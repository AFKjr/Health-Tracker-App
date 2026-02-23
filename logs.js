// Toast notification
function showToast(message, type) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show " + (type || "info");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
        toast.className = "toast";
    }, 2500);
}

// Stored chart instances so we can destroy them before re-creating
let weightChartInstance = null;
let bpChartInstance = null;
let bmiChartInstance = null;

// Temporary exercise list while editing an entry
let editingExercises = [];

// Create the weight chart
function createWeightChart(entries) {
    if (entries.length === 0) {
        return;
    }

    if (weightChartInstance) {
        weightChartInstance.destroy();
        weightChartInstance = null;
    }

    const dates = entries.map(function(entry) { return entry.date; });
    const weights = entries.map(function(entry) { return Number(entry.weight); });
    const canvas = document.getElementById("weight-chart");

    weightChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Weight (lbs)',
                data: weights,
                borderColor: '#000080',
                backgroundColor: 'rgba(0, 0, 128, 0.2)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

// Create the blood pressure chart
function createBPChart(entries) {
    if (entries.length === 0) {
        return;
    }

    if (bpChartInstance) {
        bpChartInstance.destroy();
        bpChartInstance = null;
    }

    const dates = entries.map(function(entry) { return entry.date; });
    const systolic = entries.map(function(entry) {
        return Number(entry.bloodPressure.split('/')[0]);
    });
    const diastolic = entries.map(function(entry) {
        return Number(entry.bloodPressure.split('/')[1]);
    });

    const canvas = document.getElementById("bp-chart");

    bpChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Systolic (mmHg)',
                    data: systolic,
                    borderColor: '#800080',
                    backgroundColor: 'rgba(128, 0, 128, 0.2)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Diastolic (mmHg)',
                    data: diastolic,
                    borderColor: '#008000',
                    backgroundColor: 'rgba(0, 128, 0, 0.2)',
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                annotation: {
                    annotations: {
                        systolicNormal: {
                            type: 'line',
                            yMin: 120, yMax: 120,
                            borderColor: '#008000',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Systolic Normal (120)', position: 'start', font: { size: 11 } }
                        },
                        systolicElevated: {
                            type: 'line',
                            yMin: 130, yMax: 130,
                            borderColor: '#cc8800',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Elevated (130)', position: 'start', font: { size: 11 } }
                        },
                        systolicHigh: {
                            type: 'line',
                            yMin: 140, yMax: 140,
                            borderColor: '#cc0000',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'High (140)', position: 'start', font: { size: 11 } }
                        },
                        diastolicNormal: {
                            type: 'line',
                            yMin: 80, yMax: 80,
                            borderColor: '#008000',
                            borderWidth: 1,
                            borderDash: [3, 5],
                            label: { display: true, content: 'Diastolic Normal (80)', position: 'end', font: { size: 11 } }
                        },
                        diastolicHigh: {
                            type: 'line',
                            yMin: 90, yMax: 90,
                            borderColor: '#cc0000',
                            borderWidth: 1,
                            borderDash: [3, 5],
                            label: { display: true, content: 'Diastolic High (90)', position: 'end', font: { size: 11 } }
                        }
                    }
                }
            },
            scales: { y: { beginAtZero: false } }
        }
    });
}

// Create the BMI chart
function createBMIChart(entries) {
    if (entries.length === 0) {
        return;
    }

    if (bmiChartInstance) {
        bmiChartInstance.destroy();
        bmiChartInstance = null;
    }

    const dates = entries.map(function(entry) { return entry.date; });
    const bmis = entries.map(function(entry) { return Number(entry.bmi); });

    const canvas = document.getElementById("bmi-chart");

    bmiChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'BMI',
                data: bmis,
                borderColor: '#000080',
                backgroundColor: 'rgba(0, 0, 128, 0.2)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                annotation: {
                    annotations: {
                        underweight: {
                            type: 'line',
                            yMin: 18.5, yMax: 18.5,
                            borderColor: '#0066cc',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Underweight (18.5)', position: 'start', font: { size: 11 } }
                        },
                        overweight: {
                            type: 'line',
                            yMin: 25, yMax: 25,
                            borderColor: '#cc8800',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Overweight (25)', position: 'start', font: { size: 11 } }
                        },
                        obese: {
                            type: 'line',
                            yMin: 30, yMax: 30,
                            borderColor: '#cc0000',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Obese (30)', position: 'start', font: { size: 11 } }
                        }
                    }
                }
            },
            scales: { y: { beginAtZero: false } }
        }
    });
}

