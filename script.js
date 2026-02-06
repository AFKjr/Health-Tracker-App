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
    // Get the values first from the html
    const userInches = document.getElementById("inches").value;
    const userFeet = document.getElementById("feet").value;
    const userWeight = document.getElementById("weight").value;
    const userBloodPressure = document.getElementById("blood-pressure").value;
    
    // Validate BEFORE doing anything else
    if (!validateHeight(userFeet, userInches)) {
        return; // Stop if validation fails
    }
    
    if (!validateWeight(userWeight)) {
        return; // Stop if validation fails
    }
    
    // NOW we do the calculations
    const feetInInches = FEETMEASUREMENT * Number(userFeet);
    const userTotalHeight = feetInInches + Number(userInches);
    const BMI = (Number(userWeight) / Math.pow(userTotalHeight, 2)) * IMPERIALMEASUREMENT;
    const roundedBMI = BMI.toFixed(1);
    
    // Display BMI
    const bmiResult = document.getElementById("bmi-result");
    const bmiDisplayDiv = document.getElementById("bmi-display");
    bmiResult.textContent = `Your BMI is ${roundedBMI}`;
    bmiDisplayDiv.style.display = "block";
    
    // Display weight
    const weightResult = document.getElementById("weight-result");
    const weightDisplayDiv = document.getElementById("weight-display");
    weightResult.textContent = `Your recorded weight is ${userWeight}`;
    weightDisplayDiv.style.display = "block";
    
    // Display blood pressure
    const bpResult = document.getElementById("blood-pressure-result");
    const bloodPressureDisplayDiv = document.getElementById("blood-pressure-display");
    bpResult.textContent = `Your blood pressure is ${userBloodPressure}`;
    bloodPressureDisplayDiv.style.display = "block";
    
    // Save entry
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

// Input Validation And Sanitization
function validateHeight(feet, inches) {
    // Check if empty
    if (feet === "" || inches === "") {
        alert("Please enter your height!");
        return false;
    }

    // Number Conversion
    const feetNumb = Number(feet);
    const inchesNumb = Number(inches);

    // Check if valid numbers
    if (isNaN(feetNumb) || isNaN(inchesNumb)) {
        alert("Must enter a valid number!");
        return false;
    }

    // The numbers must be positive
    if (feetNumb < 0 || inchesNumb < 0) {
        alert("Height must be a positive number");
        return false;
    }

    // Checking for resonable ranges
    if (feetNumb > 8 || inchesNumb >= 12){
        alert("Your numbers make no sense!");
        return false;
    }
    return true;
}

// Input validation for weight
function validateWeight(weight) {
    // First, check if empty
    if (weight === "") {
        alert("Weight must not be empty");
        return false;
    }

    // Convert the value to a number(default is string)
    const weightNum = Number(weight);

    // Check if weight is a valid number up to 300
    if (isNaN(weightNum)) {
        alert("Weight must be between 0 and 300");
        return false;
    }

    // Check if the value is positive
    if (weightNum <= 0) {
        alert("Weight must be positive number");
        return false;
    }

    // Check for reasonable weight ranges (50 - 300)
    if (weightNum < 50 || weightNum > 300) {
        alert("Please enter a valid weight between 50 and 300");
        return false;
    }
    return true;
}