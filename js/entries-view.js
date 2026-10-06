// Entry cards on the logs page: view, edit, and delete.
import { getEntries, saveEntries, getHeight } from "./storage.js";
import { calcBMI } from "./health.js";
import { validateDate, validateWeight, validateBloodPressure } from "./validation.js";
import { showToast } from "./toast.js";
import { escapeHTML } from "./html.js";

// Temporary exercise list while editing an entry
let editingExercises = [];

// Called after any change so the page can re-render charts and entries
let onEntriesChanged = function() {};

// Build the exercise list HTML for a view-mode entry
function buildExercisesHTML(exercises) {
    if (!exercises || exercises.length === 0) {
        return "<li>None</li>";
    }
    return exercises.map(function(exercise) {
        if (exercise.reps) {
            return `<li>${escapeHTML(exercise.name)}: ${escapeHTML(exercise.reps)} reps</li>`;
        } else if (exercise.time) {
            return `<li>${escapeHTML(exercise.name)}: ${escapeHTML(exercise.time)} minutes</li>`;
        }
        return "";
    }).join("");
}

// Build exercise list HTML for edit-mode (with Remove buttons)
function buildEditExercisesHTML(entryIndex) {
    if (editingExercises.length === 0) {
        return "<li>None</li>";
    }
    return editingExercises.map(function(exercise, i) {
        const detail = exercise.reps ? `${exercise.reps} reps` : `${exercise.time} minutes`;
        return `<li>${escapeHTML(exercise.name)}: ${escapeHTML(detail)} <button class="remove-exercise-btn" data-action="remove-exercise" data-index="${entryIndex}" data-exercise="${i}">Remove</button></li>`;
    }).join("");
}

// Render entries into the logs container. Each entry carries its storage index in _index.
export function renderEntries(entries) {
    const logsContainer = document.getElementById("logs-container");
    logsContainer.innerHTML = "";

    if (entries.length === 0) {
        logsContainer.innerHTML = "<p>No logs found. Start tracking health on the home page!</p>";
        return;
    }

    entries.forEach(function(entry) {
        const storageIndex = entry._index;
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("log-entry");
        entryDiv.id = "entry-" + storageIndex;

        entryDiv.innerHTML = `
            <h3>Date: ${escapeHTML(entry.date)}</h3>
            <p>Weight: ${escapeHTML(entry.weight)} lbs</p>
            <p>Blood Pressure: ${escapeHTML(entry.bloodPressure)} mmHg</p>
            <p>BMI: ${escapeHTML(entry.bmi)}</p>
            <h4>Exercises:</h4>
            <ul>${buildExercisesHTML(entry.exercises)}</ul>
            <div class="entry-buttons">
                <button data-action="edit" data-index="${storageIndex}">Edit</button>
                <button class="delete-btn" data-action="delete" data-index="${storageIndex}">Delete</button>
            </div>
        `;

        logsContainer.appendChild(entryDiv);
    });
}

// Delete an entry by index
function deleteEntry(index) {
    const confirmed = confirm("Delete this entry? This cannot be undone.");
    if (!confirmed) return;

    const entries = getEntries();
    entries.splice(index, 1);
    saveEntries(entries);
    onEntriesChanged();
    showToast("Entry deleted.", "success");
}

// Switch an entry card into edit mode
function startEdit(index) {
    const entry = getEntries()[index];

    editingExercises = entry.exercises ? entry.exercises.map(function(e) { return Object.assign({}, e); }) : [];

    const entryDiv = document.getElementById("entry-" + index);
    entryDiv.innerHTML = `
        <div class="edit-form">
            <label>Date:</label>
            <input type="date" id="edit-date-${index}" value="${escapeHTML(entry.date)}">
            <label>Weight (lbs):</label>
            <input type="number" id="edit-weight-${index}" value="${escapeHTML(entry.weight)}">
            <label>Blood Pressure:</label>
            <input type="text" id="edit-bp-${index}" value="${escapeHTML(entry.bloodPressure)}">
            <h4>Exercises:</h4>
            <ul id="edit-exercises-list-${index}">${buildEditExercisesHTML(index)}</ul>
            <div class="entry-buttons">
                <button data-action="save" data-index="${index}">Save</button>
                <button data-action="cancel">Cancel</button>
            </div>
        </div>
    `;
}

// Remove an exercise from the edit-mode list
function removeEditExercise(entryIndex, exerciseIndex) {
    editingExercises.splice(exerciseIndex, 1);
    const list = document.getElementById("edit-exercises-list-" + entryIndex);
    list.innerHTML = buildEditExercisesHTML(entryIndex);
}

// Save edits back to storage
function saveEdit(index) {
    const dateVal = document.getElementById("edit-date-" + index).value;
    const weightVal = document.getElementById("edit-weight-" + index).value;
    const bpVal = document.getElementById("edit-bp-" + index).value;

    const error = validateDate(dateVal) || validateWeight(weightVal) || validateBloodPressure(bpVal);
    if (error) {
        showToast(error, "error");
        return;
    }

    // Recalculate BMI from saved height if available
    const entries = getEntries();
    const height = getHeight();
    const bmi = height ? calcBMI(height.feet, height.inches, weightVal) : entries[index].bmi;

    entries[index] = {
        date: dateVal,
        weight: weightVal,
        bloodPressure: bpVal,
        bmi: bmi,
        exercises: editingExercises
    };

    saveEntries(entries);
    onEntriesChanged();
    showToast("Entry updated!", "success");
}

// Wire up button clicks inside the logs container
export function initEntriesView(onChange) {
    onEntriesChanged = onChange;

    document.getElementById("logs-container").addEventListener("click", function(event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const index = Number(button.dataset.index);

        switch (button.dataset.action) {
            case "edit": startEdit(index); break;
            case "delete": deleteEntry(index); break;
            case "save": saveEdit(index); break;
            case "cancel": onEntriesChanged(); break;
            case "remove-exercise": removeEditExercise(index, Number(button.dataset.exercise)); break;
        }
    });
}
