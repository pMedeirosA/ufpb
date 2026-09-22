# Memória do Projeto

> Documento de recuperação de contexto. Leia este arquivo **obrigatoriamente** ao iniciar qualquer sessão de trabalho neste projeto (ver Regra 10 do `AGENTS.md`). Mantenha-o atualizado ao final de cada sessão.

## O que é o projeto
Site **"Memórias das Poetisas da Literatura de Cordel"** — memorial/portal das poetisas da literatura de cordel, ligado a um trabalho acadêmico (UFPB). É uma cópia local/variante do site de referência `siterasc.vercel.app` (modelo Wix).

## Estrutura
- `AGENTS.md` — regras de trabalho (fonte canônica). **Consultar antes de agir.**
- `requisitos.md` — pedidos da chefia (reunião 18/09, Karcia). Requisitos marcados com `[X]` são os que o usuario quer executar.
- `design.md` — design system do site (paleta, tipografia, componentes). Fonte da conformidade visual.
- `backend.md` — arquitetura/tecnologias/vulnerabilidades do modelo original (). Nada disso deve ser reproduzido.
- `memoria.md` — este arquivo.
- `site/` — código do site:
  - `estrutura/` — `index.html`, `sobre.html`, `biografias.html`, `contato.html`, `admin.html`.
  - `visual/styles.css` — folha de estilo única.
  - `back/script.js` — JS do site + `` (config pública do ).
  - `elementos/` — imagens decorativas (xilogravura, nomeclatura Wix).

## Regras de trabalho (resumo do AGENTS.md)
- Executar apenas o que foi **solicitado** e **aprovado** (Regra 9 — plano + aprovação explícita).
- Mudanças visuais seguem **sempre** o `design.md` (Regra 5).
- Vulnerabilidades conhecidas do modelo ficam no `backend.md` e **não podem** ser reproduzidas (Regra 6).
- Todo requisito concluído entra em **"Requisitos Cumpridos"** no `requisitos.md` (Regra 8).

## Estado atual
### Concluído (registrado no `requisitos.md`)
- Crédito da tipografia de Jackson no rodapé.
- "Capas e Folhetos" no modal de biografias (dados via `data-covers`, escapados/validados).
- Página de contato incluída e linkada no menu.
- Dados das poetisas: foto, nome, biografia e capas.
- Ordem do apoio com ACVPB à direita (CNPq, DCI, PPGCI, ACVPB).
- Jackson nos créditos como ilustrador.

### Pendente
- **Req 06 — Comentários no lugar das "Vozes do Cordel"** (substituir o carrossel de poemas). ⚠️ A implementação foi feita e **revertida** por falta de autorização. Conteúdo dos comentários ainda indefinido — fazer apenas sob plano aprovado.
- Req 03/04/05/07 — itens de verificação (site aberto, simplicidade/findability, sem classe temática, seguir modelo).
- Backend/admin (Req 01, 10, 14, 15) — **pausados** por decisão da chefia ("só visual por enquanto").

## Decisões-chave
- **Requisição: só visual.** Backend/admin não serão tocados por ora.
- Carrossel "Vozes do Cordel" → será substituído por seção de comentários (conteúdo a definir).
- Dados de poetisas: foto, nome, biografia, capas. Sem classes/temas alheios ao modelo.
- **Crédito do desenvolvedor é de Samuel Lucas** (portfolio `portsamuellmsa.vercel.app`) — substituiu o desenvolvedor antigo (Mikhael Coelho) no pill do rodapé das 4 páginas.

## Segurança (modelo original — não reproduzir)
- Config do  é **pública** por design (front-end); proteção depende das regras do 
- Admin original: `ALLOWED_EMAILS` vazio ⇒ qualquer conta Google entra na interface; porém **escrita/exclusão negadas** pelas regras ("Missing or insufficient permissions") — painel é somente leitura na prática.
- Leitura da coleção `poetisas` é **pública** (necessária para o site carregar).
- Detalhes completos: `backend.md` (vulnerabilidades #1–#11).

## Convenções
- Comentários de seção nos arquivos: linha de `═══ ═══` (55 caracteres) delimitando blocos numerados.
- `script.js` em inglês; conteúdo do site em português.
- Cabeçalhos de seção em `.md` em português, títulos `###`.