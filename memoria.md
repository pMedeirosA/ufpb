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
  - `back/` — `supabase-config.js` (config Supabase, placeholder), `acervo.js` (Supabase REST + fallback estático + componentes), `common.js` (menu mobile + ano), `home.js`, `biografias.js`, `poetisa.js`.
  - `elementos/` — novos SVGs (`favicon.svg`, `fio-memoria.svg`, `matriz-memoria.svg`) + PNGs `siteWix*.png` antigos (inutilizados, mantidos).
  - `logos/` — novos logotipos redimensionados: `CNPq.png` (720x222), `DCI.png` (720x371), `PPGCI.png` (720x368), `ACVPB.png` (360x540).

## Regras de trabalho (resumo do AGENTS.md)
- Executar apenas o que foi **solicitado** e **aprovado** (Regra 9 — plano + aprovação explícita).
- Mudanças visuais seguem **sempre** o `design.md` (Regra 5).
- Vulnerabilidades conhecidas do modelo ficam no `backend.md` e **não podem** ser reproduzidas (Regra 6).
- Todo requisito concluído entra em **"Requisitos Cumpridos"** no `requisitos.md` (Regra 8).

## Estado atual
### Concluído
- **Transplante visual completo** (aprovado pelo usuário): as 5 páginas públicas (`index`, `sobre`, `biografias`, `contato`, `poetisa`) reescritas com o visual novo; nome **"Memórias da Poesia Popular"** adotado.
- Ordem dos apoiadores corrigida na do usuário: **CNPq, DCI, PPGCI, ACVPB**.
- Créditos: **Samuel Lucas** (`portsamuellmsa.vercel.app`), **Miguel Fernandes** (`miguelfernandes3d2-netizen.github.io/portifolio.green/`), **Jackson — Ilustrador**.
- Camada de dados nova conforme `plano-supabase.md`: `supabase-config.js` (placeholder) + `acervo.js` (REST p/ Supabase com fallback estático das 8 poetisas; sem innerHTML).
- Backend antigo removido das páginas públicas: `back/script.js` e `visual/styles.css` apagados; páginas públicas agora usam apenas os `back/*.js` novos (leitura Supabase + fallback estático).
- `acervo.js` (versão antiga) descartado a pedido do usuário ("NÃO QUERO NADA DO BACK ATUAL").
- Migração `001_init.sql` do agente excluída (nunca persistiu; pasta `supabase/` removida).

### Pendente
- **Verificação no navegador**: abrir as 5 páginas e testar grid, menu mobile, filtro de letras, busca, load more, perfil + lightbox, paths.
- **Criar conta/projeto Supabase** (usuário) e preencher `supabase-config.js` (`url` + `anonKey` anônima). Enquanto vazio, o site usa o fallback estático.
- **`admin.html` reescrito para Supabase** — Auth Google (allowlist `admin_emails`) + CRUD + campo de capas; aguarda conta/projeto Supabase e migração SQL para validar.
- Req 06 — conteúdo da seção Comentários (painel já está montado, vazio, sem conteúdo fictício).

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
- Cabeçalhos de seção em `.md` em português, títulos `###`.