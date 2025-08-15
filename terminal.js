
// -------------------
// Terminal input ve output alanlarını seçiyoruz
// -------------------
const commandInput = document.getElementById('commandInput');
const output = document.getElementById('output');

// -------------------
// Dosya sistemi ve mevcut dizin simülasyonu
// -------------------
let fileSystem = {
    '/': ['Bilgisayar', 'Çöp Kutusu', 'settings.conf', 'notlar.txt', 'Firefox']
};
let currentPath = '/';

// -------------------
// Input alanında Enter tuşuna basıldığında komutu çalıştır
// -------------------
commandInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = commandInput.value.trim(); // Kullanıcının yazdığı komutu al
        handleCommand(command); // Komutu işleyen fonksiyona gönder
        commandInput.value = ''; // Input'u temizle
    }
});

// -------------------
// Terminale çıktı yazdıran fonksiyon
// -------------------
function printOutput(text) {
    output.innerHTML += `<br>${text}`;       // Yeni satır ile birlikte terminale yaz
    output.scrollTop = output.scrollHeight;   // Scroll otomatik olarak en aşağı kaydır
}

// -------------------
// Kullanıcı komutlarını işleyen fonksiyon
// -------------------
function handleCommand(command) {
    const cmd = command.toLowerCase(); // Komutu küçük harfe çevir

    switch(cmd) {
        case 'help':
            // Mevcut komutları göster
            printOutput('Mevcut komutlar:' +
                '</br> - help' +
                '</br> - echo' +
                '</br> - date' +
                '</br> - clear' +
                '</br> - exit' +
                '</br> - ls' +
                '</br> - pwd' +
                '</br> - cd' +
                '</br> - mkdir' +
                '</br> - rmdir' +
                '</br> - rm' +
                '</br> - touch' +
                '</br> - nano' +
                '</br> - cp' +
                '</br> - mv' +
                '</br> - grep' +
                '</br> - head' +
                '</br> - tail' +
                '</br> - whoami' +
                '</br> - uname -a' +
                '</br> - df -h' +
                '</br> - free -h');
            break;

        case 'date':
            printOutput(new Date().toLocaleString());
            break;

        case 'whoami':
            printOutput('user');
            break;

        case 'uname -a':
            printOutput('Linux DarkSessionOS #1 SMP x86_64');
            break;

        case 'df -h':
           printOutput(
                '/Filesystem      Size  Used Avail Use% Mounted on' +
                '</br>/dev/sda1        50G   19G   29G  40% /' +
                '</br>/tmpfs           1.9G  1.1M  1.9G   1% /dev/shm' +
                '</br>/tmpfs           1.9G  1.9M  1.9G   1% /run' +
                '</br>/dev/sda2       200G   85G  105G  45% /home'
            );
            break;

        case 'free -h':
            printOutput(
                '             total   used   free   available' +
                '</br>Mem:       8G     3G     5G       6G' +
                '</br>Swap:      2G     0G     2G'
            );
            break;

        case 'ls':
            ls();
            break;

        case 'pwd':
            pwd();
            break;

        case 'cd':
            printOutput('Klasör adı girerek cd kullanın: cd klasör_adi');
            break;

        case 'mkdir':
            printOutput('Klasör oluşturuldu (simülasyon)');
            break;

        case 'rmdir':
            printOutput('Klasör silindi (simülasyon)');
            break;

        case 'rm':
            printOutput('Dosya silindi (simülasyon)');
            break;

        case 'touch':
            printOutput('Dosya oluşturuldu (simülasyon)');
            break;

        case 'exit':
            printOutput('Oturum sonlandırıldı.');
            break;

        case 'clear':
            output.innerHTML = '<br>user@linux:~$';
            break;

        default:
            if(cmd.startsWith('echo ')) {
                // echo komutu
                printOutput(command.substring(5));
            } else if(cmd.startsWith('uname')) {
                printOutput('Linux DarkSessionOS #1 SMP x86_64');
            } else {
                printOutput(`Komut bulunamadı: ${command}`);
            }
            break;
    }
}

// -------------------
// Komut simülasyon fonksiyonları
// -------------------
function ls() {
    printOutput(fileSystem[currentPath].join('  '));
}

function pwd() {
    printOutput(currentPath);
}

function cd(folder) {
    if (fileSystem[currentPath].includes(folder)) {
        currentPath = currentPath + '/' + folder;
        printOutput(`Dizin değiştirildi: ${currentPath}`);
    } else {
        printOutput('Dizin bulunamadı.');
    }
}
