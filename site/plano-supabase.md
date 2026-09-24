# Plano de Implementação — Sistema de Cadastro de Poetisas com Supabase

> Documento técnico de planejamento. Este arquivo descreve, de ponta a ponta, a migração da
> camada de dados do site "Memórias das Poetisas da Literatura de Cordel" do **
> ** para **Supabase (PostgreSQL + Auth + RLS)**, conforme plano aprovado em
> 21/09/2026.
>
> Fonte de rigor: `AGENTS.md` (Regras 5, 6, 7, 8, 9), `design.md` (conformidade visual),
> `backend.md` (vulnerabilidades que não podem ser reproduzidas), `requisitos.md` (pedidos da
> chefia), `SKILL.md` (práticas de backend com IA — **documento canônico ao iniciar qualquer
> tarefa de backend**), `memoria.md` (contexto).

---

## 1. Resumo executivo

O objetivo é atender os requisitos pendentes da chefia (Reunião 18/09, Karcia) com um sistema
**mínimo, simples e de longa duração**:

- Painel admin para **adicionar/editar/excluir poetisas** (nome, biografia, foto, capas).
- Site público mantém leitura aberta, **sem nenhuma mudança visual** (Regra 5).
- **Supabase no lugar do **, seguindo a decisão da chefia de priorizar um banco
  padrão (PostgreSQL) com portabilidade de dados a longo prazo.

Princípio central (backup de `backend.md`): segurança **deny-by-default** em regras
(antes  → agora **RLS**), validação e escape de toda entrada (XSS), sem segredos no
client-side, CSP no deploy.

---

## 2. Arquitetura alvo

```
[admin.html] ── anon/publishable key + Google OAuth (JWT) ──▶ Supabase Auth/ 
                  (na verdade: Supabase Auth + PostgreSQL via Data API)
        │  INSERT/UPDATE/DELETE  → RLS: authenticated + e-mail na allowlist
        ▼
[PostgreSQL — Supabase]  tabela `poetisas` (+ `admin_emails`)
        ▲
        │  SELECT (público) → RLS: anon
[biografias.html] ── anon/publishable key ──▶ SELECT público onde a chefia lista as poetisas
```

- **Aplicação 100% client-side, sem framework** (convenção do projeto: HTML/CSS/JS vanilla).
- **Supabase** substitui o : Postgres real, Auth com Google OAuth, **RLS** como
  barreira de segurança (substitui as regras do ).
- Dados continuam na nuvem, mas em **Postgres serializável e portável** — a crítica da
  chefia: "futuro incerto, inúmeras incógnitas" foi respondida com um banco **padrão da
  indústria**, sem lock-in proprietário de documento (NoSQL ).

### Por que Supabase e não outra opção (decisão da chefia, registrada em 21/09/2026)

| Critério (longo prazo, sem considerar o projeto atual) | Supabase |  | Git-files (Decap) |
|---|---|---|---|
| Dados portáveis (exportação) | ✅ PostgreSQL universal | ⚠️  proprietário | ✅✅ Arquivos brutos |
| Depende de console/conta | ⚠️ Console (portátil) | ❌ Firme (Google) | ✅ Só repositório |
| Custo imprevisível | ✅ Free hoje | ⚠️ Políticas mudaram (2026) | ✅🤖 Zero recorrente |
| Qd. knowledge disponível | ✅ SQL (padrão) | ⚠️ NoSQL niche | ⚠️ Git + CMS |
| Admin não técnico edita | ✅ | ✅ | ✅ (via CMS) |
| Escala futura | ✅✅ | ✅ | ✅ suficiente |

**Decisão**: **Supabase**. Recomendação para projetos do zero; no atual, o modelo já está
integrado com , mas a chefia pediu priorizar **independência e longevidade** → Supabase.
_(Nota: se não houvesse projeto existente, a recomendação "ideal-teórica" seria também Supabase
pela portabilidade SQL, com Git-files como alternativa de máxima posse de dados.)_

---

## 3. Modelo de dados (PostgreSQL)

Coleção/tabela `poetisas` (substitui a coleção  `poetisas`):

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

