// Exercise queue on the entry page: exercises added before the entry is submitted.
import { TIME_BASED_EXERCISES } from "./health.js";
import { validateExercise } from "./validation.js";
import { showToast } from "./toast.js";

// The array to store exercises for the current session
const exerciseList = [];

const exerciseNameSelect = document.getElementById("exercise-name");
const customExerciseInput = document.getElementById("custom-exercise");

// Snapshot of the queued exercises
export function getQueuedExercises() {
    return exerciseList.slice();
}

export function clearQueue() {
    exerciseList.length = 0;
    renderExerciseQueue();
}

function renderExerciseQueue() {
    const queueDiv = document.getElementById("exercise-queue");
    if (exerciseList.length === 0) {
        queueDiv.innerHTML = '<p class="queue-empty">No exercises added yet.</p>';
        return;
    }
    const items = exerciseList.map(function(ex, i) {
        const detail = ex.reps ? `${ex.reps} reps` : `${ex.time} min`;
        return `<li>${ex.name}: ${detail} <button class="remove-queue-btn" data-action="remove-queue" data-index="${i}">✕</button></li>`;
    }).join("");
    queueDiv.innerHTML = `<ul>${items}</ul>`;
}

function removeFromQueue(index) {
    exerciseList.splice(index, 1);
    renderExerciseQueue();
}

function handleExerciseChange() {
    const exerciseName = exerciseNameSelect.value;
    const repsInput = document.getElementById("exercise-reps");
    const timeInput = document.getElementById("exercise-time");

    customExerciseInput.style.display = exerciseName === "other" ? "inline" : "none";

    if (TIME_BASED_EXERCISES.includes(exerciseName)) {
        repsInput.style.display = "none";
        timeInput.style.display = "inline";
    } else {
        repsInput.style.display = "inline";
        timeInput.style.display = "none";
    }
}

function addExercise() {
    const exerciseRepsInput = document.getElementById("exercise-reps");
    const exerciseTimeInput = document.getElementById("exercise-time");

    const exerciseName = exerciseNameSelect.value === "other" ? customExerciseInput.value : exerciseNameSelect.value;
    const repsCount = exerciseRepsInput.value;
    const timeCount = exerciseTimeInput.value;

    const error = validateExercise(exerciseNameSelect.value, customExerciseInput.value, repsCount, timeCount);
    if (error) {
        showToast(error, "error");
        return;
    }

    if (TIME_BASED_EXERCISES.includes(exerciseNameSelect.value)) {
        exerciseList.push({ name: exerciseName, time: timeCount });
    } else {
        exerciseList.push({ name: exerciseName, reps: repsCount });
    }

    renderExerciseQueue();
    showToast("Exercise added!", "success");

    exerciseNameSelect.value = "";
    customExerciseInput.value = "";
    customExerciseInput.style.display = "none";
    exerciseRepsInput.value = "";
    exerciseTimeInput.value = "";
}

export function initExerciseQueue() {
    exerciseNameSelect.addEventListener("change", handleExerciseChange);
    document.getElementById("add-exercise-button").addEventListener("click", addExercise);
    document.getElementById("exercise-queue").addEventListener("click", function(event) {
        const button = event.target.closest('button[data-action="remove-queue"]');
        if (button) removeFromQueue(Number(button.dataset.index));
    });
}
