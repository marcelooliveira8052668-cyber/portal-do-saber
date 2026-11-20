"use strict";
const $=id=>document.getElementById(id);
const aviso=msg=>$("aviso").textContent=msg;
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let proximo=0;
function adicionarQuestao(enunciado="",resposta=""){
 if($("questoes").children.length>=30){aviso("Limite de 30 questões por atividade.");return;}
 const n=++proximo;
 const f=document.createElement("fieldset");
 const l=document.createElement("legend");l.textContent="Questão "+n;f.appendChild(l);
 for(const [nome,valor] of [["Pergunta",enunciado],["Resposta para o professor",resposta]]){
  const label=document.createElement("label");label.textContent=nome;
  const area=document.createElement("textarea");area.value=valor;area.maxLength=3000;
  area.required=nome==="Pergunta";area.dataset.tipo=nome==="Pergunta"?"pergunta":"resposta";
  label.appendChild(area);f.appendChild(label);
 }
 const remover=document.createElement("button");remover.type="button";remover.textContent="Remover questão";remover.className="alt";remover.addEventListener("click",()=>f.remove());f.appendChild(remover);
 $("questoes").appendChild(f);
}
try{
 const bruto=localStorage.getItem("portalSaberPlanoParaAtividadeV25");
 const plano=bruto?JSON.parse(bruto):null;
 if(plano&&typeof plano==="object"){
  $("titulo").value=("Atividade: "+String(plano.titulo||"")).slice(0,140);
  if(typeof plano.conteudos==="string")$("orientacoes").value="Conteúdos: "+plano.conteudos.slice(0,1500)+"\nResponda às questões abaixo.";
 }
}catch{aviso("Não foi possível recuperar o plano. Você pode criar a atividade normalmente.");}
adicionarQuestao();
$("adicionar").addEventListener("click",()=>adicionarQuestao());
function coletar(){
 if(!$("form").reportValidity()){aviso("Preencha o título e as perguntas.");return null;}
 const questoes=[...$("questoes").children].map(f=>({
  pergunta:f.querySelector('[data-tipo="pergunta"]').value.trim(),
  resposta:f.querySelector('[data-tipo="resposta"]').value.trim()
 }));
 if(!questoes.length||questoes.some(q=>!q.pergunta)){aviso("Adicione pelo menos uma pergunta.");return null;}
 return {titulo:$("titulo").value.trim(),orientacoes:$("orientacoes").value.trim(),modo:$("modo").value,questoes};
}
function montarDocumento(d, comGabarito=false){
 const perguntas=d.questoes.map((q,i)=>`<section><h2>Questão ${i+1}</h2><p>${escapeHtml(q.pergunta).replace(/\n/g,"<br>")}</p><div class="linhas">__________________________________________________________________<br>__________________________________________________________________</div></section>`).join("");
 const respostas=comGabarito?`<section><h2>Gabarito exclusivo do professor</h2><ol>${d.questoes.map(q=>`<li>${escapeHtml(q.resposta||"Resposta a definir pelo professor").replace(/\n/g,"<br>")}</li>`).join("")}</ol></section>`:"";
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(d.titulo)}</title><style>body{font:17px/1.55 system-ui,sans-serif;max-width:800px;margin:auto;padding:24px;color:#172338}section{margin:30px 0;break-inside:avoid}.linhas{line-height:2.2;color:#677}h2{font-size:1.1rem}@media print{body{padding:0}section{break-inside:avoid}}</style></head><body><h1>${escapeHtml(d.titulo)}</h1><p>${escapeHtml(d.orientacoes).replace(/\n/g,"<br>")}</p>${perguntas}${respostas}</body></html>`;
}
function baixarArquivo(nome,conteudo){
 const url=URL.createObjectURL(new Blob([conteudo],{type:"text/html;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=nome;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$("baixar").addEventListener("click",()=>{
 const d=coletar();if(!d)return;
 baixarArquivo("atividade-aluno.html",montarDocumento(d,false));
 aviso("Atividade para aluno preparada, sem gabarito.");
});
$("baixarGabarito").addEventListener("click",()=>{
 const d=coletar();if(!d)return;
 baixarArquivo("gabarito-professor.html",montarDocumento(d,true));
 aviso("Gabarito preparado. Não compartilhe este arquivo com os alunos.");
});
$("imprimir").addEventListener("click",()=>{
 const d=coletar();if(!d)return;
 const janela=window.open("","_blank");
 if(!janela){aviso("Permita a abertura da janela para imprimir.");return;}
 janela.document.open();janela.document.write(montarDocumento(d,false));janela.document.close();
 janela.focus();janela.print();
 aviso("Impressão da atividade do aluno aberta sem gabarito.");
});

function montarInterativo(d){
 // No modo de avaliação, o arquivo NÃO recebe o gabarito.
 const comRespostas=d.modo!=="professor";
 const perguntas=d.questoes.map((q,i)=>`<fieldset><legend>Questão ${i+1}</legend><p>${escapeHtml(q.pergunta).replace(/\n/g,"<br>")}</p><label for="r${i}">Sua resposta</label><textarea id="r${i}" rows="4"></textarea>${d.modo==="imediato"?`<button type="button" data-ver="${i}">Conferir resposta</button>`:""}<div id="f${i}" role="status" aria-live="polite"></div></fieldset>`).join("");
 const respostas=comRespostas?JSON.stringify(d.questoes.map(q=>q.resposta)).replace(/</g,"\\\\u003c"):"null";
 const codigo=`const respostas=${respostas};const modo=${JSON.stringify(d.modo)};const mostrar=(i)=>{const campo=document.getElementById("r"+i);const saida=document.getElementById("f"+i);if(!campo.value.trim()){saida.textContent="Escreva sua resposta antes de conferir.";return;}saida.textContent="Resposta de referência: "+(respostas[i]||"O professor ainda não informou a resposta.");};document.querySelectorAll("[data-ver]").forEach(b=>b.addEventListener("click",()=>mostrar(Number(b.dataset.ver))));const finalizar=document.getElementById("finalizar");if(finalizar)finalizar.addEventListener("click",()=>{if(![...document.querySelectorAll("textarea")].every(c=>c.value.trim())){document.getElementById("status").textContent="Responda todas as questões antes de finalizar.";return;}document.querySelectorAll("textarea").forEach(c=>c.readOnly=true);respostas.forEach((_,i)=>mostrar(i));finalizar.disabled=true;document.getElementById("status").textContent="Simulado finalizado. Compare suas respostas com as referências.";});`;
 const finalizar=d.modo==="final"?'<button type="button" id="finalizar">Finalizar simulado</button>':"";
 const nota=d.modo==="professor"?"As respostas serão avaliadas pelo professor. Este arquivo não envia respostas automaticamente.":"Atividade de autocorreção: compare sua resposta com o modelo. Não há nota automática nem proteção contra consulta ao gabarito.";
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(d.titulo)}</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:780px;margin:auto;padding:20px;color:#15283c}fieldset{border:1px solid #aab9c9;border-radius:8px;margin:20px 0;padding:16px}legend{font-weight:bold}textarea{display:block;width:100%;box-sizing:border-box;margin:8px 0;padding:10px;font:inherit}button{padding:10px 16px;background:#1555a7;color:white;border:0;border-radius:6px;cursor:pointer}button:focus-visible{outline:3px solid orange}div[role=status]{margin:12px 0;white-space:pre-wrap;font-weight:600}</style></head><body><h1>${escapeHtml(d.titulo)}</h1><p>${escapeHtml(d.orientacoes).replace(/\n/g,"<br>")}</p><p>${escapeHtml(nota)}</p>${perguntas}${finalizar}<p id="status" role="status"></p><script>${codigo}</script></body></html>`;
}
$("interativo").addEventListener("click",()=>{
 const dados=coletar();if(!dados)return;
 baixarArquivo("atividade-interativa-aluno.html",montarInterativo(dados));
 aviso(dados.modo==="professor"?"Avaliação exportada sem gabarito. Ainda não há envio de respostas nem liberação segura.":"Atividade interativa preparada. As respostas estão no arquivo local e não são protegidas.");
});
