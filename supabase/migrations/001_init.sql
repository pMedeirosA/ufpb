-- ============================================================
-- 001_init.sql — Memórias da Poesia Popular
-- Schema, RLS (deny-by-default) e seed inicial (8 poetisas).
-- Executar no Supabase → SQL Editor (uma única vez, no todo).
-- ============================================================

begin;

-- ============================================================
-- TABELAS
-- ============================================================

create table if not exists public.poetisas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  initials    text,
  letter      text,
  subtitle    text,
  summary     text,
  bio         text not null,
  photo_type  text not null default 'none'
              check (photo_type in ('url', 'none')),
  photo_url   text,
  video_url   text,
  covers      jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.poetisas is 'Acervo de poetisas — Memórias da Poesia Popular';

create table if not exists public.admin_emails (
  email      text primary key,
  created_at timestamptz not null default now()
);

comment on table public.admin_emails is 'Allowlist de e-mails autorizados ao painel admin. Vazia = acesso negado (deny-by-default).';

-- ============================================================
-- TRIGGER atualiza updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_poetisas_set_updated_at on public.poetisas;
create trigger trg_poetisas_set_updated_at
  before insert or update on public.poetisas
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS — DENY-BY-DEFAULT
-- ============================================================

alter table public.poetisas     enable row level security;
alter table public.admin_emails enable row level security;

alter table public.poetisas     force row level security;
alter table public.admin_emails force row level security;

-- poetisas: leitura pública (o site carrega sem login)
create policy "poetisas public read" on public.poetisas
  for select
  using (true);

-- poetisas: escrita somente para autenticado com e-mail na allowlist
create policy "poetisas admin insert" on public.poetisas
  for insert to authenticated
  with check (
    exists (select 1 from public.admin_emails where email = auth.jwt() ->> 'email')
  );

create policy "poetisas admin update" on public.poetisas
  for update to authenticated
  using (
    exists (select 1 from public.admin_emails where email = auth.jwt() ->> 'email')
  )
  with check (
    exists (select 1 from public.admin_emails where email = auth.jwt() ->> 'email')
  );

create policy "poetisas admin delete" on public.poetisas
  for delete to authenticated
  using (
    exists (select 1 from public.admin_emails where email = auth.jwt() ->> 'email')
  );

-- admin_emails: cada usuário só lê o próprio e-mail (deny-by-default).
-- Sem política de escrita — a allowlist é gerida pelo dono via SQL Editor.
create policy "admin_emails own read" on public.admin_emails
  for select to authenticated
  using (email = auth.jwt() ->> 'email');

-- ============================================================
-- SEED INICIAL — as 8 poetisas do fallback estático
-- Idempotente: só popula quando a tabela está vazia (ON CONFLICT
-- protege contra estados parciais). Reexecutar nunca duplica.
-- ============================================================

do $$
begin
  if (select count(*) from public.poetisas) = 0 then
    insert into public.poetisas
  (id, name, initials, letter, subtitle, summary, bio, photo_type, photo_url, video_url, covers)
