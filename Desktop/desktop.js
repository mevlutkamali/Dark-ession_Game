/**
 * Desktop Environment Manager
 * Handles window management, desktop interactions, and application launching
 */

class DesktopManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.zIndex = 100;
        this.taskbarApps = new Map();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateClock();
        this.initializeApplications();
        
        // Update clock every second
        setInterval(() => this.updateClock(), 1000);
    }
    
    setupEventListeners() {
        // Desktop icon clicks
        document.querySelectorAll('.icon').forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const appName = e.currentTarget.dataset.app;
                this.openApplication(appName);
            });
        });
        
        // Window controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                const window = e.target.closest('.window');
                this.closeWindow(window.dataset.app);
            } else if (e.target.classList.contains('minimize-btn')) {
                const window = e.target.closest('.window');
                this.minimizeWindow(window.dataset.app);
            } else if (e.target.classList.contains('maximize-btn')) {
                const window = e.target.closest('.window');
                this.toggleMaximize(window.dataset.app);
            }
        });
        
        // Window dragging
        document.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-header')) {
                const window = e.target.closest('.window');
                this.startDragging(window, e);
            }
        });
        
        // Window focus
        document.addEventListener('mousedown', (e) => {
            const window = e.target.closest('.window');
            if (window && window.style.display !== 'none') {
                this.focusWindow(window.dataset.app);
            }
        });
        
        // Taskbar app clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.taskbar-app')) {
                const appName = e.target.closest('.taskbar-app').dataset.app;
                this.toggleApplication(appName);
            }
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 't') {
                e.preventDefault();
                this.openApplication('terminal');
            } else if (e.ctrlKey && e.altKey && e.key === 'f') {
                e.preventDefault();
                this.openApplication('file-manager');
            }
        });
    }
    
    initializeApplications() {
        // Initialize calculator
        window.calculator = new Calculator();
        
        // Initialize file manager
        window.fileManager = new FileManager();
        
        // Initialize text editor
        window.textEditor = new TextEditor();
        
        // Initialize system info
        window.systemInfo = new SystemInfo();
        
        // Initialize memory monitor
        window.memoryMonitor = new MemoryMonitor();
    }
    
    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const dateString = now.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            clockElement.textContent = `${dateString} ${timeString}`;
        }
    }
    
    openApplication(appName) {
        if (this.isApplicationOpen(appName)) {
            this.showWindow(appName);
            this.focusWindow(appName);
            return;
        }
        
        const windowElement = document.getElementById(`${appName}-window`);
        if (!windowElement) {
            console.error(`Window not found for app: ${appName}`);
            return;
        }
        
        if (this.windows.has(appName)) {
            // Window exists, just show and focus it
            this.showWindow(appName);
            this.focusWindow(appName);
        } else {
            // Create new window instance
            this.createWindow(appName, windowElement);
        }
        
        // Add to taskbar if not already there
        this.addToTaskbar(appName);
        
        // Focus the terminal input if it's a terminal
        if (appName === 'terminal') {
            setTimeout(() => {
                const terminalInput = document.getElementById('terminal-input');
                if (terminalInput) {
                    terminalInput.focus();
                }
            }, 100);
        }
    }
    
    createWindow(appName, windowElement) {
        const windowConfig = {
            element: windowElement,
            isMaximized: false,
            isMinimized: false,
            originalPosition: { x: 100 + this.windows.size * 30, y: 50 + this.windows.size * 30 },
            originalSize: { width: 800, height: 600 }
        };
        
        // Set initial position and size
        windowElement.style.left = windowConfig.originalPosition.x + 'px';
        windowElement.style.top = windowConfig.originalPosition.y + 'px';
        windowElement.style.width = windowConfig.originalSize.width + 'px';
        windowElement.style.height = windowConfig.originalSize.height + 'px';
        
        this.windows.set(appName, windowConfig);
        this.showWindow(appName);
        this.focusWindow(appName);
    }
    
    showWindow(appName) {
        const windowConfig = this.windows.get(appName);
        if (windowConfig) {
            windowConfig.element.style.display = 'block';
            windowConfig.isMinimized = false;
            windowConfig.element.classList.remove('minimized');
        }
    }
    
    hideWindow(appName) {
        const windowConfig = this.windows.get(appName);
        if (windowConfig) {
            windowConfig.element.style.display = 'none';
            windowConfig.isMinimized = true;
            windowConfig.element.classList.add('minimized');
        }
    }
    
    closeWindow(appName) {
        const windowConfig = this.windows.get(appName);
        if (windowConfig) {
            windowConfig.element.style.display = 'none';
            this.windows.delete(appName);
            this.removeFromTaskbar(appName);
            
            // Update active window
            if (this.activeWindow === appName) {
                this.activeWindow = null;
                // Focus the next available window
                if (this.windows.size > 0) {
                    const nextApp = Array.from(this.windows.keys())[0];
                    this.focusWindow(nextApp);
                }
            }
        }
    }
    
    minimizeWindow(appName) {
        this.hideWindow(appName);
        if (this.activeWindow === appName) {
            this.activeWindow = null;
        }
    }
    
    toggleMaximize(appName) {
        const windowConfig = this.windows.get(appName);
        if (!windowConfig) return;
        
        const windowElement = windowConfig.element;
        
        if (windowConfig.isMaximized) {
            // Restore window
            windowElement.classList.remove('maximized');
            windowElement.style.left = windowConfig.originalPosition.x + 'px';
            windowElement.style.top = windowConfig.originalPosition.y + 'px';
            windowElement.style.width = windowConfig.originalSize.width + 'px';
            windowElement.style.height = windowConfig.originalSize.height + 'px';
            windowConfig.isMaximized = false;
        } else {
            // Store current position and size
            windowConfig.originalPosition.x = parseInt(windowElement.style.left) || 100;
            windowConfig.originalPosition.y = parseInt(windowElement.style.top) || 50;
            windowConfig.originalSize.width = parseInt(windowElement.style.width) || 800;
            windowConfig.originalSize.height = parseInt(windowElement.style.height) || 600;
            
            // Maximize window
            windowElement.classList.add('maximized');
            windowConfig.isMaximized = true;
        }
    }
    
    focusWindow(appName) {
        // Remove active class from all windows
        document.querySelectorAll('.window').forEach(window => {
            window.classList.remove('active');
        });
        
        // Remove active class from all taskbar apps
        document.querySelectorAll('.taskbar-app').forEach(app => {
            app.classList.remove('active');
        });
        
        const windowConfig = this.windows.get(appName);
        if (windowConfig) {
            windowConfig.element.classList.add('active');
            windowConfig.element.style.zIndex = ++this.zIndex;
            this.activeWindow = appName;
            
            // Update taskbar
            const taskbarApp = document.querySelector(`.taskbar-app[data-app="${appName}"]`);
            if (taskbarApp) {
                taskbarApp.classList.add('active');
            }
        }
    }
    
    startDragging(windowElement, e) {
        e.preventDefault();
        
        const windowConfig = this.windows.get(windowElement.dataset.app);
        if (!windowConfig || windowConfig.isMaximized) return;
        
        const rect = windowElement.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        const handleMouseMove = (e) => {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            // Constrain to screen bounds
            const maxX = window.innerWidth - windowElement.offsetWidth;
            const maxY = window.innerHeight - windowElement.offsetHeight - 48; // Account for taskbar
            
            windowElement.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
            windowElement.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    addToTaskbar(appName) {
        if (this.taskbarApps.has(appName)) return;
        
        const taskbarAppsContainer = document.getElementById('taskbar-apps');
        const appElement = document.createElement('div');
        appElement.className = 'taskbar-app';
        appElement.dataset.app = appName;
        
        const appNames = {
            'terminal': 'Terminal',
            'file-manager': 'Files',
            'text-editor': 'Editor',
            'calculator': 'Calculator'
        };
        
        appElement.textContent = appNames[appName] || appName;
        taskbarAppsContainer.appendChild(appElement);
        
        this.taskbarApps.set(appName, appElement);
    }
    
    removeFromTaskbar(appName) {
        const appElement = this.taskbarApps.get(appName);
        if (appElement) {
            appElement.remove();
            this.taskbarApps.delete(appName);
        }
    }
    
    toggleApplication(appName) {
        if (this.isApplicationOpen(appName)) {
            const windowConfig = this.windows.get(appName);
            if (windowConfig.isMinimized || this.activeWindow !== appName) {
                this.showWindow(appName);
                this.focusWindow(appName);
            } else {
                this.minimizeWindow(appName);
            }
        } else {
            this.openApplication(appName);
        }
    }
    
    isApplicationOpen(appName) {
        return this.windows.has(appName);
    }
}

// Calculator Application
class Calculator {
    constructor() {
        this.display = null;
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        
        this.init();
    }
    
    init() {
        this.display = document.getElementById('calc-display');
    }
    
    number(digit) {
        if (this.waitingForOperand) {
            this.currentInput = digit;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? digit : this.currentInput + digit;
        }
        
        this.updateDisplay();
    }
    
    operation(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operator);
            
            this.currentInput = String(newValue);
            this.previousInput = newValue;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateDisplay();
    }
    
    equals() {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput !== '' && this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operator);
            
            this.currentInput = String(newValue);
            this.previousInput = '';
            this.operator = null;
            this.waitingForOperand = true;
        }
        
        this.updateDisplay();
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.updateDisplay();
    }
    
    calculate(firstOperand, secondOperand, operator) {
        switch (operator) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '*':
                return firstOperand * secondOperand;
            case '/':
                return firstOperand / secondOperand;
            default:
                return secondOperand;
        }
    }
    
    updateDisplay() {
        if (this.display) {
            this.display.value = this.currentInput;
        }
    }
}

