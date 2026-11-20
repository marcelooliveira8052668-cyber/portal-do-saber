import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const source=fs.readFileSync(new URL("./criar-atividade.js",import.meta.url),"utf8");
const inicio=source.indexOf("function montarInterativo(d){");
const fim=source.indexOf('\n$("interativo").addEventListener',inicio);
assert(inicio>=0&&fim>inicio,"Função exportadora não encontrada");
const contexto=vm.createContext({});
vm.runInContext(`const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));\n${source.slice(inicio,fim)}`,contexto);
const montar=vm.runInContext("montarInterativo",contexto);
const base={titulo:"Aula de História",orientacoes:"Linha 1\nLinha 2",questoes:[{pergunta:"Quando?\nExplique.",resposta:"Resposta de teste </script><script>alert(1)</script>"}]};
for(const modo of ["imediato","final","professor"]){
 const html=montar({...base,modo});
 assert(html.includes("Linha 1<br>Linha 2"),"Quebra de linha nas orientações");
 assert(html.includes("Quando?<br>Explique."),"Quebra de linha na pergunta");
 assert.equal((html.match(/<\/script>/g)||[]).length,1,"Script não pode ser encerrado por resposta");
 if(modo==="professor")assert(!html.includes("Resposta de teste"),"Gabarito vazou para avaliação");
 else assert(html.includes("Resposta de teste"),"Faltou referência na atividade de estudo");
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert(script,"Script não gerado");
 new vm.Script(script);
}
console.log("OK: 3 modalidades, gabarito ausente na avaliação, escape do script e quebras de linha.");
