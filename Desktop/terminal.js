// === DarkSession unified terminal.js ===

// Terminal açma
document.getElementById('terminal-icon').addEventListener('click', function() {
  document.getElementById('terminalWindow').style.display = 'block';
  document.getElementById('terminal-line').focus();
});

// Terminal kapatma
function closeTerminal() {
  document.getElementById('terminalWindow').style.display = 'none';
}

// Dosya sistemi
let currentDir = "/home/user";
const fileSystem = {
  "/home/user": ["Desktop","Documents","Downloads","Music","Pictures","Videos","logs","notes.txt","readme.txt"],
  "/home/user/Desktop": ["project.txt","todo.md"],
  "/home/user/Documents": ["project1","project2","notes.txt"],
  "/home/user/Documents/project1":[],
  "/home/user/Downloads": ["file1.zip","file2.exe"],
  "/home/user/Music": ["song1.mp3","song2.mp3"],
  "/home/user/Pictures": ["photo1.jpg","photo2.png"],
  "/home/user/Videos": ["video1.mp4","video2.mp4"],
  "/home/user/logs": ["system.log","auth.log","kernel.log","app.log"]
};

const fileContents = {
  "/home/user/notes.txt": "Bu bir not dosyasıdır.\nDark$ession OS'a hoş geldiniz.",
  "/home/user/readme.txt": "Dark$ession OS Kullanım Kılavuzu\n\nTemel komutlar için 'help' yazın.",
  "/home/user/Desktop/project.txt": "Proje Notları:\n- Güvenlik duvarı yapılandırıldı",
};

const logContents = {
  "system.log":"[2037-01-20 08:15:22] INFO: System booted successfully\n[2037-01-20 09:30:45] WARNING: CPU temperature high (78°C)",
  "auth.log":"[2037-01-20 08:16:03] INFO: User 'root' logged in",
  "kernel.log":"[2037-01-20 08:15:10] INFO: Linux kernel 6.5.8 loaded",
  "app.log":"[2037-01-20 09:00:01] INFO: Dark$ession application started"
};

// Komut geçmişi
let commandHistory = [];
let historyIndex = -1;

const terminalBody = document.getElementById('terminal-body');
let commandText = '';
let currentLine = document.getElementById('terminal-line');

function addOutput(text, className = '') {
  const output = document.createElement('pre');
  if (className) output.className = className;
  output.textContent = text;
  terminalBody.appendChild(output);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function createNewCommandLine() {
  const newLine = document.createElement('pre');
  newLine.id = 'terminal-line';
  newLine.innerHTML = `<span class="command">user@darksession:${currentDir.replace('/home/user', '~')}$</span><span class="pulse">_</span>`;
  terminalBody.appendChild(newLine);
  currentLine = newLine;
  commandText = '';
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function executeCommand(cmdline) {
  if (!cmdline) return;

  commandHistory.push(cmdline);
  historyIndex = commandHistory.length;

  const args = cmdline.split(" ");
  const cmd = args[0];

  function printOutput(txt){ addOutput(txt); }

  switch(cmd) {
    case 'help':
      printOutput('Mevcut komutlar: help, echo, date, clear, exit, ls, pwd, cd, mkdir, rmdir, rm, touch, nano, cp, mv, grep, head, tail, whoami, uname -a, df -h, free -h, ping, uptime');
      break;

    case 'date':
      printOutput(new Date().toLocaleString('tr-TR'));
      break;

    case 'whoami':
      printOutput('user');
      break;

    case 'uname':
      if (args.includes('-a')) printOutput('Linux DarkSessionOS #1 SMP x86_64');
      else printOutput('Linux');
      break;

    case 'df':
      printOutput('/Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   19G   29G  40% /\n/dev/sda2       200G   85G  105G  45% /home');
      break;

    case 'free':
      printOutput('             total   used   free   available\nMem:       8G     3G     5G       6G\nSwap:      2G     0G     2G');
      break;

    case 'ls':
      printOutput((fileSystem[currentDir] || []).join('  '));
      break;

    case 'pwd':
      printOutput(currentDir);
      break;

    case 'cd':
      if(!args[1]) currentDir='/home/user';
      else if(args[1]==='..') {
        const parts=currentDir.split('/');
        if(parts.length>3){parts.pop(); currentDir=parts.join('/');}
      }
      else {
        const newDir=(args[1].startsWith('/')?args[1]:`${currentDir}/${args[1]}`);
        if(fileSystem[newDir]) currentDir=newDir;
        else printOutput('Klasör bulunamadı.');
      }
      break;

    case 'cat':
      let fp = args[1];
      if(fp&&!fp.startsWith('/')) fp=`${currentDir}/${fp}`;
      if(fileContents[fp]) printOutput(fileContents[fp]);
      else if(logContents[fp]) printOutput(logContents[fp]);
      else printOutput('Dosya bulunamadı.');
      break;

    case 'tail':
      if(!args[1]) return printOutput('Kullanım: tail DOSYA');
      let f = args[1]; if(!f.startsWith('/')) f=currentDir+'/'+f;
      if(logContents[f]) {
        const lines = logContents[f].split('\n');
        printOutput(lines.slice(-10).join('\n'));
      } else printOutput('Dosya bulunamadı.');
      break;

    case 'echo':
      printOutput(args.slice(1).join(' '));
      break;

    case 'clear':
      terminalBody.innerHTML = '';
      break;

    case 'ping':
      printOutput(`PING ${args[1] || '127.0.0.1'}... cevap bekleniyor (ctrl+c ile iptal)`);
      break;

    case 'uptime':
      printOutput(' 10:42:58 up  2 days,  5:12,  1 user,  load average: 0.12, 0.15, 0.11');
      break;

    default:
      printOutput(`Komut bulunamadı: ${cmdline}`);
  }
}

// Key events
document.addEventListener('keydown', function(e) {
  if (document.getElementById('terminalWindow').style.display !== 'block') return;

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex > 0) { historyIndex--; commandText = commandHistory[historyIndex]; updateCommandLine(); }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) { historyIndex++; commandText = commandHistory[historyIndex]; } else { historyIndex = commandHistory.length; commandText=''; }
    updateCommandLine();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    currentLine.innerHTML = `<span class="command">user@darksession:${currentDir.replace('/home/user','~')}$</span> ${commandText}`;
    executeCommand(commandText);
    createNewCommandLine();
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    if (commandText.length>0) { commandText=commandText.slice(0,-1); updateCommandLine(); }
  } else if (e.key.length===1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    commandText += e.key; updateCommandLine();
  }
});

function updateCommandLine() {
  if (currentLine) {
    currentLine.innerHTML = `<span class="command">user@darksession:${currentDir.replace('/home/user','~')}$</span> ${commandText}<span class="pulse">_</span>`;
  }
}

window.addEventListener('load', function() {
  addOutput('Dark$ession OS [Sürüm 2.0.37]','system-message');
  addOutput('Copyright (c) 2037 Dark$ession Labs.','system-message');
  addOutput('\nYardım için "help" yazın.\n','system-message');
  createNewCommandLine();
});
