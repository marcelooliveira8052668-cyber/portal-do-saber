import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync(new URL('./corrigir-politicas-cursos.sql',import.meta.url),'utf8');
assert.match(sql,/security definer set search_path = ''/i);
for(const fn of ['aluno_inscrito_em_curso','professor_dono_de_curso']){
 assert.match(sql,new RegExp('revoke all on function public\\.'+fn));
 assert.match(sql,new RegExp('grant execute on function public\\.'+fn));
}
assert.match(sql,/aluno_id = \(select auth\.uid\(\)\)/);
assert.match(sql,/professor_id = \(select auth\.uid\(\)\)/);
assert.match(sql,/drop policy if exists "cursos visiveis"/);
assert.match(sql,/drop policy if exists "inscricoes visiveis"/);
console.log('OK: verificações estáticas das políticas de cursos, inscrições e aulas.');
