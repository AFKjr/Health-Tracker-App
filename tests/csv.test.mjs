import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { entriesToCSV, csvToEntries } from "../js/csv.js";

const HEADER = "Date,Weight (lbs),BMI,Systolic (mmHg),Diastolic (mmHg),Exercises";

const sample = [
    { date: "2026-10-01", weight: "180", bloodPressure: "120/80", bmi: "25.8",
        exercises: [{ name: 'Bob\'s "fun", run', reps: "20" }, { name: "running", time: "30" }] },
    { date: "2026-10-02", weight: "178.5", bloodPressure: "118/76", bmi: "25.6", exercises: [] },
];

describe("entriesToCSV", function() {
    it("writes the header and quotes fields per RFC 4180", function() {
        assert.equal(entriesToCSV(sample), [
            HEADER,
            '2026-10-01,180,25.8,120,80,"Bob\'s ""fun"", run: 20 reps; running: 30 min"',
            "2026-10-02,178.5,25.6,118,76,",
        ].join("\n"));
    });

    it("escapes ; and \\ inside exercise names", function() {
        const csv = entriesToCSV([{ ...sample[1], exercises: [{ name: "warm-up; stretch", reps: "10" }, { name: "C:\\path\\", time: "5" }] }]);
        assert.equal(csv.split("\n")[1], "2026-10-02,178.5,25.6,118,76,warm-up\\; stretch: 10 reps; C:\\\\path\\\\: 5 min");
    });
});

describe("csvToEntries", function() {
    it("round-trips exported entries", function() {
        assert.deepEqual(csvToEntries(entriesToCSV(sample), null).entries, sample);
    });

    it("round-trips names with semicolons and backslashes", function() {
        const names = ["warm-up; stretch", "C:\\path\\", "a\\;b", ";;", "plain"];
        const tricky = [{ ...sample[1], exercises: names.map(function(name, i) {
            return i % 2 ? { name, time: "5" } : { name, reps: "10" };
        }) }];
        assert.deepEqual(csvToEntries(entriesToCSV(tricky), null).entries, tricky);
    });

    it("handles a UTF-8 BOM, CRLF line endings, and a trailing newline", function() {
        const csv = "\uFEFF" + entriesToCSV(sample).replace(/\n/g, "\r\n") + "\r\n";
        assert.deepEqual(csvToEntries(csv, null).entries, sample);
    });

    it("reads CSVs exported before escaping existed", function() {
        const legacy = HEADER + '\n2026-09-01,180,25.8,120,80,"push-ups: 50 reps; outdoor-walk: 30 min; C:\\drive: 5 min"';
        assert.deepEqual(csvToEntries(legacy, null).entries[0].exercises, [
            { name: "push-ups", reps: "50" },
            { name: "outdoor-walk", time: "30" },
            { name: "C:\\drive", time: "5" },
        ]);
    });

    it("matches columns by name in any order and fills a blank BMI from height", function() {
        const result = csvToEntries("Systolic,Diastolic,Date,Weight,BMI\n120,80,2026-10-03,180,", { feet: "5", inches: "10" });
        assert.deepEqual(result.entries, [{ date: "2026-10-03", weight: "180", bloodPressure: "120/80", bmi: "25.8", exercises: [] }]);
    });

    it("leaves BMI blank when it is missing and no height is saved", function() {
        assert.equal(csvToEntries("Date,Weight,Systolic,Diastolic\n2026-10-03,180,120,80", null).entries[0].bmi, "");
    });

    it("skips blank rows", function() {
        assert.equal(csvToEntries("Date,Weight,Systolic,Diastolic\n2026-10-03,180,120,80\n,,,\n\n", null).entries.length, 1);
    });

    const errorCases = [
        ["an empty file", "", "CSV file is empty."],
        ["a header with no rows", "Date,Weight,Systolic,Diastolic\n", "CSV contains no entries."],
        ["a missing required column", "Date,Weight\n2026-10-01,180", 'CSV is missing the "systolic" column.'],
        ["a non-ISO date", "Date,Weight,Systolic,Diastolic\n10/01/2026,180,120,80", "Row 2: Date must be in format YYYY-MM-DD."],
        ["an out-of-range weight", "Date,Weight,Systolic,Diastolic\n2026-10-01,900,120,80", "Row 2: Please enter a valid weight between 50 and 300 lbs."],
        ["an out-of-range BP on row 3", "Date,Weight,Systolic,Diastolic\n2026-10-01,180,120,80\n2026-10-02,180,300,80", "Row 3: Please enter a valid blood pressure reading."],
        ["a non-numeric BMI", "Date,Weight,BMI,Systolic,Diastolic\n2026-10-01,180,abc,120,80", "Row 2: BMI must be a valid number."],
        ["an unreadable exercise", 'Date,Weight,Systolic,Diastolic,Exercises\n2026-10-01,180,120,80,"push-ups lots"', 'Row 2: Could not read exercise "push-ups lots".'],
        ["too many reps", "Date,Weight,Systolic,Diastolic,Exercises\n2026-10-01,180,120,80,squats: 5000 reps", "Row 2: Please enter a reasonable number of reps (max 1000)."],
    ];
    for (const [label, csv, message] of errorCases) {
        it(`rejects ${label}`, function() {
            assert.deepEqual(csvToEntries(csv, null), { error: message });
        });
    }
});
