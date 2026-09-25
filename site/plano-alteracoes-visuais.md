# Plano de Alterações Visuais e de Experiência — Página Inicial

> Documento técnico de planejamento (Regra 9 — **aprovação exigida antes de qualquer execução**).
> Reúne a lista de mudanças que a chefia planeja fazer no site "Memórias das Poetisas da
> Literatura de Cordel", com foco em **experiência (UX), responsividade e tipografia legível**.
>
> Fonte de rigor: `AGENTS.md` (Regras 5, 6, 7, 8, 9), `design.md` (conformidade visual),
> `memoria.md` (contexto), `SKILL.md` (documento canônico ao iniciar backend — aplicável por
> analogia, pois toca em CSS/HTML), `requisitos.md` (pedidos da chefia).
>
> ⚠️ **Nota de transparência (desatualizada):** a imagem anexada pela chefia não pôde ser
> exibida nesta sessão (limitação de entrada de imagem do agente). A identificação do elemento
> foi feita via código (ver estado atual abaixo).
>
> ⚠️ **Estado atual do projeto (25/09/2026):** a página foi reestruturada e as referências
> originais deste plano existem **apenas aqui**, não mais no código:
>   - O pássaro decorativo (`.decor-hero-bird` / `siteWix13.png`) **não existe mais** — o hero
>     atual é `.home-hero` com a xilogravura `matriz-memoria.svg`.
>   - A folha de estilos é **`site/visual/public.css`** (não existe `styles.css`).
>   - Os scripts são **`site/back/*.js`** (não existe `script.js`).
> O plano permanece **válido como intenção** (A/B/C/D), mas a execução — quando aprovada —
> deve ser re-analiada contra o código atual. Itens C e D (rodapé sans-serif + textos de leitura
> em sans-serif) **já estão de fato implementados**: o projeto usa `Inter` (Google Fonts,
> carregada nas 5 páginas) e o rodapé já segue `var(--font-body)`. Segue suspenso conforme
> Regra 9 até aprovação explícita.

---

## 1. Resumo executivo

Quatro alterações planejadas, todas **client-side (HTML/CSS/JS vanilla)** e sem impacto em
dados:

| # | Mudança | Natureza | Área |
|---|---|---|---|
| A | **Animação do pássaro** cruzando a tela da direita → esquerda | CSS/JS | Hero |
| B | **Responsividade de verdade** (layout se ajusta, não apenas encolhe) | CSS | Global |
| C | **Rodapé legível** (fontes sans-serif comuns) | CSS | Footer |
| D | **Nova regra tipográfica**: textos de leitura sempre em sans-serif | Regra (documento) | Global |

Princípio norteador (bom senso da chefia + Regras 5/6 do `AGENTS.md`): melhorar usabilidade e
leitura **sem quebrar a identidade visual** do `design.md` (paleta terrosa, xilogravuras,
JacksonXilogravura nos títulos).

---

## 2. A — Animação do pássaro no hero

### 2.1 Estado atual (verificado no código)
- **Elemento:** ~~`<img src="../elementos/siteWix13.png" alt="Decor Pássaro"
  class="decor-img decor-hero-bird">` no `<section class="hero">` do `index.html`~~ —
  **não existe mais**. O hero atual é `.home-hero` (com `matriz-memoria.svg`).
- **CSS atual:** só existe **`site/visual/public.css`** (não há `styles.css`); não há
  `.decor-hero-bird` nem classe `hero` em uso.
- **Media queries existentes:** em `public.css`, retorno `≤768px` os elementos decorativos são
  ocultados (`decor-img` some no mobile — decisão correta a preservar).
- **Consequência:** o item A precisa ser **redesenhado** quando a chefia aprovar o voo —
  reutilizar `matriz-memoria.svg` (bird-memória) em faixa fixa, em vez do `siteWix13.png`.

### 2.2 Objetivo
O pássaro deve **cruzar a tela, da direita para a esquerda** (como um voo decorativo contínuo),
**na parte de cima do hero, logo abaixo do header fixo**, e **permanecer parado em relação à
rolagem** (o elemento não deve "descer" junto com o conteúdo ao rolar — comportamento
`position: fixed` na faixa do topo).

### 2.3 Comportamento exato proposto

