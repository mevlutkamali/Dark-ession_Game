document.querySelectorAll('.window').forEach(windowEl => {
    const header = windowEl.querySelector('.window-header');
    let offsetX = 0, offsetY = 0;
    let isDragging = false;

    header.addEventListener('mousedown', (e) => {
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
});