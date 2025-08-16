const output = document.getElementById("terminalOutput");

let currentDir = "/home/user";
const directories = {
  "/home/user":["documents","downloads","music","pictures","videos","logs"],
  "/home/user/documents":["project1","project2","notes.txt"],
  "/home/user/downloads":["file1.zip","file2.exe"],
  "/home/user/music":["song1.mp3","song2.mp3"],
  "/home/user/pictures":["photo1.jpg","photo2.png"],
  "/home/user/videos":["video1.mp4","video2.mp4"],
  "/home/user/documents/project1":[],
  "/home/user/logs":["system.log","auth.log","kernel.log","app.log"]
};
const logContents = {
  "system.log":"[2037-01-20 08:15:22] INFO: System booted successfully\n[2037-01-20 09:30:45] WARNING: CPU temperature high (78°C)\n[2037-01-20 10:12:33] INFO: System update available",
  "auth.log":"[2037-01-20 08:16:03] INFO: User 'root' logged in\n[2037-01-20 09:22:15] WARNING: Failed login attempt",
  "kernel.log":"[2037-01-20 08:15:10] INFO: Linux kernel 6.5.8 loaded",
  "app.log":"[2037-01-20 09:00:01] INFO: Dark$ession application started"
};

function writeLine(txt){
  const div = document.createElement("div");
  div.innerHTML = txt;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
  saveTerminal();
}

function saveTerminal(){
  localStorage.setItem("terminalContent", output.innerHTML);
}

function loadTerminal(){
  if(localStorage.getItem("terminalContent")){
    output.innerHTML = localStorage.getItem("terminalContent");
  }
}

function printPrompt(){
  const prompt = `<span class="prompt">user@linux:${currentDir}$</span> `;
  const div = document.createElement("div");
  div.className = "line";
  div.contentEditable = true;
  div.spellcheck = false;
  div.innerHTML = prompt;
  output.appendChild(div);

  // imleci promptun yanına koy
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(div.childNodes[div.childNodes.length-1], 0);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);

  div.focus();
  output.scrollTop = output.scrollHeight;

  // Enter eventini bu div’e bağla
  div.addEventListener("keydown", handleInput);
}

function handleInput(e){
  if(e.key === "Enter"){
    e.preventDefault();
    const line = e.target;
    const cmdline = line.textContent.replace(`user@linux:${currentDir}$`, "").trim();

    // Boşsa yeni prompt
    if(!cmdline){ printPrompt(); return; }

    writeLine(`<span class="prompt">user@linux:${currentDir}$</span> ${cmdline}`);

    const args = cmdline.split(" ");
    const cmd = args[0];

    function printOutput(txt){ writeLine(txt); }

    switch(cmd) {
        case 'help':
            printOutput('Mevcut komutlar: help, echo, date, clear, exit, ls, pwd, cd, mkdir, rmdir, rm, touch, nano, cp, mv, grep, head, tail, whoami, uname -a, df -h, free -h');
            break;
        case 'date':
            printOutput(new Date().toLocaleString());
            break;
        case 'whoami':
            printOutput('user');
            break;
        case 'uname':
            printOutput('Linux DarkSessionOS #1 SMP x86_64');
            break;
        case 'df':
            printOutput('/Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   19G   29G  40% /\n/tmpfs           1.9G  1.1M  1.9G   1% /dev/shm\n/tmpfs           1.9G  1.9M  1.9G   1% /run\n/dev/sda2       200G   85G  105G  45% /home');
            break;
        case 'free':
            printOutput('             total   used   free   available\nMem:       8G     3G     5G       6G\nSwap:      2G     0G     2G');
            break;
        case 'ls':
            printOutput((directories[currentDir] || []).join('  '));
            break;
        case 'pwd':
            printOutput(currentDir);
            break;
        case 'cd':
            if(args[1] && directories[currentDir].includes(args[1])){
                currentDir = currentDir+'/'+args[1];
            } else {
                printOutput('Klasör bulunamadı veya belirtmediniz.');
            }
            break;
        case 'clear':
            output.innerHTML = '';
            break;
        default:
            if(cmd.startsWith('echo')) printOutput(cmdline.slice(5));
            else printOutput(`Komut bulunamadı: ${cmdline}`);
            break;
    }

    printPrompt();
    e.target.removeEventListener("keydown", handleInput); // eski listener kaldır
}

// Sayfa açılınca geçmişi yükle ve prompt başlat
loadTerminal();
printPrompt();
