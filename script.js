const FEETMEASUREMENT = 12;
const IMPERIALMEASUREMENT = 703;
const TIME_BASED_EXERCISES = ["running", "outdoor-walk", "cycling"];

// The array to store exercises for the current session
const exerciseList = [];

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

// Exercise queue display
function renderExerciseQueue() {
    const queueDiv = document.getElementById("exercise-queue");
    if (exerciseList.length === 0) {
        queueDiv.innerHTML = '<p class="queue-empty">No exercises added yet.</p>';
        return;
    }
    const items = exerciseList.map(function(ex, i) {
        const detail = ex.reps ? `${ex.reps} reps` : `${ex.time} min`;
        return `<li>${ex.name}: ${detail} <button class="remove-queue-btn" onclick="removeFromQueue(${i})">✕</button></li>`;
    }).join("");
    queueDiv.innerHTML = `<ul>${items}</ul>`;
}

function removeFromQueue(index) {
    exerciseList.splice(index, 1);
    renderExerciseQueue();
}

// Set today's date
const dateEntry = document.getElementById("date-entry");
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
dateEntry.value = `${year}-${month}-${day}`;

// Pre-fill height from saved data
const savedHeight = localStorage.getItem("userHeight");
if (savedHeight) {
    const heightData = JSON.parse(savedHeight);
    document.getElementById("feet").value = heightData.feet;
    document.getElementById("inches").value = heightData.inches;
}

// Pre-fill weight and BP from the last saved entry
const savedEntries = localStorage.getItem("entries");
if (savedEntries) {
    const parsedEntries = JSON.parse(savedEntries);
    if (parsedEntries.length > 0) {
        const last = parsedEntries[parsedEntries.length - 1];
        document.getElementById("weight").value = last.weight;
        document.getElementById("blood-pressure").value = last.bloodPressure;
    }
}

const exerciseNameSelect = document.getElementById("exercise-name");
const customExerciseInput = document.getElementById("custom-exercise");

exerciseNameSelect.addEventListener("change", handleExerciseChange);

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

const addExerciseButton = document.getElementById("add-exercise-button");
addExerciseButton.addEventListener("click", addExercise);

const eraseDataButton = document.getElementById("erase-data-button");
eraseDataButton.addEventListener("click", eraseAllData);

