const winDetails = JSON.parse(localStorage.getItem("winDetails"));

var moves = winDetails.moves;
var handsWon = winDetails.handsWon;
var handsPlayed = winDetails.handsPlayed;

const playAgain = document.getElementById("play-again");

playAgain.addEventListener("click", function(){
    location.href = "../index.html";
})

