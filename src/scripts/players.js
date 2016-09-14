var allplayers;


addPlayerToWatchlist = function(id){
  fetch('./assets/data/players.json')
    .then(function(response){
      return response.json();
    }).catch(function(error){
      console.log(error);
      return error;
    }).then(function(response){

      var player = response.Players.filter(function(entry) {
          return entry.playerId === id;
      });

      var myPlayer = player[0];

      var data = {
        playerId: myPlayer.playerId,
        displayName: myPlayer.displayName,
        position: myPlayer.position,
        team: myPlayer.team,
        active: myPlayer.active
      };

      /* save player data in db */
      var db = openDatabase();
        db.then(function(db) {
          var tx = db.transaction('players', 'readwrite');
          var store = tx.objectStore('players');
          store.put(data);
          return tx.complete;
        }).catch(function(error){
          console.log(error);
        });
      });
};


filterPlayersBy = function(param){
  var players = fetch('./assets/data/players.json')
    .then(function(response){
      return response.json();
    }).catch(function(error){
      console.log(error);
      return error;
    }).then(function(response){
      var filteredPlayersList;
      if(param == "ALL"){
        filteredPlayersList = response.Players;
      }else if (param == "FLEX"){
        filteredPlayersList = response.Players.filter(function(entry){
          return entry.position === "RB" ||
              entry.position === "WR" ||
              entry.position === "TE";
        });
      }else{
        filteredPlayersList = response.Players.filter(function(entry){
          return entry.position === param;
        });
      }

      var theTemplateScript = $("#players-list").html();
      var theTemplate = Handlebars.compile(theTemplateScript);
      $("#playersList").html("");
      $("#playersList").append(theTemplate(filteredPlayersList));
      $(".player-to-add").on('click', function(){
        addPlayerToWatchlist($(this).attr('id'));
      });
    });

};

$(document).ready(function(){

if(path == '/all-players.html'){


  allplayers = fetch('./assets/data/players.json')
    .then(function(response){
      return response.json();
    }).catch(function(error){
      console.log(error);
      return error;
    }).then(function(response){

      var players = response.Players;

      var theTemplateScript = $("#players-list").html();
      var theTemplate = Handlebars.compile(theTemplateScript);
      $("#playersList").append(theTemplate(players));

      $(".player-to-add").on('click', function(){
        addPlayerToWatchlist($(this).attr('id'));
      });

      return players;
    }).catch(function(error){
      console.log(error);
      return error;
    });

    $("#all").click(function(){
      filterPlayersBy("ALL");
    });
    $("#qb").click(function(){
      filterPlayersBy("QB");
    });
    $("#rb").click(function(){
      filterPlayersBy("RB");
    });
    $("#wr").click(function(){
      filterPlayersBy("WR");
    });
    $("#te").click(function(){
      filterPlayersBy("TE");
    });
    $("#flex").click(function(){
      filterPlayersBy("FLEX");
    });

  }

});
