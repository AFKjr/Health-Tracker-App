// All localStorage access goes through here.
const ENTRIES_KEY = "entries";
const HEIGHT_KEY = "userHeight";

export function getEntries() {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY) || "[]");
}

export function saveEntries(entries) {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function getHeight() {
    return JSON.parse(localStorage.getItem(HEIGHT_KEY) || "null");
}

export function setHeight(height) {
    localStorage.setItem(HEIGHT_KEY, JSON.stringify(height));
}

export function clearAll() {
    localStorage.clear();
}
