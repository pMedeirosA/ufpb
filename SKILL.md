# SKILL — Backend com IA (Supabase + Postgres)

> Skill de trabalho para agentes de IA atuarem no backend deste projeto.
> Construída a partir de pesquisa de mercado (junho/julho/agosto 2026): melhores práticas de
> skills de backend com IA — destaque para **Supabase Agent Skills (Postgres Best Practices)**,
> **security-first**, **verificação/code-review** e **TDD**.
> Projeto: "Memórias das Poetisas da Literatura de Cordel" (UFPB).

---

## Identificação da skill

- **nome**: `backend-supabase-ia`
- **versão**: 1.0 — 21/09/2026
- **descrição (gatilhos de uso)**: use esta skill em QUALQUER tarefa que envolva banco de dados,
  SQL, autenticação, RLS (Row Level Security), migrações, API, Supabase, schema, queries,
  política de segurança ou integração de backend — inclusive ao criar ou alterar tabelas,
  colunas, índices, triggers, funções, políticas de acesso e ao escrever SQL de migração.

---

## Quando usar

Acione esta skill antes de:
- Criar/alterar **tabelas, colunas, tipos, índices** ou `migrations`.
- Escrever ou revisar **queries SQL** (performance e corretude).
- Implementar **autenticação** (Supabase Auth) ou **políticas de acesso (RLS)**.
- Configurar **CORS, chaves de API** ou qualquer item de segurança do backend.
- Fazer **auditoria de segurança** do banco ou do código.
- Trabalhar com **@supabase/supabase-js** (browser ou server).

---

## Regras (filtradas das melhores skills de backend com IA)

### 1. Postgres/Supabase — Melhores Práticas (CRÍTICO)

Fonte: rules oficiais da Supabase (`supabase/agent-skills` → `supabase-postgres-best-practices`),
30 regras em 8 categorias priorizadas por impacto. **Carregar ANTES de escrever/alterar qualquer
coisa que viva no Postgres.**

| Prioridade | Categoria | Exigência mínima |
|---|---|---|
| 🔴 CRÍTICA | **Query Performance** (`query-`) | Índice para toda `WHERE`/`ORDER BY`/`JOIN` relevante; índices parciais quando fizer sentido; validar com `EXPLAIN ANALYZE` |
| 🔴 CRÍTICA | **Connection Management** (`conn-`) | Reutilizar cliente/connection pool; **nunca** criar um cliente por requisição/per-render |
| 🔴 CRÍTICA | **Security & RLS** (`security-`) | RLS habilitado em TODA tabela exposta; política por operação; **deny-by-default**; cachear `auth.uid()` em subselect para performance |
| 🟠 ALTA | **Schema Design** (`schema-`) | Tipos corretos (`uuid`, `timestamptz`), `NOT NULL` e constraints; migrações versionadas |
| 🟡 MÉDIA-ALTA | **Concurrency & Locking** (`lock-`) | Entender `SELECT FOR UPDATE`; evitar locks desnecessários |
| 🟡 MÉDIA | **Data Access Patterns** (`data-`) | Evitar N+1; usar batch/`in()` correto |
| ⚪ BAIXA-MÉDIA | **Monitoring & Diagnostics** (`monitor-`) | Consultar documentação oficial antes de diagnosticar; não chutar causa |
| ⚪ BAIXA | **Advanced Features** (`advanced-`) | `pg_cron`, `pgvector` etc. só quando o caso exigir |

**Anti-padrão → padrão (RLS com performance):**
```sql
-- Anti-padrão: auth.uid() chamado para cada linha
CREATE POLICY "bad_policy" ON poetisas FOR SELECT USING (auth.uid() = user_id);
-- Padrão correto: cacheia o valor em subselect
CREATE POLICY "good_policy" ON poetisas FOR SELECT USING ((select auth.uid()) = user_id);
```

### 2. Segurança por padrão (security-first)

