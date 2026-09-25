# Memória do Projeto

> Documento de recuperação de contexto. Leia este arquivo **obrigatoriamente** ao iniciar qualquer sessão de trabalho neste projeto (ver Regra 10 do `AGENTS.md`). Mantenha-o atualizado ao final de cada sessão.

## O que é o projeto
Site **"Memórias da Poesia Popular"** — acervo digital das poetisas da literatura de cordel, ligado a um trabalho acadêmico (UFPB, PPGCi). O visual segue o novo design system (`visual/public.css`, tirado do build `Downloads/ufpb-main-modificado/ufpb-main`), aprovado pelo usuário.

## Estrutura
- `AGENTS.md` — regras de trabalho (fonte canônica). **Consultar antes de agir.**
- `requisitos.md` — pedidos da chefia (reunião 18/09, Karcia). Requisitos marcados com `[X]` são os que o usuário quer executar.
- `design.md` — design system do site (paleta, tipografia, componentes). Fonte da conformidade visual.
- `backend.md` — arquitetura/tecnologias/vulnerabilidades do modelo de referência. Nada disso deve ser reproduzido.
- `memoria.md` — este arquivo.
- `site/plano-supabase.md` — **plano do back-end do usuário (Supabase)**: tabelas `poetisas` + `admin_emails` (allowlist por e-mail), sem Storage, sem tabela de obras, com fallback estático de 8 poetisas. Fonte canônica da camada de dados.
- `site/` — código do site:
  - `estrutura/` — `index.html`, `sobre.html`, `biografias.html`, `contato.html`, `poetisa.html` (nova), `admin.html` (reescrito para Supabase).
  - `visual/public.css` — folha de estilo única (visual novo). `styles.css` antigo foi removido.
  - `back/` — `supabase-config.js` (**preenchido** com o projeto real), `acervo.js` (Supabase REST + fallback estático + componentes), `common.js` (menu mobile + ano), `home.js`, `biografias.js`, `poetisa.js`.
  - `elementos/` — novos SVGs (`favicon.svg`, `fio-memoria.svg`, `matriz-memoria.svg`) + PNGs `siteWix*.png` antigos (inutilizados, mantidos).
  - `logos/` — novos logotipos redimensionados: `CNPq.png` (720x222), `DCI.png` (720x371), `PPGCI.png` (720x368), `ACVPB.png` (360x540).

## Regras de trabalho (resumo do AGENTS.md)
- Executar apenas o que foi **solicitado** e **aprovado** (Regra 9 — plano + aprovação explícita).
- Mudanças visuais seguem **sempre** o `design.md` (Regra 5).
- Vulnerabilidades conhecidas do modelo ficam no `backend.md` e **não podem** ser reproduzidas (Regra 6).
- Todo requisito concluído entra em **"Requisitos Cumpridos"** no `requisitos.md` (Regra 8).

## Configuração externa ativa
- Projeto Supabase: `ewhbhcvwibutqflymvgz.supabase.co` (credenciais abertas em `back/supabase-config.js`).
- Migração `supabase/migrations/001_init.sql` **aplicada** no SQL Editor (tabelas `poetisas` + `admin_emails`, RLS deny-by-default, seed das 8 poetisas). Seed agora **idempotente** (só popula quando a tabela está vazia; UUIDs fixos + `ON CONFLICT (id)`).
- Provedor Google **habilitado** (`Authentication → Sign In / Providers → Google`) com chaves OAuth do Google Cloud; redirect URI: `https://ewhbhcvwibutqflymvgz.supabase.co/auth/v1/callback`.
- Allowlist `admin_emails`: configurada com o e-mail do Google autorizado.
- Redirect URL `http://localhost:8080` adicionado em `Authentication → URL Configuration`.
- **Sem Node/Python/PHP na máquina** (o `python` presente é o stub da Microsoft Store) → servidor local = **`servir.ps1`** (raiz do projeto; HTTP listener PowerShell na porta 8080). Rodar com `powershell -ExecutionPolicy Bypass -File .\servir.ps1`. Testado: HTTP 200 servindo o site em `http://localhost:8080`.

