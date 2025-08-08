// Pencere sürükleme ve tam ekran açma / kapama

document.querySelectorAll('.window').forEach(windowEl => {
    const header = windowEl.querySelector('.window-header');
  
    let isFullScreen = false;
    let prevStyles = {};
  
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
  
    header.addEventListener('mousedown', (e) => {
      if (isFullScreen) return;
  
      isDragging = true;
      offsetX = e.clientX - windowEl.offsetLeft;
      offsetY = e.clientY - windowEl.offsetTop;
      windowEl.style.zIndex = 3000;
    });
  
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        windowEl.style.left = (e.clientX - offsetX) + 'px';
        windowEl.style.top = (e.clientY - offsetY) + 'px';
        windowEl.style.position = 'absolute';
      }
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  
    header.addEventListener('dblclick', () => {
      if (!isFullScreen) {
        prevStyles = {
          top: windowEl.style.top,
          left: windowEl.style.left,
          width: windowEl.style.width,
          height: windowEl.style.height,
          position: windowEl.style.position
        };
  
        windowEl.style.top = "0px";
        windowEl.style.left = "0px";
        windowEl.style.width = "100vw";
        windowEl.style.height = "100vh";
        windowEl.style.position = "fixed";
        windowEl.style.zIndex = 9999;
  
        isFullScreen = true;
      } else {
        windowEl.style.top = prevStyles.top;
        windowEl.style.left = prevStyles.left;
        windowEl.style.width = prevStyles.width;
        windowEl.style.height = prevStyles.height;
        windowEl.style.position = prevStyles.position;
  
        isFullScreen = false;
      }
    });
  });
  
  // Saat güncelleme ve gösterme (sabit tarih + saat)
function updateClock() {
    const day = '21';
    const month = '01';
    const year = '2037';
  
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
  
    let period = 'sabah';
  
    if (hours >= 12) {
      period = 'akşam';
      if (hours > 12) hours -= 12;
    }
  
    if (hours === 0) {
      hours = 12;
    }
  
    hours = hours.toString().padStart(2, '0');
  
    document.getElementById('clock').textContent = `${day}/${month}/${year} ${period} ${hours}:${minutes}`;
}
  
setInterval(updateClock, 1000);
updateClock();
  