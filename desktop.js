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

        // Initialize notes.txt
        window.notesApp = new NotesApp();
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
            'calculator': 'Calculator',
            'notes': 'notes.txt'
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
    <div>
        <h3 style="color: #58a6ff; margin-top: 0;">🖥️ Sistem Bilgileri</h3>
        <div><strong>İşletim Sistemi:</strong> Dark Session Linux</div>
        <div><strong>Çekirdek:</strong> 5.15.0-darknet</div>
        <div><strong>Mimari:</strong> x86_64</div>
        <div><strong>Hostname:</strong> darksession</div>
        <div><strong>Uptime:</strong> 42 days, 13:37:21</div>
    </div>
    
    <div>
        <h3 style="color: #ff6b6b; margin-top: 0;">💾 Bellek Kullanımı</h3>
        <div style="margin-bottom: 10px;">
            <div><strong>Toplam RAM:</strong> 3.9 GB</div>
            <div><strong>Kullanılan:</strong> 2.1 GB (54%)</div>
            <div><strong>Boş:</strong> 1.8 GB</div>
            <div><strong>Cache:</strong> 512 MB</div>
        </div>
        <div style="background: #21262d; border-radius: 4px; padding: 3px;">
            <div style="background: #ff6b6b; height: 8px; width: 54%; border-radius: 2px;"></div>
        </div>
    </div>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
    <div>
        <h3 style="color: #ffa657; margin-top: 0;">💽 Disk Kullanımı</h3>
        <div><strong>/</strong> (root)</div>
        <div>Boyut: 20 GB</div>
        <div>Kullanılan: 12.8 GB (64%)</div>
        <div>Boş: 7.2 GB</div>
        <div style="background: #21262d; border-radius: 4px; padding: 3px; margin: 5px 0;">
            <div style="background: #ffa657; height: 8px; width: 64%; border-radius: 2px;"></div>
        </div>
        
        <div style="margin-top: 10px;"><strong>/home</strong> (kullanıcı)</div>
        <div>Boyut: 100 GB</div>
        <div>Kullanılan: 23.7 GB (24%)</div>
        <div>Boş: 76.3 GB</div>
        <div style="background: #21262d; border-radius: 4px; padding: 3px; margin: 5px 0;">
            <div style="background: #ffa657; height: 8px; width: 24%; border-radius: 2px;"></div>
        </div>
    </div>
    
    <div>
        <h3 style="color: #56d364; margin-top: 0;">🌐 Ağ Bilgileri</h3>
        <div><strong>Ethernet (eth0):</strong></div>
        <div>IP: 192.168.1.42</div>
        <div>Subnet: 255.255.255.0</div>
        <div>Gateway: 192.168.1.1</div>
        <div style="margin-top: 10px;"><strong>WiFi (wlan0):</strong></div>
        <div>IP: 192.168.1.101</div>
        <div>SSID: DarkNet_5G</div>
        <div>Sinyal: -42 dBm (Excellent)</div>
    </div>
</div>

<div style="margin-bottom: 20px;">
    <h3 style="color: #a78bfa; margin-top: 0;">⚡ CPU Bilgileri</h3>
    <div><strong>İşlemci:</strong> Intel® Core™ i7-10700K CPU @ 3.80GHz</div>
    <div><strong>Çekirdek:</strong> 8 çekirdek, 16 thread</div>
    <div><strong>Önbellek:</strong> L1: 512 KB, L2: 2 MB, L3: 16 MB</div>
    <div><strong>Mevcut Hız:</strong> 3.8 GHz</div>
    <div><strong>Sıcaklık:</strong> 42°C</div>
    
    <div style="margin: 10px 0;">
        <div><strong>CPU Kullanımı:</strong></div>
        <div style="display: flex; gap: 10px; margin-top: 5px;">
            <div style="flex: 1;">
                <div>Core 1: 23%</div>
                <div style="background: #21262d; border-radius: 2px; padding: 2px;">
                    <div style="background: #a78bfa; height: 6px; width: 23%; border-radius: 1px;"></div>
                </div>
            </div>
            <div style="flex: 1;">
                <div>Core 2: 45%</div>
                <div style="background: #21262d; border-radius: 2px; padding: 2px;">
                    <div style="background: #a78bfa; height: 6px; width: 45%; border-radius: 1px;"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div style="border-top: 1px solid #30363d; padding-top: 15px;">
    <h3 style="color: #e3b341; margin-top: 0;">🔐 Güvenlik Durumu</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <div>✅ Firewall: Active</div>
        <div>✅ Antivirus: Protected</div>
        <div>✅ VPN: Connected</div>
        <div>✅ SSH: Secured</div>
        <div>⚠️ Updates: 3 pending</div>
        <div>✅ Backup: Current</div>
    </div>
