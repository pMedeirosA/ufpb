/* ===================================
   SUPABASE-CONFIG.JS — Memórias da Poesia Popular
   Backend: Supabase (PostgreSQL + RLS), conforme plano-supabase.md.
   Preencha com os dados do seu projeto Supabase
   (Dashboard → Settings → API):
     url     = "https://SEU-PROJETO.supabase.co"
     anonKey = chave anônima ("anon public")
   Enquanto estiver vazio, o site usa o conteúdo estático local (fallback).
   =================================== */

const SUPABASE_CONFIG = {
  url: '',
  anonKey: ''
};

function supabaseEstaConfigurado() {
  return Boolean(
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.url.indexOf('https://') === 0 &&
    SUPABASE_CONFIG.anonKey
  );
}