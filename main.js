// Firebase Authentication
var config = {
  apiKey: "APIKEY",
  authDomain: "omnislash-9efc1.firebaseapp.com",
  databaseURL: "https://omnislash-9efc1.firebaseio.com",
  projectId: "omnislash-9efc1",
  storageBucket: "omnislash-9efc1.appspot.com",
  messagingSenderId: "964659312009"
};
firebase.initializeApp(config);

//Create database variable to create reference to firebase.database().
var database = firebase.database();

var minuteTilArrive = 0;

//Show and update current time. Use setInterval method to update time.
function displayRealTime() {
setInterval(function(){
  $('#current-time').html(moment().format('hh:mm A'))
}, 1000);
}
displayRealTime();


var tRow = "";
var getKey = "";

//Click event for the submit button. When user clicks Submit button to add a train to the schedule...
$("#submit-button").on("click", function() {

// Prevent form from submitting
event.preventDefault();

//Grab the values that the user enters in the text boxes in the "Add train" section. Store the values in variables.
var trainName = $("#train-name").val().trim();
var destination = $("#destination").val().trim();
var firstTrainTime = $("#first-train-time").val().trim();
var trainFrequency = $("#frequency").val().trim();

//Print the values that the user enters in the text boxes to the console for debugging purposes.
console.log(trainName);
console.log(destination);
console.log(firstTrainTime);
console.log(trainFrequency);


//Check that all fields are filled out.
if (trainName === "" || destination === "" || firstTrainTime === "" || trainFrequency === ""){
  return false;		
}

//Check to make sure that there are no null values in the form.
else if (trainName === null || destination === null || firstTrainTime === null || trainFrequency === null){
  return false;		
}

//Check that the user enters the first train time as military time.
else if (firstTrainTime.length !== 5 || firstTrainTime.substring(2,3)!== ":") {
  return false;
}

//Check that the user enters a number for the Frequency value.
else if (isNaN(trainFrequency)) {
  return false;
}

//If form is valid, perform time calculations and add train to the current schedule.
else {

  //Moment JS math caclulations to determine train next arrival time and the number of minutes away from destination.
  // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");
    console.log(firstTimeConverted);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    var tRemainder = diffTime % trainFrequency;
    console.log(tRemainder);

    // Minute Until Train
    var minuteTilArrive = trainFrequency - tRemainder;
    console.log("MINUTES TILL TRAIN: " + minuteTilArrive);

    // Next Train
    var nextTrain = moment().add(minuteTilArrive, "minutes").format("hh:mm A");
    console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

  //Create local temporary object for holding train data
  var newTrain = {
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    trainFrequency: trainFrequency,
    nextTrain: nextTrain,
    minuteTilArrive: minuteTilArrive,
    currentTime: currentTime.format("hh:mm A")
  };

  //Save/upload train data to the database.
  database.ref().push(newTrain);

  //Log everything to console for debugging purposes.
  console.log("train name in database: " + newTrain.trainName);
  console.log("destination in database: " + newTrain.destination);
  console.log("first train time in database: " + newTrain.firstTrainTime);
  console.log("train frequency in database: " + newTrain.trainFrequency);
  console.log("next train in database: " + newTrain.nextTrain);
  console.log("minutes away in database: " + newTrain.minuteTilArrive);
  console.log("current time in database: " + newTrain.currentTime);


  //Remove the text from the form boxes after user presses the add to schedule button.
  $("#train-name").val("");
  $("#destination").val("");
  $("#first-train-time").val("");
  $("#frequency").val("");
}
});


// At the initial load and subsequent value changes, get a snapshot of the stored data.
// This function allows you to update the page in real-time when the firebase database changes.
database.ref().on("child_added", function(childSnapshot, prevChildKey) {
console.log(childSnapshot.val());
console.log(prevChildKey);

//Set variables for form input field values equal to the stored values in firebase.
var trainName = childSnapshot.val().trainName;
var destination = childSnapshot.val().destination;
var firstTrainTime = childSnapshot.val().firstTrainTime;
var trainFrequency = childSnapshot.val().trainFrequency;
var nextTrain = childSnapshot.val().nextTrain;
var minuteTilArrive = childSnapshot.val().minuteTilArrive;
var currentTime = childSnapshot.val().currentTime;

//Train info
console.log(trainName);
console.log(destination);
console.log(firstTrainTime);
console.log(nextTrain);
console.log(minuteTilArrive);
console.log(trainFrequency);
console.log(currentTime);


//Update "Train Schedule" on HTML 
var tRow = $("<tr>");
var trainTd = $("<td>").text(trainName);
  var destTd = $("<td>").text(destination);
  var nextTrainTd = $("<td>").text(nextTrain);
  var trainFrequencyTd = $("<td>").text(trainFrequency);
  var minuteTilArriveTd = $("<td>").text(minuteTilArrive);

  // Append the newly created table data to the table row.
  tRow.append("<img src='assets/images/trainIcon.png' class='train-icon' mr-3'>", trainTd, destTd, trainFrequencyTd, nextTrainTd, minuteTilArriveTd);
  //Play train sound when a new destination is submitted
  $('#audio').get(0).play();
  // Append the table row to the table body
  $("#schedule-body").append(tRow);
});

//One way to initialize all tooltips on a page would be to select them by their data-toggle attribute:
$(function () {
$('[data-toggle="tooltip"]').tooltip()
})