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
  "/home/user": ["documents", "downloads", "music", "pictures", "videos"],
  "/home/user/documents": ["project1", "project2", "notes.txt"],
  "/home/user/downloads": ["file1.zip", "file2.exe"],
  "/home/user/music": ["song1.mp3", "song2.mp3"],
  "/home/user/pictures": ["photo1.jpg", "photo2.png"],
  "/home/user/videos": ["video1.mp4", "video2.mp4"],
  "/home/user/documents/project1": []
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
        <strong>help</strong> - Show this help
      </div>`;
    } else {
      output.innerHTML += `<div>bash: ${cmd}: command not found</div>`;
    }

    e.target.value = "";
    output.scrollTop = output.scrollHeight;
  }
});
