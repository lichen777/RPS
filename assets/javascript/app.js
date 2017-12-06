const game = {
  r : {
    r : "tie",
    p : "lose",
    s : "win"
  },
  p : {
    r : "win",
    p : "tie",
    s : "lose"
  },
  s : {
    r : "lose",
    p : "win",
    s : "tie"
  },
  choices : ["r", "p", "s"],
  choicesImg : ["assets/images/r.png", "assets/images/p.png", "assets/images/s.png"],

  showChoices : function () {
    $('game').empty();
    for (var i = 0; i < this.choices.length; i++) {
      var images = $('<img>').attr('src', this.choicesImg[i]).attr('data-rps',this.choices[i]);
      $('#game').append(images);
    }
  },

  showStatus : function (player) {
    var name = $('<div>').text(player.name);
    var win = $('<div>').text("win: " + player.win);
    var lose = $('<div>').text("lose: " + player.lose);
    $('#player1status').append(name).append(win).append(lose);
  }

  start : function () {
    game.showChoices();

    $('<img>').click(function () {
      var value = ($(this).attr("data-rps"));
      console.log(value);

    })
  },

}

const initialwin = 0;
const initiallose = 0;

const player = {
  name : "",
  win : initialwin,
  lose : initiallose
}

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCaZegY5dEdnNRP_E-KPB1l9nCwAmlKp4Y",
  authDomain: "rps-multi-18d77.firebaseapp.com",
  databaseURL: "https://rps-multi-18d77.firebaseio.com",
  projectId: "rps-multi-18d77",
  storageBucket: "rps-multi-18d77.appspot.com",
  messagingSenderId: "290724551069"
};
firebase.initializeApp(config);

var database = firebase.database();

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");

connectedRef.on("value", function(snap) {
  if (snap.val()) {
    var con = connectionsRef.push(true);
    con.onDisconnect().remove();
  }
});

connectionsRef.on("value", function(snap) {
  $("#watchers").text(snap.numChildren());
});














$(document).ready(function() {

})






