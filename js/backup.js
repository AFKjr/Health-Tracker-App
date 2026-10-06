// CSV export/import and JSON backup/restore. Imports replace all existing data.
import { getEntries, saveEntries, getHeight, setHeight } from "./storage.js";
import { entriesToCSV, csvToEntries } from "./csv.js";
import { downloadFile } from "./download.js";
import { showToast } from "./toast.js";

// Read the file chosen in a file input, then reset the input so the same file can be picked again
function readSelectedFile(event, onText) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        onText(e.target.result);
    };
    reader.readAsText(file);
    event.target.value = "";
}

export function exportCSV() {
    const entries = getEntries();
    if (entries.length === 0) {
        showToast("No entries to export.", "error");
        return;
    }
    downloadFile(entriesToCSV(entries), "health-tracker-export.csv", "text/csv");
    showToast("CSV exported!", "success");
}

export function importCSV(event, onImported) {
    readSelectedFile(event, function(text) {
        const result = csvToEntries(text, getHeight());
        if (result.error) {
            showToast(result.error, "error");
            return;
        }
        const confirmed = confirm(`Import ${result.entries.length} entries? This will replace your current data.`);
        if (!confirmed) return;

        saveEntries(result.entries);
        onImported();
        showToast("CSV imported successfully!", "success");
    });
}

// Export full stored data as a JSON backup file
export function exportJSON() {
    const data = { entries: getEntries(), userHeight: getHeight() };
    if (data.entries.length === 0) {
        showToast("No data to back up.", "error");
        return;
    }
    downloadFile(JSON.stringify(data, null, 2), "health-tracker-backup.json", "application/json");
    showToast("Backup exported!", "success");
}

// Import a JSON backup file and restore data
export function importJSON(event, onImported) {
    readSelectedFile(event, function(text) {
        try {
            const data = JSON.parse(text);
            if (!data.entries || !Array.isArray(data.entries)) {
                showToast("Invalid backup file.", "error");
                return;
            }
            const confirmed = confirm(`Import ${data.entries.length} entries? This will replace your current data.`);
            if (!confirmed) return;

            saveEntries(data.entries);
            if (data.userHeight) {
                setHeight(data.userHeight);
            }
            onImported();
            showToast("Data restored successfully!", "success");
        } catch (err) {
            showToast("Failed to read backup file.", "error");
        }
    });
}