// File Manager Application
class FileManager {
    constructor() {
        this.currentPath = '/home/user';
        this.fileList = null;
        this.pathDisplay = null;
        this.history = ['/home/user'];
        this.historyIndex = 0;
        
        this.init();
    }
    
    init() {
        this.fileList = document.getElementById('file-list');
        this.pathDisplay = document.getElementById('current-path');
        
        // Set up navigation buttons
        document.getElementById('back-btn').addEventListener('click', () => this.goBack());
        document.getElementById('forward-btn').addEventListener('click', () => this.goForward());
        document.getElementById('up-btn').addEventListener('click', () => this.goUp());
        
        this.refreshFileList();
    }
    
    refreshFileList() {
        if (!this.fileList || !window.terminal) return;
        
        const dir = window.terminal.getDirectoryContents(this.currentPath);
        if (!dir) return;
        
        this.fileList.innerHTML = '';
        this.pathDisplay.textContent = this.currentPath;
        
        Object.keys(dir).forEach(name => {
            const item = dir[name];
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.name = name;
            fileItem.dataset.type = item.type;
            
            if (item.type === 'directory') {
                fileItem.classList.add('folder');
                fileItem.innerHTML = `<i class="fas fa-folder"></i><span>${name}</span>`;
                fileItem.addEventListener('dblclick', () => this.openDirectory(name));
            } else {
                fileItem.innerHTML = `<i class="fas fa-file"></i><span>${name}</span>`;
                fileItem.addEventListener('dblclick', () => this.openFile(name));
            }
            
            this.fileList.appendChild(fileItem);
        });
    }
    
