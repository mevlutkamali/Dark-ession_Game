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
        
        document.getElementById('clock').textContent = `${dateString} ${timeString}`;
    }
    
    openApplication(appName) {
        const window = document.getElementById(`${appName}-window`);
        
        if (!window) {
            console.error(`Window not found: ${appName}-window`);
            return;
        }
        
        if (this.windows.has(appName)) {
            // Window exists, just show and focus it
            this.showWindow(appName);
            this.focusWindow(appName);
        } else {
            // Create new window instance
            this.createWindow(appName, window);
        }
        
        // Initialize app-specific functionality
        this.initializeApp(appName);
    }
    
    createWindow(appName, windowElement) {
        const windowData = {
            element: windowElement,
            isMaximized: false,
            isMinimized: false,
            originalBounds: null,
            isDragging: false
        };
        
        this.windows.set(appName, windowData);
        
        // Set initial position
        this.setInitialPosition(windowElement);
        
        // Show window
        windowElement.style.display = 'block';
        
        // Add to taskbar
        this.addToTaskbar(appName);
        
        // Focus window
        this.focusWindow(appName);
    }
    
    setInitialPosition(windowElement) {
        const desktop = document.querySelector('.desktop');
        const desktopRect = desktop.getBoundingClientRect();
        
        // Random position with some offset
        const maxX = Math.max(0, desktopRect.width - windowElement.offsetWidth - 20);
        const maxY = Math.max(0, desktopRect.height - windowElement.offsetHeight - 70); // Account for taskbar
        
        const x = Math.min(100 + (this.windows.size * 30), maxX);
        const y = Math.min(50 + (this.windows.size * 30), maxY);
        
        windowElement.style.left = `${x}px`;
        windowElement.style.top = `${y}px`;
    }
    
    closeWindow(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        windowData.element.style.display = 'none';
        this.windows.delete(appName);
        this.removeFromTaskbar(appName);
        
        // Focus next window
        if (this.activeWindow === appName) {
            this.activeWindow = null;
            const remainingWindows = Array.from(this.windows.keys());
            if (remainingWindows.length > 0) {
                this.focusWindow(remainingWindows[remainingWindows.length - 1]);
            }
        }
    }
    
    minimizeWindow(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        windowData.element.style.display = 'none';
        windowData.isMinimized = true;
        
        if (this.activeWindow === appName) {
            this.activeWindow = null;
        }
        
        this.updateTaskbarApp(appName);
    }
    
    showWindow(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        windowData.element.style.display = 'block';
        windowData.isMinimized = false;
        this.updateTaskbarApp(appName);
    }
    
    toggleMaximize(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        const window = windowData.element;
        
        if (windowData.isMaximized) {
            // Restore
            if (windowData.originalBounds) {
                window.style.left = windowData.originalBounds.left;
                window.style.top = windowData.originalBounds.top;
                window.style.width = windowData.originalBounds.width;
                window.style.height = windowData.originalBounds.height;
            }
            window.classList.remove('maximized');
            windowData.isMaximized = false;
        } else {
            // Maximize
            windowData.originalBounds = {
                left: window.style.left,
                top: window.style.top,
                width: window.style.width,
                height: window.style.height
            };
            window.classList.add('maximized');
            windowData.isMaximized = true;
        }
    }
    
    focusWindow(appName) {
        // Remove active class from all windows
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        // Set as active
        windowData.element.classList.add('active');
        windowData.element.style.zIndex = ++this.zIndex;
        this.activeWindow = appName;
        
        // Update taskbar
        this.updateTaskbarApps();
        
        // Focus appropriate input if terminal
        if (appName === 'terminal') {
            const terminalInput = document.getElementById('terminal-input');
            if (terminalInput) {
                setTimeout(() => terminalInput.focus(), 100);
            }
        }
    }
    
    toggleApplication(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        if (windowData.isMinimized || this.activeWindow !== appName) {
            this.showWindow(appName);
            this.focusWindow(appName);
        } else {
            this.minimizeWindow(appName);
        }
    }
    
    startDragging(window, e) {
        const windowData = this.windows.get(window.dataset.app);
        if (!windowData || windowData.isMaximized) return;
        
        windowData.isDragging = true;
        const rect = window.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        const handleMouseMove = (e) => {
            if (!windowData.isDragging) return;
            
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            // Constrain to desktop bounds
            const desktop = document.querySelector('.desktop');
            const desktopRect = desktop.getBoundingClientRect();
            
            const maxX = desktopRect.width - window.offsetWidth;
            const maxY = desktopRect.height - window.offsetHeight - 48; // Account for taskbar
            
            window.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            window.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        };
        
        const handleMouseUp = () => {
            windowData.isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    addToTaskbar(appName) {
        const taskbarApps = document.getElementById('taskbar-apps');
        const taskbarApp = document.createElement('div');
        
        taskbarApp.className = 'taskbar-app';
        taskbarApp.dataset.app = appName;
        
        const icon = this.getAppIcon(appName);
        const title = this.getAppTitle(appName);
        
        taskbarApp.innerHTML = `<i class="${icon}"></i> ${title}`;
        
        taskbarApps.appendChild(taskbarApp);
        this.taskbarApps.set(appName, taskbarApp);
    }
    
    removeFromTaskbar(appName) {
        const taskbarApp = this.taskbarApps.get(appName);
        if (taskbarApp) {
            taskbarApp.remove();
            this.taskbarApps.delete(appName);
        }
    }
    
    updateTaskbarApps() {
        this.taskbarApps.forEach((element, appName) => {
            element.classList.toggle('active', this.activeWindow === appName);
        });
    }
    
    updateTaskbarApp(appName) {
        const taskbarApp = this.taskbarApps.get(appName);
        if (!taskbarApp) return;
        
        const windowData = this.windows.get(appName);
        if (windowData) {
            taskbarApp.classList.toggle('active', this.activeWindow === appName && !windowData.isMinimized);
        }
    }
    
    getAppIcon(appName) {
        const icons = {
            'terminal': 'fas fa-terminal',
            'file-manager': 'fas fa-folder',
            'text-editor': 'fas fa-file-code',
            'calculator': 'fas fa-calculator'
        };
        return icons[appName] || 'fas fa-window-maximize';
    }
    
    getAppTitle(appName) {
        const titles = {
            'terminal': 'Terminal',
            'file-manager': 'Files',
            'text-editor': 'Editor',
            'calculator': 'Calculator'
        };
        return titles[appName] || appName;
    }
    
    initializeApp(appName) {
        switch (appName) {
            case 'terminal':
                if (window.terminal) {
                    window.terminal.input.focus();
                }
                break;
            case 'file-manager':
                if (window.fileManager) {
                    window.fileManager.refresh();
                }
                break;
            case 'text-editor':
                if (window.textEditor) {
                    window.textEditor.focus();
                }
                break;
        }
    }
}

/**
 * Calculator Application
 */
class Calculator {
    constructor() {
        this.display = document.getElementById('calc-display');
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = false;
    }
    
    number(digit) {
        if (this.waitingForNewValue) {
            this.currentValue = digit;
            this.waitingForNewValue = false;
        } else {
            this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
        }
        this.updateDisplay();
    }
    
    operation(op) {
        if (this.previousValue === null) {
            this.previousValue = this.currentValue;
        } else if (this.operation) {
            const result = this.calculate();
            this.currentValue = String(result);
            this.updateDisplay();
        }
        
        this.operation = op;
        this.previousValue = this.currentValue;
        this.waitingForNewValue = true;
    }
    
    equals() {
        if (this.operation && this.previousValue !== null) {
            const result = this.calculate();
            this.currentValue = String(result);
            this.operation = null;
            this.previousValue = null;
            this.waitingForNewValue = true;
            this.updateDisplay();
        }
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForNewValue = false;
        this.updateDisplay();
    }
    
    calculate() {
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        
        switch (this.operation) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/': return current !== 0 ? prev / current : 0;
            default: return current;
        }
    }
    
    updateDisplay() {
        this.display.value = this.currentValue;
    }
}

