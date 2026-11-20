"use strict";
const $=id=>document.getElementById(id);
const CHAVE="portalSaberMateriaisV28";
let itens=[];
try{const dados=JSON.parse(localStorage.getItem(CHAVE)||"[]");if(Array.isArray(dados))itens=dados.filter(x=>x&&typeof x==="object").slice(0,500);}catch{$("status").textContent="Não foi possível ler os rascunhos anteriores.";}
function salvar(){try{localStorage.setItem(CHAVE,JSON.stringify(itens));return true;}catch{$("status").textContent="Não foi possível salvar. Verifique o espaço disponível no navegador.";return false;}}
function limpar(){ $("form").reset();$("edicao").value="";$("titulo").focus();}
function texto(pai,tag,valor){const el=document.createElement(tag);el.textContent=valor;pai.appendChild(el);return el;}
function renderizar(){
 const lista=$("lista");lista.replaceChildren();
 const termo=$("busca").value.toLocaleLowerCase("pt-BR");
 const filtrados=itens.filter(x=>[x.titulo,x.disciplina,x.turma,x.tipo].some(v=>String(v||"").toLocaleLowerCase("pt-BR").includes(termo)));
 if(!filtrados.length){texto(lista,"p","Nenhum material encontrado.");return;}
 for(const item of filtrados){
 const card=document.createElement("article");
 texto(card,"h3",item.titulo||"Sem título");
 texto(card,"p",[item.tipo,item.disciplina,item.turma].filter(Boolean).join(" · "));
 texto(card,"p",item.conteudo||"");
 if(item.link&&/^https:\/\//i.test(item.link)){const a=document.createElement("a");a.href=item.link;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Abrir material externo";card.appendChild(a);}
 const acoes=document.createElement("div");acoes.className="acoes";
 const editar=texto(acoes,"button","Editar");editar.type="button";editar.addEventListener("click",()=>{for(const campo of ["titulo","disciplina","turma","tipo","conteudo","link"])$(campo).value=item[campo]||"";$("edicao").value=item.id;window.scrollTo({top:0,behavior:"smooth"});});
 const excluir=texto(acoes,"button","Excluir");excluir.type="button";excluir.className="perigo";excluir.addEventListener("click",()=>{if(!confirm("Excluir este rascunho?"))return;const anteriores=itens;itens=itens.filter(x=>x.id!==item.id);if(!salvar())itens=anteriores;renderizar();});
 card.appendChild(acoes);lista.appendChild(card);
 }
}
$("form").addEventListener("submit",e=>{
 e.preventDefault();if(!$("form").reportValidity())return;
 const link=$("link").value.trim();if(link&&!/^https:\/\//i.test(link)){$("status").textContent="Informe um link HTTPS válido.";return;}
 const id=$("edicao").value||("m"+Date.now()+"-"+Math.random().toString(36).slice(2,8));
 const item={id};for(const campo of ["titulo","disciplina","turma","tipo","conteudo","link"])item[campo]=$(campo).value.trim();
 if(!item.titulo||!item.disciplina||!item.conteudo)return;
 const anteriores=itens;itens=[item,...itens.filter(x=>x.id!==id)];
 if(!salvar()){itens=anteriores;return;}
 $("status").textContent="Rascunho salvo somente neste navegador.";limpar();renderizar();
});
$("limpar").addEventListener("click",limpar);
$("busca").addEventListener("input",renderizar);
$("exportar").addEventListener("click",()=>{
 const blob=new Blob([JSON.stringify({versao:28,materiais:itens},null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="meus-materiais-portal-do-saber.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
renderizar();
