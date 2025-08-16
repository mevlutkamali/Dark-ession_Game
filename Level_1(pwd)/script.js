// Pencere açma / kapama
function openWindow(id) { document.getElementById(id).style.display = "block"; }
function closeWindow(id) { document.getElementById(id).style.display = "none"; }

// Sürükleme
let draggedIcon = null;
function drag(e) { draggedIcon = e.target.closest(".icon"); }

const desktop = document.getElementById("desktop");

desktop.addEventListener("dragover", e => e.preventDefault());
desktop.addEventListener("drop", e => {
  e.preventDefault();
  if(draggedIcon){
    const rect = desktop.getBoundingClientRect();
    draggedIcon.style.left = (e.clientX - rect.left - 40) + "px";
    draggedIcon.style.top = (e.clientY - rect.top - 40) + "px";
  }
});

// Pencereleri sürükleme ve büyütme
document.querySelectorAll('.window').forEach(win => {
  const handle = win.querySelector('.handle');
  let isDragging = false;
  let offsetX=0, offsetY=0;
  let isFull=false;
  let prevStyle={};

  handle.addEventListener('mousedown', e => {
    if(isFull) return;
    isDragging=true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex=9999;
  });

  document.addEventListener('mousemove', e => {
    if(!isDragging) return;
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener('mouseup', e => { isDragging=false; });

  handle.addEventListener('dblclick', e => {
    if(!isFull){
      prevStyle = {
        top: win.style.top,
        left: win.style.left,
        width: win.style.width,
        height: win.style.height,
        position: win.style.position
      };
      win.style.top="0"; win.style.left="0"; win.style.width="100vw"; win.style.height="100vh"; win.style.position="fixed"; win.style.zIndex=9999;
      isFull=true;
    } else {
      win.style.top=prevStyle.top;
      win.style.left=prevStyle.left;
      win.style.width=prevStyle.width;
      win.style.height=prevStyle.height;
      win.style.position=prevStyle.position;
      isFull=false;
    }
  });
});
