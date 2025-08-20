/**
 * Terminal Emulator for Desktop Simulation
 * Provides a functional command-line interface with file system simulation
 */

class Terminal {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.prompt = 'user@darksession:~$ ';
        this.currentPath = '/home/user';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.fileSystem = this.initializeFileSystem();
        
        this.init();
    }
    
    init() {
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.input.addEventListener('focus', () => this.showCursor());
        this.input.addEventListener('blur', () => this.hideCursor());
        
        // Welcome message
        this.printWelcome();
        
        // Focus the input when terminal is opened
        this.input.focus();
    }
    
    initializeFileSystem() {
        return {
            '/': {
                type: 'directory',
                contents: {
                    'home': {
                        type: 'directory',
                        contents: {
                            'user': {
                                type: 'directory',
                                contents: {
                                    'Documents': {
                                        type: 'directory',
                                        contents: {
                                            'readme.txt': {
                                                type: 'file',
                                                content: 'Welcome to the Dark Session Desktop!\n\nThis is a simulated desktop environment with:\n- Functional terminal\n- File manager\n- Text editor\n- Calculator\n\nExplore and enjoy!'
                                            },
                                            'projects': {
                                                type: 'directory',
                                                contents: {
                                                    'website': {
                                                        type: 'directory',
                                                        contents: {
                                                            'index.html': {
                                                                type: 'file',
                                                                content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Website</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>'
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    'Downloads': {
                                        type: 'directory',
                                        contents: {}
                                    },
                                    'Pictures': {
                                        type: 'directory',
                                        contents: {}
                                    },
                                    '.bashrc': {
                                        type: 'file',
                                        content: '# ~/.bashrc: executed by bash(1) for non-login shells.\n\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\nalias la="ls -A"\n'
                                    }
                                }
                            }
                        }
                    },
                    'etc': {
                        type: 'directory',
                        contents: {
                            'passwd': {
                                type: 'file',
                                content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User:/home/user:/bin/bash\n'
                            }
                        }
                    },
                    'usr': {
                        type: 'directory',
                        contents: {
                            'bin': {
                                type: 'directory',
                                contents: {}
                            }
                        }
                    }
                }
            }
        };
    }
    
    printWelcome() {
        const welcome = `
            <span class="info">Welcome to Dark Session Terminal</span>
            <span class="comment">Type 'help' to see available commands</span>

        `;
        this.output.innerHTML = welcome;
    }
    
    handleKeyDown(e) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                this.executeCommand();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
            case 'Tab':
                e.preventDefault();
                this.autoComplete();
                break;
        }
    }
    
    executeCommand() {
        const command = this.input.value.trim();
        
        if (command) {
            this.commandHistory.push(command);
            this.historyIndex = this.commandHistory.length;
        }
        
        // Display command in output
        this.appendOutput(`<span class="terminal-prompt">${this.prompt}</span>${command}`);
        
        // Clear input
        this.input.value = '';
        
        // Execute command
        if (command) {
            this.processCommand(command);
        }
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    processCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        
        switch(cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'ls':
                this.listDirectory(args);
                break;
            case 'cd':
                this.changeDirectory(args[0] || '/home/user');
                break;
            case 'pwd':
                this.printWorkingDirectory();
                break;
            case 'cat':
                this.catFile(args[0]);
                break;
            case 'mkdir':
                this.makeDirectory(args[0]);
                break;
            case 'touch':
                this.touchFile(args[0]);
                break;
            case 'rm':
                this.removeFile(args);
                break;
            case 'echo':
                this.echo(args.join(' '));
                break;
            case 'date':
                this.showDate();
                break;
            case 'whoami':
                this.appendOutput('user');
                break;
            case 'uname':
                this.showSystemInfo(args);
                break;
            case 'ps':
                this.showProcesses();
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'history':
                this.showHistory();
                break;
            case 'grep':
                this.grep(args);
                break;
            case 'find':
                this.find(args);
                break;
            case 'tree':
                this.showTree(args[0] || this.currentPath);
                break;
            case 'ipconfig':
                this.showIPConfig();
                break;
            case 'who':
                this.showWho();
                break;
            default:
                this.appendOutput(`<span class="error">Command not found: ${cmd}</span>`);
                this.appendOutput(`<span class="comment">Type 'help' to see available commands</span>`);
        }
    }
    
    showHelp() {
        const help = `
<span class="info">Available Commands:</span>

<span class="success">File Operations:</span>
  ls [path]         - List directory contents
  cd [path]         - Change directory
  pwd               - Print working directory
  cat [file]        - Display file contents
  mkdir [dir]       - Create directory
  touch [file]      - Create empty file
  rm [file/dir]     - Remove file or directory
  find [pattern]    - Find files and directories
  tree [path]       - Show directory tree

<span class="success">System Commands:</span>
  date              - Show current date and time
  whoami            - Show current user
  uname [-a]        - Show system information
  ps                - Show running processes
  history           - Show command history
  clear             - Clear terminal screen

<span class="success">Text Operations:</span>
  echo [text]       - Display text
  grep [pattern]    - Search for pattern in files

<span class="success">Navigation:</span>
  ↑/↓ arrows        - Navigate command history
  Tab               - Auto-complete paths
  Ctrl+L            - Clear screen

<span class="comment">Example: ls -la /home/user</span>
`;
        this.appendOutput(help);
    }
    
    listDirectory(args) {
        const path = args[0] || this.currentPath;
        const showHidden = args.includes('-a') || args.includes('-la');
        const longFormat = args.includes('-l') || args.includes('-la');
        
        const dir = this.getDirectoryContents(path);
        
        if (!dir) {
            this.appendOutput(`<span class="error">ls: cannot access '${path}': No such file or directory</span>`);
            return;
        }
        
        if (longFormat) {
            this.appendOutput(`total ${Object.keys(dir).length}`);
        }
        
        Object.keys(dir).forEach(name => {
            if (!showHidden && name.startsWith('.')) return;
            
            const item = dir[name];
            if (longFormat) {
                const type = item.type === 'directory' ? 'd' : '-';
                const permissions = item.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--';
                const size = item.type === 'file' ? (item.content ? item.content.length : 0) : 4096;
                const date = new Date().toLocaleDateString();
                
                if (item.type === 'directory') {
                    this.appendOutput(`${type}${permissions} 2 user user ${size.toString().padStart(8)} ${date} <span class="directory">${name}</span>`);
                } else {
                    this.appendOutput(`${type}${permissions} 1 user user ${size.toString().padStart(8)} ${date} <span class="file">${name}</span>`);
                }
            } else {
                if (item.type === 'directory') {
                    this.appendOutput(`<span class="directory">${name}/</span>`);
                } else {
                    this.appendOutput(`<span class="file">${name}</span>`);
                }
            }
        });
    }
    
    changeDirectory(path) {
        const newPath = this.resolvePath(path);
        const dir = this.getDirectoryContents(newPath);
        
        if (!dir) {
            this.appendOutput(`<span class="error">cd: no such file or directory: ${path}</span>`);
            return;
        }
        
        this.currentPath = newPath;
        this.updatePrompt();
    }
    
    printWorkingDirectory() {
        this.appendOutput(`<span class="path">${this.currentPath}</span>`);
    }
    
    catFile(filename) {
        if (!filename) {
            this.appendOutput(`<span class="error">cat: missing file operand</span>`);
            return;
        }
        
        const filePath = this.resolvePath(filename);
        const file = this.getFile(filePath);
        
        if (!file) {
            this.appendOutput(`<span class="error">cat: ${filename}: No such file or directory</span>`);
            return;
        }
        
        if (file.type !== 'file') {
            this.appendOutput(`<span class="error">cat: ${filename}: Is a directory</span>`);
            return;
        }
        
        this.appendOutput(file.content || '');
    }
    
    makeDirectory(dirname) {
        if (!dirname) {
            this.appendOutput(`<span class="error">mkdir: missing operand</span>`);
            return;
        }
        
        const dirPath = this.resolvePath(dirname);
        const parentPath = this.getParentPath(dirPath);
        const dirName = this.getFileName(dirPath);
        
        const parent = this.getDirectoryContents(parentPath);
        if (!parent) {
            this.appendOutput(`<span class="error">mkdir: cannot create directory '${dirname}': No such file or directory</span>`);
            return;
        }
        
        if (parent[dirName]) {
            this.appendOutput(`<span class="error">mkdir: cannot create directory '${dirname}': File exists</span>`);
            return;
        }
        
        parent[dirName] = {
            type: 'directory',
            contents: {}
        };
        
        this.appendOutput(`<span class="success">Directory '${dirname}' created</span>`);
    }
    
    touchFile(filename) {
        if (!filename) {
            this.appendOutput(`<span class="error">touch: missing file operand</span>`);
            return;
        }
        
        const filePath = this.resolvePath(filename);
        const parentPath = this.getParentPath(filePath);
        const fileName = this.getFileName(filePath);
        
        const parent = this.getDirectoryContents(parentPath);
        if (!parent) {
            this.appendOutput(`<span class="error">touch: cannot touch '${filename}': No such file or directory</span>`);
            return;
        }
        
        if (!parent[fileName]) {
            parent[fileName] = {
                type: 'file',
                content: ''
            };
            this.appendOutput(`<span class="success">File '${filename}' created</span>`);
        } else {
            this.appendOutput(`<span class="success">File '${filename}' touched</span>`);
        }
    }
    
    removeFile(args) {
        if (args.length === 0) {
            this.appendOutput(`<span class="error">rm: missing operand</span>`);
            return;
        }
        
        const filename = args[args.length - 1];
        const recursive = args.includes('-r') || args.includes('-rf');
        const force = args.includes('-f') || args.includes('-rf');
        
        const filePath = this.resolvePath(filename);
        const parentPath = this.getParentPath(filePath);
        const fileName = this.getFileName(filePath);
        
        const parent = this.getDirectoryContents(parentPath);
        if (!parent || !parent[fileName]) {
            if (!force) {
                this.appendOutput(`<span class="error">rm: cannot remove '${filename}': No such file or directory</span>`);
            }
            return;
        }
        
        const item = parent[fileName];
        if (item.type === 'directory' && !recursive) {
            this.appendOutput(`<span class="error">rm: cannot remove '${filename}': Is a directory</span>`);
            return;
        }
        
        delete parent[fileName];
        this.appendOutput(`<span class="success">Removed '${filename}'</span>`);
    }
    
    echo(text) {
        this.appendOutput(text);
    }
    
    showDate() {
        const now = new Date();
        this.appendOutput(now.toString());
    }
    
    showSystemInfo(args) {
        if (args.includes('-a')) {
            this.appendOutput('Linux darksession 5.15.0 #1 SMP x86_64 GNU/Linux');
        } else {
            this.appendOutput('Linux');
        }
    }
    
    showProcesses() {
        const processes = `
        PID TTY          TIME CMD
            1 ?        00:00:01 systemd
        123 pts/0    00:00:00 bash
        456 pts/0    00:00:00 terminal
        789 pts/0    00:00:00 ps
        `;
        this.appendOutput(processes);
    }

    showIPConfig() {
    const ipInfo = `
    Ethernet adapter Ethernet:

    Connection-specific DNS Suffix  . : darksession.local
    IPv4 Address. . . . . . . . . . . : 192.168.1.42
    Subnet Mask . . . . . . . . . . . : 255.255.255.0
    Default Gateway . . . . . . . . . : 192.168.1.1

    Wireless LAN adapter Wi-Fi:

    Connection-specific DNS Suffix  . : darksession.local
    IPv4 Address. . . . . . . . . . . : 192.168.1.101
    Subnet Mask . . . . . . . . . . . : 255.255.255.0
    Default Gateway . . . . . . . . . : 192.168.1.1
    `;
        this.appendOutput(ipInfo);
    }

    showWho() {
        const whoOutput = `
        NAME       TTY       LOGIN TIME           IP
        user1      pts/0     2025-08-20 19:45    (:0)
        user2      pts/1     2025-08-20 20:01    (192.168.1.5)
        admin      pts/2     2025-08-20 18:30    (10.0.0.2)
        `;
            this.appendOutput(whoOutput);
        }


    
    clearTerminal() {
        this.output.innerHTML = '';
    }
    
    showHistory() {
        this.commandHistory.forEach((cmd, index) => {
            this.appendOutput(`${(index + 1).toString().padStart(4)} ${cmd}`);
        });
    }
    
    grep(args) {
        if (args.length < 2) {
            this.appendOutput(`<span class="error">grep: missing pattern or file</span>`);
            return;
        }
        
        const pattern = args[0];
        const filename = args[1];
        
        const file = this.getFile(this.resolvePath(filename));
        if (!file || file.type !== 'file') {
            this.appendOutput(`<span class="error">grep: ${filename}: No such file or directory</span>`);
            return;
        }
        
        const lines = file.content.split('\n');
        const matches = lines.filter(line => line.includes(pattern));
        
        if (matches.length === 0) {
            return; // No output for no matches
        }
        
        matches.forEach(line => {
            const highlighted = line.replace(new RegExp(pattern, 'g'), `<span class="warning">${pattern}</span>`);
            this.appendOutput(highlighted);
        });
    }
    
    find(args) {
        if (args.length === 0) {
            this.appendOutput(`<span class="error">find: missing search pattern</span>`);
            return;
        }
        
        const pattern = args[0];
        const results = this.findInDirectory(this.currentPath, pattern);
        
        if (results.length === 0) {
            this.appendOutput(`<span class="comment">No files found matching '${pattern}'</span>`);
            return;
        }
        
        results.forEach(result => {
            this.appendOutput(`<span class="path">${result}</span>`);
        });
    }
    
    showTree(path) {
        const dir = this.getDirectoryContents(path);
        if (!dir) {
            this.appendOutput(`<span class="error">tree: ${path}: No such file or directory</span>`);
            return;
        }
        
        this.appendOutput(`<span class="path">${path}</span>`);
        this.printTree(dir, '', path);
    }
    
    printTree(contents, prefix, currentPath) {
        const entries = Object.keys(contents);
        entries.forEach((name, index) => {
            const isLast = index === entries.length - 1;
            const item = contents[name];
            const connector = isLast ? '└── ' : '├── ';
            
            if (item.type === 'directory') {
                this.appendOutput(`${prefix}${connector}<span class="directory">${name}/</span>`);
                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                this.printTree(item.contents, newPrefix, `${currentPath}/${name}`);
            } else {
                this.appendOutput(`${prefix}${connector}<span class="file">${name}</span>`);
            }
        });
    }
    
    findInDirectory(path, pattern) {
        const results = [];
        const dir = this.getDirectoryContents(path);
        
        if (!dir) return results;
        
        Object.keys(dir).forEach(name => {
            const fullPath = `${path}/${name}`.replace(/\/+/g, '/');
            
            if (name.includes(pattern)) {
                results.push(fullPath);
            }
            
            if (dir[name].type === 'directory') {
                results.push(...this.findInDirectory(fullPath, pattern));
            }
        });
        
        return results;
    }
    
    // Utility methods
    resolvePath(path) {
        if (path.startsWith('/')) {
            return path;
        }
        
        if (path === '.') {
            return this.currentPath;
        }
        
        if (path === '..') {
            return this.getParentPath(this.currentPath);
        }
        
        if (path.startsWith('./')) {
            path = path.substring(2);
        }
        
        return `${this.currentPath}/${path}`.replace(/\/+/g, '/');
    }
    
    getParentPath(path) {
        if (path === '/') return '/';
        return path.substring(0, path.lastIndexOf('/')) || '/';
    }
    
    getFileName(path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }
    
    getDirectoryContents(path) {
        const parts = path.split('/').filter(p => p);
        let current = this.fileSystem['/'];
        
        for (const part of parts) {
            if (!current.contents || !current.contents[part]) {
                return null;
            }
            current = current.contents[part];
        }
        
        return current.type === 'directory' ? current.contents : null;
    }
    
    getFile(path) {
        const parentPath = this.getParentPath(path);
        const fileName = this.getFileName(path);
        const parent = this.getDirectoryContents(parentPath);
        
        return parent ? parent[fileName] : null;
    }
    
    updatePrompt() {
        const pathParts = this.currentPath.split('/');
        const shortPath = pathParts.length > 3 ? `.../${pathParts.slice(-2).join('/')}` : this.currentPath;
        this.prompt = `user@darksession:${shortPath === '/' ? '/' : shortPath}$ `;
        
        // Update the prompt display
        const promptElement = document.querySelector('.terminal-prompt');
        if (promptElement) {
            promptElement.textContent = this.prompt;
        }
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.input.value = '';
            return;
        }
        
        this.input.value = this.commandHistory[this.historyIndex];
    }
    
    autoComplete() {
        const value = this.input.value;
        const parts = value.split(' ');
        const lastPart = parts[parts.length - 1];
        
        if (parts.length === 1) {
            // Command completion
            const commands = ['ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'echo', 'date', 'whoami', 'uname', 'ps', 'clear', 'history', 'grep', 'find', 'tree', 'help'];
            const matches = commands.filter(cmd => cmd.startsWith(lastPart));
            
            if (matches.length === 1) {
                parts[parts.length - 1] = matches[0];
                this.input.value = parts.join(' ') + ' ';
            } else if (matches.length > 1) {
                this.appendOutput(`\n${matches.join('  ')}`);
                this.appendOutput(`<span class="terminal-prompt">${this.prompt}</span>${value}`);
            }
        } else {
            // Path completion
            const path = this.resolvePath(lastPart);
            const parentPath = this.getParentPath(path);
            const prefix = this.getFileName(path);
            
            const dir = this.getDirectoryContents(parentPath);
            if (dir) {
                const matches = Object.keys(dir).filter(name => name.startsWith(prefix));
                
                if (matches.length === 1) {
                    const fullMatch = `${parentPath}/${matches[0]}`.replace(/\/+/g, '/');
                    const relativePath = fullMatch.startsWith(this.currentPath) 
                        ? fullMatch.substring(this.currentPath.length + 1) 
                        : fullMatch;
                    
                    parts[parts.length - 1] = relativePath;
                    this.input.value = parts.join(' ');
                } else if (matches.length > 1) {
                    this.appendOutput(`\n${matches.join('  ')}`);
                    this.appendOutput(`<span class="terminal-prompt">${this.prompt}</span>${value}`);
                }
            }
        }
    }
    
    appendOutput(text) {
        this.output.innerHTML += text + '\n';
    }
    
    scrollToBottom() {
        const container = document.querySelector('.terminal-container');
        container.scrollTop = container.scrollHeight;
    }
    
    showCursor() {
        const cursor = document.querySelector('.terminal-cursor');
        if (cursor) cursor.style.display = 'inline';
    }
    
    hideCursor() {
        const cursor = document.querySelector('.terminal-cursor');
        if (cursor) cursor.style.display = 'none';
    }
}

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new Terminal();
});