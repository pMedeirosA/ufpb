# Backend do Projeto

## Visão Geral
Descrever a arquitetura e a implementação do backend.

## Arquitetura
- **Confirmada pelo código do admin (`admin.html` publicado):** aplicação 100% client-side, sem backend próprio.
- Admin = **um único HTML** com CSS e JavaScript inline; `` separado (mesma pasta no deploy original).
- Dados direto no **** (coleção `poetisas`) via SDK compat 10.12.0 por CDN. Sem Cloud Functions, sem REST próprio, sem Storage (fotos são por URL).

## Tecnologias
- Linguagem: HTML/CSS/JS vanilla (sem framework).
- Banco de dados:   (projeto `sitecassia-78403`).
- Autenticação:  Auth — Google OAuth (popup).
- Deploy: estático na Vercel.

## API / Endpoints
- Não há API própria. Contra os SDKs do  (Auth + ) direto do navegador.

## Autenticação e Segurança
- _Em construção_ (ver seção "Vulnerabilidades Conhecidas" abaixo).

## Modelo de Dados
- Coleção `poetisas`, documento por poetisa com: `name`, `subtitle`, `summary`, `bio`, `initials`, `letter`, `photoType` (`url`/`none`, com `upload` só como legado), `photoUrl`, `videoUrl`, `createdAt`, `updatedAt`.

## Deploy
- _Em construção_

## Vulnerabilidades Conhecidas — Não Reproduzir

> Aviso: o usuário **não quer nenhuma** destas vulnerabilidades no site. Todo agente deve garantir que o código produzido não apresente falhas semelhantes. Todas abaixo foram identificadas no site de referência `siterasc.vercel.app` (código real analisado).

### 1. Login administrativo com lista de e-mails autorizados vazia (MÉDIA)
- **Onde**: `admin.html` — `ALLOWED_EMAILS`.
- **Problema**: lista vazia + `isEmailAllowed()` retorna `true` quando vazia. Qualquer conta Google entra na interface do painel, **mas** o impacto efetivo foi reduzido: teste real (19/09/2026) mostrou que as regras do  **negam escrita/exclusão** (`set` e `delete` → "Missing or insufficient permissions"). O painel é, na prática, **somente leitura**.
- **Risco residual**: acesso indevido à interface e leitura dos dados; e se as regras forem afrouxadas no futuro, o mesmo login ganha CRUD total. O painel original provavelmente **não consegue salvar** poetisas.
- **Prevenção**: deny-by-default. Lista de permissões obrigatória antes do deploy; ausência de configuração = acesso negado.

### 2. XSS armazenado via dados do banco injetados em `innerHTML` (ALTA)
- **Onde**: `script.js` público — `initDynamicBios()` e `initModals()`.
- **Problema**: `p.name`, `p.summary`, `p.bio` e `p.photoUrl` são interpolados em `card.innerHTML`/`modalBody.innerHTML` **sem escapar** (o `escapeHtml` existe só no admin). Combinado com a falha #1, um atacante com acesso de escrita pode armazenar `<script>` ou atributos `onerror` que executam no navegador de qualquer visitante do site (stored XSS).
- **Prevenção**: todo dado vindo do banco deve ser escapado antes do DOM (`escapeHtml`), ou renderizado com `textContent`.

### 3. Injeção em atributo `src` de imagem (ALTA)
- **Onde**: `script.js` — `photoHTML = "<img src=\"${p.photoUrl}\" ...>"`. Também em `admin.html` — `renderCards()` usa `escapeHtml(p.photoUrl)` em `src`.
- **Problema**: no site público, uma URL como `x" onerror="alert(1)` quebra o atributo e injeta código arbitrário. No admin, o `escapeHtml` protege contra quebra do atributo, **mas não sanitiza protocolo**: `javascript:`/`data:` passam (embora `javascript:` em `<img>` geralmente não execute nos browsers modernos, `data:` e SVG externo podem).
- **Prevenção**: escapar atributos HTML **e** validar a URL (somente `http`/`https`, domínios confiáveis) antes de usar em `src`.

### 4. Embed de vídeo por URL livre / domínios arbitrários (MÉDIA)
- **Onde**: `script.js` — `convertToEmbed()`: `if (url.includes('embed') || url.includes('player')) return url;`.
- **Problema**: qualquer domínio contendo "embed" ou "player" vira `src` de iframe, permitindo conteúdo externo não verificado (risco de clickjacking/phishing disfarçado).
- **Prevenção**: aceitar apenas YouTube/Vimeo validados por regex de ID; nunca devolver URL de terceiros como iframe.

### 5. Regras do  como única barreira + config pública (ALTA)
- **Onde**: `` — apiKey, projectId, etc. públicos por design no front-end.
- **Problema**: como a config é visível para qualquer um, a proteção depende 100% das regras do  Devem ser deny-by-default: leitura pública só quando necessária (ex.: coleção de poetisas para o site) e **escrita restrita** a usuários autenticados **com permissão explícita** (ex.: custom claims), nunca um `if request.auth != null` genérico.
- **Observado em teste (19/09/2026)**: leitura pública (o site carrega `poetisas` sem login) e **escrita/exclusão negadas** para usuário autenticado qualquer. O gabarito atual está seguro para escrita, mas a leitura aberta é necessária ao site — manter assim apenas se o conteúdo for público por design.

