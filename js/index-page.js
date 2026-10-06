// Entry point for index.html
import { getEntries, saveEntries, getHeight, setHeight, clearAll } from "./storage.js";
import { calcBMI } from "./health.js";
import { toLocalISODate } from "./dates.js";
import { validateHeight, validateWeight, validateBloodPressure } from "./validation.js";
import { initExerciseQueue, getQueuedExercises, clearQueue } from "./exercise-queue.js";
import { showToast } from "./toast.js";

// Set today's date
document.getElementById("date-entry").value = toLocalISODate(new Date());

// Pre-fill height from saved data
const savedHeight = getHeight();
if (savedHeight) {
    document.getElementById("feet").value = savedHeight.feet;
    document.getElementById("inches").value = savedHeight.inches;
}

// Pre-fill weight and BP from the last saved entry
const savedEntries = getEntries();
if (savedEntries.length > 0) {
    const last = savedEntries[savedEntries.length - 1];
    document.getElementById("weight").value = last.weight;
    document.getElementById("blood-pressure").value = last.bloodPressure;
}

function showResult(displayId, resultId, text) {
    document.getElementById(resultId).textContent = text;
    document.getElementById(displayId).style.display = "block";
}

function handleSubmit() {
    const userInches = document.getElementById("inches").value;
    const userFeet = document.getElementById("feet").value;
    const userWeight = document.getElementById("weight").value;
    const userBloodPressure = document.getElementById("blood-pressure").value;

    const error = validateHeight(userFeet, userInches) || validateWeight(userWeight) || validateBloodPressure(userBloodPressure);
    if (error) {
        showToast(error, "error");
        return;
    }

    const roundedBMI = calcBMI(userFeet, userInches, userWeight);

    showResult("bmi-display", "bmi-result", `Your BMI is ${roundedBMI}`);
    showResult("weight-display", "weight-result", `Your recorded weight is ${userWeight}`);
    showResult("blood-pressure-display", "blood-pressure-result", `Your blood pressure is ${userBloodPressure}`);

    const entryDate = document.getElementById("date-entry").value;
    saveEntry(userInches, userFeet, userWeight, userBloodPressure, roundedBMI, getQueuedExercises(), entryDate);
}

function saveEntry(inches, feet, weight, userBloodPressure, bmi, exercises, date) {
    // Always store the submitted height so a corrected height is used from now on
    setHeight({ feet: feet, inches: inches });

    const entries = getEntries();
    entries.push({
        date: date,
        weight: weight,
        bloodPressure: userBloodPressure,
        bmi: bmi,
        exercises: exercises
    });
    saveEntries(entries);

    clearQueue();
    showToast("Data saved successfully!", "success");
}

function eraseAllData() {
    const confirmed = confirm("Are you sure you want to erase ALL data? This cannot be undone!");
    if (confirmed) {
        clearAll();
        location.reload();
    }
}

initExerciseQueue();
document.querySelector('button[type="submit"]').addEventListener("click", handleSubmit);
document.getElementById("erase-data-button").addEventListener("click", eraseAllData);
