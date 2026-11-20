# Regras de acesso — Portal do Saber 15

| Pessoa | Pode consultar | Não pode consultar |
|---|---|---|
| Aluno | Suas turmas, avaliações e notas | Notas de colegas |
| Professor | Turmas que ministra e notas dessas turmas | Turmas de outros professores |
| Responsável | Somente vínculo próprio verificado (por enquanto) | Notas ou dados de qualquer aluno sem autorização específica |
| Administrador | Acesso administrativo a ser definido por função de servidor | Acesso irrestrito por simples alteração do navegador |

## Regras de cadastro a implementar
1. Login por serviço de autenticação com verificação de e-mail e recuperação segura de senha.
2. O usuário não escolhe livremente ser administrador ou professor: isso exige aprovação no servidor.
3. Responsável só se vincula ao aluno após confirmação adequada, especialmente quando há menores.
4. A senha nunca é guardada no HTML ou no localStorage.
5. Nenhum acesso a dados reais pelo seletor de personagens do protótipo.
6. A autorização precisa ser testada no banco, não apenas ocultando botões.
7. Aplicar LGPD, minimização de dados e políticas de retenção antes de receber cadastros reais.

## Testes obrigatórios antes de lançar
- Aluno A não consegue consultar notas de aluno B.
- Professor A não consegue consultar turma do professor B.
- Usuário sem sessão não acessa dados privados.
- Cadastro comum não consegue assumir papel de administrador ou professor.
- Responsável sem vínculo validado não acessa informações de aluno.
- Tentativas de inserir ou alterar notas diretamente no navegador são negadas.
- Sessões expiradas e redefinição de senha são tratadas com segurança.

**Situação:** documentação e SQL preparados; testes de integração ainda não realizados.
