// Entry point for logs.html
import { getEntries } from "./storage.js";
import { toLocalISODate } from "./dates.js";
import { renderCharts } from "./charts.js";
import { renderEntries, initEntriesView } from "./entries-view.js";
import { exportCSV, importCSV, exportJSON, importJSON } from "./backup.js";

// Filter entries by the selected date range
function getFilteredEntries(entries) {
    const filterEl = document.getElementById("date-filter");
    if (!filterEl || filterEl.value === "all") return entries;

    const days = Number(filterEl.value);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = toLocalISODate(cutoff);

    return entries.filter(function(entry) {
        return entry.date >= cutoffStr;
    });
}

// Load entries from storage and render everything
function loadEntries() {
    const allEntries = getEntries();

    // Tag each entry with its original storage index before any filtering or reversing
    allEntries.forEach(function(entry, i) { entry._index = i; });

    // Show in date order regardless of the order entries were added (stable, so same-day entries keep entry order)
    allEntries.sort(function(a, b) {
        return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });

    const entries = getFilteredEntries(allEntries);

    renderCharts(entries);
    renderEntries(entries.slice().reverse());
}

initEntriesView(loadEntries);
document.getElementById("date-filter").addEventListener("change", loadEntries);
document.getElementById("export-csv-btn").addEventListener("click", exportCSV);
document.getElementById("export-json-btn").addEventListener("click", exportJSON);
document.getElementById("import-csv").addEventListener("change", function(event) {
    importCSV(event, loadEntries);
});
document.getElementById("import-file").addEventListener("change", function(event) {
    importJSON(event, loadEntries);
});

loadEntries();