</div>

<div style="margin-top: 20px; text-align: center; color: #6e7681; font-style: italic;">
Last updated: ${new Date().toLocaleString()}
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
        this.updateMemoryInfo();
        this.updateInterval = setInterval(() => {
            this.updateMemoryInfo();
        }, 2000);
    }
    
    updateMemoryInfo() {
        if (!this.content) return;
        
        // Simulate dynamic memory usage
        const totalRAM = 4096;
        const usedRAM = Math.floor(Math.random() * 1000) + 1500;
        const freeRAM = totalRAM - usedRAM;
        const usagePercent = Math.floor((usedRAM / totalRAM) * 100);
        
        const memoryInfo = `
<div style="color: #00ff00; border: 2px solid #00ff00; padding: 15px; margin-bottom: 20px;">
<div style="text-align: center; font-size: 18px;">████ MEMORY MONITOR ████</div>
</div>

<div style="margin-bottom: 20px;">
    <h3 style="color: #58a6ff;">💾 RAM Kullanımı</h3>
    <div style="font-family: monospace; background: #161b22; padding: 15px; border-radius: 6px; margin: 10px 0;">
        <div>Toplam RAM: ${totalRAM} MB</div>
        <div>Kullanılan:  ${usedRAM} MB</div>
        <div>Boş:       ${freeRAM} MB</div>
        <div>Kullanım:   ${usagePercent}%</div>
    </div>
    
    <div style="background: #21262d; border-radius: 4px; padding: 3px; margin: 10px 0;">
        <div style="background: ${usagePercent > 80 ? '#ff6b6b' : usagePercent > 60 ? '#ffa657' : '#56d364'}; height: 20px; width: ${usagePercent}%; border-radius: 2px; transition: all 0.3s ease;"></div>
    </div>
</div>

<div style="margin-bottom: 20px;">
    <h3 style="color: #ffa657;">📊 Süreç Listesi</h3>
    <div style="font-family: monospace; background: #161b22; padding: 15px; border-radius: 6px;">
        <div style="border-bottom: 1px solid #30363d; padding-bottom: 5px; margin-bottom: 10px;">
            <strong>PID    NAME              CPU%   MEM%</strong>
        </div>
        <div>1234   desktop-manager   12.3   8.7</div>
        <div>5678   terminal          2.1    3.2</div>
        <div>9012   file-manager      1.8    2.9</div>
        <div>3456   calculator        0.5    1.1</div>
        <div>7890   system-monitor    3.7    4.2</div>
        <div>2468   browser           45.2   28.6</div>
        <div>1357   text-editor       0.9    2.3</div>
        <div>8024   background-task   8.1    5.4</div>
    </div>
</div>

<div style="margin-bottom: 20px;">
    <h3 style="color: #a78bfa;">📈 Sistem Performansı</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div style="background: #161b22; padding: 10px; border-radius: 6px;">
            <div style="color: #58a6ff;"><strong>CPU Load</strong></div>
            <div style="font-size: 24px; color: #56d364;">${(Math.random() * 30 + 20).toFixed(1)}%</div>
        </div>
        <div style="background: #161b22; padding: 10px; border-radius: 6px;">
            <div style="color: #58a6ff;"><strong>Disk I/O</strong></div>
            <div style="font-size: 24px; color: #ffa657;">${(Math.random() * 50 + 10).toFixed(1)} MB/s</div>
        </div>
        <div style="background: #161b22; padding: 10px; border-radius: 6px;">
            <div style="color: #58a6ff;"><strong>Network</strong></div>
            <div style="font-size: 24px; color: #ff6b6b;">${(Math.random() * 100 + 50).toFixed(1)} KB/s</div>
        </div>
        <div style="background: #161b22; padding: 10px; border-radius: 6px;">
            <div style="color: #58a6ff;"><strong>Uptime</strong></div>
            <div style="font-size: 18px; color: #c9d1d9;">42d 13h 37m</div>
        </div>
    </div>
</div>

<div style="border-top: 1px solid #30363d; padding-top: 15px; color: #6e7681; font-style: italic; text-align: center;">
Güncelleme: ${new Date().toLocaleTimeString()}
</div>
        `;
        
        this.content.innerHTML = memoryInfo;
    }
    
    stopMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Notes Application
class NotesApp {
    constructor() {
        this.content = null;
        this.init();
    }
    
    init() {
        this.content = document.getElementById('notes-content');
        // Notes content is already set in HTML, no need to modify
    }
}

// Initialize desktop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.desktopManager = new DesktopManager();
    window.terminal = new Terminal();
});