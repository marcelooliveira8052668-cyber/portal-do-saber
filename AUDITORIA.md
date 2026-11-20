# Auditoria técnica inicial — Portal do Saber

## Estado comprovado no pacote
- `index.html`: protótipo demonstrativo extenso, com dados simulados.
- `painel-professor.html`: rascunhos locais, não relacionados a uma identidade autenticada.
- `planejar-aula.html` e `criar-atividade.html`: ferramentas locais de autoria e exportação.
- `conta.html`: interface de autenticação não configurada para operação real.
- Arquivos SQL: propostas de banco/permissões, ainda não executadas e validadas em servidor real.

## Problemas a resolver antes de qualquer lançamento
1. Falta identidade autenticada e isolamento real dos dados de cada professor/aluno.
2. Cursos e materiais ainda não usam um modelo de dados único persistente.
3. Cadastro, recuperação de senha, autorização e vínculo de responsáveis ainda precisam de testes ponta a ponta.
4. Entrega e correção de atividades precisam de API segura; respostas não podem ser enviadas ao navegador em provas.
5. Armazenamento e distribuição de vídeos ainda não implementados.
6. Cobrança, taxas, repasses de 70%/30% e regras fiscais não implementados.
7. Revisão de acessibilidade, privacidade de menores, direitos autorais e testes reais em navegador pendentes.
8. `index.html` contém lógica e dados demonstrativos misturados; requer modularização e revisão de segurança.

## Correção neste pacote
- Ajuste de tratamento de quebras de linha e escape de dados ao gerar atividade interativa, para impedir que uma resposta contendo `</script>` interrompa o script exportado.
- Adicionados testes automatizados básicos para a exportação da atividade.

## Decisão de engenharia
Não lançar publicamente enquanto cadastro real, RLS, proteção dos dados e fluxos essenciais não estiverem integrados e testados. Não há porcentagem técnica confiável sem critérios de aceite por funcionalidade.
