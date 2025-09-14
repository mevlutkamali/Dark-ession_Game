window.onload = () => {
    figlet.text("Dark$ession", {
        font: "Standard"  // istersen "Slant", "Big", "Ghost" deneyebilirsin
    }, function(err, data) {
        if (err) {
            console.log("Figlet hata verdi:", err);
            return;
        }
        terminalOutput.innerHTML += `<pre>${data}</pre>`;
    });
};
