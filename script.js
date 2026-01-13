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
