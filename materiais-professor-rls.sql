-- Portal do Saber: migração proposta para PostgreSQL/Supabase.
-- NÃO executar em produção sem revisar a estrutura existente e testar em ambiente isolado.
-- Depende de auth.users (Supabase Auth). Não altera as tabelas antigas.
begin;
create table if not exists public.materiais_professor (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null check (char_length(btrim(titulo)) between 1 and 120),
  disciplina text not null check (char_length(btrim(disciplina)) between 1 and 70),
  turma_referencia text check (char_length(turma_referencia) <= 80),
  tipo text not null check (tipo in ('aula','exercicio','videoaula','material')),
  conteudo text not null check (char_length(btrim(conteudo)) between 1 and 10000),
  link text check (link is null or (char_length(link) <= 2000 and link ~ '^https://')),
  status text not null default 'rascunho' check (status in ('rascunho','arquivado')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, professor_id)
);
create index if not exists materiais_professor_autor_idx
 on public.materiais_professor(professor_id, atualizado_em desc);
alter table public.materiais_professor enable row level security;
alter table public.materiais_professor force row level security;
revoke all on public.materiais_professor from anon;
grant select, insert, update, delete on public.materiais_professor to authenticated;
drop policy if exists materiais_selecionar_proprios on public.materiais_professor;
create policy materiais_selecionar_proprios on public.materiais_professor
 for select to authenticated using (professor_id = (select auth.uid()));
drop policy if exists materiais_inserir_proprios on public.materiais_professor;
create policy materiais_inserir_proprios on public.materiais_professor
 for insert to authenticated with check (professor_id = (select auth.uid())
 and exists (select 1 from public.papeis p where p.usuario_id = (select auth.uid()) and p.papel = 'professor'));
drop policy if exists materiais_editar_proprios on public.materiais_professor;
create policy materiais_editar_proprios on public.materiais_professor
 for update to authenticated using (professor_id = (select auth.uid())
 and exists (select 1 from public.papeis p where p.usuario_id = (select auth.uid()) and p.papel = 'professor'))
 with check (professor_id = (select auth.uid())
 and exists (select 1 from public.papeis p where p.usuario_id = (select auth.uid()) and p.papel = 'professor'));
drop policy if exists materiais_excluir_proprios on public.materiais_professor;
create policy materiais_excluir_proprios on public.materiais_professor
 for delete to authenticated using (professor_id = (select auth.uid())
 and exists (select 1 from public.papeis p where p.usuario_id = (select auth.uid()) and p.papel = 'professor'));
-- professor_id não pode ser alterado, mesmo quando a identidade do usuário muda.
create or replace function public.proteger_autor_material()
returns trigger language plpgsql set search_path = '' as $$
begin
 if new.professor_id is distinct from old.professor_id then
   raise exception 'O autor do material não pode ser alterado';
 end if;
 new.atualizado_em = now();
 return new;
end $$;
drop trigger if exists proteger_autor_material_trigger on public.materiais_professor;
create trigger proteger_autor_material_trigger before update on public.materiais_professor
 for each row execute function public.proteger_autor_material();
revoke all on function public.proteger_autor_material() from public;
commit;
