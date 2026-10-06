// CSV conversion for health entries. No DOM access, so this can run in Node.
import { calcBMI, formatExercise } from "./health.js";
import { validateDate, validateWeight, validateBloodPressure, validateExerciseAmount } from "./validation.js";

const HEADERS = ["Date", "Weight (lbs)", "BMI", "Systolic (mmHg)", "Diastolic (mmHg)", "Exercises"];
const EXERCISE_PATTERN = /^(.*): (\d+(?:\.\d+)?) (reps|min|minutes)$/;

// Quote a field when it contains a comma, quote, or newline (RFC 4180)
function escapeField(value) {
    const text = value === undefined || value === null ? "" : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Exercises are joined with "; ", so escape "\" and ";" inside names
function escapeExerciseName(exercise) {
    return Object.assign({}, exercise, { name: exercise.name.replace(/[\\;]/g, "\\$&") });
}

export function entriesToCSV(entries) {
    const rows = entries.map(function(entry) {
        const bpParts = entry.bloodPressure.split("/");
        const exercises = (entry.exercises || []).map(escapeExerciseName).map(formatExercise).join("; ");
        return [entry.date, entry.weight, entry.bmi, bpParts[0], bpParts[1], exercises].map(escapeField).join(",");
    });
    return [HEADERS.join(",")].concat(rows).join("\n");
}

// Split CSV text into an array of records (arrays of field strings)
function parseCSV(text) {
    const records = [];
    let record = [];
    let field = "";
    let inQuotes = false;
    let i = text.charCodeAt(0) === 0xFEFF ? 1 : 0;

    for (; i < text.length; i++) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += ch;
            }
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === ",") {
            record.push(field);
            field = "";
        } else if (ch === "\n" || ch === "\r") {
            if (ch === "\r" && text[i + 1] === "\n") i++;
            record.push(field);
            records.push(record);
            record = [];
            field = "";
        } else {
            field += ch;
        }
    }
    if (field !== "" || record.length > 0) {
        record.push(field);
        records.push(record);
    }
    return records;
}

// "Weight (lbs)" -> "weight"
function normalizeHeader(header) {
    return header.replace(/\(.*?\)/g, "").trim().toLowerCase();
}

// Split on ";" not preceded by "\", unescaping "\;" and "\\".
// Any other backslash is kept as-is so older exports still read the same.
function splitExercises(text) {
    const items = [];
    let current = "";
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === "\\" && (text[i + 1] === ";" || text[i + 1] === "\\")) {
            current += text[i + 1];
            i++;
        } else if (ch === ";") {
            items.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    items.push(current);
    return items;
}

function parseExercises(text) {
    const exercises = [];
    const items = splitExercises(text).map(function(item) { return item.trim(); }).filter(Boolean);
    for (const item of items) {
        const match = EXERCISE_PATTERN.exec(item);
        if (!match || match[1].trim() === "") {
            return { error: `Could not read exercise "${item}".` };
        }
        const isTime = match[3] !== "reps";
        const amountError = validateExerciseAmount(isTime, isTime ? "" : match[2], isTime ? match[2] : "");
        if (amountError) return { error: amountError };
        exercises.push(isTime ? { name: match[1].trim(), time: match[2] } : { name: match[1].trim(), reps: match[2] });
    }
    return { exercises: exercises };
}

// Parse CSV text into entries. Returns { entries } or { error }.
// height ({feet, inches} or null) is used to fill in a blank BMI.
export function csvToEntries(text, height) {
    const records = parseCSV(text);
    if (records.length === 0) return { error: "CSV file is empty." };

    const columns = {};
    records[0].forEach(function(header, i) { columns[normalizeHeader(header)] = i; });
    for (const required of ["date", "weight", "systolic", "diastolic"]) {
        if (!(required in columns)) return { error: `CSV is missing the "${required}" column.` };
    }

    const entries = [];
    for (let r = 1; r < records.length; r++) {
        const record = records[r];
        if (record.every(function(value) { return value.trim() === ""; })) continue;

        const get = function(name) {
            return name in columns ? (record[columns[name]] || "").trim() : "";
        };
        const rowError = function(message) { return { error: `Row ${r + 1}: ${message}` }; };

        const date = get("date");
        const weight = get("weight");
        const bloodPressure = `${get("systolic")}/${get("diastolic")}`;
        const error = validateDate(date) || validateWeight(weight) || validateBloodPressure(bloodPressure);
        if (error) return rowError(error);

        let bmi = get("bmi");
        if (bmi === "") {
            bmi = height ? calcBMI(height.feet, height.inches, weight) : "";
        } else if (isNaN(Number(bmi))) {
            return rowError("BMI must be a valid number.");
        }

        const parsed = parseExercises(get("exercises"));
        if (parsed.error) return rowError(parsed.error);

        entries.push({ date: date, weight: weight, bloodPressure: bloodPressure, bmi: bmi, exercises: parsed.exercises });
    }

    if (entries.length === 0) return { error: "CSV contains no entries." };
    return { entries: entries };
}
