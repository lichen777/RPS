const logic = {
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
  }
} // Object: logic

const panel = {

  choices : ["r", "p", "s"],
  choicesImg : ["assets/images/r.png", "assets/images/p.png", "assets/images/s.png"],

  showChoices : function (id) {
    $(id).empty();
    for (var i = 0; i < this.choices.length; i++) {
      var images = $('<img>').attr('src', this.choicesImg[i]).attr('data-rps',this.choices[i]).addClass("choices");
      $(id).append(images);
    }

    $('.choices').click(function () {
      var value = ($(this).attr("data-rps"));
      console.log(value);
      $(id).empty();
      var image = $('<img>').attr('src', panel.choicesImg[(panel.choices.indexOf(value))]);
      $(id).append(image);
      $(id).append("<div class='result' ><p>selected</p><p>Waiting for another player to select.</p></div>");
      
      if (id === '#player1'){
        player1.selected = value;
        database.ref("/game").update({
          player1Pick: player1.selected
        });
      } else if (id === '#player2') {
        player2.selected = value;
        database.ref("/game").update({
          player2Pick: player2.selected
        });
      } 
    });//
  },

  playerLogin : function () {
    $('#player1-btn').click(function (event) {
      event.preventDefault();
      var input = $("#player1-name").val().trim();
      if(input){
        $('#player1-name').val("");
        player1.name = input;
        player1.win = initialNum;
        player1.lose = initialNum;
        yourRole = player1.id;
        opponent = player2.id;
        panel.playerLogged();
        database.ref("/player/player1").set({
          name: player1.name,
          win: player1.win,
          lose: player1.lose,
        });
      } 
    })
    $('#player2-btn').click(function (event) {
      event.preventDefault();
      var input = $("#player2-name").val().trim();
      if(input){
        $('#player2-name').val("");
        player2.name = input;
        player2.win = initialNum;
        player2.lose = initialNum;
        yourRole = player2.id;
        opponent = player1.id;
        panel.playerLogged();
        database.ref("/player/player2").set({
          name: player2.name,
          win: player2.win,
          lose: player2.lose,
        });
      }
    })
  },

  playerLogged : function () {
    $('#player1-login').hide();
    $('#player2-login').hide();
    if (player1.name !== "") {
      var text = $('<div>').text("Waiting for Another Player to Join").addClass("waiting");
      $('#player2-block').prepend(text);
      panel.showStatus();
      
      
    } else if (player2.name !== "") {
      var text = $('<div>').text("Waiting for Another Player to Join").addClass("waiting");
      $('#player1-block').prepend(text);
      panel.showStatus();
      
    }

  },

  showStatus : function () {
    if(player1.name !== ""){
      $('#player1-login').hide();
      $('#player1-status').empty();
      var name = $('<div>').text(player1.name);
      var win = $('<div>').text("win: " + player1.win);
      var lose = $('<div>').text("lose: " + player1.lose);
      $('#player1-status').append(name).append(win).append(lose);   
    }
    
    if(player2.name !== ""){
      $('#player2-login').hide();
      $('#player2-status').empty();
      name = $('<div>').text(player2.name);
      win = $('<div>').text("win: " + player2.win);
      lose = $('<div>').text("lose: " + player2.lose);
      $('#player2-status').append(name).append(win).append(lose);
    }
  }
  
} // Object: panel

const game = {

  nameUpdate : function () {
    database.ref("/player/player1").on("value", function(snapshot) {
      if (snapshot.val().name){
        var con = database.ref("player/player1");
        con.onDisconnect().set({ //not working, because this function doesn't select player on disconnect. any one left can trigger this function
          name: "",
          win: initialNum,
          lose: initialNum,
        });
        player1.name = snapshot.val().name;
        panel.showStatus();
      }
    })
    database.ref("/player/player2").on("value", function(snapshot) {
      if (snapshot.val().name){
        var con = database.ref("player/player2");
        con.onDisconnect().set({ //not working, because this function doesn't select player on disconnect. any one left can trigger this function
          name: "",
          win: initialNum,
          lose: initialNum,
        });
        player2.name = snapshot.val().name;
        panel.showStatus();
      }
    })
  },

  scoreUpdate : function () {
    database.ref("/player").on("value", function(snapshot) {
      player1.win = snapshot.child("player1").child("win").val();
      player1.lose = snapshot.child("player1").child("lose").val();
      player2.win = snapshot.child("player2").child("win").val();
      player2.lose = snapshot.child("player2").child("lose").val();
      panel.showStatus();
    })
  },

  judge : function (p1, p2) {
    if (yourRole === "#player1"){
      return logic[p1][p2];
    } else if (yourRole === "#player2"){
      return logic[p2][p1];
    }
  },

  readyToGo : function () {
    database.ref("/player").on("value", function(snapshot) {
      if(snapshot.child("player1").child("name").val() && snapshot.child("player2").child("name").val()){
        console.log("both logged");
        $('.waiting').empty();
        setTimeout(function () {
          console.log("timeout");
          $(opponent).empty();
          panel.showChoices(yourRole);
        }, 3000);
      }
    })
  },

  main : function () {
    
    panel.playerLogin();
    game.nameUpdate();
    
    game.readyToGo();

    database.ref("/game").on("value", function(snapshot) {
      if(snapshot.child("player1Pick").val() && snapshot.child("player2Pick").val()){
        console.log("both selected");

        var result = game.judge(snapshot.child("player1Pick").val(),snapshot.child("player2Pick").val());
        console.log(result);
        $('.result').text("You " + result + " !");

        if (yourRole === "#player1") {
          var image = $('<img>').attr('src', panel.choicesImg[(panel.choices.indexOf(snapshot.child("player2Pick").val()))]);
          $(opponent).append(image);
          if (result === "win") {
            player1.win ++;
          }
          if (result === "lose") {
            player1.lose ++;
          }
          database.ref("/player/player1").update({
            win: player1.win,
            lose: player1.lose,
          });
        } else if (yourRole === "#player2") {
          var image = $('<img>').attr('src', panel.choicesImg[(panel.choices.indexOf(snapshot.child("player1Pick").val()))]);
          $(opponent).append(image);
          if (result === "win") {
            player2.win ++;
          }
          if (result === "lose") {
            player2.lose ++;
          }
          database.ref("/player/player2").update({
            win: player2.win,
            lose: player2.lose,
          });
        }

        database.ref("/game").remove();

        game.scoreUpdate();

        game.readyToGo();
        
      }
    }); 
  }

} // Object: game

const initialNum = 0;

let yourRole = "";
let opponent = "";

const player1 = {
  name : "",
  win : initialNum,
  lose : initialNum,
  id : "#player1",
  selected : ""
}

const player2 = {
  name : "",
  win : initialNum,
  lose : initialNum,
  id : "#player2",
  selected : ""
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
  
  game.main();
  
})
