addPlayerToWatchlist = function(id) {

            var player = allplayers.filter(function(entry) {
                return entry.PlayerID === parseInt(id);
            });

            //console.log(player);
            var myPlayer = player[0];

            var data = {
                PlayerID: myPlayer.PlayerID,
                Name: myPlayer.Name,
                Position: myPlayer.Position,
                Team: myPlayer.Team,
                Active: myPlayer.Active,
                Injured: myPlayer.Injured,
                PhotoUrl: myPlayer.PhotoUrl,
                Price: myPlayer.UpcomingYahooSalary
            };

            /* save player data in db */
            var db = openDatabase();
            db.then(function(db) {
                var tx = db.transaction('myplayers', 'readwrite');
                var store = tx.objectStore('myplayers');
                store.put(data);
                return tx.complete;
            }).catch(function(error) {
                console.log(error);
            });

};


filterPlayersBy = function(param) {

    var filteredPlayersList;
      if(param == "ALL"){
        filteredPlayersList = allplayers;
      }else if (param == "FLEX"){
        filteredPlayersList = allPlayers.filter(function(entry){
                return entry.Position === "RB" ||
                    entry.Position === "WR" ||
                    entry.Position === "TE";
              });
            }else{
              filteredPlayersList = allPlayers.filter(function(entry){
                return entry.Position === param;
              });
            }


            var theTemplateScript = $("#players-list").html();
            var theTemplate = Handlebars.compile(theTemplateScript);
            $("#playersList").html("");
            $("#playersList").append(theTemplate(filteredPlayersList));
            $(".player-to-add").on('click', function() {
                addPlayerToWatchlist($(this).attr('id'));
            });

};

$(document).ready(function() {

    if (path == '/all-players.html') {


      /* TODO read cache */

      var db = openDatabase();

      db.then(function(db) {

        if (!db){
          console.log('No database!');
          return;
        }
    		var tx = db.transaction('allplayers', 'readwrite');
    		var store = tx.objectStore('allplayers');

    		return store.getAll();

    	}).catch(function(err){
      }).then(function(response) {

    		if ( response.length === 0 ) {
          //console.log('no response');
    			return Promise.reject();
    		} else {

          allPlayers = sortDscByKey(response, "Price");
          var theTemplateScript = $("#players-list").html();
          var theTemplate = Handlebars.compile(theTemplateScript);
          $("#playersList").append(theTemplate(sortDscByKey(response, "Price")));

          $(".player-to-add").on('click', function() {
              addPlayerToWatchlist($(this).attr('id'));
          });

    		}
      }).catch(function(err){
          fetchPlayers();
      });

      /* add event listeners to DOM */
        $("#all").click(function() {
            filterPlayersBy("ALL");
        });
        $("#qb").click(function() {
            filterPlayersBy("QB");
        });
        $("#rb").click(function() {
            filterPlayersBy("RB");
        });
        $("#k").click(function() {
            filterPlayersBy("K");
        });
        $("#wr").click(function() {
            filterPlayersBy("WR");
        });
        $("#te").click(function() {
            filterPlayersBy("TE");
        });
        $("#flex").click(function() {
            filterPlayersBy("FLEX");
        });

    }


});
