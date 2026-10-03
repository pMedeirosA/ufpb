# Plano de Implementação — Sistema de Cadastro de Poetisas com Supabase

> Documento técnico de planejamento. Este arquivo descreve, de ponta a ponta, a camada de
> dados do site "Memórias da Poesia Popular" sobre **Supabase (PostgreSQL + Auth + RLS)**,
> conforme plano aprovado em 21/09/2026.
>
> Fonte de rigor: `AGENTS.md` (Regras 5, 6, 7, 8, 9), `design.md` (conformidade visual),
> `backend.md` (arquitetura e segurança do back-end), `requisitos.md` (pedidos da chefia),
> `SKILL.md` (práticas de backend com IA — **documento canônico ao iniciar qualquer
> tarefa de backend**), `memoria.md` (contexto).

---

## 1. Resumo executivo

O objetivo é atender os requisitos pendentes da chefia (Reunião 18/09, Karcia) com um sistema
**mínimo, simples e de longa duração**:

- Painel admin para **adicionar/editar/excluir poetisas** (nome, biografia, foto, capas).
- Site público mantém leitura aberta, sem mudanças visuais não aprovadas (Regra 5).
- **Supabase** como back-end padrão (PostgreSQL) com portabilidade de dados a longo prazo.

Princípio central (ver `backend.md`): segurança **deny-by-default** via **RLS**, validação e
escape de toda entrada (XSS), sem segredos no client-side, CSP no deploy.

---

## 2. Arquitetura alvo

```
[admin.html] ── anon/publishable key + Google OAuth (JWT) ──▶ Supabase Auth + Data API
        │  INSERT/UPDATE/DELETE  → RLS: authenticated + e-mail na allowlist
        ▼
[PostgreSQL — Supabase]  tabela `poetisas` (+ `admin_emails`)
        ▲
        │  SELECT (público) → RLS: anon
[páginas públicas] ── anon/publishable key ──▶ SELECT público
```

- **Aplicação 100% client-side, sem framework** (convenção do projeto: HTML/CSS/JS vanilla).
- **Supabase**: Postgres real, Auth com Google OAuth e **RLS** como barreira de segurança.
- Dados na nuvem em **Postgres serializável e portável** — banco padrão da indústria, sem
  lock-in proprietário de documento.

**Decisão registrada (21/09/2026):** Supabase. Recomendação para projetos do zero e também
para o atual, pela portabilidade SQL (com Git-files como alternativa de máxima posse de dados,
mas sem console/banco administrável pela chefia).

---

## 3. Modelo de dados (PostgreSQL)

Tabela `poetisas`:

| Coluna | Tipo | Obrig. | Observação |
|---|---|---|---|
| `id` | `uuid` PK | ✅ | gerado pelo Postgres |
| `name` | `text` NOT NULL | ✅ | Nome da poetisa |
| `initials` | `text` | auto | iniciais (A–Z) |
| `letter` | `text` | auto | letra do índice |
| `subtitle` | `text` | opc. | Subtítulo (visual) |
| `summary` | `text` | opc. | Resumo (card) |
| `bio` | `text` NOT NULL | ✅ | Biografia |
| `photo_type` | `text` DEFAULT `'none'` | ✅ | `url` / `none` |
| `photo_url` | `text` | opc. | Foto (validada `http(s)`) |
| `video_url` | `text` | opc. | Vídeo (apis: Youtube/Vimeo somente) |
| `covers` | `jsonb` DEFAULT `'[]'` | opc. | 🆕 **Array de capas**: `[{src, title}]` |
| `created_at` / `updated_at` | `timestamptz` | auto | auditoria |

Tabela auxiliar `admin_emails` — allowlist de e-mails autorizados. **Lista vazia = acesso
negado (deny-by-default)**; nunca permite "qualquer e-mail".

---

## 4. Segurança — deny-by-default (conforme `backend.md`)

A proteção é **Row Level Security (RLS)**, política **deny-by-default**:

```sql
-- habilitar RLS em toda tabela exposta
alter table poetisas enable row level security;

-- leitura pública (site carrega sem login)
create policy "poetisas public read" on poetisas
  for select using (true);

-- escrita: somente usuário autenticado COM e-mail listado na allowlist
create policy "poetisas admin write" on poetisas
  for insert to authenticated
  with check (
    (select auth.jwt() ->> 'email') = any (select email from admin_emails)
  );
-- iguais para update/delete
```

### Requisitos de segurança (checklist `backend.md`)

| # | Requisito | Solução neste plano |
|---|---|---|
| 1 | Login sem allowlist (qualquer conta entra) | **allowlist obrigatória** (`admin_emails`); lista vazia = deny |
| 2/3 | XSS → innerHTML sem escape | `escapeHtml` em **toda** string do banco antes do DOM (site e admin) |
| 4 | Embed por URL livre (iframe arbitrário) | `convertToEmbed`: somente Youtube/Vimeo validados por regex |
| 5 | Config pública | **Por design** (anon/publishable key); barreira real = **RLS deny-by-default + policies por operação/papel**; secrets nunca no client |
| 6 | Sem CSP | Aplicar CSP restrito (`default-src 'self'`) + `nosniff` + Referrer-Policy **conforme o host final** (deploy sem Vercel; `site/vercel.json` é o template dos headers) |
| 7 | Código morto/sensível | Remoção de branches não usados e constantes desnecessárias; admin reescrito |
| 8 | Sem rate limiting / força bruta | **Google OAuth** gerencia credenciais; monitoração via log de auditoria do Supabase. Nota: a Data API do Supabase não permite restringir CORS no dashboard (header é `*` fixo — não há "Allowed Origins"); por isso a defesa real é 100% RLS |
| 9 | Validação client-side como única defesa | **RLS server-side** é a defesa real; validação client = UX, não segurança |
| 10 | CDN sem política de versão | Versões fixas por CDN + revisão registrada (ver `SKILL.md`) |
| 11 | Handler com dado não escapado | `addEventListener` + `dataset`/closure; nunca interpolar dados em handler |

---

## 5. Fluxo do Painel Admin (simples, para a chefia)

> **ESTADO ATUAL (02/10 — TEMPORÁRIO): acesso aberto.** Por decisão da chefia, o painel
> **não exige mais login** (sem Google/allowlist): `admin.html` abre direto e a RLS de
> `poetisas` aceita escrita de qualquer um via migração **`002_acesso_aberto.sql`** (a aplicar
> no SQL Editor). O fluxo abaixo (login Google) é o **planejado/correto** e volta a valer quando
> reverterem — bloco de reversão comentado no fim do `002`.

1. Chefia abre `admin.html` → **"Entrar com Google"** (OAuth do Supabase).
2. E-mail verificado contra `admin_emails` (deny-by-default): não autorizado →
   **"Acesso negado"**, painel oculto.
3. Formulário deslizante lateral (conforme `design.md`): **Nome***, Biografia*,
   Foto (URL/Nenhuma), Vídeo (opcional), **Capas e Folhetos** (lista URL+título, ➕/✖).
4. Salvar → grava no Postgres via Supabase → toast "Poetisa salva com sucesso!".

**Visual**: 100% conforme `design.md` (sidebar `#2C1810`, terracota `#C4513D`, cards,
formulário 520px, toast, diálogo de confirmação de exclusão).

### 5.1 Configuração externa — provedor Google (para o login funcionar)

O "Entrar com Google" exige o provedor **habilitado** no projeto Supabase; enquanto não estiver,
o Auth responde `400 validation_failed — Unsupported provider: provider is not enabled`:

1. **Supabase** → `Authentication` → `Sign In / Providers` → **Google** → ativar o toggle
   **"Enable Sign in with Google"** e colar `Client ID` + `Client Secret`.
