# Reunião — 18 de Setembro (Karcia)

> Anotações dos pedidos da chefia. Pendências a executar no projeto. Fonte: `Reunião dia 18 de setembro KARCIA.txt`.

## Requisitos
- [ ] **Painel Admin** para que a chefia consiga alterar dados ou adicionar poetisas.
- [X] **Tipografia feita por Jackson** — creditar/considerar.
- [ ] Site aberto para **todos** (acesso público e livre).
- [ ] Tudo **simples e fácil de achar** (usabilidade/findability).
- [ ] **Sem classe temática** (sem classificações por tema).
- [ ] **Comentários** no lugar das "Vozes do Cordel" (substituir o carrossel de poemas).
- [ ] Seguir o modelo do site de referência: `https://siterasc.vercel.app/`.
- [X] Nas **biografias**, incluir **capas e folhetos** dos cordéis.
- [X] **Contato** deve ser incluído (página já existe no modelo).
- [ ] 🔴 **PRIORIDADE MÁXIMA:** adiantar o sistema para colocar **todas as poetisas**.
- [X] Dados das poetisas: **Foto, Nome, Biografia, Capas dos cordéis**.
- [X] Ordem do apoio: **ACVPB (segunda) vai para a direita**.
- [x] Adicionar **Jackson nos créditos** como **ilustrador**.
- [ ] Avaliar como ficará a **manutenção** do site.
- [ ] _Pergunta em aberto:_ **quanto vai custar o domínio?**

## Notas de decisão
- O carrossel "Vozes do Cordel" será substituído por uma seção de comentários.
- Estrutura de dados das poetisas: foto, nome, biografia e capas de cordéis.
- Não haverá classes/temas alheios ao modelo de referência.

## Requisitos Cumpridos

> Seção mantida pela **Regra 8** do `AGENTS.md`: todo requisito concluído é registrado aqui com o que foi feito e a data.

- **Tipografia feita por Jackson** — crédito de "Ilustração e Tipografia" adicionado no rodapé de todas as páginas, no mesmo visual do crédito do desenvolvedor. _(19/09/2026)_
- **Capas e folhetos nas biografias** — seção "Capas e Folhetos" no modal de biografia, com galeria de capas (`covers-grid`), dados via `data-covers` (escapados e validados). _(19/09/2026)_
- **Contato incluído** — página `contato.html` presente no projeto e linkada no menu de todas as páginas. _(19/09/2026)_
- **Dados das poetisas: Foto, Nome, Biografia, Capas** — cards exibem foto/nome/biografia; capas integradas à seção de capas e folhetos. _(19/09/2026)_
- **Ordem do apoio: ACVPB (segunda) vai para a direita** — ordem ajustada para CNPq, DCI, PPGCI, ACVPB nas 4 páginas. _(19/09/2026)_
- **Jackson nos créditos como ilustrador** — pill `.footer-dev` com ícone de caneta no rodapé, ao lado do crédito do desenvolvedor. _(19/09/2026)_