// Build the exercise list HTML for a view-mode entry
function buildExercisesHTML(exercises) {
    if (!exercises || exercises.length === 0) {
        return "<li>None</li>";
    }
    return exercises.map(function(exercise) {
        if (exercise.reps) {
            return `<li>${exercise.name}: ${exercise.reps} reps</li>`;
        } else if (exercise.time) {
            return `<li>${exercise.name}: ${exercise.time} minutes</li>`;
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
        return `<li>${exercise.name}: ${detail} <button class="remove-exercise-btn" onclick="removeEditExercise(${entryIndex}, ${i})">Remove</button></li>`;
    }).join("");
}

// Render all entries into the logs container
function renderEntries(entries) {
    const logsContainer = document.getElementById("logs-container");
    logsContainer.innerHTML = "";

    if (entries.length === 0) {
        logsContainer.innerHTML = "<p>No logs found. Start tracking health on the home page!</p>";
        return;
    }

    entries.forEach(function(entry, index) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("log-entry");
        entryDiv.id = "entry-" + index;

        entryDiv.innerHTML = `
            <h3>Date: ${entry.date}</h3>
            <p>Weight: ${entry.weight} lbs</p>
            <p>Blood Pressure: ${entry.bloodPressure} mmHg</p>
            <p>BMI: ${entry.bmi}</p>
            <h4>Exercises:</h4>
            <ul>${buildExercisesHTML(entry.exercises)}</ul>
            <div class="entry-buttons">
                <button onclick="startEdit(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
            </div>
        `;

        logsContainer.appendChild(entryDiv);
    });
}

// Delete an entry by index
function deleteEntry(index) {
    const confirmed = confirm("Delete this entry? This cannot be undone.");
    if (!confirmed) return;

    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    entries.splice(index, 1);
    localStorage.setItem("entries", JSON.stringify(entries));
    loadEntries();
    showToast("Entry deleted.", "success");
}

// Switch an entry card into edit mode
function startEdit(index) {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const entry = entries[index];

    editingExercises = entry.exercises ? entry.exercises.map(function(e) { return Object.assign({}, e); }) : [];

    const entryDiv = document.getElementById("entry-" + index);
    entryDiv.innerHTML = `
        <div class="edit-form">
            <label>Date:</label>
            <input type="date" id="edit-date-${index}" value="${entry.date}">
            <label>Weight (lbs):</label>
            <input type="number" id="edit-weight-${index}" value="${entry.weight}">
            <label>Blood Pressure:</label>
            <input type="text" id="edit-bp-${index}" value="${entry.bloodPressure}">
            <h4>Exercises:</h4>
            <ul id="edit-exercises-list-${index}">${buildEditExercisesHTML(index)}</ul>
            <div class="entry-buttons">
                <button onclick="saveEdit(${index})">Save</button>
                <button onclick="cancelEdit()">Cancel</button>
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

// Save edits back to localStorage
function saveEdit(index) {
    const dateVal = document.getElementById("edit-date-" + index).value;
    const weightVal = document.getElementById("edit-weight-" + index).value;
    const bpVal = document.getElementById("edit-bp-" + index).value;

    if (!dateVal) {
        showToast("Please enter a date.", "error");
        return;
    }

    const weightNum = Number(weightVal);
    if (!weightVal || isNaN(weightNum) || weightNum < 50 || weightNum > 300) {
        showToast("Please enter a valid weight between 50 and 300 lbs.", "error");
        return;
    }

    const bpPattern = /^\d{2,3}\/\d{2,3}$/;
    if (!bpPattern.test(bpVal)) {
        showToast("Blood pressure must be in format XXX/XX (e.g., 120/80).", "error");
        return;
    }
    const bpParts = bpVal.split("/");
    if (Number(bpParts[0]) < 70 || Number(bpParts[0]) > 250 || Number(bpParts[1]) < 40 || Number(bpParts[1]) > 150) {
        showToast("Please enter a valid blood pressure reading.", "error");
        return;
    }

    // Recalculate BMI from saved height if available
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    let bmi = entries[index].bmi;
    const savedHeight = localStorage.getItem("userHeight");
    if (savedHeight) {
        const h = JSON.parse(savedHeight);
        const totalInches = (Number(h.feet) * 12) + Number(h.inches);
        bmi = ((weightNum / Math.pow(totalInches, 2)) * 703).toFixed(1);
    }

    entries[index] = {
        date: dateVal,
        weight: weightVal,
        bloodPressure: bpVal,
        bmi: bmi,
        exercises: editingExercises
    };

    localStorage.setItem("entries", JSON.stringify(entries));
    loadEntries();
    showToast("Entry updated!", "success");
}

// Cancel edit and re-render
function cancelEdit() {
    loadEntries();
}

// Load entries from localStorage and render everything
function loadEntries() {
    const savedEntries = localStorage.getItem("entries");
    const entries = savedEntries ? JSON.parse(savedEntries) : [];

    createWeightChart(entries);
    createBPChart(entries);
    createBMIChart(entries);
    renderEntries(entries);
}

loadEntries();
