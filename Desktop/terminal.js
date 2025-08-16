// Terminal açma
document.getElementById('terminal-icon').addEventListener('click', function() {
  document.getElementById('terminalWindow').style.display = 'block';
  document.getElementById('terminal-line').focus();
});

// Terminal kapatma
function closeTerminal() {
  document.getElementById('terminalWindow').style.display = 'none';
}

// Dosya sistemi simülasyonu
let currentDir = "/home/user";
const fileSystem = {
  "/home/user": ["Desktop", "Documents", "Downloads", "Music", "Pictures", "Videos", "notes.txt", "readme.txt"],
  "/home/user/Desktop": ["project.txt", "todo.md"],
  "/home/user/Documents": ["report.pdf", "budget.xlsx"],
  "/home/user/Downloads": ["installer.deb", "archive.tar.gz"],
  "/home/user/Music": ["track01.mp3", "playlist.m3u"],
  "/home/user/Pictures": ["screenshot.png", "vacation.jpg"],
  "/home/user/Videos": ["tutorial.mp4", "movie.mkv"]
};

// Dosya içerikleri
const fileContents = {
  "/home/user/notes.txt": "Bu bir not dosyasıdır.\nÖnemli bilgiler içerir.\nDark$ession OS'a hoş geldiniz.",
  "/home/user/readme.txt": "Dark$ession OS Kullanım Kılavuzu\n===========================\n\nTemel komutlar için 'help' yazın.\nSistem günlükleri için 'cat /var/log/system.log' komutunu kullanın.",
  "/home/user/Desktop/project.txt": "Proje Notları:\n- Güvenlik duvarı yapılandırması tamamlandı\n- Veritabanı yedekleme sistemi kuruldu\n- Kullanıcı yetkilendirme modülü geliştirilecek"
};

// Komut geçmişi
let commandHistory = [];
let historyIndex = -1;

const terminalBody = document.getElementById('terminal-body');
let commandText = '';
let currentLine = document.getElementById('terminal-line');

