# Consolidação 05 — dependência circular nas permissões

**Problema identificado:** a política de leitura de `cursos` consultava `inscricoes`, cuja política de leitura consultava `cursos`. Isso pode causar recursão de RLS e impedir consultas reais.

**Correção proposta:** `corrigir-politicas-cursos.sql` substitui as consultas circulares por duas funções booleanas `SECURITY DEFINER`, com `search_path` vazio, parâmetros limitados e verificação do usuário autenticado. Os privilégios de execução são limitados a `authenticated`.

**Cuidado:** `SECURITY DEFINER` exige revisão do proprietário das funções e das permissões do banco; elas devem ser criadas por um papel confiável e não expor dados. Não executamos SQL nem testes de acesso reais em PostgreSQL/Supabase. O arquivo deve ser aplicado somente depois da estrutura-base e das migrações correspondentes, em ambiente de desenvolvimento.

**Teste necessário antes de produção:** criar dois professores e dois alunos, confirmar que professor A não vê cursos privados do professor B; que aluno não inscrito não vê cursos pagos privados; que aluno inscrito vê apenas os cursos e aulas publicados permitidos; e que a consulta não falha por recursão.
