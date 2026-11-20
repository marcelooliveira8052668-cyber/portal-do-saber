-- Portal do Saber 21 — solicitação e aprovação de matrículas em cursos gratuitos.
-- Projeto para revisão; não executar em produção sem testes de integração.
-- Depende de estrutura-banco.sql, cursos-e-aulas.sql e papéis confiáveis.
begin;
create table if not exists public.solicitacoes_matricula (
 curso_id uuid not null references public.cursos(id) on delete cascade,
 aluno_id uuid not null references public.perfis(id) on delete cascade,
 situacao text not null default 'pendente' check (situacao in ('pendente','aprovada','recusada')),
 solicitada_em timestamptz not null default now(),
 analisada_em timestamptz,
 primary key (curso_id, aluno_id)
);
create index if not exists solicitacoes_aluno_idx on public.solicitacoes_matricula(aluno_id);
alter table public.solicitacoes_matricula enable row level security;
grant select on public.solicitacoes_matricula to authenticated;
create policy "aluno ve seu pedido" on public.solicitacoes_matricula
for select to authenticated using (aluno_id = (select auth.uid()));
create policy "professor ve pedidos do proprio curso" on public.solicitacoes_matricula
for select to authenticated using (
 exists (select 1 from public.cursos c
         where c.id = solicitacoes_matricula.curso_id and c.professor_id = (select auth.uid()))
);

-- Usuário não informa aluno_id nem altera situacao; ambos controlados pelo banco.
create or replace function public.aluno_solicitar_matricula(p_curso uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := auth.uid();
begin
 if v_usuario is null or not exists (
   select 1 from public.papeis where usuario_id=v_usuario and papel='aluno'
 ) then raise exception 'Acesso não autorizado'; end if;
 if not exists (select 1 from public.cursos where id=p_curso and publicado and gratuito)
 then raise exception 'Curso indisponível para matrícula gratuita'; end if;
 if exists (select 1 from public.inscricoes where curso_id=p_curso and aluno_id=v_usuario)
 then raise exception 'Aluno já matriculado'; end if;
 insert into public.solicitacoes_matricula(curso_id,aluno_id,situacao)
 values(p_curso,v_usuario,'pendente')
 on conflict (curso_id,aluno_id) do update
 set situacao='pendente',solicitada_em=now(),analisada_em=null
 where public.solicitacoes_matricula.situacao='recusada';
end; $$;

create or replace function public.professor_analisar_matricula(
 p_curso uuid, p_aluno uuid, p_aprovar boolean
) returns void language plpgsql security definer set search_path = '' as $$
declare v_usuario uuid := auth.uid();
begin
 if v_usuario is null or not exists (
  select 1 from public.papeis where usuario_id=v_usuario and papel='professor'
 ) or not exists (
  select 1 from public.cursos where id=p_curso and professor_id=v_usuario
     and gratuito and publicado
 ) then raise exception 'Acesso não autorizado ou curso indisponível'; end if;
 update public.solicitacoes_matricula
 set situacao=case when p_aprovar is true then 'aprovada' else 'recusada' end,
 analisada_em=now()
 where curso_id=p_curso and aluno_id=p_aluno and situacao='pendente';
 if not found then raise exception 'Solicitação pendente não encontrada'; end if;
 if p_aprovar is true then
  insert into public.inscricoes(curso_id,aluno_id)
  values(p_curso,p_aluno) on conflict do nothing;
 end if;
end; $$;

revoke all on function public.aluno_solicitar_matricula(uuid) from public,anon;
revoke all on function public.professor_analisar_matricula(uuid,uuid,boolean) from public,anon;
grant execute on function public.aluno_solicitar_matricula(uuid) to authenticated;
grant execute on function public.professor_analisar_matricula(uuid,uuid,boolean) to authenticated;
-- Não há liberação automática para cursos pagos. Pagamentos exigem validação do servidor.
commit;