function addExercise() {
    const exerciseRepsInput = document.getElementById("exercise-reps");
    const exerciseTimeInput = document.getElementById("exercise-time");

    let exerciseName;
    if (exerciseNameSelect.value === "other") {
        exerciseName = customExerciseInput.value;
    } else {
        exerciseName = exerciseNameSelect.value;
    }

    const repsCount = exerciseRepsInput.value;
    const timeCount = exerciseTimeInput.value;

    if (!validateExercise(exerciseNameSelect.value, customExerciseInput.value, repsCount, timeCount)) {
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

const submitButton = document.querySelector('button[type="submit"]');
submitButton.addEventListener("click", handleSubmit);

function handleSubmit() {
    const userInches = document.getElementById("inches").value;
    const userFeet = document.getElementById("feet").value;
    const userWeight = document.getElementById("weight").value;
    const userBloodPressure = document.getElementById("blood-pressure").value;

    if (!validateHeight(userFeet, userInches)) return;
    if (!validateWeight(userWeight)) return;
    if (!validateBloodPressure(userBloodPressure)) return;

    const feetInInches = FEETMEASUREMENT * Number(userFeet);
    const userTotalHeight = feetInInches + Number(userInches);
    const BMI = (Number(userWeight) / Math.pow(userTotalHeight, 2)) * IMPERIALMEASUREMENT;
    const roundedBMI = BMI.toFixed(1);

    const bmiResult = document.getElementById("bmi-result");
    const bmiDisplayDiv = document.getElementById("bmi-display");
    bmiResult.textContent = `Your BMI is ${roundedBMI}`;
    bmiDisplayDiv.style.display = "block";

    const weightResult = document.getElementById("weight-result");
    const weightDisplayDiv = document.getElementById("weight-display");
    weightResult.textContent = `Your recorded weight is ${userWeight}`;
    weightDisplayDiv.style.display = "block";

    const bpResult = document.getElementById("blood-pressure-result");
    const bloodPressureDisplayDiv = document.getElementById("blood-pressure-display");
    bpResult.textContent = `Your blood pressure is ${userBloodPressure}`;
    bloodPressureDisplayDiv.style.display = "block";

    const entryDate = document.getElementById("date-entry").value;
    saveEntry(userInches, userFeet, userWeight, userBloodPressure, roundedBMI, exerciseList, entryDate);
}

function saveEntry(inches, feet, weight, userBloodPressure, bmi, exercises, date) {
    const savedHeight = localStorage.getItem("userHeight");
    if (!savedHeight) {
        const heightData = { feet: feet, inches: inches };
        localStorage.setItem("userHeight", JSON.stringify(heightData));
    }

    const logEntry = {
        date: date,
        weight: weight,
        bloodPressure: userBloodPressure,
        bmi: bmi,
        exercises: exercises.slice()
    };

    const savedEntries = localStorage.getItem("entries");
    const entries = savedEntries ? JSON.parse(savedEntries) : [];
    entries.push(logEntry);
    localStorage.setItem("entries", JSON.stringify(entries));

    exerciseList.length = 0;
    renderExerciseQueue();

    showToast("Data saved successfully!", "success");
}

// Input Validation
function validateHeight(feet, inches) {
    if (feet === "" || inches === "") {
        showToast("Please enter your height!", "error");
        return false;
    }
    const feetNumb = Number(feet);
    const inchesNumb = Number(inches);
    if (isNaN(feetNumb) || isNaN(inchesNumb)) {
        showToast("Height must be a valid number!", "error");
        return false;
    }
    if (feetNumb < 0 || inchesNumb < 0) {
        showToast("Height must be a positive number.", "error");
        return false;
    }
    if (feetNumb > 8 || inchesNumb >= 12) {
        showToast("Please enter a realistic height.", "error");
        return false;
    }
    return true;
}

function validateWeight(weight) {
    if (weight === "") {
        showToast("Please enter your weight.", "error");
        return false;
    }
    const weightNum = Number(weight);
    if (isNaN(weightNum)) {
        showToast("Weight must be a valid number.", "error");
        return false;
    }
    if (weightNum <= 0) {
        showToast("Weight must be a positive number.", "error");
        return false;
    }
    if (weightNum < 50 || weightNum > 300) {
        showToast("Please enter a valid weight between 50 and 300 lbs.", "error");
        return false;
    }
    return true;
}

function validateBloodPressure(bp) {
    if (bp === "") {
        showToast("Please enter your blood pressure.", "error");
        return false;
    }
    const bpPattern = /^\d{2,3}\/\d{2,3}$/;
    if (!bpPattern.test(bp)) {
        showToast("Blood pressure must be in format XXX/XX (e.g., 120/80).", "error");
        return false;
    }
    const parts = bp.split("/");
    const systolic = Number(parts[0]);
    const diastolic = Number(parts[1]);
    if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
        showToast("Please enter a valid blood pressure reading.", "error");
        return false;
    }
    return true;
}

function validateExercise(exerciseName, customExerciseName, reps, time) {
    if (exerciseName === "") {
        showToast("Please select an exercise from the list.", "error");
        return false;
    }
    if (exerciseName === "other" && customExerciseName === "") {
        showToast("Please enter a custom exercise name.", "error");
        return false;
    }
    if (TIME_BASED_EXERCISES.includes(exerciseName)) {
        if (time === "") {
            showToast("Please enter time in minutes.", "error");
            return false;
        }
        const timeNum = Number(time);
        if (isNaN(timeNum)) {
            showToast("Time must be a valid number.", "error");
            return false;
        }
        if (timeNum <= 0) {
            showToast("Time must be greater than 0.", "error");
            return false;
        }
        if (timeNum > 300) {
            showToast("Please enter a reasonable time (max 300 min).", "error");
            return false;
        }
    } else {
        if (reps === "") {
            showToast("Please enter number of reps.", "error");
            return false;
        }
        const repsNum = Number(reps);
        if (isNaN(repsNum)) {
            showToast("Reps must be a valid number.", "error");
            return false;
        }
        if (repsNum <= 0) {
            showToast("Reps must be greater than 0.", "error");
            return false;
        }
        if (repsNum > 1000) {
            showToast("Please enter a reasonable number of reps (max 1000).", "error");
            return false;
        }
    }
    return true;
}


function eraseAllData() {
    const confirmed = confirm("Are you sure you want to erase ALL data? This cannot be undone!");
    if (confirmed) {
        localStorage.clear();
        location.reload();
    }
}
