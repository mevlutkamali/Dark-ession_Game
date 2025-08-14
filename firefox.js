
function openWindow(id) {
    document.getElementById(id).style.display = "block";
}

function closeWindow(id) {
    document.getElementById(id).style.display = "none";
}

document.getElementById("urlBar").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        let url = this.value;

        // Eğer URL "https" ile başlamıyorsa, "https://" ekleme.
        if (!url.startsWith("http")) {
            url = "http://" + url;
        }

        document.getElementById("browserFrame").src = url;
    }
});