// Komut çıktısı ekleme
function addOutput(text, className = '') {
  const output = document.createElement('pre');
  if (className) output.className = className;
  output.textContent = text;
  terminalBody.appendChild(output);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Komut satırı oluşturma
function createNewCommandLine() {
  const newLine = document.createElement('pre');
  newLine.id = 'terminal-line';
  newLine.innerHTML = `<span class="command">user@darksession:${currentDir.replace('/home/user', '~')}$</span><span class="pulse">_</span>`;
  terminalBody.appendChild(newLine);
  currentLine = newLine;
  commandText = '';
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Komut çalıştırma
function executeCommand(command) {
  if (!command) return;
  
  // Komut geçmişine ekle
  commandHistory.push(command);
  historyIndex = commandHistory.length;
  
  const args = command.split(' ');
  const cmd = args[0];
  
  switch(cmd) {
    case 'clear':
      terminalBody.innerHTML = '';
      break;
      
    case 'ls':
      if (fileSystem[currentDir]) {
        addOutput(fileSystem[currentDir].join('  '));
      } else {
        addOutput('Dizin bulunamadı.');
      }
      break;
      
    case 'cd':
      if (args.length < 2) {
        currentDir = '/home/user';
      } else if (args[1] === '..') {
        const parts = currentDir.split('/');
        if (parts.length > 3) { // /home/user'dan yukarı çıkmasın
          parts.pop();
          currentDir = parts.join('/');
        }
      } else if (args[1].startsWith('/')) {
        if (fileSystem[args[1]]) {
          currentDir = args[1];
        } else {
          addOutput(`bash: cd: ${args[1]}: Böyle bir dizin yok`);
        }
      } else {
        const newDir = `${currentDir}/${args[1]}`;
        if (fileSystem[newDir]) {
          currentDir = newDir;
        } else {
          addOutput(`bash: cd: ${args[1]}: Böyle bir dizin yok`);
        }
      }
      break;
      
    case 'pwd':
      addOutput(currentDir);
      break;
      
    case 'cat':
      if (args.length < 2) {
        addOutput('Kullanım: cat DOSYA');
      } else {
        let filePath = args[1];
        if (!filePath.startsWith('/')) {
          filePath = `${currentDir}/${filePath}`;
        }
        
        if (fileContents[filePath]) {
          addOutput(fileContents[filePath]);
        } else {
          addOutput(`cat: ${args[1]}: Böyle bir dosya yok`);
        }
      }
      break;
      
    case 'echo':
      addOutput(args.slice(1).join(' '));
      break;
      
    case 'date':
      const now = new Date();
      addOutput(now.toLocaleString('tr-TR'));
      break;
      
    case 'whoami':
      addOutput('user');
      break;
      
    case 'uname':
      if (args.includes('-a')) {
        addOutput('Linux DarkSession 5.15.0-generic #1 SMP x86_64 GNU/Linux');
      } else {
        addOutput('Linux');
      }
      break;
      
    case 'help':
      addOutput('Kullanılabilir komutlar:\n' +
               'ls - Dizin içeriğini listele\n' +
               'cd - Dizin değiştir\n' +
               'pwd - Mevcut dizini göster\n' +
               'cat - Dosya içeriğini göster\n' +
               'echo - Metin yazdır\n' +
               'clear - Terminali temizle\n' +
               'date - Tarih ve saati göster\n' +
               'whoami - Kullanıcı adını göster\n' +
               'uname - Sistem bilgisini göster\n' +
               'history - Komut geçmişini göster');
      break;
      
    case 'history':
      const historyList = commandHistory.map((cmd, i) => `${i+1}  ${cmd}`).join('\n');
      addOutput(historyList);
      break;
      
    default:
      addOutput(`bash: ${cmd}: komut bulunamadı`);
  }
}

// Klavye olaylarını dinle
document.addEventListener('keydown', function(e) {
  if (document.getElementById('terminalWindow').style.display !== 'block') return;
  
  // Komut geçmişinde gezinme
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      commandText = commandHistory[historyIndex];
      updateCommandLine();
    }
  } 
  else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      commandText = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      commandText = '';
    }
    updateCommandLine();
  }
  // Tab tamamlama (basit)
  else if (e.key === 'Tab') {
    e.preventDefault();
    // Basit bir tab tamamlama örneği
    if (commandText.startsWith('cd ') && commandText.split(' ').length === 2) {
      const partial = commandText.split(' ')[1];
      const matches = fileSystem[currentDir]?.filter(item => item.startsWith(partial)) || [];
      if (matches.length === 1) {
        commandText = `cd ${matches[0]}`;
        updateCommandLine();
      }
    }
  }
  // Komut çalıştırma
  else if (e.key === 'Enter') {
    e.preventDefault();
    
    // Mevcut komut satırını statik yap
    currentLine.innerHTML = `<span class="command">user@darksession:${currentDir.replace('/home/user', '~')}$</span> ${commandText}`;
    
    // Komutu çalıştır
    executeCommand(commandText);
    
    // Yeni komut satırı oluştur
    createNewCommandLine();
  }
  // Backspace ile silme
  else if (e.key === 'Backspace') {
    e.preventDefault();
    if (commandText.length > 0) {
      commandText = commandText.slice(0, -1);
      updateCommandLine();
    }
  }
  // Ctrl+C ile iptal
  else if (e.key === 'c' && e.ctrlKey) {
    e.preventDefault();
    addOutput('^C');
    createNewCommandLine();
  }
  // Ctrl+L ile temizleme (clear)
  else if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault();
    terminalBody.innerHTML = '';
    createNewCommandLine();
  }
  // Normal karakter girişi
  else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    commandText += e.key;
    updateCommandLine();
  }
});

// Komut satırını güncelle
function updateCommandLine() {
  if (currentLine) {
    currentLine.innerHTML = `<span class="command">user@darksession:${currentDir.replace('/home/user', '~')}$</span> ${commandText}<span class="pulse">_</span>`;
  }
}

// Sayfa yüklendiğinde ilk komut satırını oluştur
window.addEventListener('load', function() {
  // Başlangıç mesajı
  addOutput('Dark$ession OS [Sürüm 2.0.37]', 'system-message');
  addOutput('Copyright (c) 2037 Dark$ession Labs. Tüm hakları saklıdır.', 'system-message');
  addOutput('\nYardım için "help" yazın.\n', 'system-message');
  
  // İlk komut satırını oluştur
  createNewCommandLine();
});