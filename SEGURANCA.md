# Autenticação — preparação v18

A página `conta.html` e o arquivo `conta.js` oferecem interface de cadastro, entrada, recuperação de senha e saída, **mas não estão conectados**.

## Antes de ativar
1. Criar projeto Supabase independente, configurar URL e chave **publicável** (nunca service_role).
2. Confirmar e-mail e configurar URL de redirecionamento autorizada.
3. Implementar fluxo de consentimento e proteção de crianças/adolescentes, com validação de responsáveis quando exigida.
4. **Não confiar em `perfil_solicitado`**: ele é um pedido enviado pelo usuário, não uma permissão. Atribuição de papéis só por processo verificado no servidor.
5. Implementar perfil e autorização no banco com RLS, sem leitura cruzada; testar com usuários diferentes.
6. Criar página para redefinir senha após link de recuperação, regras contra abuso e auditoria.
7. Testar login, sessão expirada, recuperação, vínculo responsável/aluno e bloqueio de papéis privilegiados.
8. Só depois integrar a página de acesso ao site principal.

A tela falha de forma segura: sem configuração, cadastro e entrada ficam desabilitados. Não usar dados reais neste protótipo.
