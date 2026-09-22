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