    openDirectory(dirname) {
        const newPath = `${this.currentPath}/${dirname}`.replace(/\/+/g, '/');
        this.navigateTo(newPath);
    }
    
    openFile(filename) {
        // Open file in text editor
        const filePath = `${this.currentPath}/${filename}`.replace(/\/+/g, '/');
        if (window.textEditor) {
            window.textEditor.openFile(filePath);
        }
        // Also open text editor window
        if (window.desktopManager) {
            window.desktopManager.openApplication('text-editor');
        }
    }
    
    navigateTo(path) {
        this.currentPath = path;
        
        // Update history
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        this.history.push(path);
        this.historyIndex = this.history.length - 1;
        
        this.refreshFileList();
    }
    
    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentPath = this.history[this.historyIndex];
            this.refreshFileList();
        }
    }
    
    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentPath = this.history[this.historyIndex];
            this.refreshFileList();
        }
    }
    
    goUp() {
        const parentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/')) || '/';
        if (parentPath !== this.currentPath) {
            this.navigateTo(parentPath);
        }
    }
}

// Text Editor Application
class TextEditor {
    constructor() {
        this.content = null;
        this.currentFile = null;
        this.titleElement = null;
        
        this.init();
    }
    
    init() {
        this.content = document.getElementById('editor-content');
        this.titleElement = document.querySelector('#text-editor-window .window-title span');
        
        // Set up toolbar buttons
        document.getElementById('new-file-btn').addEventListener('click', () => this.newFile());
        document.getElementById('open-file-btn').addEventListener('click', () => this.openFileDialog());
        document.getElementById('save-file-btn').addEventListener('click', () => this.saveFile());
    }
    
