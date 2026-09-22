# Design do Projeto

> Baseado no design system real do site de referência (modelo `siterasc.vercel.app`), extraído do `styles.css`.

## Visão Geral
Identidade visual "Cordel Terroso": estética de literatura de cordel brasileira com xilogravuras decorativas, paleta terrosa (bege, terracota, dourado) e tipografia serifada de caráter popular. Estilo glassmorphism nos cards, animações sutis de scroll e layout responsivo. O site é aberto para todos, simples e fácil de navegar (sem classes temáticas).

## Identidade Visual

### Paleta de Cores (variáveis CSS em `:root`)
| Variável | Valor | Uso |
|---|---|---|
| `--color-bg` | `#F5EDE3` | Fundo principal (bege creme) |
| `--color-bg-warm` | `#F0E4D5` | Fundo quente (gradientes) |
| `--color-bg-alt` | `#EDE0D0` | Fundo alternativo |
| `--color-surface` | `#FDFAF6` | Superfície (cards/modal) |
| `--color-surface-warm` | `#F8F0E6` | Superfície quente |
| `--color-primary` | `#C4513D` | Terracota — ação/CTA |
| `--color-primary-dark` | `#A33C2B` | Terracota escuro (hover) |
| `--color-primary-light` | `#E07A68` | Terracota claro |
| `--color-secondary` | `#D4A853` | Dourado — destaque |
| `--color-secondary-light` | `#E8C778` | Dourado claro (texto em fundo escuro) |
| `--color-accent` | `#8B5E3C` | Marrom — detalhes |
| `--color-text` | `#1E110A` | Texto (marrom escuro) / fundo do carrossel/footer |
| `--color-text-muted` | `#3E2A1E` | Texto secundário |
| `--color-text-light` | `#6B5545` | Texto terciário |

Bordas: `rgba(139, 94, 60, 0.15)` (fraca) e `rgba(139, 94, 60, 0.3)` (forte).
Glassmorphism: fundo `rgba(253,250,246,0.7)` + blur `16px` + borda branca `0.25`; variante escura `rgba(44,24,16,0.75)`.

### Tipografia
- **Display** (`--font-display`): **JacksonXilogravura** (fonte local `fonts/JacksonXilogravura-Regular.otf`, criada por Jackson) → fallback Playfair Display, serif. Usada em títulos, navbar, botões e destaque.
- **Heading** (`--font-heading`): Playfair Display (Google Fonts).
- **Body** (`--font-body`): Inter (Google Fonts, pesos 300–700).
- Escala: `--text-xs` 0.85rem → `--text-6xl` 4.5rem. H1 = 3.5rem/700, H2 = 2.6rem/600, H3 = 1.6rem, H4 = 1.35rem.

### Logotipo
- Não há arquivo de logo; a marca é o texto **"Memórias das Poetisas da Literatura de Cordel"** na fonte display.

### Elementos Decorativos (xilogravura)
Imagens PNG 32-bit em `elementos/` (nomeclatura herdada do editor Wix): `siteWix.png` (separador), `siteWix2.png`–`siteWix15.png` e variantes brancas `siteWix3_branco.png`/`siteWix11_branco.png`. Posicionadas de forma absoluta com `clamp()` para largura e `vw` para posição; **opacidade 25% abaixo de 1440px e ocultas no mobile (<768px)**.

## Sessões e Layout

### Navbar (fixa, glassmorphism)
- Fixa no topo; transparente no início → ao rolar (`>40px`) ganha fundo translúcido `rgba(252,245,236,0.6)` + blur 12px.
- Brand à esquerda, links (Início, Sobre, Biografias, Contato) à direita.
- Link ativo: terracota com barra de 20px abaixo.
- Mobile: hambúrguer (anima para ✕) abre gaveta lateral 280px fundo `--color-surface`.

### Hero (página inicial)
- 100vh, gradiente `135deg` (bege → `#F2D9CF` → bege-warm).
- Subtítulo terracota + título com gradiente de texto + descrição + 2 CTAs.
- Animação `fadeInUp` em cascata (0s/0.2s/0.4s/0.6s). 3 elementos decorativos (pássaro no título, lado esquerdo/direito).

### Carrossel "Vozes do Cordel"
- Fundo escuro (`--color-text`), título dourado claro, 3 poemas em itálico.
- Autoplay 6s, setas circulares `‹`/`›`, dots (ativo expande para 24px).
- ⚠️ **Planejado: substituir por seção de Comentários** (ver `requisitos.md`).

### Cards
- Glass (fundo translúcido + blur), raio 20px; hover: `translateY(-4px)` + sombra maior.

