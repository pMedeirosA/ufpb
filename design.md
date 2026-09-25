# Design do Projeto

> Design system do site **"Memórias da Poesia Popular"** (aprovado pelo usuário). Fonte canônica: `site/visual/public.css` (copiado do build `Downloads/ufpb-main-modificado/ufpb-main` e com o `@font-face` ajustado para o caminho local `../fonts/JacksonXilogravura-Regular.otf`). Este arquivo substitui o design antigo do site.

## Visão Geral
Identidade visual "Memória em Matriz": estética memorial de cordel com papel envelhecido, vinho, dourado e sálvia; tipografia display em xilogravura (Jackson Xilogravura) e corpo neutro. Layout editorial, tipográfico e limpo, sem ornamentos decorativos por página; a "matriz" (xilogravura) e o "fio de memória" são os únicos elementos gráficos. O site é aberto, simples e acessível (skip-link, navegação clara, `aria-current`).

## Identidade Visual

### Paleta de Cores (variáveis CSS em `:root` de `public.css`)
| Variável | Valor | Uso |
|---|---|---|
| `--paper` | `#f4f0e8` | Fundo principal (papel) |
| `--paper-deep` | `#ece5d8` | Fundo alternativo (seções "deep") |
| `--ink` | `#211a18` | Texto principal / fundos escuros |
| `--ink-soft` | `#5b544c` | Texto secundário |
| `--wine` | `#7a263a` | Vinho — acentos, títulos, bordas, CTA |
| `--brass` | `#c29a4a` | Dourado — detalhes e realces |
| `--sage` | `#53665a` | Sálvia — detalhes secundários |
| `--line` | `rgba(33, 26, 24, 0.12)` | Bordas fracas |
| `--line-strong` | `rgba(33, 26, 24, 0.25)` | Bordas fortes |

`--header-height` controla o cabeçalho fixo; sombras `--shadow-sm/md` e raios `12px` padronizam cards e imagens.

### Tipografia
- **Display** (`--font-display`): **Jackson Xilogravura** (fonte local `fonts/JacksonXilogravura-Regular.otf`, criada por Jackson) → fallback serif. Títulos em caixa alta discreta, peso 400, `line-height` ~0.94–1.
- **Corpo** (`--font-body`): **Inter** (Google Fonts). Subtítulos/lede em peso leve, cor `--ink-soft`.
- Escala fluida com `clamp()`: H1 hero ~`5.5rem`, H1 perfil até `6.5rem`, títulos de seção ~`4rem`, texto ~`1.08rem`.

### Logotipo
- Marca textual no cabeçalho: **"Memórias"** (`brand__title`) sobre **"da Poesia Popular"** (`brand__descriptor`) na fonte display.
- Ícone: `elementos/favicon.svg`.

## Sessões e Layout

### Cabeçalho (site-header)
- Fixo, com `site-header__inner` centralizado. Brand à esquerda, navegação à direita: **Início, Sobre, Poetisas, Contato**.
- Link ativo com `aria-current="page"` (estilo vinho sublinhado).
- Mobile (< 64.1rem): botão `.menu-toggle` (aria-expanded) abre/fecha a gaveta `[data-open]` (gerido por `back/common.js`); fechamento ao clicar em link ou `Esc`, e ao voltar para desktop.

### Hero (página inicial)
- Bloco `home-hero` com copy à esquerda: eyebrow, H1 **"A memória das poetisas de cordel."** (com destaque vinho), lede, 2 CTAs (`.button` vinho e `.button--secondary`) e 3 pilares (Biografias, Obras, Capas).
- À direita: `matrix-art` com `elementos/matriz-memoria.svg` e selo "Memória em matriz".

### Seções
- `project-intro` (Início): número de índice (01), eyebrow, H2 display e lede + `text-link`.
- `section-heading`: eyebrow + H2 à esquerda, texto/link à direita.
- `section--deep`: fundo `--paper-deep` com borda superior.
- `page-hero` (páginas internas): eyebrow + H1 + leitura descritiva à direita.
- `reading-width` + `prose`: texto institucional com largura de leitura; `principles-list` para princípios e equipe (strong + texto).
- `folio-rule`: `elementos/fio-memoria.svg` usado como divisor decorativo.