values
  ('a0000000-0000-4000-8000-000000000001', 'Antônia Pessoa Magalhães', 'AP', 'A', 'Poetisa cordelista',
$doc$Cordelista paraibana dedicada à preservação da literatura popular e à expressão feminina no cordel nordestino.$doc$,
$doc$Antônia Pessoa Magalhães é uma poetisa paraibana que dedica sua arte à preservação da literatura de cordel. Sua obra reflete as vivências do povo nordestino, com especial atenção à condição feminina e às tradições culturais da região.

Seus versos transitam entre o humor, a crítica social e a celebração da cultura popular, mantendo viva a tradição oral que caracteriza o cordel.$doc$,
'none', '', '', '[]'),

  ('a0000000-0000-4000-8000-000000000002', 'Benedita Silva de Azevedo', 'BS', 'B', 'Poetisa e educadora',
$doc$Educadora e poetisa que utiliza a literatura de cordel como instrumento de transformação social e valorização cultural.$doc$,
$doc$Benedita Silva de Azevedo é uma poetisa e educadora que encontrou na literatura de cordel um instrumento poderoso de transformação social. Seus folhetos abordam temas como educação, direitos das mulheres e valorização da cultura popular.

Com uma escrita engajada e acessível, Benedita contribui para a democratização do saber através da poesia popular, levando o cordel para escolas e comunidades.$doc$,
'none', '', '', '[]'),

  ('a0000000-0000-4000-8000-000000000003', 'Clotilde Santa Cruz Tavares', 'CS', 'C', 'Pioneira do cordel feminino',
$doc$Uma das pioneiras da literatura de cordel feminina no Nordeste brasileiro, quebrando barreiras em um gênero tradicionalmente masculino.$doc$,
$doc$Clotilde Santa Cruz Tavares é reconhecida como uma das pioneiras da literatura de cordel feminina no Nordeste brasileiro. Em uma época em que a produção cordelista era predominantemente masculina, Clotilde ousou ocupar esse espaço com talento e determinação.

Sua obra abrange temas variados, desde narrativas tradicionais até questões sociais contemporâneas, sempre com a musicalidade e a rima características do cordel.

Clotilde é referência para gerações de mulheres cordelistas que vieram depois dela, abrindo caminho para a participação feminina nessa forma de expressão cultural.$doc$,
'none', '', '', '[]'),

  ('a0000000-0000-4000-8000-000000000004', 'Creusa Meira', 'CM', 'C', 'Poetisa popular',
$doc$Poetisa popular nordestina que mantém viva a tradição do cordel através de versos que retratam o cotidiano e as lutas do povo.$doc$,
$doc$Creusa Meira é uma poetisa popular nordestina cuja obra se destaca pela sensibilidade e pela conexão com as raízes culturais do Nordeste. Seus versos retratam o cotidiano, as lutas e as alegrias do povo, com uma linguagem acessível e profundamente poética.

Através de seus folhetos, Creusa contribui para a preservação da memória cultural nordestina e para a valorização da voz feminina na literatura de cordel.$doc$,
'none', '', '', '[]'),

  ('a0000000-0000-4000-8000-000000000005', 'Dora Ribeiro', 'DR', 'D', 'Cordelista e ativista cultural',
$doc$Cordelista e ativista cultural que promove a literatura de cordel como patrimônio imaterial brasileiro.$doc$,
$doc$Dora Ribeiro é cordelista e ativista cultural que dedica sua vida à promoção da literatura de cordel como patrimônio imaterial do Brasil. Seus versos combinam tradição e contemporaneidade, abordando temas atuais com a forma clássica do cordel.

Dora é atuante em movimentos culturais e educacionais, levando a arte do cordel para novos públicos e promovendo oficinas e encontros de cordelistas.$doc$,
'none', '', '', '[]'),

  ('a0000000-0000-4000-8000-000000000006', 'Josenir Amorim Alves de Lacerda', 'JA', 'J', 'Poetisa e pesquisadora',
$doc$Pesquisadora e poetisa que alia produção acadêmica à arte do cordel, contribuindo para a documentação da tradição cordelista feminina.$doc$,
$doc$Josenir Amorim Alves de Lacerda é poetisa e pesquisadora da literatura de cordel, dedicando-se tanto à produção poética quanto à documentação e estudo dessa tradição cultural.

Sua dupla atuação — como artista e acadêmica — contribui significativamente para a preservação e valorização do cordel feminino, produzindo tanto versos quanto reflexões críticas sobre o papel da mulher nessa manifestação cultural.$doc$,
'none', '', '', '[]'),

  ('a0000000-0000-4000-8000-000000000007', 'Maria das Neves Baptista Pimentel', 'MN', 'M', 'Cordelista histórica',
$doc$Uma das primeiras mulheres a publicar folhetos de cordel no Brasil, figura fundamental na história da literatura popular.$doc$,
$doc$Maria das Neves Baptista Pimentel é uma figura histórica da literatura de cordel brasileira, sendo considerada uma das primeiras mulheres a publicar folhetos de cordel no país. Sua produção literária desafiou as convenções de gênero de sua época.

Seus folhetos circularam amplamente pelas feiras e mercados do Nordeste, alcançando grande popularidade e provando que a arte do cordel não era exclusividade masculina.

Maria das Neves é hoje celebrada como um marco na luta pela participação feminina na literatura popular brasileira.$doc$,
'none', '', '', '[]'),

  ('a0000000-0000-4000-8000-000000000008', 'Salete Maria da Silva', 'SM', 'S', 'Poetisa e jurista',
$doc$Jurista e poetisa que utiliza o cordel como ferramenta de educação jurídica popular e empoderamento feminino.$doc$,
$doc$Salete Maria da Silva é jurista e poetisa que encontrou no cordel uma forma inovadora de democratizar o conhecimento jurídico. Seus folhetos tratam de direitos humanos, cidadania e empoderamento feminino em linguagem acessível.

Sua obra é um exemplo singular de como a literatura popular pode ser instrumento de educação e transformação social, levando informação sobre direitos fundamentais para comunidades que muitas vezes não têm acesso à linguagem jurídica formal.$doc$,
'none', '', '', '[]')
    on conflict (id) do nothing;
  end if;
end $$;

commit;

-- ============================================================
-- PRÓXIMO PASSO (após executar o bloco acima):
-- Adicionar SEU e-mail à allowlist (deny-by-default; sem isso
-- o admin não salva). Substitua pelo e-mail do Google autorizado:
--
--   insert into public.admin_emails (email)
--   values ('SEU-EMAIL-AQUI');
--
-- Para listar as autorizadas:
--   select * from public.admin_emails order by created_at;
;