### 6. Ausência de cabeçalhos de segurança / CSP (MÉDIA)
- **Onde**: deploy Vercel — nenhuma `Content-Security-Policy`, `X-Content-Type-Options` ou `Referrer-Policy` (apenas HSTS automático da Vercel).
- **Problema**: sem CSP, toda falha de XSS explora sem mitigação; sem `nosniff`, há risco de MIME sniffing.
- **Prevenção**: adicionar CSP restrito (default-src 'self', frame-ancestors), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

### 7. Código morto / sensível (BAIXA)
- **Onde**: `admin.html` — `const AUTH_KEY = 'admin_auth';` declarada, nunca usada; e o branch legado `photoType === 'upload'` (a aba de upload foi removida do painel, só restam `url`/`none`, mas o tratamento de upload fica no código).
- **Problema**: não é explorável diretamente, mas lixo de código indica segredos esquecidos e dificulta auditoria.
- **Prevenção**: remover código morto; nunca armazenar segredos/sessões em constantes client-side.

### 8. Sem rate limiting ou proteção contra força bruta (MÉDIA)
- **Onde**: login admin (popup OAuth) e formulário de contato — sem limites.
- **Problema**: login é mitigado parcialmente pelo Google OAuth, mas operações sensíveis devem ter limites.
- **Prevenção**: configurar limites/regras no backend (ex.:  Security Rules por taxa se aplicável) e validar tudo server-side.

### 9. Confiança apenas na validação client-side (MÉDIA)
- **Onde**: formulário de contato — validação HTML apenas (`required`), sem processamento server-side.
- **Problema**: hoje o formulário é estático (não envia nada), mas qualquer validação feita só no navegador é contornável.
- **Prevenção**: toda entrada reenviada ao servidor deve ser validada/sanitizada no servidor.

### 10. Dependências e SDKs sem política de atualização (BAIXA)
- **Onde**: jQuery-free, mas  SDK 10.12.0 fixo via CDN.
- **Problema**: versões fixas pendentes de atualização acumulam falhas conhecidas.
- **Prevenção**: registrar versões de dependências, manter SDKs atualizados e revisar CVEs relacionadas.

### 11. Injeção via `onclick` com ID de documento não escapado (MÉDIA)
- **Onde**: `admin.html` — `renderCards()`: `onclick="editPoetisa('${p.id}')"` e `onclick="confirmDelete('${p.id}')"`.
- **Problema**: o `p.id` vem do  e é interpolado dentro de atributo de handler sem escapar. Ids gerados automaticamente são seguros, mas um documento criado com **ID customizado** contendo `'` (ex.: `');alert(1)//`) quebra o atributo e executa código arbitrário no navegador da chefia.
- **Prevenção**: não interpolar dados em atributos de handler — usar `addEventListener` + `dataset`/closure, ou escapar o id e restringir o conjunto de caracteres permitidos para IDs.

---
**Práticas mínimas para este projeto (nunca remover):**
- Deny-by-default em autenticação e regras de banco.
- Escapar/validar toda entrada antes do DOM.
- CSP e cabeçalhos de segurança no deploy.
- Sem segredos no client-side; segredos sempre em variáveis de ambiente server-side.

**Nova vulnerabilidade a registrar?** _Adicionar aqui._

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

> Registradas aqui porque formam a base da proteção do novo backend (ver plano).

- **Chave `anon`/publishable (`sb_publishable_`) é pública por design** (fica no browser) — a proteção real é **100% RLS (deny-by-default)**, nunca o segredo da chave. Legacy `anon`/`service_role` deprecados até o fim de 2026.
- **Chave `secret`/`service_role` NUNCA no client-side** — ela tem `BYPASSRLS`; expor = banco inteiro comprometido.
- Habilite RLS em **toda tabela exposta** (schema `public` alcançável pela Data API) e **force** para donos. Política por operação (SELECT/INSERT/UPDATE/DELETE) e por papel (`anon`/`authenticated`).
- "Expor tabela à Data API" ≠ RLS: o grant libera o endpoint; a política decide quais linhas são visíveis.
- Restringir **CORS** no dashboard às origens do site (nunca `*`).
- Revisar/revogar grants `anon`/`authenticated` onde não forem necessários.
- Testar políticas com `supabase test db` (pgTAP) — uma asserção por operação e por papel.

### Práticas mínimas ampliadas (nunca remover — juntamente com as originais)

- **Tratar toda saída de IA como não confiável** e verificar antes de aceitar (código, SQL, dependências, config).
- **Nunca hardcode segredos**; segredos só em variáveis de ambiente server-side.
- **Verificar dependências** sugeridas por IA (existência, histórico, downloads) e fixar versões por lockfile/hash.
- **Revisão humana obrigatória** em código de autenticação, criptografia e qualquer área sensível.
- **Forçar verificação** em toda mudança de schema/RLS (testes de política).