Tabela auxiliar `admin_emails` — allowlist de e-mails autorizados (resolve de vez a
vulnerabilidade #1 do `backend.md`: **lista vazia = acesso negado**).

---

## 4. Segurança — deny-by-default (corrige as 11 vulnerabilidades do `backend.md`)

A proteção passa a ser **Row Level Security (RLS)**, política **deny-by-default**:

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

### Mapa vulnerabilidades originais → mitigação no Supabase

| # | Vulnerabilidade (backend.md) | Solução neste plano |
|---|---|---|
| 1 | Login com allowlist vazia (qualquer Google entra) | **allowlist obrigatória** (`admin_emails`); lista vazia = deny; **deny-forever** |
| 2/3 | XSS/escrita no banco → innerHTML sem escape | `escapeHtml` em **toda** string do banco antes do DOM (site e admin); validação server (RLS não escapa; escape é no client) |
| 4 | Embed por URL livre (iframe arbitrário) | `convertToEmbed`: somente YouTube/Vimeo validados por regex; nunca URL de terceiros |
| 5 | Regras  como única barreira + config pública | Config pública é **por design** (anon key publicável); **barreira real = RLS deny-by-default + policies por operação/papel**; secrets nunca no client |
| 6 | Sem CSP | `vercel.json` com CSP restrito (`default-src 'self'`, sem `*`), `nosniff`, Referrer-Policy |
| 7 | Código morto/sensível (`ALLOWED_EMAILS` const, branch upload) | Remoção do branch `upload` e constantes não usadas; reescrita do admin |
| 8 | Sem rate limiting / força bruta | Mitigado pelo **Google OAuth** (provedor gerencia); CORS restrito; monitoração via log de auditoria (Supabase) |
| 9 | Validação client-side como única defesa | RLS **server-side** é a defesa real (deny-by-default); validação client = UX, não segurança |
| 10 | SDKs fixos sem política | Versões fixas por CDN (v2) + revisão registrada; documentar versões (SKILL.md) |
| 11 | `onclick` com ID não escapado | Substituir por `addEventListener` + `dataset`/closure (nunca interpolar dados em handler) |

---

## 5. Fluxo do Painel Admin (simples, para a chefia)

1. Chefia abre `admin.html` → **"Entrar com Google"**.
2. `ALLOWED_EMAILS` (agora lido do Supabase/`admin_emails` com deny-by-default): e-mail não
   autorizado → **"Acesso negado"**, painel oculto (**sem risco #1**).
3. Formulário deslizante lateral (design conforme `design.md`): **Nome***, Biografia*,
   Foto (URL/Nenhuma), Vídeo (opcional), **Capas e Folhetos** (lista URL+título, ➕/✖).
4. Salvar → grava no Postgres via Supabase → toast "Poetisa salva com sucesso!".

**Visual**: 100% conforme `design.md` (sidebar `#2C1810`, terracota `#C4513D`, cards glassmorphism,
formulário 520px, toast, modal de confirmação de exclusão) — **nenhuma mudança estética**.

---

## 6. Fluxo do site público

- `biografias.html` + `script.js` leem do Supabase (`anon key`, SELECT público via RLS) e
  renderizam cards/modal/bio + **Capas e Folhetos** (nova).
- **Fallback:** se o banco estiver indisponível, o site exibe o conteúdo estático inline
  (como hoje) — **site nunca quebra** (robustez + simples).
- Sem login para o visitante (Requisito: "site aberto para todos, simples e fácil de achar").

---

## 7. Migração de dados (do ático → Supabase)

- **Seed SQL** com as poetisas atuais (as já presentes em `biografias.html`/) para
  popular a tabela na migração inicial; depois o admin passa a gerenciar via painel.
- Os dados são portáveis: dumps SQL exportáveis a qualquer momento (longevidade).

---

## 8. Deploy e custos

- **Deploy**: site permanece estático na **Vercel** (sem change de infra); Supabase cuida do
  banco/auth.
- **Custo**: plano **free do Supabase** (50.000 documentos/linhas até escala, R$ 0 em
  volume deste site). Se a chefia migrar a dados PostgreSQL próprio no futuro, o SQL sai
  **sem reescrita** (universal).
- Durabilidade: Supabase tem histórico de políticas de preço estáveis; e mesmo que mudassem,
  os dados são Postgres exportável (resposta à "inumerável incógnita" de longo prazo).

---

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
| `site/back/` | 🔄 → `supabase-config.js` (URL + publishable key) |
| `site/estrutura/admin.html` | ↩️ reescrever dados (fonte: Supabase; visual: design.md) |
| `site/back/script.js` | ↩️ reescrever dados (Supabase + RLS/escape/validação) |
| `site/estrutura/biografias.html` | ✏️ editar scripts (barra Supabase) |
| `supabase/migrations/001_init.sql` | 🆕 migração + seed + RLS |
| `vercel.json` | 🆕 CSP/security headers |

---

## 10. Fases de implementação (execução após aprovação)

| Fase | Entrega | Verificação |
|---|---|---|
| 0 | Conta Supabase + projeto + config (interface) | dashboard acessível |
| 1 | Migração SQL + RLS + seed | `supabase db push`; policies testam anon/authenticated |
| 2 | `supabase-config.js` + `script.js` (leitura) | site público carrega do Postgres; fallback ok |
| 3 | `admin.html` completo (login Google + CRUD + capas) | cadastro novo aparece no site público |
| 4 | Segurança (CSP/Vercel, CORS, auditoria RLS) | checklist `SKILL.md` — zero segredos/`innerHTML` sem escape |
| 5 | Documentação (`requisitos.md`, `memoria.md`, `backend.md`) | Regras 8 e 10 aplicadas |

---

## 11. Decisões que exigem confirmação da chefia

1. **E-mail(s) autorizado(s)** ao painel (ex.: e-mail da Karcia) — obrigatório.
2. **Acesso ao dashboard Supabase** para aplicar migração/RLS (console) — ou autorização para
   que o agente o faça via SQL editor.
3. **Campos mínimos**: Nome, Biografia, Foto, Capas (confirmado por você: apenas o necessário).
4. Comportamento quando a chefia quiser **excluir** — manter botão "Excluir" com confirmação
   (simples) — confirmar.

---

_Documento gerado em 21/09/2026. Registrar implementação concluída em `requisitos.md` (Regra 8)
após execução aprovada._