## Estado atual
### Concluído
- **Transplante visual completo** (aprovado pelo usuário): as 5 páginas públicas (`index`, `sobre`, `biografias`, `contato`, `poetisa`) reescritas com o visual novo; nome **"Memórias da Poesia Popular"** adotado.
- Ordem dos apoiadores corrigida na do usuário: **CNPq, DCI, PPGCI, ACVPB**.
- Créditos: **Samuel Lucas** (`portsamuellmsa.vercel.app`), **Miguel Fernandes** (`miguelfernandes3d2-netizen.github.io/portifolio.green/`), **Jackson — Ilustrador**.
- Camada de dados nova conforme `plano-supabase.md`: `supabase-config.js` + `acervo.js` (REST p/ Supabase com fallback estático das 8 poetisas; sem innerHTML).
- Conta/projeto Supabase criados e `supabase-config.js` **preenchido** com `url` + chave `sb_publishable_`; as páginas públicas passaram a ler os dados reais do banco.
- Migração `001_init.sql` **aplicada via SQL Editor** e **verificada via API**: 8 poetisas retornadas corretamente; INSERT anônimo **negado** (HTTP 401) — RLS deny-by-default funcionando.
- Backend antigo removido das páginas públicas: `back/script.js` e `visual/styles.css` apagados; páginas públicas agora usam apenas os `back/*.js` novos (leitura Supabase + fallback estático).
- `acervo.js` (versão antiga) descartado a pedido do usuário ("NÃO QUERO NADA DO BACK ATUAL").
- **Auditoria completa (25/09)** contra todos os `.md` do repositório — corrigidos os achados abaixo:
  - **Vulnerabilidade #4 corrigida** (`backend.md`): `acervo.js`→`convertToEmbed` não aceita mais URL arbitrária com "embed"/"player"; só YouTube (watch/embed/shorts/youtu.be) e Vimeo via regex, senão `null` (guarda `!embedUrl` em `poetisa.js`); alinhado ao `getEmbedUrl` do admin.
  - **Fonte Inter carregada** (`design.md`): Google Fonts adicionado nas 5 páginas públicas (antes a `--font-body` caía no fallback Segoe).
  - **Admin sem innerHTML de dados**: `renderCards` e `renderCoversList` reescritos com DOM API; `escapeHtml` (agora morto) removido. Únicos `innerHTML` restantes = ícones SVG **constantes** (edit/delete), sem dados dinâmicos.
  - **Fase 4 parcial**: `site/vercel.json` criado com `Content-Security-Policy` (self + Google Fonts + jsdelivr + Supabase connect + YouTube/Vimeo frame), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
  - **`plano-alteracoes-visuais.md`** atualizado: `.decor-hero-bird`/`siteWix13.png`, `styles.css` e `script.js` **não existem mais**; itens C/D já estão implementados (Inter + rodapé `--font-body`); plano segue **suspenso** (Regra 9).

### Pendente
- Req 06 — conteúdo da seção Comentários (painel já está montado, vazio, sem conteúdo fictício).
- Fase 4 do plano (`plano-supabase.md` §10): **limitar CORS no dashboard** (`Authentication → URL Configuration` é config local; o CORS global `*` precisa ser restringido no painel Supabase — ação manual) e **publicar no Vercel** (decidir domínio final; CSP/headers do `vercel.json` já pronto).

## Decisões-chave
- **Back-end do projeto = Supabase do `plano-supabase.md`** (escolha explícita do usuário). Sem o back do build novo (sem Storage, sem tabela `obras`, sem `status`, campos `video_url`/`covers` mantidos no schema do plano).
- Card individual de poetisa incluído (`poetisa.html?slug=...`).
- Fallback estático de 8 poetisas garante que o site nunca quebra sem o Supabase configurado.
- Formulário de contato **desabilitado** (canal institucional em validação) até a UFPB confirmar o destino oficial.
- Banner "em preparação" só aparece quando o banco devolve zero registros (com fallback, conteúdo é exibido normalmente).
- Renderização dinâmica **sem innerHTML** (createElement + textContent) nos scripts novos.

## Segurança (modelo de referência — não reproduzir)
- Chave `anon`/publishable do Supabase é **pública** por design (front-end); a proteção real é o **RLS deny-by-default**, nunca o segredo da chave. `service_role` jamais no client-side.
- Admin: allowlist em `admin_emails`; **lista vazia = acesso negado** (deny-by-default), e a RLS barra escrita/exclusão sem e-mail autorizado — painel efetivamente somente leitura sem permissão.
- Leitura das poetisas é **pública** (necessária ao site). Escrita restrita a `authenticated` + e-mail em `admin_emails` conforme `plano-supabase.md`.
- Detalhes completos: `backend.md` (vulnerabilidades #1–#11).

## Convenções
- Scripts novos: **português**, sem innerHTML, com helper `Acervo.createElement()` (usado somente para dados; conteúdo estático das páginas é HTML natural).
- Exceção documentada: admite-se `innerHTML`/SVG apenas para **ícones fixos (constantes, sem dados)** — todo dado dinâmico é `createElement` + `textContent`/`src`.
- Fontes: `Inter` (Google Fonts) carregada nas 5 páginas públicas via `<link>` no `<head>`; `--font-body` nunca deve cair em fallback.
- Cabeçalhos de seção em `.md` em português, títulos `###`.