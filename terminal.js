const terminalOutput = document.getElementById("terminal-output");
const terminalInput = document.getElementById("terminal-input");

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
    "df": () => {
        return ` 
Filesystem      1K-blocks     Used Available Use% Mounted on
/dev/sda1        51200000  10240000  40960000  20% /
/dev/sda2        25600000   6400000  19200000  25% /home
/dev/sdb1       102400000  20480000  81920000  20% /mnt/data
tmpfs             2048000        64   2047936   1% /dev/shm
tmpfs             1024000       512   1023488   1% /run
tmpfs              512000         0    512000   0% /tmp
        `;
    },
        "top": () => {
        return ` 
top - 14:10:05 up 3 days,  4:12,  3 users,  load average: 0.42, 0.35, 0.29
Tasks: 142 total,   1 running, 141 sleeping,   0 stopped,   0 zombie
%Cpu(s):  6.2 us,  2.1 sy,  0.0 ni, 90.8 id,  0.5 wa,  0.0 hi,  0.4 si,  0.0 st
MiB Mem :  64342.0 total,  12532.4 free,  28940.8 used,  22868.8 buff/cache
MiB Swap:  8192.0 total,   8192.0 free,     0.0 used.  31820.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 1324 root      20   0  125.4m  12.3m   6.1m S   7.8  0.2   1:12.45 sshd
 2401 player    20   0 1024.0m 150.2m  24.1m S   5.3  0.2   0:45.12 darksession
 3010 www-data  20   0  256.1m  34.6m   8.9m S   2.9  0.1   0:15.02 nginx
 4122 mecha     20   0  512.0m  45.0m  12.0m S   1.8  0.1   0:08.33 game-ai
 4980 nobody    20   0   33.2m   4.1m   3.0m S   0.7  0.0   0:00.73 cron
 6205 root      20   0   12.0m   2.5m   1.2m S   0.3  0.0   0:00.10 systemd
 7890 player    20   0  768.0m 200.1m  10.0m S   0.1  0.3   3:22.90 renderer

        `;
    },
    "vmstat": () => {
        return ` 
procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu
 1  0      0 812340  45200 389120    0    0   120    45  310  580  2  3 94  1  0  0
 2  0      0 798512  47360 392800    0    0   240    60  320  600  3  4 92  1  0  0
 1  0      0 805220  46500 391000    0    0   180    55  315  590  2  3 94  1  0  0
 0  0      0 799876  47020 393500    0    0   200    52  325  610  3  4 92  1  0  0
        `;
    },
    "netstat": (args) => {
    args = args || [];

    // Hiç parametre verilmemişse kısa kullanım mesajı
    if (args.length === 0) {
        return "Kullanım: netstat [--ant] | [-r|--route]\nTry 'netstat --ant' for game-style overview.";
    }

    // --ant : özel oyun görünümü (Active Network Table)
    if (args.includes("--ant")) {
        const ts = new Date().toLocaleString();
        return `
netstat --ant
Active Network Table (ANT) - Dark$ession Network Monitor
Timestamp: ${ts}

--- Active Sockets ---
Proto Recv-Q Send-Q Local Address        Foreign Address      State       PID/Program
tcp        0      0 0.0.0.0:22           0.0.0.0:*            LISTEN      1324/sshd
tcp        0      0 127.0.0.1:8080       0.0.0.0:*            LISTEN      3010/nginx
tcp       12      0 10.0.0.10:44567      93.184.216.34:443    ESTABLISHED 2401/darksession
udp        0      0 0.0.0.0:5353         0.0.0.0:*            -           4980/avahi
unix       0      0 @/tmp/.X11-unix/X0   @/tmp/.X11-unix/X0    ESTABLISHED 7890/renderer

--- NAT Table (simulated) ---
# Src IP        Dst IP         Proto  InIf   OutIf  Action
10.0.0.10       93.184.216.34  tcp    eth0   eth1   SNAT:203.0.113.10:34567
192.168.50.12   10.8.0.23      udp    wlan0  tun0   DNAT:10.8.0.23:1194

--- Firewall Summary ---
Chain: FORWARD (policy ACCEPT)
 pkts      bytes target     prot opt in     out     source               destination
   1024   128K   ACCEPT     all  --  eth0   eth1    10.0.0.0/8           0.0.0.0/0
     12    1.5K DROP       tcp  --  *      *       198.51.100.50        0.0.0.0/0

--- Routing Hint (short) ---
Destination     Gateway         Genmask         Iface
default         203.0.113.1     0.0.0.0         eth1
10.0.0.0        0.0.0.0         255.0.0.0       eth0

--- Notes ---
ANT = Active Network Table (oyun içi özel görünüm). Bu çıktı tamamen uydurma ve demo amaçlıdır.
        `;
    }

    // -r veya --route : klasik rota tablosu
    if (args.includes("-r") || args.includes("--route")) {
        return ` 
+----------------+-------------+----------------+-------+-----+--------+------+-------+
| Destination    | Gateway     | Genmask        | Flags | MSS | Window | irtt | Iface |
+----------------+-------------+----------------+-------+-----+--------+------+-------+
| default        | 10.0.2.2    | 0.0.0.0        | UG    | 0   | 0      | 0    | eth0  |
| 10.0.2.0       | 0.0.0.0     | 255.255.255.0  | U     | 0   | 0      | 0    | eth0  |
| 192.168.1.0    | 192.168.1.1 | 255.255.255.0  | UG    | 0   | 0      | 0    | wlan0 |
| 172.16.0.0     | 0.0.0.0     | 255.240.0.0    | U     | 0   | 0      | 0    | eth1  |
| 192.168.100.0  | 192.168.50.1| 255.255.255.0  | UG    | 0   | 0      | 0    | eth2  |
| 10.10.10.0     | 0.0.0.0     | 255.255.255.0  | U     | 0   | 0      | 0    | tun0  |
+----------------+-------------+----------------+-------+-----+--------+------+-------+

        `;
    }

         // Bilinmeyen opsiyon -> netstat benzeri hata mesajı göster
         return `
netstat: unrecognized option '${args.join(" ")}'
usage: netstat [-vWeenNcCF] [<Af>] -r         netstat {-V|--version|-h|--help}
netstat [-vWnNcaeol] [<Socket> ...]
        `;
    },
    
    // theharvester
    "theharvester": (args = []) => {
        if (args.includes("-h") || args.includes("--help")) {
            return `
┏━(Message from Linux Dark$ession developers)
┃
┃ The command theharvester is deprecated. Please use theHarvester instead.
┃
┗━   

Read proxies.yaml from /etc/theHarvester/proxies.yaml
*******************************************************************
*  _   _                                            _             *
* | |_| |__   ___    /\\  /\\__ _ _ ____   _____  ___| |_ ___ _ __  *
* | __|  _ \\ / _ \\  / /_/ / _\` | '__\\ \\ / / _ \\/ __| __/ _ \\ '__| *
* | |_| | | |  __/ / __  / (_| | |   \\ V /  __/\\__ \\ ||  __/ |    *
*  \\__|_| |_|\\___| \\/ /_/ \\__,_|_|    \\_/ \\___||___/\\__\\___|_|    *
*                                                                 *
* theHarvester 4.8.2                                              *
* Coded by Christian Martorella                                   *
* Edge-Security Research                                          *
* cmartorella@edge-security.com                                   *
*                                                                 *
*******************************************************************

usage: theHarvester [-h] -d DOMAIN [-l LIMIT] [-S START] [-b SOURCE]

Options:
  -d <domain>        Target domain
  -b <source>        Data source (google, bing, linkedin, shodan, etc.)
  -l <limit>         Maximum results to fetch
  -f <file>          Output file
  -h, --help         Show this help message
  -v                 Enable verbose mode

Examples:
  theHarvester -d example.com -b google
  theHarvester -d example.com -b linkedin -l 50
  theHarvester -d example.com -b shodan -f results.html

Notes:
- This is a deprecated command in Kali Linux.
- Please switch to theHarvester for updated features.
            `;
        } else if (args.includes("-d") && args.includes("-l") && args.includes("-b")) {
            let domainIndex = args.indexOf("-d") + 1;
            let limitIndex = args.indexOf("-l") + 1;
            let sourceIndex = args.indexOf("-b") + 1;

            let domain = args[domainIndex] || "undefined";
            let limit = parseInt(args[limitIndex]) || 0;
            let source = args[sourceIndex] || "undefined";

            if (limit < 0 || limit > 1000) {
                return "Hata: Limit 0 ile 1000 arasında olmalıdır!";
            }

                return `
Searching ${limit} results for ${domain} using ${source}... [Simulated]

[+] Found 15 subdomains:
  - www.${domain}
  - mail.${domain}
  - blog.${domain}
  - dev.${domain}
  - shop.${domain}

[+] Emails discovered:
  - admin@${domain}
  - info@${domain}
  - support@${domain}

[+] Hosts/IPs:
  - 192.168.10.12
  - 192.168.10.15

[+] Open ports (simulated):
  - 80/tcp
  - 443/tcp
  - 22/tcp

[!] Scan complete. This is a **simulated output** for Dark$ession training game.
            `;

        } else {
            return "Kullanım:\n theharvester -h | --help\n Geçerli format: -d DOMAIN -l LIMIT -b SOURCE";
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
    "ipconfig": ()=> {
        return `
Ethernet adapter eth0:
   IPv4 Address. . . . . . . . . . . : 192.168.1.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1

Ethernet adapter lo:
   IPv4 Address. . . . . . . . . . . : 127.0.0.1
   Subnet Mask . . . . . . . . . . . : 255.0.0.0
        `;
    },
    "netdiscover": () => {
        return`
Currently scanning: 192.168.1.0/24   |   Screen View: Unique Hosts
                                                                     
7 Captured ARP Req/Rep packets, from 7 hosts.   Total size: 420
___________________________________________________________________________
 IP            At MAC Address      Count     Len  MAC Vendor / Hostname      
-----------------------------------------------------------------------------
192.168.1.1    52:54:00:12:35:02      1      60   QEMU Virtual NIC
192.168.1.5    08:00:27:aa:bb:cc      2      60   Oracle VirtualBox
192.168.1.10   00:0a:95:9d:68:16      4      60   PCS Systemtechnik GmbH
192.168.1.15   08:00:27:d1:f8:5d      1      60   Oracle VirtualBox
192.168.1.20   00:16:3e:44:55:66      3      60   Xen Project
192.168.1.25   b8:27:eb:12:34:56      5      60   Raspberry Pi Foundation
192.168.1.30   3c:07:54:89:ab:cd      1      60   Intel Corporate        
         `;
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
    "help": () => "Kullanılabilir komutlar: pwd, ls, whoami, help",
    "figlet": (args) => {
        if (!args[0]) return "Kullanım: figlet <metin>";
        let text = args.join(" "); // Girilen tüm parametreleri birleştir
        return `
 ____             _     _                 _             
|  _ \\  __ _ _ __| | __| |  ___  ___  ___(_) ___  _ __  
| | | |/ _\` | '__| |/ / __)/ _ \\/ _ \\/ __| |/ _ \\| '_ \\ 
| |_| | (_| | |  |   <\\__ \\  __/  __/\\__ \\ | (_) | | | |
|____/ \\__,_|_|  |_|\\_(   /\\___|\\___||___/_|\\___/|_| |_|
                       |_|                              
            ${text}
        `;
    }
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

