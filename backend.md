# Backend do Projeto

## Visão Geral
Arquitetura e implementação do back-end do site **"Memórias da Poesia Popular"**, baseado em **Supabase (PostgreSQL + Auth + RLS)** conforme `plano-supabase.md`.

## Arquitetura
- **Confirmada pelo código:** aplicação 100% client-side, sem servidor próprio.
- Admin = **um único HTML** (`admin.html`) com CSS e JavaScript inline; `supabase-config.js` separado (URL + chave `anon`/publishable).
- Dados via **Supabase Data API (REST)** — SELECT público para o site; INSERT/UPDATE/DELETE restritos por **RLS** a usuários autenticados com e-mail na allowlist (`admin_emails`). Sem Storage (fotos e capas são por URL).

## Tecnologias
- Linguagem: HTML/CSS/JS vanilla (sem framework).
- Banco de dados: **PostgreSQL (Supabase)** — tabela `poetisas` (+ `admin_emails`).
- Autenticação: **Google OAuth** via Supabase Auth; autorização por allowlist em `admin_emails` (deny-by-default).
- Deploy: estático (Vercel ou hospedagem atual) + `vercel.json` para CSP/security headers.

## API / Endpoints
- Sem API própria. As páginas usam a **Data API do Supabase** (`/rest/v1/...`) direto do navegador com a chave `anon` (pública por design). A barreira real é o **RLS deny-by-default**.

## Autenticação e Segurança
- Login do admin: Google OAuth (Supabase) → JWT no navegador.
- `admin_emails`: lista de e-mails autorizados. **Lista vazia = acesso negado** (nunca permite "qualquer e-mail").
- Toda política de escrita exige `authenticated` **e** e-mail presente em `admin_emails`.
- Requisitos mínimos (nunca remover): deny-by-default, escape/validação de toda entrada antes do DOM, CSP no deploy, sem segredos no client-side, versões de SDK fixadas e registradas.

## Modelo de Dados
- Tabela `poetisas`: `id` (uuid PK), `name`, `initials`, `letter`, `subtitle`, `summary`, `bio`, `photo_type` (`url`/`none`), `photo_url`, `video_url`, `covers` (jsonb `[{src,title}]`), `created_at`, `updated_at`.
- Tabela `admin_emails`: allowlist de e-mails.

## Deploy
- Estático; Supabase gerencia banco/auth. CSP restrito (`default-src 'self'`), `nosniff`, Referrer-Policy em `vercel.json`.

---

## Vulnerabilidades Conhecidas — Não Reproduzir

> Aviso: o usuário **não quer nenhuma** destas vulnerabilidades no site. Todo agente deve garantir que o código produzido não apresente falhas semelhantes. Os itens abaixo são classes de falha identificadas no modelo de referência avaliado (código real analisado) e mapeadas para a mitigação atual no Supabase (ver `plano-supabase.md`, seção 4).

### 1. Login administrativo com lista de e-mails autorizados vazia (MÉDIA)
- **Problema**: lista vazia + checagem que retorna `true` quando vazia. Qualquer conta Google entra na interface do painel.
- **Prevenção (aplicada)**: deny-by-default. `admin_emails` é consultada via RLS; lista vazia ou erro = **acesso negado**.

### 2. XSS armazenado via dados do banco injetados em `innerHTML` (ALTA)
- **Problema**: campos do banco interpolados em `innerHTML` sem escapar ⇒ stored XSS no navegador de qualquer visitante.
- **Prevenção (aplicada)**: todo dado do banco é escapado antes do DOM (`escapeHtml`) ou renderizado com `textContent` (site e admin).

### 3. Injeção em atributo `src` de imagem (ALTA)
- **Problema**: URL capciosa (`x" onerror="alert(1)`) quebra o atributo; protocolos `javascript:`/`data:` passam.
- **Prevenção (aplicada)**: escapar atributos HTML **e** validar a URL (somente `http`/`https`) antes de usar em `src`; conversão automática de links do Google Drive.

