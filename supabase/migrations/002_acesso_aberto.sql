-- ============================================================
-- 002_acesso_aberto.sql — PERÍODO DE ACESSO ABERTO (temporário)
-- Decisão da chefia (02/10/2026): qualquer pessoa pode entrar no
-- painel e editar, sem conta/login.
--
-- Executar no Supabase → SQL Editor (após o 001_init.sql).
-- A tabela `admin_emails` continua protegida (RLS intacta).
--
-- PARA REVERTER (voltar a exigir login + allowlist):
--   Executar o bloco comentado no fim deste arquivo.
-- ============================================================

begin;

-- 1) Deixa de forçar RLS sobre o dono da tabela (não é necessário
--    para abrir o acesso, mas mantém o comportamento simples).
alter table public.poetisas no force row level security;

-- 2) Abre a escrita para TODOS (anon + autenticado).
--    Como já existe a política de leitura pública, qualquer um
--    consegue inserir, editar e excluir poetisas.
drop policy if exists "poetisas admin insert" on public.poetisas;
drop policy if exists "poetisas admin update" on public.poetisas;
drop policy if exists "poetisas admin delete" on public.poetisas;

create policy "poetisas aberto insert" on public.poetisas
  for insert to anon, authenticated
  with check (true);

create policy "poetisas aberto update" on public.poetisas
  for update to anon, authenticated
  using (true)
  with check (true);

create policy "poetisas aberto delete" on public.poetisas
  for delete to anon, authenticated
  using (true);

commit;

-- ============================================================
-- PARA REVERTER — reexecutar o 001_init.sql exigiria reiniciar o
-- acervo; melhor executar o código abaixo para restaurar a
-- proteção original (login Google + allowlist admin_emails):
--
--   begin;
--
--   alter table public.poetisas force row level security;
--
--   drop policy if exists "poetisas aberto insert" on public.poetisas;
--   drop policy if exists "poetisas aberto update" on public.poetisas;
--   drop policy if exists "poetisas aberto delete" on public.poetisas;
--
--   create policy "poetisas admin insert" on public.poetisas
--     for insert to authenticated
--     with check (
--       exists (select 1 from public.admin_emails where email = auth.jwt() ->> 'email')
--     );
--
--   create policy "poetisas admin update" on public.poetisas
--     for update to authenticated
--     using (
--       exists (select 1 from public.admin_emails where email = auth.jwt() ->> 'email')
--     )
--     with check (
--       exists (select 1 from public.admin_emails where email = auth.jwt() ->> 'email')
--     );
--
--   create policy "poetisas admin delete" on public.poetisas
--     for delete to authenticated
--     using (
--       exists (select 1 from public.admin_emails where email = auth.jwt() ->> 'email')
--     );
--
--   commit;
--
-- (A política "poetisas public read" já existia e não muda.)
-- ============================================================