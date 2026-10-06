import { TIME_BASED_EXERCISES } from "./health.js";

// Each validator returns an error message, or null when the input is valid.

export function validateDate(date) {
    if (!date) return "Please enter a date.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
        return "Date must be in format YYYY-MM-DD.";
    }
    return null;
}

export function validateHeight(feet, inches) {
    if (feet === "" || inches === "") return "Please enter your height!";
    const feetNumb = Number(feet);
    const inchesNumb = Number(inches);
    if (isNaN(feetNumb) || isNaN(inchesNumb)) return "Height must be a valid number!";
    if (feetNumb < 0 || inchesNumb < 0) return "Height must be a positive number.";
    if (feetNumb > 8 || inchesNumb >= 12) return "Please enter a realistic height.";
    return null;
}

export function validateWeight(weight) {
    if (weight === "") return "Please enter your weight.";
    const weightNum = Number(weight);
    if (isNaN(weightNum)) return "Weight must be a valid number.";
    if (weightNum <= 0) return "Weight must be a positive number.";
    if (weightNum < 50 || weightNum > 300) return "Please enter a valid weight between 50 and 300 lbs.";
    return null;
}

export function validateBloodPressure(bp) {
    if (bp === "") return "Please enter your blood pressure.";
    if (!/^\d{2,3}\/\d{2,3}$/.test(bp)) return "Blood pressure must be in format XXX/XX (e.g., 120/80).";
    const parts = bp.split("/");
    const systolic = Number(parts[0]);
    const diastolic = Number(parts[1]);
    if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
        return "Please enter a valid blood pressure reading.";
    }
    return null;
}

// Validates a reps or time amount; isTime selects which limits/messages apply
export function validateExerciseAmount(isTime, reps, time) {
    if (isTime) {
        if (time === "") return "Please enter time in minutes.";
        const timeNum = Number(time);
        if (isNaN(timeNum)) return "Time must be a valid number.";
        if (timeNum <= 0) return "Time must be greater than 0.";
        if (timeNum > 300) return "Please enter a reasonable time (max 300 min).";
    } else {
        if (reps === "") return "Please enter number of reps.";
        const repsNum = Number(reps);
        if (isNaN(repsNum)) return "Reps must be a valid number.";
        if (repsNum <= 0) return "Reps must be greater than 0.";
        if (repsNum > 1000) return "Please enter a reasonable number of reps (max 1000).";
    }
    return null;
}

export function validateExercise(exerciseName, customExerciseName, reps, time) {
    if (exerciseName === "") return "Please select an exercise from the list.";
    if (exerciseName === "other" && customExerciseName === "") return "Please enter a custom exercise name.";
    return validateExerciseAmount(TIME_BASED_EXERCISES.includes(exerciseName), reps, time);
}