- Pensar em segurança **na fase de arquitetura**, não como retrabalho (Regra 6 do `AGENTS.md`).
- **Deny-by-default**: ausência de configuração = acesso negado (mesma filosofia da vulnerabilidade #1 do `backend.md`).
- Forçar RLS para o dono da tabela: `ALTER TABLE ... FORCE ROW LEVEL SECURITY;`.
- `service_role`/secret key **jamais** no client-side (bypassa RLS).
- Restringir CORS a origens conhecidas (nunca `*`).

### 3. Verificação obrigatória — "parece certo" ≠ "é certo" (CRÍTICO)

Maior falha de agentes: produzir código que **parece correto e está errado/inseguro**
(e humanos tendem a confiar mais em código de IA — efeito documentado em 2026).
- **Todo artefato gerado deve ser verificado**: SQL aplica? Política permite o que deveria e nega o que não deveria? Teste roda?
- Tratar a **saída do modelo como não confiável** até prova em contrário (mesmo princípio de "dados do banco não confiáveis").
- Não pular a verificação em código de **auth/criptografia/segurança** — áreas de maior risco.
- O que não dá para testar automaticamente: declarar explicitamente no plano.

### 4. TDD / Testes

- Escrever/validar testes das **políticas RLS** (padrão oficial Supabase: `supabase test db` / pgTAP — uma asserção por operação e por papel `anon`/`authenticated`).
- Mudança de schema sem teste de política = mudança não terminada.

### 5. Privilégio mínimo e segredos

- **Nunca hardcode segredos** (chaves, tokens, senhas) — nem em código, exemplos, comentários ou config. A IA reproduz segredos vistos em treino (+28,6M segredos vazados em commits em 2025).
- Chaves do Supabase: **publishable** (pública, vai no browser) vs **secret** (só server-side, via variável de ambiente).
- Credencial só onde é necessária, com escopo mínimo.

### 6. Arquitetura simples (Regra 3 do `AGENTS.md`)

- Solução mais **lógica e simples** possível; nada mirabolante.
- Front-end **vanilla** (sem framework) — convenção deste projeto.
- Separação mínima de responsabilidades: config separada, dados separados, render separado.

---

## Contrato de verificação (checklist final)

Antes de dar uma tarefa de backend como concluída:
- [ ] Migração SQL aplica limpa e é idempotente quando devia ser.
- [ ] Toda tabela exposta tem RLS habilitado + políticas por operação e por papel.
- [ ] Testado com papel `anon` (visitante) e `authenticated` (admin): leitura pública ok, escrita negada p/ quem não deve.
- [ ] Nenhum dado dinâmico cai no DOM sem `escapeHtml`/`textContent` (XSS).
- [ ] Toda URL vinda do banco validada (`http`/`https`) antes de `src` (foto, capas, vídeo).
- [ ] `grep` por segredos/chaves no código versionado: zero ocorrências.
- [ ] Dependências verificadas (existem, têm histórico) e versões fixadas.
- [ ] CORS restrito às origens do site.

---

## Referências obrigatórias deste projeto

- `backend.md` — arquitetura, modelo de dados e **todas as vulnerabilidades que NÃO podem ser reproduzidas** (originais #1–#11 + seção de vulnerabilidades de IA).
- `requisitos.md` — pedidos da chefia e registro de requisitos cumpridos (Regra 8).
- `design.md` — conformidade visual obrigatória (Regra 5).
- `AGENTS.md` — regras de trabalho (Regra 2: consultar antes de agir).

---

## Guardrails específicos do projeto

- Conteúdo do site em **português**; código em **inglês** (convenção da `memoria.md`).
- Comentários de seção: linha `═══ ═══` (55 caracteres) delimitando blocos numerados.
- Cabeçalhos de `.md` em português, seções `###`.
- Executar apenas o que for **solicitado e aprovado** (Regra 9) — planos são propostas até aprovação explícita.
- Registrar toda vulnerabilidade nova descoberta em `backend.md` (Regra 6).