// Trend charts. Chart is a global loaded from the CDN script tags in logs.html.

// Stored chart instances so we can destroy them before re-creating
let weightChartInstance = null;
let bpChartInstance = null;
let bmiChartInstance = null;

// Create the weight chart
function createWeightChart(entries) {
    if (entries.length === 0) {
        return;
    }

    if (weightChartInstance) {
        weightChartInstance.destroy();
        weightChartInstance = null;
    }

    const dates = entries.map(function(entry) { return entry.date; });
    const weights = entries.map(function(entry) { return Number(entry.weight); });
    const canvas = document.getElementById("weight-chart");

    weightChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Weight (lbs)',
                data: weights,
                borderColor: '#000080',
                backgroundColor: 'rgba(0, 0, 128, 0.2)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

// Create the blood pressure chart
function createBPChart(entries) {
    if (entries.length === 0) {
        return;
    }

    if (bpChartInstance) {
        bpChartInstance.destroy();
        bpChartInstance = null;
    }

    const dates = entries.map(function(entry) { return entry.date; });
    const systolic = entries.map(function(entry) {
        return Number(entry.bloodPressure.split('/')[0]);
    });
    const diastolic = entries.map(function(entry) {
        return Number(entry.bloodPressure.split('/')[1]);
    });

    const canvas = document.getElementById("bp-chart");

    bpChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Systolic (mmHg)',
                    data: systolic,
                    borderColor: '#800080',
                    backgroundColor: 'rgba(128, 0, 128, 0.2)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Diastolic (mmHg)',
                    data: diastolic,
                    borderColor: '#008000',
                    backgroundColor: 'rgba(0, 128, 0, 0.2)',
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                annotation: {
                    annotations: {
                        systolicNormal: {
                            type: 'line',
                            yMin: 120, yMax: 120,
                            borderColor: '#008000',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Systolic Normal (120)', position: 'start', font: { size: 11 } }
                        },
                        systolicElevated: {
                            type: 'line',
                            yMin: 130, yMax: 130,
                            borderColor: '#cc8800',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Elevated (130)', position: 'start', font: { size: 11 } }
                        },
                        systolicHigh: {
                            type: 'line',
                            yMin: 140, yMax: 140,
                            borderColor: '#cc0000',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'High (140)', position: 'start', font: { size: 11 } }
                        },
                        diastolicNormal: {
                            type: 'line',
                            yMin: 80, yMax: 80,
                            borderColor: '#008000',
                            borderWidth: 1,
                            borderDash: [3, 5],
                            label: { display: true, content: 'Diastolic Normal (80)', position: 'end', font: { size: 11 } }
                        },
                        diastolicHigh: {
                            type: 'line',
                            yMin: 90, yMax: 90,
                            borderColor: '#cc0000',
                            borderWidth: 1,
                            borderDash: [3, 5],
                            label: { display: true, content: 'Diastolic High (90)', position: 'end', font: { size: 11 } }
                        }
                    }
                }
            },
            scales: { y: { beginAtZero: false } }
        }
    });
}

// Create the BMI chart
function createBMIChart(entries) {
    if (entries.length === 0) {
        return;
    }

    if (bmiChartInstance) {
        bmiChartInstance.destroy();
        bmiChartInstance = null;
    }

    const dates = entries.map(function(entry) { return entry.date; });
    const bmis = entries.map(function(entry) { return Number(entry.bmi); });

    const canvas = document.getElementById("bmi-chart");

    bmiChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'BMI',
                data: bmis,
                borderColor: '#000080',
                backgroundColor: 'rgba(0, 0, 128, 0.2)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                annotation: {
                    annotations: {
                        underweight: {
                            type: 'line',
                            yMin: 18.5, yMax: 18.5,
                            borderColor: '#0066cc',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Underweight (18.5)', position: 'start', font: { size: 11 } }
                        },
                        overweight: {
                            type: 'line',
                            yMin: 25, yMax: 25,
                            borderColor: '#cc8800',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Overweight (25)', position: 'start', font: { size: 11 } }
                        },
                        obese: {
                            type: 'line',
                            yMin: 30, yMax: 30,
                            borderColor: '#cc0000',
                            borderWidth: 1,
                            borderDash: [6, 4],
                            label: { display: true, content: 'Obese (30)', position: 'start', font: { size: 11 } }
                        }
                    }
                }
            },
            scales: { y: { beginAtZero: false } }
        }
    });
}

export function renderCharts(entries) {
    createWeightChart(entries);
    createBPChart(entries);
    createBMIChart(entries);
}
