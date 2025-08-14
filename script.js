// Pencere açma / kapama fonksiyonları
function openWindow(id) {
  document.getElementById(id).style.display = "block";
}

function closeWindow(id) {
  document.getElementById(id).style.display = "none";
}

// İkon sürükleme
let draggedIcon = null;

function drag(event) {
  draggedIcon = event.target.closest(".icon");
}

const desktop = document.getElementById("desktop");

desktop.addEventListener("dragover", function(e) {
  e.preventDefault();
});

desktop.addEventListener("drop", function(e) {
  e.preventDefault();
  if (draggedIcon) {
    const desktopRect = desktop.getBoundingClientRect();
    draggedIcon.style.left = (e.clientX - desktopRect.left - 40) + "px";
    draggedIcon.style.top = (e.clientY - desktopRect.top - 40) + "px";
  }
});

// Sağ tık menüsü
const contextMenu = document.getElementById("contextMenu");

document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
  contextMenu.style.display = "block";
  contextMenu.style.left = e.pageX + "px";
  contextMenu.style.top = e.pageY + "px";
});

document.addEventListener("click", function() {
  contextMenu.style.display = "none";
});

// Terminal komut sistemi

const directories = {
  "/home/user": ["documents", "downloads", "music", "pictures", "videos", "logs"],
  "/home/user/documents": ["project1", "project2", "notes.txt"],
  "/home/user/downloads": ["file1.zip", "file2.exe"],
  "/home/user/music": ["song1.mp3", "song2.mp3"],
  "/home/user/pictures": ["photo1.jpg", "photo2.png"],
  "/home/user/videos": ["video1.mp4", "video2.mp4"],
  "/home/user/documents/project1": [],
  "/home/user/logs": ["system.log", "auth.log", "kernel.log", "app.log"]
};

// Log dosyalarının içerikleri
const logContents = {
  "system.log": "[2037-01-20 08:15:22] INFO: System booted successfully\n[2037-01-20 09:30:45] WARNING: CPU temperature high (78°C)\n[2037-01-20 10:12:33] INFO: System update available\n[2037-01-20 11:05:17] ERROR: Failed to mount /dev/sdb1\n[2037-01-20 12:45:01] INFO: Network interface eth0 connected",
  "auth.log": "[2037-01-20 08:16:03] INFO: User 'root' logged in\n[2037-01-20 09:22:15] WARNING: Failed login attempt for user 'admin'\n[2037-01-20 10:45:30] WARNING: Failed login attempt for user 'admin'\n[2037-01-20 10:46:12] WARNING: Failed login attempt for user 'admin'\n[2037-01-20 10:47:05] CRITICAL: Account 'admin' locked due to multiple failed attempts",
  "kernel.log": "[2037-01-20 08:15:10] INFO: Linux kernel 6.5.8 loaded\n[2037-01-20 08:15:15] INFO: CPU: 8 cores detected\n[2037-01-20 08:15:18] INFO: Memory: 16GB available\n[2037-01-20 10:33:42] WARNING: Process 1458 using excessive CPU\n[2037-01-20 11:05:17] ERROR: I/O error on device sdb1",
  "app.log": "[2037-01-20 09:00:01] INFO: Dark$ession application started\n[2037-01-20 09:15:23] INFO: User connected to server\n[2037-01-20 10:22:45] WARNING: Database connection slow\n[2037-01-20 11:30:12] ERROR: Failed to load module 'security'\n[2037-01-20 12:05:33] INFO: Backup completed successfully"
};

let currentDir = "/home/user";

const commandInput = document.getElementById("commandInput");
const output = document.getElementById("output");

commandInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const input = e.target.value.trim();
    output.innerHTML += `<div><span class="prompt">user@linux:${currentDir}$</span> ${input}</div>`;

    const args = input.split(" ");
    const cmd = args[0];

    if (cmd === "pwd") {
      output.innerHTML += `<div>${currentDir}</div>`;
    } else if (cmd === "ls") {
      const files = directories[currentDir];
      if (files) {
        output.innerHTML += `<div>${files.join("  ")}</div>`;
      } else {
        output.innerHTML += `<div>ls: cannot access '${currentDir}': No such directory</div>`;
      }
    } else if (cmd === "cd") {
      if (args.length < 2 || args[1] === "~") {
        currentDir = "/home/user";
      } else {
        let target = args[1];

        if (target === "..") {
          if (currentDir !== "/home/user") {
            const parts = currentDir.split("/");
            parts.pop();
            currentDir = parts.join("/") || "/";
          }
        } else if (target.startsWith("/")) {
          if (directories[target]) {
            currentDir = target;
          } else {
            output.innerHTML += `<div>bash: cd: ${target}: No such directory</div>`;
          }
        } else {
          const newPath = currentDir + "/" + target;
          if (directories[newPath]) {
            currentDir = newPath;
          } else {
            output.innerHTML += `<div>bash: cd: ${target}: No such directory</div>`;
          }
        }
      }
    } else if (cmd === "clear") {
      output.innerHTML = "";
    } else if (cmd === "help") {
      output.innerHTML += `<div>
        Available commands:<br>
        <strong>pwd</strong> - Show current directory<br>
        <strong>ls</strong> - List directory contents<br>
        <strong>cd [dir]</strong> - Change directory<br>
        <strong>clear</strong> - Clear terminal<br>
        <strong>cat [file]</strong> - Display file contents<br>
        <strong>grep [pattern] [file]</strong> - Search for pattern in file<br>
        <strong>whoami</strong> - Display current user<br>
        <strong>date</strong> - Display system date and time<br>
        <strong>tail [file]</strong> - Display the last part of a file<br>
        <strong>help</strong> - Show this help
      </div>`;
    } else if (cmd === "cat") {
      if (args.length < 2) {
        output.innerHTML += `<div>cat: missing file operand</div>`;
      } else {
        const fileName = args[1];
        const dirPath = currentDir.split("/");
        const currentFolder = dirPath[dirPath.length - 1];
        
        if (currentFolder === "logs" && logContents[fileName]) {
          // Log içeriğini renklendirme
          const content = logContents[fileName];
          const lines = content.split("\n");
          const coloredLines = lines.map(line => {
            if (line.includes("INFO")) {
              return `<span class="log-info">${line}</span>`;
            } else if (line.includes("WARNING")) {
              return `<span class="log-warning">${line}</span>`;
            } else if (line.includes("ERROR")) {
              return `<span class="log-error">${line}</span>`;
            } else if (line.includes("CRITICAL")) {
              return `<span class="log-critical">${line}</span>`;
            } else {
              return line;
            }
          });
          output.innerHTML += `<div>${coloredLines.join("\n")}</div>`;
        } else {
          output.innerHTML += `<div>cat: ${fileName}: No such file or directory</div>`;
        }
      }
    } else if (cmd === "grep") {
      if (args.length < 3) {
        output.innerHTML += `<div>grep: missing pattern or file operand</div>`;
      } else {
        const pattern = args[1];
        const fileName = args[2];
        const dirPath = currentDir.split("/");
        const currentFolder = dirPath[dirPath.length - 1];
        
        if (currentFolder === "logs" && logContents[fileName]) {
          const content = logContents[fileName];
          const lines = content.split("\n");
          const matchedLines = lines.filter(line => line.includes(pattern));
          
          if (matchedLines.length > 0) {
            // Log içeriğini renklendirme
            const coloredLines = matchedLines.map(line => {
              if (line.includes("INFO")) {
                return `<span class="log-info">${line}</span>`;
              } else if (line.includes("WARNING")) {
                return `<span class="log-warning">${line}</span>`;
              } else if (line.includes("ERROR")) {
                return `<span class="log-error">${line}</span>`;
              } else if (line.includes("CRITICAL")) {
                return `<span class="log-critical">${line}</span>`;
              } else {
                return line;
              }
            });
            output.innerHTML += `<div>${coloredLines.join("\n")}</div>`;
          } else {
            output.innerHTML += `<div>(no matches found)</div>`;
          }
        } else {
          output.innerHTML += `<div>grep: ${fileName}: No such file or directory</div>`;
        }
      }
    } else if (cmd === "whoami") {
      output.innerHTML += `<div>dark$ession</div>`;
    } else if (cmd === "date") {
      output.innerHTML += `<div>Mon Jan 21 12:45:33 UTC 2037</div>`;
    } else if (cmd === "tail") {
      if (args.length < 2) {
        output.innerHTML += `<div>tail: missing file operand</div>`;
      } else {
        const fileName = args[1];
        const dirPath = currentDir.split("/");
        const currentFolder = dirPath[dirPath.length - 1];
        
        if (currentFolder === "logs" && logContents[fileName]) {
          const content = logContents[fileName];
          const lines = content.split("\n");
          const lastLines = lines.slice(-5); // Son 5 satır
          
          // Log içeriğini renklendirme
          const coloredLines = lastLines.map(line => {
            if (line.includes("INFO")) {
              return `<span class="log-info">${line}</span>`;
            } else if (line.includes("WARNING")) {
              return `<span class="log-warning">${line}</span>`;
            } else if (line.includes("ERROR")) {
              return `<span class="log-error">${line}</span>`;
            } else if (line.includes("CRITICAL")) {
              return `<span class="log-critical">${line}</span>`;
            } else {
              return line;
            }
          });
          
          output.innerHTML += `<div>${coloredLines.join("\n")}</div>`;
        } else {
          output.innerHTML += `<div>tail: ${fileName}: No such file or directory</div>`;
        }
      }
    } else {
      output.innerHTML += `<div>bash: ${cmd}: command not found</div>`;
    }

    e.target.value = "";
    output.scrollTop = output.scrollHeight;
  }
});
