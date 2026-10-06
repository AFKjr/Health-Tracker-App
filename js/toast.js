// Toast notification
export function showToast(message, type) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show " + (type || "info");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
        toast.className = "toast";
    }, 2500);
}
