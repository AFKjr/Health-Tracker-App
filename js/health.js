const INCHES_PER_FOOT = 12;
const IMPERIAL_BMI_FACTOR = 703;

export const TIME_BASED_EXERCISES = ["running", "outdoor-walk", "cycling"];

// BMI from height in feet/inches and weight in lbs, rounded to one decimal (string)
export function calcBMI(feet, inches, weight) {
    const totalInches = (INCHES_PER_FOOT * Number(feet)) + Number(inches);
    return ((Number(weight) / Math.pow(totalInches, 2)) * IMPERIAL_BMI_FACTOR).toFixed(1);
}

// "name: 50 reps" or "name: 30 min"
export function formatExercise(exercise) {
    return exercise.reps ? `${exercise.name}: ${exercise.reps} reps` : `${exercise.name}: ${exercise.time} min`;
}