### 4. Embed de vídeo por URL livre / domínios arbitrários (MÉDIA)
- **Problema**: qualquer domínio contendo "embed" ou "player" vira `src` de iframe (clickjacking/phishing).
- **Prevenção (aplicada)**: `convertToEmbed` aceita apenas YouTube/Vimeo validados por regex de ID; nunca devolve URL de terceiros como iframe.

### 5. Config pública + regras de banco como única barreira (ALTA)
- **Problema**: chave `anon` é pública por design; proteção não pode depender do segredo da chave.
- **Prevenção (aplicada)**: chave `secret`/`service_role` nunca no client-side; barreira real = **RLS deny-by-default + policies por operação/papel**. Nota (25/09): a Data API do Supabase **não permite restringir CORS no dashboard** (header `Access-Control-Allow-Origin` é `*` fixo; sem "Allowed Origins" — confirmado em docs e discussões do GitHub). Como leitura pública já é o objetivo e escrita exige login+allowlist, o wildcard não enfraquece a proteção real.

### 6. Ausência de cabeçalhos de segurança / CSP (MÉDIA)
- **Prevenção (aplicada)**: CSP restrito (`default-src 'self'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy` no deploy.

### 7. Código morto / sensível (BAIXA)
- **Problema**: constantes declaradas e nunca usadas, branches legados.
- **Prevenção (aplicada)**: remoção de código morto (ex.: `AUTH_KEY`, branch `upload`); sem armazenar segredos/sessões em constantes client-side.

### 8. Sem rate limiting ou proteção contra força bruta (MÉDIA)
- **Prevenção (aplicada)**: **Google OAuth** gerencia credenciais; monitoração via logs de auditoria do Supabase. (CORS do dashboard não é configurável — ver notícia #5.)

### 9. Confiança apenas na validação client-side (MÉDIA)
- **Prevenção (aplicada)**: a defesa real é server-side (RLS deny-by-default); validação no client é apenas UX.

### 10. Dependências e SDKs sem política de atualização (BAIXA)
- **Prevenção (aplicada)**: versão fixa do supabase-js por CDN, registrada no `plano-supabase.md` e revisada conforme `SKILL.md`.

### 11. Injeção via `onclick` com ID não escapado (MÉDIA)
- **Prevenção (aplicada)**: sem `onclick` inline — `addEventListener` + `dataset`/closure (nunca interpolar dados em handler).

---
**Práticas mínimas para este projeto (nunca remover):**
- Deny-by-default em autenticação e regras de banco (RLS).
- Escapar/validar toda entrada antes do DOM.
- CSP e cabeçalhos de segurança no deploy.
- Sem segredos no client-side; segredos sempre em variáveis de ambiente server-side.

---

## Vulnerabilidades Típicas de Código Gerado por IA (pesquisa 21/09/2026)

> Seção criada por pesquisa completa (fontes: Veracode GenAI Code Security Report 2026, Cloud
> Security Alliance, GitHub/Georgia Tech "Vibe Security Radar", CodeRabbit vs Humans 2026,
> Stanford/Boneh, Socket/Checkmarx — slopsquatting, OWASP LLM Top 10 2025/2026, OWASP Top 10
> para Aplicações Agentic (ASI) 2026, GitGuardian State of Secrets Sprawl 2026).
> **Regra 6 do `AGENTS.md`: nenhuma destas pode ser reproduzida no código produzido.**

### Contexto — números (2026)

- **~44–45%** das tarefas com código gerado por IA introduziram vulnerabilidade em testes; 56% de taxa de aprovação em segurança (estável desde 2025, enquanto o volume de código gerado disparou) — Veracode 2026.
- **XSS: 85% de falha**; **Log injection: 88%**; SQL injection: 17%; algoritmos criptográficos: 13% (Veracode 2026).
- PRs co-autorados por IA: ~**1,7x mais problemas** no geral, **até 2,74x mais vulnerabilidades**, ~2x mais lacunas de tratamento de erro que PRs humanos (CodeRabbit, 470 PRs, 2026).
- **74 CVEs** diretamente ligadas a ferramentas de "vibe coding" até março/2026 (Georgia Tech), crescendo de 6 (jan) para 35 (mar) — ~6x em um trimestre.
- **28,6 milhões de segredos hardcoded** em commits públicos em 2025 (+34% vs 2024); **24.008 segredos únicos só em arquivos de config MCP** no GitHub público (2.117 ainda válidos na detecção) — GitGuardian 2026.
- Estudo Stanford/Boneh: desenvolvedores usando IA escreveram **código menos seguro em 4 de 5 tarefas**, porém se sentiram **mais confiantes** sobre a segurança.

### Padrões clássicos que IAs repetem (NÃO REPRODUZIR)

1. **Ausência de sanitização de entrada** — a falha mais comum de código LLM, mesmo quando instruído a "escrever código seguro".
2. **XSS via `innerHTML`/interpolação sem escape** (mesmo padrão das vulnerabilidades #2/#3 deste arquivo).
3. **SQL injection por concatenação de strings**.
4. **Segredos hardcoded** (API keys, tokens, senhas) reproduzidos do treino.
5. **Command injection** via `exec()` com entrada não confiável.
6. **`eval()`** em dados não confiáveis.
7. **Hash fraco para senhas** (MD5/SHA1) e criptografia inadequada.
8. **CORS wildcard** em APIs autenticadas.
9. **Verificação SSL desabilitada.**
10. **Path traversal** por caminhos não sanitizados.
11. **Catch blocks vazios** que engolem erros de segurança silenciosamente.
12. **Faltas recorrentes**: null checks, verificações de auth, corner cases e log de exceções.

### Vieses típicos de bugs de IA (pesquisa acadêmica 2026)

- Padrões mais comuns (Survey of Bugs in AI-Generated Code, arXiv 2512.05239): **Misinterpretation** (mal-entendido do pedido — o mais comum), **Missing Corner Cases**, **Hallucinated Object**, **Incomplete Generation**, **Wrong Attribute**.
- **"Seductive simplicity"**: o código parece consistente, compila e executa — mas está errado/inseguro. **Obriga verificação explícita** (ver `SKILL.md`, regra de verificação).
- Modelos treinados em repositórios públicos reproduzem padrões inseguros **com a mesma confiança** que reproduzem padrões seguros.

### Supply chain — dependências alucinadas (slopsquatting)

- **~20% dos pacotes recomendados por LLMs não existem** (Socket, 576 mil amostras Python/JS); 43% dos nomes alucinados se repetem em 10 execuções — previsíveis para atacantes.
- Atacantes monitoram saídas de Copilot/Claude/Cursor e **registram os nomes alucinados em horas** no npm/PyPI (ataque ativo em 2025–2026).
- **Mitigação**: toda dependência sugerida por IA é **não confiável até verificação**; conferir existência/histórico/downloads; lockfiles; pinagem de versões por hash; desconfiar de nomes novos/genéricos.

### OWASP LLM Top 10 (2025/2026) — resumo aplicável

| Código | Risco | Lição para este projeto |
|---|---|---|
| LLM01 | **Prompt Injection** (mais explorada; variante indireta via conteúdo externo: docs, PRs, páginas) | Conteúdo externo lido por agente/LLM nunca é instrução confiável |
| LLM02 | Descoberta de Informação Sensível | Segredos fora do alcance dos agentes |
| LLM03 | Supply Chain (plugins, prompts, dependências comprometidos) | Verificar dependências (slopsquatting acima) |
| LLM04 | Envenenamento de dados/modelo | Validar dados antes do DOM/processamento |
| LLM05 | Tratamento impróprio de saída | Saída de IA = dado não confiável até validação |
| LLM06 | **Agency excessiva** (agente com poder demais) | Escopo mínimo; ações sensíveis exigem aprovação |
| LLM07 | Vazamento de prompt de sistema / contexto oculto | Nunca colocar segredos/regras sensíveis em contexto exposto |
| LLM08 | Fraquezas de vetores/embeddings (RAG) | Não aplicável hoje (sem RAG) — monitorar |
| LLM09 | Desinformação | Verificar conteúdo factual gerado |
| LLM10 | Consumo descontrolado (custo) | Limites de operações/leitura |

### OWASP Top 10 para Agentes (ASI, 2026) — resumo

ASI01 Goal Hijack (injecção + autonomia), ASI02 Tool Misuse, ASI03 Abuso de identidade/privilégio, ASI04 Supply Chain agentic, ASI05 Execução de código inesperada, ASI06 Envenenamento de memória/contexto, ASI07–ASI10 novas classes fora de LLMs tradicionais (incluindo ASI08 Cascading Failures, ASI09 Exploração de confiança humano-agente e ASI10 Rogue Agents). **Lições**: limitar ferramentas/credenciais por tarefa; auditar chamadas de ferramentas; sandbox; exigir confirmação em operações destrutivas.

### Ataques reais a agentes de código (2025–2026)

- **CamoLeak (CVE-2025-59145, CVSS 9.6)**: exfiltrou segredos e código de repositórios privados via PR oculto no GitHub Copilot Chat.
- **Comment and Control (abr/2026)**: três agentes (Claude Code, Gemini CLI, Copilot Agent) vazaram tokens de CI (`ANTHROPIC_API_KEY`, `GITHUB_TOKEN`) via comentário/PR/título de ticket com instruções ocultas.
- **Regra prática**: conteúdo externo (issues, PRs, docs, respostas de API) é **não confiável**; limitar as credenciais que o agente alcança (mínimo privilégio), não confiar em filtragem de saída como defesa principal.

### Notas de segurança específicas do Supabase (arquitetura alvo)

> Registradas aqui porque formam a base da proteção do backend (ver `plano-supabase.md`).

- **Chave `anon`/publishable (`sb_publishable_`) é pública por design** (fica no browser) — a proteção real é **100% RLS (deny-by-default)**, nunca o segredo da chave. Legacy `anon`/`service_role` deprecados até o fim de 2026.
- **Chave `secret`/`service_role` NUNCA no client-side** — ela tem `BYPASSRLS`; expor = banco inteiro comprometido.
- Habilite RLS em **toda tabela exposta** (schema `public` alcançável pela Data API) e **force** para donos. Política por operação (SELECT/INSERT/UPDATE/DELETE) e por papel (`anon`/`authenticated`).
- "Expor tabela à Data API" ≠ RLS: o grant libera o endpoint; a política decide quais linhas são visíveis.
- Restringir **CORS** nas suas próprias APIs sempre que possível. (Exceção documentada neste projeto: a **Data API do Supabase não expõe configuração de CORS** — header `*` fixo; mitigado por RLS deny-by-default.)
- Revisar/revogar grants `anon`/`authenticated` onde não forem necessários.
- Testar políticas com `supabase test db` (pgTAP) — uma asserção por operação e por papel.

### Práticas mínimas ampliadas (nunca remover — juntamente com as originais)

- **Tratar toda saída de IA como não confiável** e verificar antes de aceitar (código, SQL, dependências, config).
- **Nunca hardcode segredos**; segredos só em variáveis de ambiente server-side.
- **Verificar dependências** sugeridas por IA (existência, histórico, downloads) e fixar versões por lockfile/hash.
- **Revisão humana obrigatória** em código de autenticação, criptografia e qualquer área sensível.
- **Forçar verificação** em toda mudança de schema/RLS (testes de política).