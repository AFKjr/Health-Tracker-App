// Create the weight chart
function createWeightChart(entries) {
    // Check if there are any entries
    if (entries.length === 0) {
        return;
    }
    
    // Extract dates and weights
    const dates = entries.map(function(entry) {
        return entry.date;
    });
    
    const weights = entries.map(function(entry) {
        return Number(entry.weight);
    });
    
    // Canvas element
    const canvas = document.getElementById("weight-chart");
    
    // Create the chart
    new Chart(canvas, {
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
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// First load entries from localStorage
function loadEntries() {
    const savedEntries = localStorage.getItem("entries");
    const entries = savedEntries ? JSON.parse(savedEntries) : [];

    // Create the chart
    createWeightChart(entries);

    const logsContainer = document.getElementById("logs-container");

    // We need to if there any entries 
    if (entries.length === 0) {
        logsContainer.innerHTML = "<p>No logs found. Start tracking health on the home page!</p>";
        return;
    }

    // Display each entry
    entries.forEach(function(entry) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("log-entry");

        //Build the entry HTML
        let entryHTML = `
            <h3>Date: ${entry.date}</h3>
            <p>Weight: ${entry.weight} lbs</p>
            <p>Blood Pressure: ${entry.bloodPressure} mmHg</p>
            <p>BMI: ${entry.bmi}</p>
            <h4>Exercises:</h4>
            <ul>
        `;
            
        // Now add exercises
        entry.exercises.forEach(function(exercise) {
            if (exercise.reps) {
                entryHTML += `<li>${exercise.name}: ${exercise.reps} reps</li>`;
            } else if (exercise.time) {
                entryHTML += `<li>${exercise.name}: ${exercise.time} minutes</li>`;
            }
        });

        entryHTML += `</ul>`;

        entryDiv.innerHTML = entryHTML;
        logsContainer.appendChild(entryDiv);
    });
}

// Load in entries
loadEntries();