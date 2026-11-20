// Cliente opcional: nenhum segredo de servidor deve ficar neste arquivo.
// Preencha somente a URL pública e a chave publicável do projeto.
const CONFIG = {
  url: "",
  publishableKey: ""
};
const $ = id => document.getElementById(id);
let modo = "entrar", cliente = null;
const informar = msg => { $("mensagem").textContent = msg; };
function mudarModo(novo){
  modo=novo; const criando=modo==="criar";
  $("nomeCampo").hidden=!criando;
  $("perfilCampo").hidden=!criando;
  $("enviar").textContent=criando?"Criar conta":"Entrar";
  $("senha").autocomplete=criando?"new-password":"current-password";
  informar("");
}
$("tabEntrar").addEventListener("click",()=>mudarModo("entrar"));
$("tabCriar").addEventListener("click",()=>mudarModo("criar"));
async function iniciar(){
  if (!CONFIG.url || !CONFIG.publishableKey){
    $("enviar").disabled=true; $("recuperar").disabled=true;
    informar("Cadastro indisponível: serviço de autenticação ainda não configurado.");
    return;
  }
  try {
    const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    cliente=createClient(CONFIG.url,CONFIG.publishableKey);
    const {data:{session}}=await cliente.auth.getSession();
    $("sair").hidden=!session;
    if(session) informar("Sessão iniciada. O acesso aos dados depende das permissões do servidor.");
    cliente.auth.onAuthStateChange((_evento,sessao)=>{$("sair").hidden=!sessao;});
  }catch{informar("Não foi possível iniciar o serviço de acesso.");$("enviar").disabled=true;}
}
$("formConta").addEventListener("submit",async ev=>{
  ev.preventDefault(); if(!cliente)return;
  $("enviar").disabled=true; informar("Aguarde...");
  try{
    const email=$("email").value.trim(),password=$("senha").value;
    if(modo==="criar"){
      const nome=$("nome").value.trim();
      if(nome.length<2){informar("Informe seu nome.");return;}
      const {error}=await cliente.auth.signUp({
        email,password,options:{data:{nome,perfil_solicitado:$("perfil").value}}
      });
      if(error) throw error;
      informar("Solicitação recebida. Verifique seu e-mail. O perfil ainda depende de validação.");
    }else{
      const {error}=await cliente.auth.signInWithPassword({email,password});
      if(error) throw error;
      informar("Você entrou na conta. As páginas privadas ainda não estão conectadas.");
    }
  }catch{informar("Não foi possível concluir. Confira os dados ou tente novamente.");}
  finally{$("enviar").disabled=false;}
});
$("recuperar").addEventListener("click",async()=>{
  if(!cliente)return;
  const email=$("email").value.trim();
  if(!email){informar("Digite seu e-mail para recuperar a senha.");return;}
  try{await cliente.auth.resetPasswordForEmail(email);informar("Se o e-mail estiver cadastrado, você receberá instruções.");}
  catch{informar("Não foi possível enviar as instruções agora.");}
});
$("sair").addEventListener("click",async()=>{if(!cliente)return;await cliente.auth.signOut();informar("Sessão encerrada.");});
mudarModo("entrar"); iniciar();
