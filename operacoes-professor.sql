-- Versão 20: operações de professor no banco (Supabase/PostgreSQL)
-- DEPENDE de estrutura-banco.sql e cursos-e-aulas.sql.
-- Somente para revisão em ambiente de desenvolvimento.
begin;

-- A autorização depende do papel verificado, atribuído por fluxo confiável.
create or replace function public.professor_criar_curso(
  p_titulo text, p_descricao text, p_etapa text, p_gratuito boolean default true
) returns uuid language plpgsql security definer
set search_path = '' as $$
declare v_id uuid; v_usuario uuid := auth.uid();
begin
  if v_usuario is null or not exists (
    select 1 from public.papeis where usuario_id = v_usuario and papel = 'professor'
  ) then raise exception 'Acesso não autorizado'; end if;
  if length(trim(coalesce(p_titulo,''))) not between 3 and 160
     or length(trim(coalesce(p_etapa,''))) not between 2 and 80
     or length(coalesce(p_descricao,'')) > 4000
  then raise exception 'Dados inválidos'; end if;
  insert into public.cursos(professor_id,titulo,descricao,etapa,gratuito,publicado)
  values(v_usuario,trim(p_titulo),coalesce(p_descricao,''),trim(p_etapa),coalesce(p_gratuito,true),false)
  returning id into v_id;
  return v_id;
end; $$;

create or replace function public.professor_criar_aula(
  p_curso uuid, p_titulo text, p_resumo text default '', p_ordem integer default 1
) returns uuid language plpgsql security definer
set search_path = '' as $$
declare v_id uuid; v_usuario uuid := auth.uid();
begin
  if v_usuario is null or not exists (
    select 1 from public.papeis where usuario_id=v_usuario and papel='professor'
  ) or not exists (
    select 1 from public.cursos where id=p_curso and professor_id=v_usuario
  ) then raise exception 'Acesso não autorizado'; end if;
  if length(trim(coalesce(p_titulo,''))) not between 3 and 160
     or length(coalesce(p_resumo,'')) > 8000
     or p_ordem is null or p_ordem < 1
  then raise exception 'Dados inválidos'; end if;
  insert into public.aulas(curso_id,titulo,resumo,ordem,publicada)
  values(p_curso,trim(p_titulo),coalesce(p_resumo,''),p_ordem,false)
  returning id into v_id;
  return v_id;
end; $$;

create or replace function public.professor_publicar_aula(p_aula uuid, p_publicar boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := auth.uid();
begin
  if v_usuario is null or not exists (
    select 1 from public.papeis where usuario_id=v_usuario and papel='professor'
  ) then raise exception 'Acesso não autorizado'; end if;
  update public.aulas a set publicada=coalesce(p_publicar,false)
  from public.cursos c
  where a.id=p_aula and a.curso_id=c.id and c.professor_id=v_usuario;
  if not found then raise exception 'Aula não encontrada ou acesso negado'; end if;
end; $$;

create or replace function public.professor_publicar_curso(p_curso uuid, p_publicar boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := auth.uid();
begin
  if v_usuario is null or not exists (
    select 1 from public.papeis where usuario_id=v_usuario and papel='professor'
  ) then raise exception 'Acesso não autorizado'; end if;
  update public.cursos set publicado=coalesce(p_publicar,false)
  where id=p_curso and professor_id=v_usuario;
  if not found then raise exception 'Curso não encontrado ou acesso negado'; end if;
end; $$;

-- Revogar execução padrão PUBLIC (inclui usuários anônimos).
revoke all on function public.professor_criar_curso(text,text,text,boolean) from public,anon;
revoke all on function public.professor_criar_aula(uuid,text,text,integer) from public,anon;
revoke all on function public.professor_publicar_aula(uuid,boolean) from public,anon;
revoke all on function public.professor_publicar_curso(uuid,boolean) from public,anon;
grant execute on function public.professor_criar_curso(text,text,text,boolean) to authenticated;
grant execute on function public.professor_criar_aula(uuid,text,text,integer) to authenticated;
grant execute on function public.professor_publicar_aula(uuid,boolean) to authenticated;
grant execute on function public.professor_publicar_curso(uuid,boolean) to authenticated;
commit;
