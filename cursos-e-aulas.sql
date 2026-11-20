-- Portal do Saber 19: cursos, aulas e inscrições
-- Extensão da estrutura-banco.sql; exige autenticação e políticas revisadas.
-- NÃO EXECUTAR EM PRODUÇÃO SEM TESTES DE ACESSO.
begin;
create table if not exists public.cursos (
 id uuid primary key default gen_random_uuid(),
 professor_id uuid not null references public.perfis(id),
 titulo text not null check (length(trim(titulo)) between 3 and 160),
 descricao text not null default '',
 etapa text not null,
 gratuito boolean not null default true,
 publicado boolean not null default false,
 criado_em timestamptz not null default now(),
 unique(id,professor_id)
);
create table if not exists public.inscricoes (
 curso_id uuid not null references public.cursos(id) on delete cascade,
 aluno_id uuid not null references public.perfis(id) on delete cascade,
 criada_em timestamptz not null default now(),
 primary key(curso_id,aluno_id)
);
create table if not exists public.aulas (
 id uuid primary key default gen_random_uuid(),
 curso_id uuid not null references public.cursos(id) on delete cascade,
 titulo text not null check(length(trim(titulo)) between 3 and 160),
 resumo text not null default '',
 ordem integer not null default 1 check(ordem > 0),
 publicada boolean not null default false,
 -- URL privada não deve ser exposta em tabela pública
 video_url text,
 criada_em timestamptz not null default now()
);
create index if not exists cursos_professor_idx on public.cursos(professor_id);
create index if not exists inscricoes_aluno_idx on public.inscricoes(aluno_id);
create index if not exists aulas_curso_idx on public.aulas(curso_id,ordem);

alter table public.cursos enable row level security;
alter table public.inscricoes enable row level security;
alter table public.aulas enable row level security;
grant select on public.cursos,public.inscricoes,public.aulas to authenticated;

-- Professor vê os próprios cursos; aluno vê os publicados e gratuitos,
-- ou os publicados em que possui inscrição validada.
create policy "cursos visiveis" on public.cursos
for select to authenticated using (
 professor_id = (select auth.uid()) or
 (publicado and (
   gratuito or exists (
     select 1 from public.inscricoes i
     where i.curso_id = cursos.id and i.aluno_id = (select auth.uid())
   )
 ))
);

create policy "inscricoes visiveis" on public.inscricoes
for select to authenticated using (
 aluno_id = (select auth.uid()) or exists (
  select 1 from public.cursos c
  where c.id = inscricoes.curso_id and c.professor_id = (select auth.uid())
 )
);

create policy "aulas visiveis" on public.aulas
for select to authenticated using (
 exists (
  select 1 from public.cursos c
  where c.id = aulas.curso_id and (
   c.professor_id = (select auth.uid()) or
   (c.publicado and aulas.publicada and (
    c.gratuito or exists (
      select 1 from public.inscricoes i
      where i.curso_id = c.id and i.aluno_id = (select auth.uid())
    )
   ))
  )
 )
);
-- Escrita (INSERT/UPDATE/DELETE) permanece NEGADA para clientes.
-- Operações de publicação, matrícula e cobrança exigem API segura,
-- verificação de papéis, consentimento quando aplicável e auditoria.
commit;
