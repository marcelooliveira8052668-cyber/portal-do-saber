-- Portal do Saber: estrutura inicial de dados para Supabase/PostgreSQL.
-- NÃO executar antes de configurar o projeto e revisar as políticas.
-- Cadastro de professor e administrador deve ser autorizado pelo servidor.
begin;

create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (length(trim(nome)) between 2 and 120),
  criado_em timestamptz not null default now()
);

create table if not exists public.papeis (
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  papel text not null check (papel in ('aluno','professor','administrador')),
  primary key (usuario_id,papel)
);

create table if not exists public.turmas (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references public.perfis(id),
  nome text not null check (length(trim(nome)) between 1 and 120),
  criada_em timestamptz not null default now(),
  unique(id,professor_id)
);

create table if not exists public.matriculas (
  turma_id uuid not null references public.turmas(id) on delete cascade,
  aluno_id uuid not null references public.perfis(id) on delete cascade,
  criada_em timestamptz not null default now(),
  primary key(turma_id,aluno_id)
);

create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turmas(id) on delete cascade,
  titulo text not null check (length(trim(titulo)) between 1 and 150),
  peso numeric(6,2) not null default 1 check (peso > 0)
);

create table if not exists public.notas (
  avaliacao_id uuid not null references public.avaliacoes(id) on delete cascade,
  turma_id uuid not null references public.turmas(id) on delete cascade,
  aluno_id uuid not null references public.perfis(id),
  valor numeric(4,2) not null check (valor between 0 and 10),
  atualizada_em timestamptz not null default now(),
  primary key(avaliacao_id,aluno_id),
  foreign key(turma_id,aluno_id) references public.matriculas(turma_id,aluno_id)
);

create index if not exists matriculas_aluno_idx on public.matriculas(aluno_id);
create index if not exists notas_aluno_idx on public.notas(aluno_id);

-- Verificação de vínculo entre avaliação e turma, feita no banco.
create or replace function public.validar_nota_turma()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1 from public.avaliacoes a
    where a.id = new.avaliacao_id and a.turma_id = new.turma_id
  ) then
    raise exception 'Avaliação não pertence à turma informada';
  end if;
  new.atualizada_em := now();
  return new;
end; $$;

drop trigger if exists validar_nota_turma_trigger on public.notas;
create trigger validar_nota_turma_trigger
before insert or update on public.notas
for each row execute function public.validar_nota_turma();

alter table public.perfis enable row level security;
alter table public.papeis enable row level security;
alter table public.turmas enable row level security;
alter table public.matriculas enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.notas enable row level security;

-- Evita cadastro direto com papel de professor ou administrador.
revoke all on public.papeis from anon, authenticated;
grant select on public.papeis to authenticated;
create policy "ver proprio papel" on public.papeis
for select to authenticated using (usuario_id = (select auth.uid()));

grant select on public.perfis to authenticated;
create policy "ver proprio perfil" on public.perfis
for select to authenticated using (id = (select auth.uid()));

-- A criação/edição de perfis, turmas e matrículas será feita
-- por operações autenticadas no servidor, após validação.
-- Aqui liberamos SOMENTE leitura com autorização de vínculo.
grant select on public.turmas,public.matriculas,public.avaliacoes,public.notas to authenticated;

create policy "professor ou aluno ve turma" on public.turmas
for select to authenticated using (
 professor_id = (select auth.uid()) or exists (
   select 1 from public.matriculas m
   where m.turma_id = turmas.id and m.aluno_id = (select auth.uid())
 )
);

create policy "ver matriculas vinculadas" on public.matriculas
for select to authenticated using (
 aluno_id = (select auth.uid()) or exists (
   select 1 from public.turmas t
   where t.id = matriculas.turma_id and t.professor_id = (select auth.uid())
 )
);

create policy "ver avaliacoes da turma" on public.avaliacoes
for select to authenticated using (
 exists (
   select 1 from public.turmas t
   where t.id = avaliacoes.turma_id and (
     t.professor_id = (select auth.uid()) or
     exists (select 1 from public.matriculas m
       where m.turma_id = t.id and m.aluno_id = (select auth.uid()))
   )
 )
);

create policy "ver somente notas autorizadas" on public.notas
for select to authenticated using (
 aluno_id = (select auth.uid()) or exists (
   select 1 from public.turmas t
   where t.id = notas.turma_id and t.professor_id = (select auth.uid())
 )
);
commit;