### Destaques e catálogo
- Início: `.feature-grid` 3 cards (`data-featured-poetisas`, geridos por `back/home.js`).
- Biografias: `.catalog-tools` com `.search-field` (busca por nome) e `.letter-filter` (Todos + A–Z, gerido por `back/biografias.js`); `.catalog-status` (resultado + total); `.poetisa-grid`; `.load-more` (Carregar mais / página de 24). Filtro e busca sincronizam a URL (`letra`, `busca`).
- Cards (`poetisa-card`): retrato 4:5 com foto ou placeholder de iniciais (`poetisa-card__fallback` — fundo vinho com iniciais display), nome, resumo e "Ver perfil". Usados no destaque e no catálogo.
- Esqueletos de carregamento (`.skeleton-card`) e estado vazio (`.state-panel`).

### Página da poetisa (`poetisa.html?slug=...`)
- `.profile-header` (2 colunas): `.profile-portrait` fixo (frame 4:5, foto ou `profile-portrait__fallback` com iniciais) + `.profile-copy` (H1, `.lede`, `.biography` com drop cap na 1ª letra).
- Seção `.works-section`: `.works-heading` (eyebrow "Acervo" + H2 **"Obras e folhetos"** + contador) e `.works-gallery` (4 colunas).
- `.work-card`: figure com botão de ampliação, imagem 4:5 e legenda (tipo de obra). Clique abre `.lightbox` (**dialog**) com barra de título + fechar + imagem; fecha por botão, `Esc` ou clique no backdrop.
- Vídeo opcional (youtube/vimeo) renderizado após as obras com iframe 16:9.

### Comentários
- `.comments-panel`: painel preparado, **sem conteúdo fictício** (texto explica que o espaço aguarda a política de participação — Req 06).

### Contato
- `.contact-layout` 2 colunas: à esquerda eyebrow + H2 "Informação verificável." + `.contact-note` (canal institucional em validação; vínculo UFPB — João Pessoa; PPGCi).
- À direita `.form-card` com formulário **desabilitado** (`hidden`) e painel `.state-panel` de indisponibilidade até a UFPB confirmar o canal oficial.

### Apoio e realização
- `.supporters`: H2 "Apoio e realização" + `.supporters__grid` com 4 logos na **ordem correta: CNPq, DCI, PPGCI, ACVPB** (dimensões: 720x222, 720x371, 720x368, 360x540).

### Rodapé (site-footer)
- `.footer-grid`: brand + navegação + texto + link administrativo (`admin.html`).
- `.credits`: `credit-pill`s — **Samuel Lucas** (link `portsamuellmsa.vercel.app`), **Miguel Fernandes** (link), **Jackson — Ilustrador**.
- `.footer-bottom`: © ano (auto via `[data-current-year]`) + "Projeto acadêmico da UFPB".

### Banner e acessibilidade
- `.config-banner` (role status, `hidden` por padrão): exibido apenas quando o banco devolve zero registros; também com fallback `<noscript>`.
- `.skip-link` "Ir para o conteúdo" em todas as páginas.

## Painel Admin (admin.html)
- **Reescrito para Supabase** conforme `plano-supabase.md`: Auth Google (allowlist `admin_emails`), CRUD e campo de capas. Usa CSS/styles próprios do painel (não usa `public.css`).

## Responsividade
- Quebra principal em **64.1rem** (menu vira gaveta mobile). Grades de cards (feature/catálogo/works) colapsam para 1–2 colunas em telas menores (media queries no final de `public.css`).

## Fluxos de Navegação
1. **Início** → CTA "Conhecer poetisas" → Biografias; "Sobre o projeto" → Sobre; destaques → perfil da poetisa.
2. **Biografias** → busca + filtro A–Z → card → **poetisa.html?slug** com obras e lightbox.
3. **Contato** → formulário desabilitado (aguardando canal oficial).
4. **Admin** (`admin.html`) → login Google (allowlist) → CRUD de poetisas e capas.

## Protótipos
- Páginas de referência do build novo: `Downloads/ufpb-main-modificado/ufpb-main/{index,sobre,biografias,contato,poetisa}/index.html` + `src/partials/html.js` + `src/styles/public.css`.
- Páginas transplantadas (estáticas, sem build): `site/estrutura/*.html` usando `../visual/public.css`, `../elementos/*.svg`, `../logos/*.png` e `../back/*.js`.