// URL çubuğu
document.getElementById("urlBar").addEventListener("keypress", function(e){
  if(e.key==="Enter"){
    let url=this.value;
    if(!url.startsWith("http")) url="http://"+url;
    document.getElementById("browserFrame").src=url;
  }
});
