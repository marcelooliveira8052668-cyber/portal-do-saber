-- Revisão proposta: quebra a dependência circular de políticas RLS.
-- Requer estrutura-banco.sql e cursos-e-aulas.sql. Executar apenas em ambiente de testes.
begin;
-- SECURITY DEFINER: funções limitadas a consultas booleanas, sem dados privados retornados.
create or replace function public.aluno_inscrito_em_curso(p_curso uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
 select (select auth.uid()) is not null and exists (
   select 1 from public.inscricoes i
   where i.curso_id = p_curso and i.aluno_id = (select auth.uid())
 );
$$;
create or replace function public.professor_dono_de_curso(p_curso uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
 select (select auth.uid()) is not null and exists (
   select 1 from public.cursos c
   where c.id = p_curso and c.professor_id = (select auth.uid())
 );
$$;
revoke all on function public.aluno_inscrito_em_curso(uuid) from public, anon;
revoke all on function public.professor_dono_de_curso(uuid) from public, anon;
grant execute on function public.aluno_inscrito_em_curso(uuid) to authenticated;
grant execute on function public.professor_dono_de_curso(uuid) to authenticated;
-- A política de cursos não consulta diretamente inscrições protegidas por RLS.
drop policy if exists "cursos visiveis" on public.cursos;
create policy "cursos visiveis" on public.cursos
 for select to authenticated using (
 professor_id = (select auth.uid())
 or (publicado and (gratuito or public.aluno_inscrito_em_curso(id)))
);
-- A política de inscrições não consulta diretamente cursos protegidos por RLS.
drop policy if exists "inscricoes visiveis" on public.inscricoes;
create policy "inscricoes visiveis" on public.inscricoes
 for select to authenticated using (
 aluno_id = (select auth.uid())
 or public.professor_dono_de_curso(curso_id)
);
-- Aulas podem consultar cursos com a política já sem dependência circular.
drop policy if exists "aulas visiveis" on public.aulas;
create policy "aulas visiveis" on public.aulas
 for select to authenticated using (
 exists (
  select 1 from public.cursos c
  where c.id = aulas.curso_id and (
   c.professor_id = (select auth.uid()) or
   (c.publicado and aulas.publicada and
    (c.gratuito or public.aluno_inscrito_em_curso(c.id)))
  )
 )
);
commit;