| Aspecto | Especificação |
|---|---|
| Posição | Faixa ornamental **abaixo do header fixo** (topo do viewport, acima/sobre o hero) |
| Voo | **Direita → esquerda**, contínuo e repetido (loop), repassando a cada ciclo |
| Rolagem | Elemento com **`position: fixed`** → fica atrelado ao topo do viewport, **não desce** com o scroll |
| Mobile | Oculto em `≤768px` (mantém comportamento atual — decorativos somem) |
| Interação/UX | `pointer-events: none` (não bloqueia cliques) · `z-index` abaixo do texto/CTAs |
| Acessibilidade | Novo `@media (prefers-reduced-motion: reduce)` → desativa o voo (vira imagem estática) |
| Visual | Reutiliza asset existente do hero (`matriz-memoria.svg`); nenhuma nova asset; respeita paleta/opacidade do `design.md` |

### 2.4 Implementação sugerida (a executar só após aprovação)

**CSS — marcação da faixa fixa:**
```css
.hero-flying-bird {
  position: fixed;
  top: calc(/* altura do header fixo + folga */);
  left: 0;
  right: 0;
  height: clamp(40px, 5vw, 90px);
  z-index: calc(var(--z-navbar) - 1); /* abaixo do header, acima do fundo */
  pointer-events: none;
  overflow: hidden;
}
```

**Animação (keyframes):**
```css
@keyframes bird-flight {
  from { transform: translateX(110vw); }
  to   { transform: translateX(-110vw); }
}
.hero-flying-bird .decor-hero-bird {
  animation: bird-flight var(--dur-voo, 22s) linear infinite;
}
```

**Acessibilidade (reduzir movimento):**
```css
@media (prefers-reduced-motion: reduce) {
  .hero-flying-bird .decor-hero-bird { animation: none; }
}
```

> **Nota de confirmação à chefia:** a altura exata (`top`) e o `z-index` dependerão da medida do
> header fixo no `styles.css` atual (navbar). Definir o valor final na fase de execução,
> preservando "abaixo do header, sobre o hero".

---

## 3. B — Responsividade: o layout deve se ajustar, não apenas encolher

### 3.1 Diagnóstico
O CSS já usa `clamp()` e media queries (ex.: grid "auto-fill", navbar-gaveta em ≤768px). Mas a
chefia quer que a mudança seja estrutural: **o layout se reorganize (reflowo/empilhação),
não apenas diminua proporcionalmente** — que é o comportamento de "encolher tudo" que ocorre
quando se confia só em escalas `vw`/`rem` fixas sem pontos de quebra bem definidos.

### 3.2 Diretrizes a aplicar (por prioridade)

1. **Reflowo estrutural por breakpoint**: grid de 3 colunas → 1 coluna em telas estreitas
   (cards e biografias empilham verticalmente), em vez de só reduzir o `gap`/`font-size`.
2. **Clamp com limites "humanos"**: garantir limites mínimos de legibilidade
   (`clamp(14px, 4vw, 22px)` → nunca deixar texto abaixo de ~14–16px em mobile).
3. **Gaveta real no mobile** para cards/vozes: empilhar em 1 coluna com alinhamento central.
4. **Elementos decorativos**: ocultar ou transformar em marca-d'água conforme menor viewport
   (já parcialmente feito no `design.md` — manter coerência).
5. **Tipografia fluida**: usar `clamp()` também em `line-height` para evitar quebra feia de
   hífen/justificação em telas intermediárias.
6. **Tocar a página, não o banco**: todas essas regras são CSS — zero mudança de dados.

### 3.3 Critérios de aceite
- A 480px / 768px / 1024px o layout **reorganiza** (empilha, reflui) e não só "fica menor".
- Nenhum texto relevante fica ilegível (≤16px) em qualquer viewport comum.
- Nenhuma imagem decorativa bloqueia conteúdo ou clique em nenhum tamanho de tela.

---

## 4. C — Rodapé legível (fontes sans-serif comuns)

### 4.1 Mudança
**Todo e qualquer texto no rodapé** passa a usar **fonte comum e legível do tipo sans-serif**
(em vez de fontes display/serifada como a JacksonXilogravura/Playfair). Isso vale para:

- Nome/credits do rodapé;
- Links de navegação do rodapé;
- Copyright e linha de desenvolvimento ("Ilustração e Tipografia por Jackson", "Desenvolvido
  por Samuel Lucas").

### 4.2 Como
Aplicar nas classes `.footer *` a família: `var(--font-body)` (`Inter`, sans-serif do projeto)
como padrão, com exceções óbvias garantidas só onde o `design.md` mandar manter display
(ex.: marca do footer, se a chefia quiser — **a decidir**).

> **Conflito aparente — decisão da chefia:** o `design.md` hoje prevê `.footer-brand` com
> `font-display`. A nova regra (D) permite título de marca com serifada, mas a regra (C)
> pede rodapé 100% sans. **Vou tratar por padrão: rodapé todo em sans-serif** (atende C),
> com exceção apenas se a chefia solicitar explicitamente a marca em display. Confirmar.

---

## 5. D — Regra tipográfica nova (vira regra permanente)

> **Nova regra (a registrar em `design.md` + este documento e, por consequência, em
> `SKILL.md`/guias ao gerar conteúdo):**

> **Todo texto cujo objetivo é ser lido — o que inclui textos longos, biografias, bios,
> biografias completas, resumos, parágrafos e qualquer conteúdo que o visitante precise ler —
> deve ser entregue, originalmente, com fontes do tipo sans-serif.** Isto **NÃO** inclui
> títulos e subtítulos (que podem manter as fontes de exibição/serifadas conforme o
> `design.md`). Regra aplicável por padrão; **exceção apenas quando o usuário pedir o
> contrário**.

### 5.1 O que muda na prática
- Biografias, resumos, parágrafos de "Sobre", textos de contato → **sans-serif legível**
  (`Inter`/`--font-body`).
- Títulos (H1–H4), subtítulos, marca, CTAs em destaque → mantêm display/serifada (não muda).
- Garante **legibilidade em tela de qualquer tamanho** e coerência com a nova diretriz de
  responsividade (B).

### 5.2 Onde registrar
- `design.md` → nova seção "Tipografia — regra de legibilidade" (Regra 5/6).
- Este documento (fonte de verdade da alteração).
- `memoria.md` → registrar decisão e data.

---

## 6. Arquivos afetados (quando executado)

| Arquivo | Ação |
|---|---|
| `site/estrutura/index.html` | ↩️ possivelmente: contêiner-faixa do pássaro no hero (opcional — pode sair só via CSS) |
| `site/visual/public.css` | ↩️ A: keyframes `bird-flight` + faixa fixa + `prefers-reduced-motion`; B: media queries de reflowo; C: `.footer *` sans (já em uso) |
| `site/back/acervo.js` | ✏️ (se necessário) hook para medir altura do header fixo / `ResizeObserver` |
| `design.md` | ✏️ registrar regra D + seção de responsividade |
| `memoria.md` | ✏️ decisão da chefia (data) |
| `requisitos.md` | ✏️ marcar Req como cumprido **após execução aprovada** (Regra 8) |

---

## 7. Riscos e conformidade

- **Conformidade visual** (`design.md`): nenhuma mudança de paleta, tipografia display,
  glassmorphism ou identidade geral — só adição de movimento + reorganização responsiva +
  rodapé legível.
- **Regra 11 vulnerabilidades** (`backend.md`): este é trabalho **estático (HTML/CSS/JS)**; sem
  backend, sem RLS, sem input do usuário → nenhuma das 11 vulnerabilidades se aplica. Mantém-se
  escape/validação nas demais telas (fora de escopo aqui).
- **UX**: animação contínua pode incomodar → mitigação por `prefers-reduced-motion`. Opcional:
  pausar no `hover`/foco (a definir).
- **Performance**: reutiliza asset existente, sem novas requisições de imagem.

---

## 8. Fases de execução (após aprovação expressa)

| Fase | Entrega | Verificação |
|---|---|---|
| 1 | CSS A (faixa fixa + keyframes + reduced-motion) | bird voa da direita p/ esquerda, parado sob header ao rolar; some ≤768px |
| 2 | CSS B (media queries reflowo) | 480/768/1024: layout empilha e continua legível |
| 3 | CSS C (rodapé sans) | texto do rodapé em sans-serif legível |
| 4 | Documentação: `design.md` (regra D), `memoria.md`, `requisitos.md` | Regras 5/6/8/10 cumpridas |

---

## 9. Decisões que exigem confirmação antes de executar

1. **Pássaro apenas no hero** ou em todas as páginas (faixa fixa global)? *(proposta: apenas
   hero, página inicial, para não poluir as demais)*
2. **Rodapé 100% sans** (atende C) ou manter a marca `.footer-brand` em display?
   *(proposta: 100% sans, conforme pedido "todo e qualquer texto no rodapé")*
3. Altura/posição exata da faixa sob o header fixo (medir no CSS atual na execução).
4. Reduzir/parar o voo em `hover`/foco para leitura tranquila? *(proposta: sim, apenas no
   hover/foco)*
5. Se a animação deve repetir sem fim ou ter pausas entre ciclos. *(proposta: loop contínuo
   com movimento lento, ~20–25s por ciclo)*

---

_Registrado em 22/09/2026. A execução dessas alterações fica **suspensa até aprovação explícita**
da chefia (Regra 9 do `AGENTS.md`). Toda implementação concluída será registrada em
`requisitos.md` (Regra 8) e `memoria.md` (Regra 10)._