2. **Google Cloud Console** (`console.cloud.google.com`):
   - Criar/selecionar projeto → **APIs & Services** → **OAuth consent screen**
     (External; escopos `email` + `profile`; adicionar o e-mail de teste).
   - **Credentials** → **+ Create credentials** → **OAuth client ID** → tipo **Web application**.
   - **Authorized redirect URIs**: `https://ewhbhcvwibutqflymvgz.supabase.co/auth/v1/callback`
     (idêntico ao acima — é o URL para o Google devolver o login ao Supabase).
   - Copiar **Client ID** e **Client Secret** → colar no passo 1 → **Save**.
3. **Supabase → Authentication → URL Configuration**: conferir `Site URL`; ao testar o admin
   localmente, servir via HTTP (`http://localhost:PORTA`) e adicionar essa origem em
   `Redirect URLs` — protocolo `file://` quebra o retorno do OAuth.
4. **Allowlist**: o e-mail do Google precisa estar em `admin_emails` (senão o painel abre,
   mas nega acesso — deny-by-default).

---

## 6. Fluxo do site público

- Páginas públicas (`index.html`, `biografias.html`, `poetisa.html`) leem do Supabase
  (`anon key`, SELECT público via RLS) através de `back/acervo.js`.
- **Fallback:** se o Supabase não estiver configurado/indisponível, o site exibe o conteúdo
  estático local (as 8 poetisas atuais) — **o site nunca quebra**.
- Sem login para o visitante.

---

## 7. Migração de dados (do conteúdo estático → Supabase)

- **Seed SQL** com as poetisas atuais (as 8 do fallback estático) para popular a tabela na
  migração inicial; depois o admin passa a gerenciar via painel.
- Dados portáveis: dumps SQL exportáveis a qualquer momento (longevidade).

---

## 8. Deploy e custos

- **Deploy**: site permanece estático, com **domínio próprio** (hospedagem a definir — **sem Vercel**); Supabase cuida do banco/auth. Headers de segurança aplicados conforme o host escolhido (template em `site/vercel.json`).
- **Custo**: plano **free do Supabase** (500 MB / cotas diárias, R$ 0 no volume deste site).
  Se houver migração futura para PostgreSQL próprio, o SQL sai **sem reescrita** (universal).

### 8.1 Nota de dimensionamento — quantas poetisas cabem nos 500 MB? _(registrada 21/09/2026)_

> Ponto-chave que muda o cálculo: no Supabase, os **500 MB são só o banco (texto)**. Fotos e
> capas **não** ficam no banco — ficam em **URLs** (arquitetura deste plano, sem Storage).
> Logo, o custo de cadastrar 1 poetisa é apenas o texto digitado.

**Custo médio por poetisa — 1 registro (PostgreSQL, UTF-8):**

| Campo | Conteúdo típico | Tamanho |
|---|---|---|
| `name` | "Antônia Pessoa Magalhães" | ~48 B |
| `letter` + `initials` | "A" + "AP" | ~5 B |
| `subtitle` | ~30 letras | ~60 B |
| `summary` | ~140 letras | ~280 B |
| `bio` | ~1.000 letras | ~2.000 B |
| `photo_url` | URL longa (Google Drive) | ~400 B |
| `video_url` | YouTube/Vimeo | ~160 B |
| `covers` (jsonb) | 3 capas (URL + título) | ~900 B |
| timestamps + uuid | automáticos | ~64 B |
| **Subtotal** | | **~3,9 KB** |

> Com overhead de armazenamento do Postgres (padding, índice), **~4–5 KB** por poetisa.

**Capacidade total no plano free (500 MB = 500.000.000 B):**

| Cenário | Tamanho/poetisa | Poetisas que cabem |
|---|---|---|
| Mínimo (nome + bio curta) | ~2,5 KB | **~200.000** |
| **Típico** (foto + biografia + 3 capas + vídeo) | **~4–5 KB** | **~100.000** |
| Completo (bio longa + 5 capas) | ~12–15 KB | ~33.000–40.000 |

