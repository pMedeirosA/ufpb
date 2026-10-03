-- ============================================================
-- 003_limpar_poetisas.sql — LIMPA O ACERVO (decisão da chefia 02/10)
-- Remove todas as poetisas (seed 001 + quaisquer cadastros),
-- deixando o banco pronto para a supervisora cadastrar do zero.
-- (a tabela admin_emails não é tocada)
--
-- Executar no Supabase → SQL Editor.
-- ============================================================

begin;

delete from public.poetisas;

commit;