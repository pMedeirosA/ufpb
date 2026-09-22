# AGENTS.md

Este arquivo é a fonte oficial de diretrizes de trabalho para agentes de IA neste projeto. Toda ordem, instrução ou regra sobre como o agente deve agir ou pensar deve ser registrada neste documento para garantir consistência e rastreabilidade.

## Regras

### Regra 1 — Registro de Diretrizes
Todas as instruções e diretrizes sobre o comportamento, processo de raciocínio e decisões do agente devem ser documentadas neste arquivo.

### Regra 2 — Conformidade
O agente deve consultar este documento antes de iniciar qualquer atividade e seguir estritamente as regras aqui definidas.

### Regra 3 — Escopo de Ação
O agente deve executar apenas o que lhe for solicitado, sem estender o escopo além do pedido. As soluções devem ser implementadas da forma mais lógica e simples possível.

### Regra 4 — Transparência em Mudanças Radicais
Alterações radicais (que alterem significativamente a estrutura, arquitetura ou comportamento do projeto) devem ser explicadas ao usuário antes ou durante a implementação.

### Regra 5 — Conformidade Visual
Qualquer alteração visual ou adição de novo elemento no projeto deve seguir exatamente as especificações definidas em `design.md`.

### Regra 6 — Prevenção de Vulnerabilidades
Nenhuma vulnerabilidade listada em `backend.md` (seção "Vulnerabilidades Conhecidas — Não Reproduzir") pode estar presente no projeto. Ao descobrir uma nova vulnerabilidade, o agente deve registrá-la nessa lista e nunca reproduzi-la no código produzido.

### Regra 7 — Organização
Todo código, arquivo, estrutura de pastas e documentação do projeto deve ser mantido perfeitamente organizado, seguindo padrões claros e consistentes.

### Regra 8 — Registro de Requisitos Cumpridos
Todo requisito concluído deve ser adicionado à seção **"Requisitos Cumpridos"** dentro de `requisitos.md`, com resumo do que foi feito e a data da conclusão.

### Regra 9 — Planejamento e Autorização Explícita
Antes de qualquer execução, o agente deve primeiro elaborar e apresentar um **plano** de ação, fundamentado nos arquivos `.md` do projeto (`requisitos.md`, `design.md`, `backend.md`, `AGENTS.md`). Sugestões de próximos passos, planos ou hipóteses devem ser apresentadas apenas como proposta. Nenhuma alteração, edição, commit ou deploy deve ser realizado sem a **aprovação explícita** do usuário sobre o plano proposto.

### Regra 10 — Leitura Obrigatória da Memória
Todo agente que iniciar uma sessão neste projeto **sem memória prévia dele** (primeira vez trabalhando no projeto, contexto resetado, memória perdida ou ausência de histórico) **DEVE ler obrigatoriamente o arquivo `memoria.md`** antes de qualquer outra atividade, e segui-lo como fonte de contexto. A leitura é condição obrigatória para começar a trabalhar; não pode ser ignorada ou postergada.

## Diretrizes do Projeto
- _Em construção_