**Tradução para a realidade:** o acervo brasileiro de poetisas documentáveis está na casa das
**centenas** (200–400). Precisamos registrar ~**0,3%** do que o banco grátis comporta (folga de
~99,7%). Mesmo crescendo 100×, **continua R$ 0** no plano free.

**Cotas de operação (não é só espaço):**
- Escrita: 1 INSERT por poetisa → cota de **20.000/dia** = ~20.000 cadastros/dia.
- Leitura: 1 SELECT por card → cota de **50.000/dia**.
- Login admin: 1 Google OAuth → 50k usuários/mês.

> **Resumo:** cadastrar 1 poetisa = ~5 KB + 1 escrita = **R$ 0,00**. Os 500 MB comportam
> **~100.000 poetisas**. O limite prático nunca será o banco — só a digitação do conteúdo.

---

## 9. Arquivos afetados

| Arquivo | Ação |
|---|---|
| `site/back/supabase-config.js` | ✅ preenchido (projeto real `ewhbhcvwibutqflymvgz`) |
| `site/estrutura/admin.html` | ✅ reescrito (Supabase Auth + CRUD + capas) |
| `site/back/{acervo,home,biografias,poetisa,common}.js` | ✅ criados (leitura + fallback) |
| `site/estrutura/*.html` | ✅ páginas públicas com o novo visual |
| `supabase/migrations/001_init.sql` | ✅ criado e **aplicado** via SQL Editor (chema + RLS + seed); seed idempotente (só popula tabela vazia) |
| `supabase/migrations/002_acesso_aberto.sql` | 🔶 **criado, aguardando aplicar** via SQL Editor — período de acesso aberto (sem login, escrita `anon` em `poetisas`); contém bloco de reversão |
| `site/vercel.json` | ✅ **template** de headers de segurança (CSP `default-src 'self'` + Google Fonts + jsdelivr + Supabase connect + YouTube/Vimeo frame, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`) — a **portar para o host final** (deploy não será Vercel) |

---

## 10. Fases de implementação

| Fase | Entrega | Status |
|---|---|---|
| 0 | Conta Supabase + projeto + config | ✅ feito (projeto criado; `supabase-config.js` preenchido) |
| 1 | Migração SQL + RLS + seed (`001_init.sql`) | ✅ feito (aplicada; verificado via API) |
| 2 | `supabase-config.js` + `acervo.js` (leitura) | ✅ feito e operando (dados reais no site) |
| 3 | `admin.html` completo (login Google + CRUD + capas) | ✅ **feito e validado** (login via Google + allowlist operando) |
| 4 | Segurança (headers de deploy, auditoria RLS) | 🔶 parcial — template de headers ✅ (`site/vercel.json`); falta **deploy de produção com domínio próprio** (hospedagem a definir — **sem Vercel**) p/ headers saírem do ar. ~~CORS do dashboard~~ removido: **a Data API do Supabase não permite restringir CORS** (sem "Allowed Origins"; header `*` fixo — docs + discussões GitHub). RLS segue como barreira real |
| 5 | Documentação (`requisitos.md`, `memoria.md`, `backend.md`) | ✅ feito (auditoria 25/09: vuln #4, Inter, admin sem innerHTML, plano-alteracoes — todos tratados) |

---

## 11. Decisões que exigem confirmação da chefia

1. **E-mail(s) autorizado(s)** ao painel (ex.: e-mail da Karcia) — obrigatório.
2. **Acesso ao dashboard Supabase** para aplicar migração/RLS (console) — ou autorização para
   que o agente o faça via SQL editor.
3. **Campos mínimos**: Nome, Biografia, Foto, Capas (confirmado: apenas o necessário).
4. Comportamento quando a chefia quiser **excluir** — manter botão "Excluir" com confirmação
   (simples) — confirmado.

---

_Documento gerado em 21/09/2026. Registrar implementação no `requisitos.md` (Regra 8)
após execução aprovada._