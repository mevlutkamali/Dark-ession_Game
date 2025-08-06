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
  
  document.getElementById("commandInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const input = e.target.value.trim();
      const output = document.getElementById("output");
  
      // Komut ve girdiyi terminale yazdır
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
  
      // Otomatik scroll en alta
      output.scrollTop = output.scrollHeight;
    }
  });
  