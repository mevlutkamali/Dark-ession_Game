const terminalOutput = document.getElementById("terminal-output");
const terminalInput = document.getElementById("terminal-input");

// Sahte dosya içeriği
const filesEncoded = {
    "encoded.txt": "U2Vya2V0IG1lc3NhZ2UgaGVyZSE=" // encoded.txt dosyasının içeriği Base64 ile kodlanmış: "Secret message here!"
};

const fileSystem = {
    "/home/elliot": ["Masaüstü<br>", "İndirilenler<br>", "Belgeler<br>", "Uygulamalar"],
    "/home/elliot/.hidden": ["master.key"]
};



let currentDirectory = "/home/elliot";

const commands = {
    "cd": (args) => {

    },
    "pwd": () => currentDirectory,
    "ls": (args) => {
        if(args.includes("-la")) {
            return `
-rw-r--r--  1 user user  1024 Aug 31  log.txt<br>
-rw-r--r--  1 user user  2048 Aug 31  signals.txt<br>
-rw-r--r--  1 user user   512 Aug 31  .hidden
            `;
        }else if(args.includes("-a")) {
            return ` 
log.txt<br>" 
signals.txt<br>
.hidden
            `;
        } else {
            return "log.txt  signals.txt";
        }

    },
    // cat command with Base64 decode support.
    "cat": (args) => {
        if (!args[0]) {
            return "Dosya belirtilmedi!";
        }
        if(!filesEncoded[args[0]]) {
            return "Dosya bulunamadı!";
        }
        if(args[1] === "|" && args[2] === "base64" && args[3] === "-d") {
            return atob(filesEncoded[args[0]]);
        }

        return filesEncoded[args[0]];
    },
    "whoami": () => "elliot",
    "ifconfig": () => {
        return `
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.10  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 00:0a:95:9d:68:16  txqueuelen 1000  (Ethernet)
        
lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        `;
    },
    "clear": () => {
        terminalOutput.innerHTML = "";
        return "";
    },
    "help": () => "Kullanılabilir komutlar: pwd, ls, whoami, help"
};

function runCommand(input) {
    const parts = input.trim().split(" "); // Komut ve parametreleri ayır
    const cmd = parts[0]; // İlk kısım komut
    const args = parts.slice(1); // Kalan parametreler

    // Kullanıcının yazdığı komutu terminale yazdır
    terminalOutput.innerHTML += `
        <div><span class="terminal-prompt">user@dark$ession:~$</span> ${input}</div>
    `;
    
    if (cmd === "") return;

    // args ile komutu çalıştır
    let result = commands[cmd] ? commands[cmd](args) : `Komut bulunamadı: ${cmd}`;
    terminalOutput.innerHTML += `<div>${result}</div>`;
    
    // Terminali aşağı kaydır
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}


terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        runCommand(terminalInput.value);
        terminalInput.value = "";
    }
});