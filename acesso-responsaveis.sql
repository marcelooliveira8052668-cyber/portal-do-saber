-- Extensão planejada para responsáveis; requer revisão antes de executar.
-- Execute somente após estrutura-banco.sql em ambiente de testes.
begin;
create table if not exists public.responsaveis_alunos (
 responsavel_id uuid not null references public.perfis(id) on delete cascade,
 aluno_id uuid not null references public.perfis(id) on delete cascade,
 verificado_em timestamptz not null,
 primary key(responsavel_id, aluno_id),
 check(responsavel_id <> aluno_id)
);
alter table public.papeis drop constraint if exists papeis_papel_check;
alter table public.papeis add constraint papeis_papel_check check (papel in ('aluno','professor','administrador','responsavel'));
alter table public.responsaveis_alunos enable row level security;
grant select on public.responsaveis_alunos to authenticated;
create policy "responsavel ve somente proprio vinculo" on public.responsaveis_alunos
for select to authenticated using (responsavel_id = (select auth.uid()));
-- Responsáveis NÃO recebem acesso automático às notas neste estágio.
-- O vínculo deve ser confirmado por processo seguro no servidor,
-- nunca por autodeclaração em formulário público.
-- Escrita permanece proibida para clientes comuns.
commit;