    newFile() {
        this.content.value = '';
        this.currentFile = null;
        this.titleElement.textContent = 'Text Editor - untitled.txt';
    }
    
    openFile(filePath) {
        if (!window.terminal) return;
        
        const file = window.terminal.getFile(filePath);
        if (file && file.type === 'file') {
            this.content.value = file.content || '';
            this.currentFile = filePath;
            const filename = filePath.substring(filePath.lastIndexOf('/') + 1);
            this.titleElement.textContent = `Text Editor - ${filename}`;
        }
    }
    
    openFileDialog() {
        // Simple file picker - in a real app this would be a proper dialog
        const filename = prompt('Enter filename to open:');
        if (filename && window.terminal) {
            const filePath = window.terminal.resolvePath(filename);
            this.openFile(filePath);
        }
    }
    
    saveFile() {
        if (!window.terminal) return;
        
        let filePath = this.currentFile;
        
        if (!filePath) {
            const filename = prompt('Enter filename to save:');
            if (!filename) return;
            
            filePath = window.terminal.resolvePath(filename);
        }
        
        // Save to virtual file system
        const parentPath = window.terminal.getParentPath(filePath);
        const fileName = window.terminal.getFileName(filePath);
        const parent = window.terminal.getDirectoryContents(parentPath);
        
        if (parent) {
            parent[fileName] = {
                type: 'file',
                content: this.content.value
            };
            
            this.currentFile = filePath;
            const displayName = fileName;
            this.titleElement.textContent = `Text Editor - ${displayName}`;
            
            // Refresh file manager if open
            if (window.fileManager) {
                window.fileManager.refreshFileList();
            }
        }
    }
}

// System Info Application
class SystemInfo {
    constructor() {
        this.content = null;
        this.init();
    }
    
    init() {
        this.content = document.getElementById('system-info-content');
        this.loadSystemInfo();
    }
    
    loadSystemInfo() {
        if (!this.content) return;
        
        const systemInfo = `
<div style="color: #00ff00; border: 2px solid #00ff00; padding: 15px; margin-bottom: 20px;">
<div style="text-align: center; font-size: 18px; margin-bottom: 10px;">╔══════════════════════════════════════════════════════════════╗</div>
<div style="text-align: center; font-size: 18px; margin-bottom: 10px;">║                    DARK SESSION SYSTEM INFO                 ║</div>
<div style="text-align: center; font-size: 18px; margin-bottom: 10px;">╚══════════════════════════════════════════════════════════════╝</div>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
    <div style="border: 1px solid #555; padding: 15px; background: #2a2a2a;">
        <h3 style="color: #00ff00; margin-top: 0;">🖥️ Sistem Bilgileri</h3>
        <div><strong>İşletim Sistemi:</strong> Dark Session Linux 1.0</div>
        <div><strong>Çekirdek:</strong> 5.15.0-darksession</div>
        <div><strong>Mimari:</strong> x86_64</div>
        <div><strong>Bilgisayar Adı:</strong> darksession</div>
        <div><strong>Çalışma Süresi:</strong> 25 dakika</div>
        <div><strong>Son Açılış:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
    </div>
    
    <div style="border: 1px solid #555; padding: 15px; background: #2a2a2a;">
        <h3 style="color: #ffa500; margin-top: 0;">⚡ Donanım</h3>
        <div><strong>İşlemci:</strong> Dark Session Virtual CPU</div>
        <div><strong>Çekirdek Sayısı:</strong> 4 (2 fiziksel)</div>
        <div><strong>İşlemci Hızı:</strong> 2.40 GHz</div>
        <div><strong>L3 Önbellek:</strong> 8 MB</div>
        <div><strong>Teknoloji:</strong> 64-bit</div>
        <div><strong>Virtualizasyon:</strong> Etkin</div>
    </div>
</div>

<div style="border: 1px solid #555; padding: 15px; background: #2a2a2a; margin-bottom: 20px;">
    <h3 style="color: #ff6b6b; margin-top: 0;">💾 Bellek Kullanımı</h3>
    <div style="margin-bottom: 10px;">
        <div><strong>Toplam RAM:</strong> 3.9 GB</div>
        <div style="background: #333; height: 20px; border-radius: 10px; overflow: hidden; margin: 5px 0;">
            <div style="background: linear-gradient(90deg, #51cf66 0%, #ffa94d 70%, #ff6b6b 100%); height: 100%; width: 38%; transition: width 0.3s;"></div>
        </div>
        <div><strong>Kullanılan:</strong> 1.5 GB (38%) | <strong>Boş:</strong> 2.4 GB (62%)</div>
    </div>
    
    <div>
        <div><strong>Swap Bellek:</strong> 2.0 GB</div>
        <div style="background: #333; height: 20px; border-radius: 10px; overflow: hidden; margin: 5px 0;">
            <div style="background: #51cf66; height: 100%; width: 0%; transition: width 0.3s;"></div>
        </div>
        <div><strong>Kullanılan:</strong> 0 MB (0%) | <strong>Boş:</strong> 2.0 GB (100%)</div>
    </div>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div style="border: 1px solid #555; padding: 15px; background: #2a2a2a;">
        <h3 style="color: #74c0fc; margin-top: 0;">🌐 Ağ Bağlantısı</h3>
        <div><strong>Arayüz:</strong> eth0</div>
        <div><strong>IP Adresi:</strong> 192.168.1.100</div>
        <div><strong>Alt Ağ:</strong> 255.255.255.0</div>
        <div><strong>Ağ Geçidi:</strong> 192.168.1.1</div>
        <div><strong>DNS:</strong> 8.8.8.8, 8.8.4.4</div>
        <div style="color: #51cf66;"><strong>Durum:</strong> 🟢 Bağlı</div>
    </div>
    
    <div style="border: 1px solid #555; padding: 15px; background: #2a2a2a;">
        <h3 style="color: #f783ac; margin-top: 0;">🔋 Güç Yönetimi</h3>
        <div><strong>Pil Durumu:</strong> Şarj oluyor</div>
        <div style="background: #333; height: 15px; border-radius: 8px; overflow: hidden; margin: 5px 0;">
            <div style="background: linear-gradient(90deg, #51cf66 0%, #51cf66 100%); height: 100%; width: 87%;"></div>
        </div>
        <div><strong>Şarj:</strong> 87% (2 saat 34 dakika kaldı)</div>
        <div><strong>Güç Kaynağı:</strong> AC Adaptör</div>
        <div><strong>Sağlık:</strong> Mükemmel (94%)</div>
    </div>
</div>
        `;
        
        this.content.innerHTML = systemInfo;
    }
}