/**
 * File Manager Application
 */
class FileManager {
    constructor() {
        this.currentPath = '/home/user';
        this.fileList = document.getElementById('file-list');
        this.pathDisplay = document.getElementById('current-path');
        this.history = ['/home/user'];
        this.historyIndex = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('back-btn').addEventListener('click', () => this.goBack());
        document.getElementById('forward-btn').addEventListener('click', () => this.goForward());
        document.getElementById('up-btn').addEventListener('click', () => this.goUp());
    }
    
    refresh() {
        this.updatePathDisplay();
        this.loadDirectory();
    }
    
    loadDirectory() {
        if (!window.terminal) return;
        
        const dir = window.terminal.getDirectoryContents(this.currentPath);
        this.fileList.innerHTML = '';
        
        if (!dir) return;
        
        Object.keys(dir).forEach(name => {
            const item = dir[name];
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.classList.add(item.type === 'directory' ? 'folder' : 'file');
            
            const icon = item.type === 'directory' ? 'fas fa-folder' : 'fas fa-file';
            fileItem.innerHTML = `<i class="${icon}"></i><span>${name}</span>`;
            
            fileItem.addEventListener('dblclick', () => {
                if (item.type === 'directory') {
                    this.navigateToPath(`${this.currentPath}/${name}`.replace(/\/+/g, '/'));
                }
            });
            
            this.fileList.appendChild(fileItem);
        });
    }
    
