import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("./materiais-professor-rls.sql",import.meta.url),"utf8");
for(const acao of ["insert","update","delete"]){
 const inicio=sql.indexOf(" for "+acao+" to authenticated ");
 assert(inicio>=0,"Política ausente: "+acao);
 const fim=sql.indexOf(";",inicio);
 const bloco=sql.slice(inicio,fim+1);
 assert(bloco.includes("p.papel = 'professor'"),"Papel não verificado em "+acao);
 assert(bloco.includes("professor_id = (select auth.uid())"),"Autor não verificado em "+acao);
}
assert(sql.includes("new.professor_id is distinct from old.professor_id"));
console.log("OK: verificações estáticas das políticas de autoria e papel.");
