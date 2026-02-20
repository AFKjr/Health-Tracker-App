// First load entries from localStorage
function loadEntries() {
    const savedEntries = localStorage.getItem("entries");
    const entries = savedEntries ? JSON.parse(savedEntries) : [];

    const logsContainer = document.getElementById("logs-container");

    // We need to if there any entries 
    if (entries.length === 0) {
        logsContainer.innerHTML = "<p>No logs found. Start tracking health on the home page!</p>";
        return;
    }

    // Display each entry
    entries.forEach(function(entry) {
        const entryDiv = document.createElemeent("div");
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
                entryHTML += `<li>${exercise.name}: ${exercise.reps} reps</li`;
            } else if (exercise.time) {
                entryHTML += `<li>${exercise.name}: ${exercise.time} minutes</li>`;
            }
        });

        entryHTML += `</ul`;

        entryDiv.innerHTML = entryHTML;
        logsContainer.appendChild(entryDiv);
    });
}

// Now load entries when the page loads
loadEntries();