// Memory Monitor Application
class MemoryMonitor {
    constructor() {
        this.content = null;
        this.updateInterval = null;
        this.init();
    }
    
    init() {
        this.content = document.getElementById('memory-monitor-content');
        this.startMonitoring();
    }
    
    startMonitoring() {
        if (!this.content) return;
        
        this.updateMemoryInfo();
        this.updateInterval = setInterval(() => {
            this.updateMemoryInfo();
        }, 2000); // Her 2 saniyede bir güncelle
    }
    
    stopMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    updateMemoryInfo() {
        if (!this.content) return;
        
        // Rastgele değişen bellek kullanımı simülasyonu
        const totalRam = 4048;
        const usedRam = 1500 + Math.floor(Math.random() * 200);
        const freeRam = totalRam - usedRam;
        const ramUsagePercent = Math.round((usedRam / totalRam) * 100);
        
        const totalSwap = 2048;
        const usedSwap = Math.floor(Math.random() * 50);
        const freeSwap = totalSwap - usedSwap;
        const swapUsagePercent = Math.round((usedSwap / totalSwap) * 100);
        
        const now = new Date().toLocaleTimeString('tr-TR');
        
        const memoryInfo = `
<div style="color: #00ff00; border: 2px solid #00ff00; padding: 15px; margin-bottom: 20px;">
<div style="text-align: center; font-size: 18px; margin-bottom: 10px;">╔══════════════════════════════════════════════════════════════╗</div>
<div style="text-align: center; font-size: 18px; margin-bottom: 10px;">║                      HAFIZA İZLEYİCİSİ                      ║</div>
<div style="text-align: center; font-size: 18px; margin-bottom: 10px;">╚══════════════════════════════════════════════════════════════╝</div>
<div style="text-align: center; font-size: 14px;">Son Güncelleme: ${now}</div>
</div>

<div style="background: #2a2a2a; border: 1px solid #555; padding: 20px; margin-bottom: 20px;">
    <h3 style="color: #ff6b6b; margin-top: 0; display: flex; align-items: center;">
        💾 RAM Kullanımı (${ramUsagePercent}%)
    </h3>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div style="text-align: center; background: #1e1e1e; padding: 10px; border-radius: 5px;">
            <div style="color: #51cf66; font-size: 24px; font-weight: bold;">${totalRam} MB</div>
            <div style="color: #ccc;">Toplam</div>
        </div>
        <div style="text-align: center; background: #1e1e1e; padding: 10px; border-radius: 5px;">
            <div style="color: #ffa94d; font-size: 24px; font-weight: bold;">${usedRam} MB</div>
            <div style="color: #ccc;">Kullanılan</div>
        </div>
        <div style="text-align: center; background: #1e1e1e; padding: 10px; border-radius: 5px;">
            <div style="color: #74c0fc; font-size: 24px; font-weight: bold;">${freeRam} MB</div>
            <div style="color: #ccc;">Boş</div>
        </div>
    </div>
    
    <div style="background: #333; height: 30px; border-radius: 15px; overflow: hidden; position: relative;">
        <div style="background: linear-gradient(90deg, #51cf66 0%, #ffa94d 50%, #ff6b6b 100%); height: 100%; width: ${ramUsagePercent}%; transition: width 0.5s ease;"></div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold;">${ramUsagePercent}%</div>
    </div>
</div>

<div style="background: #2a2a2a; border: 1px solid #555; padding: 20px; margin-bottom: 20px;">
    <h3 style="color: #74c0fc; margin-top: 0; display: flex; align-items: center;">
        🔄 Swap Bellek (${swapUsagePercent}%)
    </h3>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div style="text-align: center; background: #1e1e1e; padding: 10px; border-radius: 5px;">
            <div style="color: #51cf66; font-size: 24px; font-weight: bold;">${totalSwap} MB</div>
            <div style="color: #ccc;">Toplam</div>
        </div>
        <div style="text-align: center; background: #1e1e1e; padding: 10px; border-radius: 5px;">
            <div style="color: #ffa94d; font-size: 24px; font-weight: bold;">${usedSwap} MB</div>
            <div style="color: #ccc;">Kullanılan</div>
        </div>
        <div style="text-align: center; background: #1e1e1e; padding: 10px; border-radius: 5px;">
            <div style="color: #74c0fc; font-size: 24px; font-weight: bold;">${freeSwap} MB</div>
            <div style="color: #ccc;">Boş</div>
        </div>
    </div>
    
    <div style="background: #333; height: 30px; border-radius: 15px; overflow: hidden; position: relative;">
        <div style="background: linear-gradient(90deg, #51cf66 0%, #74c0fc 100%); height: 100%; width: ${swapUsagePercent}%; transition: width 0.5s ease;"></div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold;">${swapUsagePercent}%</div>
    </div>
</div>

<div style="background: #2a2a2a; border: 1px solid #555; padding: 20px;">
    <h3 style="color: #f783ac; margin-top: 0;">📊 Hafıza Dağılımı</h3>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #51cf66;">● Aktif Bellek</span>
                    <span>1024 MB</span>
                </div>
                <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: #51cf66; height: 100%; width: 65%;"></div>
                </div>
            </div>
            
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #ffa94d;">● Önbellek</span>
                    <span>512 MB</span>
                </div>
                <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: #ffa94d; height: 100%; width: 32%;"></div>
                </div>
            </div>
            
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #ff6b6b;">● Sistem</span>
                    <span>256 MB</span>
                </div>
                <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: #ff6b6b; height: 100%; width: 16%;"></div>
                </div>
            </div>
        </div>
        
        <div>
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #74c0fc;">● Tamponlar</span>
                    <span>128 MB</span>
                </div>
                <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: #74c0fc; height: 100%; width: 8%;"></div>
                </div>
            </div>
            
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #f783ac;">● Paylaşılan</span>
                    <span>64 MB</span>
                </div>
                <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: #f783ac; height: 100%; width: 4%;"></div>
                </div>
            </div>
            
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #91a7ff;">● Boş</span>
                    <span>${freeRam} MB</span>
                </div>
                <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: #91a7ff; height: 100%; width: ${Math.round((freeRam/totalRam)*100)}%;"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div style="margin-top: 15px; padding: 10px; background: #1e1e1e; border-radius: 5px; text-align: center;">
        <span style="color: #00ff00;">✅ Sistem performansı optimal seviyede</span>
    </div>
</div>
        `;
        
        this.content.innerHTML = memoryInfo;
    }
}

// Initialize desktop manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.desktopManager = new DesktopManager();
});