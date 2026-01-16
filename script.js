//The array that to store exercises
const exerciseList = [];

//Code to set the time to the current date 
const dateEntry = document.getElementById("date-entry");

//Get today's date
const today = new Date();
console.log(today);
console.log(today.getDate());

//Format the date as YYYY-MM-DD
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const formattedDate = `${year}-${month}-${day}`;
console.log(formattedDate);

//Set the input's value
dateEntry.value = formattedDate;

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

    //Clearing inputs for the next exercise
    exerciseNameSelect.value = "";
    customExerciseInput.value = "";
    customExerciseInput.style.display = "none";
    exerciseRepsInput.value = "";

    //TODO: Looking at what is stored until log page is created
    console.log(exerciseList);
}
