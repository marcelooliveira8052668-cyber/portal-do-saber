// Regras de autorização independentes da interface.
// Exemplo testável; em produção, buscar identidade e vínculos no servidor.
export function podeVerNota({usuario, nota, turma, matriculas, vinculos}) {
  if (!usuario || !nota || !turma || nota.turmaId !== turma.id) return false;
  if (usuario.papel === 'professor') return turma.professorId === usuario.id;
  if (usuario.papel === 'aluno') return nota.alunoId === usuario.id && matriculas.some(m => m.alunoId === usuario.id && m.turmaId === turma.id);
  if (usuario.papel === 'responsavel') return vinculos.some(v => v.responsavelId === usuario.id && v.alunoId === nota.alunoId && v.confirmado === true) && matriculas.some(m => m.alunoId === nota.alunoId && m.turmaId === turma.id);
  return false; // Administração exige fluxo separado, auditado.
}

export function podeAlterarNota({usuario, turma, nota, matriculas}) {
  return !!usuario && usuario.papel === 'professor' && turma.professorId === usuario.id && nota.turmaId === turma.id && matriculas.some(m => m.alunoId === nota.alunoId && m.turmaId === turma.id);
}

export function podePublicarAula({usuario, turma}) {
  return !!usuario && usuario.papel === 'professor' && turma.professorId === usuario.id;
}

export function podeAssistirAula({usuario, turma, matriculas}) {
  return !!usuario && ((usuario.papel === 'professor' && turma.professorId === usuario.id) || (usuario.papel === 'aluno' && matriculas.some(m => m.alunoId === usuario.id && m.turmaId === turma.id)));
}
