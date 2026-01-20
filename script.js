const FEETMEASUREMENT = 12;
const IMPERIALMEASUREMENT = 703;

//The array that to store exercises
const exerciseList = [];

//Code to set the time to the current date 
const dateEntry = document.getElementById("date-entry");

//Get today's date
const today = new Date();

//Format the date as YYYY-MM-DD
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const formattedDate = `${year}-${month}-${day}`;

//Set the input's value
dateEntry.value = formattedDate;

// Loading data setup
const savedHeight = localStorage.getItem("userHeight");

if (savedHeight) {
    const heightData = JSON.parse(savedHeight);
    document.getElementById("feet").value = heightData.feet;
    document.getElementById("inches").value = heightData.inches;
}

const exerciseNameSelect = document.getElementById("exercise-name");
const customExerciseInput = document.getElementById("custom-exercise");

//Handling showing and hiding custom exercise type
function handleExerciseChange() {
        if (exerciseNameSelect.value === "other") {
            customExerciseInput.style.display = "inline";
        } else {
            customExerciseInput.style.display = "none";
        }
}
exerciseNameSelect.addEventListener("change", handleExerciseChange);

//Grabbing the exercise button
const addExerciseButton = document.getElementById("add-exercise-button");

//Click Events
addExerciseButton.addEventListener("click", addExercise);

//Adding exercise and custom option to the list
function addExercise() {
    const exerciseRepsInput = document.getElementById("exercise-reps");
    /*const customExercise = docuemt.querySelector(".custom-exercise");*/

    let exerciseName;

    if (exerciseNameSelect.value === "other") {
        exerciseName = customExerciseInput.value;
    } else {
        exerciseName = exerciseNameSelect.value;
    }
    const repsCount = exerciseRepsInput.value;
    
    exerciseList.push({ name: exerciseName, reps: repsCount });
    alert("Exercise successfully added");

    //Clearing inputs for the next exercise
    exerciseNameSelect.value = "";
    customExerciseInput.value = "";
    customExerciseInput.style.display = "none";
    exerciseRepsInput.value = "";

    //TODO: Looking at what is stored until log page is created
    console.log(exerciseList);
}

const submitButton = document.querySelector('button[type="submit"]');
submitButton.addEventListener("click", handleSubmit);

function handleSubmit() {
    //we get the feet and inch values from the user in total inches
    const userInches = document.getElementById("inches").value;
    const userFeet = document.getElementById("feet").value;
    const feetInInches = FEETMEASUREMENT * Number(userFeet);
    const userWeight = document.getElementById("weight").value;
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

    const userBloodPressure = document.getElementById("blood-pressure").value;
    const bpResult = document.getElementById("blood-pressure-result");
    const bloodPressureDisplayDiv = document.getElementById("blood-pressure-display");
    bpResult.textContent = `Your blood presure is ${userBloodPressure}`;
    bloodPressureDisplayDiv.style.display = "block";

    saveEntry(userInches, userFeet, userWeight, userBloodPressure, roundedBMI, exerciseList, formattedDate);
}

//Function to save entries in localstorage
function saveEntry(inches, feet, weight, userBloodPressure, bmi, exercises, date) {
    //First check if height exists in localstorage
    const savedHeight = localStorage.getItem("userHeight");

    if (!savedHeight) {
        //Create savedheight then save it
        const heightData = {
            feet: feet,
            inches: inches,
        };
        localStorage.setItem("userHeight", JSON.stringify(heightData));
    }
    alert("Data saved successfully")

    //Logging entries
    const logEntry = {
        date: date,
        weight: weight,
        bloodPressure: userBloodPressure,
        bmi: bmi,
        exercises: exercises
    };

    //Get existing entries or create a new one
    const savedEntries = localStorage.getItem("entries");
    const entries = savedEntries ? JSON.parse(savedEntries) : [];

    // Add new entry
    entries.push(logEntry);

    // Save back to localStorage
    localStorage.setItem("entries", JSON.stringify(entries));

    console.log("Entry saved:", logEntry);

    alert("Data saved successfully");
}