    navigateToPath(path) {
        this.currentPath = path;
        this.addToHistory(path);
        this.refresh();
    }
    
    addToHistory(path) {
        // Remove any forward history
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(path);
        this.historyIndex = this.history.length - 1;
    }
    
    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentPath = this.history[this.historyIndex];
            this.refresh();
        }
    }
    
    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentPath = this.history[this.historyIndex];
            this.refresh();
        }
    }
    
    goUp() {
        const parentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/')) || '/';
        if (parentPath !== this.currentPath) {
            this.navigateToPath(parentPath);
        }
    }
    
    updatePathDisplay() {
        this.pathDisplay.textContent = this.currentPath;
    }
}

/**
 * Text Editor Application
 */
class TextEditor {
    constructor() {
        this.content = document.getElementById('editor-content');
        this.currentFile = null;
        this.isDirty = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('new-file-btn').addEventListener('click', () => this.newFile());
        document.getElementById('save-file-btn').addEventListener('click', () => this.saveFile());
        
        this.content.addEventListener('input', () => {
            this.isDirty = true;
            this.updateTitle();
        });
    }
    
    newFile() {
        if (this.isDirty && !confirm('You have unsaved changes. Continue?')) {
            return;
        }
        
        this.content.value = '';
        this.currentFile = null;
        this.isDirty = false;
        this.updateTitle();
    }
    
    saveFile() {
        // In a real implementation, this would save to the file system
        // For this simulation, we'll just mark as saved
        this.isDirty = false;
        this.updateTitle();
        
        // Show a simple notification
        const notification = document.createElement('div');
        notification.textContent = 'File saved!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #238636;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10000;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }
    
    focus() {
        this.content.focus();
    }
    
    updateTitle() {
        const window = document.getElementById('text-editor-window');
        const titleSpan = window.querySelector('.window-title span');
        const filename = this.currentFile || 'untitled.txt';
        const dirtyIndicator = this.isDirty ? ' •' : '';
        titleSpan.textContent = `Text Editor - ${filename}${dirtyIndicator}`;
    }
}

// Initialize desktop manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.desktopManager = new DesktopManager();
});