# Testes obrigatórios antes de ligar o banco

- [ ] Aluno A não vê inscrição, nota nem aula privada do aluno B.
- [ ] Professor A não vê curso não publicado do professor B.
- [ ] Professor não consegue alterar matrícula ou nota de outra turma.
- [ ] Usuário sem inscrição não acessa aula de curso pago.
- [ ] Aluno inscrito acessa apenas aulas publicadas do curso.
- [ ] Curso gratuito publicado aparece para aluno autenticado.
- [ ] Nenhum usuário pode se tornar professor ou administrador alterando o navegador.
- [ ] Cadastro de menores e vínculo com responsável passam por validação.
- [ ] URLs de vídeos privados são protegidas por acesso adequado.
- [ ] Erros, encerramento de sessão e recuperação de conta são tratados.

**Nenhum desses testes foi executado contra um banco real.**

## Operações de professor (v20)
- [ ] Aluno não consegue criar curso ou aula via RPC.
- [ ] Usuário que selecionou "professor" no formulário, mas não foi aprovado, não consegue criar curso.
- [ ] Professor A não consegue publicar curso ou aula de professor B.
- [ ] Professor consegue criar rascunho, publicar e retirar publicação do próprio conteúdo.
- [ ] Usuário anônimo não consegue executar as funções.
- [ ] Confirmar que proprietário das funções tem privilégios mínimos e que RLS das tabelas não é burlada por outras rotas.

## Matrículas v21
- [ ] Aluno autenticado solicita apenas matrícula própria.
- [ ] Conta sem papel aluno não solicita matrícula.
- [ ] Curso pago ou não publicado rejeita solicitação.
- [ ] Professor de outro curso não consegue aprovar pedido.
- [ ] Aprovação gera uma única inscrição e recusa não gera inscrição.
- [ ] Responsável não aprova matrícula fingindo ser professor.
- [ ] Políticas RLS não causam recursão ou vazamento de dados.
- [ ] Fluxo de menores e consentimento implementados antes do uso real.
