"use strict";
const campos=["titulo","etapa","disciplina","duracao","objetivos","conteudos","metodologia","recursos","avaliacao","adaptacoes"];
const chave="portalSaberPlanoAulaDemoV24";
const el=id=>document.getElementById(id);
const aviso=texto=>{el("aviso").textContent=texto;};
function dados(){return Object.fromEntries(campos.map(id=>[id,el(id).value]));}
function valido(){if(!el("plano").reportValidity()){aviso("Preencha os campos obrigatórios.");return false;}return true;}
function guardar(){if(!valido())return;try{localStorage.setItem(chave,JSON.stringify(dados()));aviso("Rascunho salvo neste navegador.");}catch{aviso("Não foi possível salvar aqui. Use Baixar plano.");}}
function carregar(){try{const bruto=localStorage.getItem(chave);if(!bruto)return;const obj=JSON.parse(bruto);if(!obj||typeof obj!=="object"||Array.isArray(obj))return;for(const id of campos){if(typeof obj[id]==="string")el(id).value=obj[id].slice(0,5000);}}catch{aviso("Não foi possível abrir o rascunho.");}}
function baixar(){if(!valido())return;const conteudo=JSON.stringify({tipo:"plano-aula",versao:1,...dados()},null,2);const url=URL.createObjectURL(new Blob([conteudo],{type:"application/json;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="plano-de-aula.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);aviso("Arquivo preparado para download.");}
el("salvar").addEventListener("click",guardar);el("baixar").addEventListener("click",baixar);el("imprimir").addEventListener("click",()=>{if(valido())window.print();});el("apagar").addEventListener("click",()=>{if(!confirm("Apagar o rascunho salvo neste navegador?"))return;try{localStorage.removeItem(chave);}catch{}el("plano").reset();aviso("Rascunho apagado.");});el("plano").addEventListener("submit",ev=>ev.preventDefault());carregar();

el("atividade").addEventListener("click",()=>{if(!valido())return;try{localStorage.setItem("portalSaberPlanoParaAtividadeV25",JSON.stringify(dados()));location.href="criar-atividade.html";}catch{aviso("Armazenamento indisponível. Não foi possível abrir a atividade.");}});