### Seção Sobre (página inicial)
- Card central (máx. 800px), texto justificado, CTA "Saiba Mais". Fundo com 2 imagens decorativas.

### Apoio e Realização (parceiros)
- Título H3 terracota, grid de logos (CNPq, ACVPB, DCI, PPGCI) centralizados (máx. 1000px).
- Hover: leve zoom. Logo máx. 200px/80px altura; mobile: 140px/60px.
- ⚠️ **Pendência:** ordem do apoio — ACVPB (segunda) deve ir para a direita (ver `requisitos.md`).

### Página Sobre
- Page-hero (padding topo 80px+6rem, gradiente, título com fadeInUp).
- Texto da pesquisa: 6 parágrafos justificados com recuo (`text-indent: 2em`).
- Equipe: grid auto-fill 280px, foto 160x200 (borda dourada, canto 10/28px), nome, papel, ícones sociais.

### Página Biografias
- Filtro de letras A–Z (sticky abaixo da navbar, ativo = terracota, indisponível = apagado).
- Divisor de letra: inicial grande terracota + gradiente de linha.
- Cards de biografia (2 colunas): foto 180x230 (raio assimétrico 12/32px, borda dourada 3px) ou placeholder com iniciais em gradiente; nome, resumo (máx. 4 linhas), botão "Saiba Mais" (pill com seta →).
- **Modal de biografia**: overlay com blur + barra lateral gradiente terracota→dourado; cabeçalho com foto 120x150, nome em gradiente de texto, subtítulo; corpo com drop cap + parágrafos + vídeo 16:9 opcional.
  - **Capas e Folhetos** (seção no modal, exibida quando houver capas): título display terracota com divisor superior; galeria `.covers-grid` (auto-fill, min 140px) com figurinhas 3:4, raio assimétrico 8/16px, borda dourada 2px, hover sobe 3px. Dados vindos de `data-covers` (JSON em `data-src`/`data-title`, escapados e validados por `http`).

### Página Contato
- Grid 2 colunas: infos (ícone em círculo + texto) e card de formulário glass (Nome+Sobrenome, Email, Mensagem).
- Inputs: fundo branco 60%, borda raio 12px; foco → borda terracota + anel `rgba(196,81,61,0.1)`.

### Footer
- Fundo escuro, barra superior de 3px em gradiente terracota→dourado.
- Brand, navegação, divisor, copyright e crédito do desenvolvedor (pill).
- ⚠️ **Pendência:** adicionar Jackson nos créditos como **ilustrador** (ver `requisitos.md`).

### Botões
- `btn-primary`: gradiente terracota, texto branco, sombra; hover sobe 2px.
- `btn-outline`: borda terracota 2px; hover preenche terracota.
- `btn-glass` e `btn-sm` (compacto).

### Animações
- Tipos: `reveal`, `reveal-left`, `reveal-right`, `reveal-scale`, `stagger-children` (atrasos 80ms em cascata) — via IntersectionObserver (threshold 0.15).
- Keyframes: `fadeInUp`, `fadeIn`, `slideUp`, `float`, `pulse-glow`.

## Painel Admin (admin.html)
- Login Google OAuth. **Design**: fundo bege, sidebar escura `#2C1810` (marca dourada, link ativo terracota), header branco com borda inferior dourada, cards brancos (hover borda dourada).
- Formulário deslizante lateral (520px) com Nome, Iniciais (auto-geradas), Subtítulo, Resumo, Biografia, Foto (abas URL/Nenhuma) e Vídeo; toast de notificação; diálogo de confirmação de exclusão.

## Responsividade
- **1440px↓**: decorativos viram marca-d'água (opacidade 0.25).
- **1024px↓**: títulos e cards de biografia encolhem; contato vira 1 coluna.
- **768px↓**: menu gaveta, grids em 1 coluna, modal empilhado, decorativos ocultos.
- **480px↓**: títulos menores.

## Fluxos de Navegação
1. **Início** → CTA "Conhecer Poetisas" → Biografias; "Sobre o Projeto" → Sobre.
2. **Biografias** → filtro A–Z ou scroll → clique no card → modal com biografia completa (+ capas/folhetos futuros).
3. **Contato** → formulário (envio a definir com backend).
4. **Admin** (`admin.html`) → login Google → CRUD de poetisas.

## Protótipos
- `index.html`, `sobre.html`, `biografias.html`, `contato.html` e `admin.html` (cópia do modelo de referência) — base visual para o projeto.
- Paleta completa e componentes documentados nas seções acima (fonte canônica: `styles.css`).