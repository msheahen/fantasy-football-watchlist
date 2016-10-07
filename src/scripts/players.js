
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

          var theTemplateScript = $("#players-list").html();
          var theTemplate = Handlebars.compile(theTemplateScript);
          var thePlayers = sortDscByKey(response, "UpcomingSalary");

          $("#playersList").append(theTemplate(sortDscByKey(response, "UpcomingSalary")));
          setPlayerList(thePlayers);

          $("#load").css({
            "display": "none"
          });
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
        $("#wr").click(function() {
            filterPlayersBy("WR");
        });
        $("#te").click(function() {
            filterPlayersBy("TE");
        });
        $("#flex").click(function() {
            filterPlayersBy("FLEX");
        });

        $("#namequery").keyup(function(e){
          var filterString = $(this).val();
          if(allplayers !== undefined){
          //console.log(filterString);
          filteredPlayersList = allplayers.filter(function(entry){
                  return entry.Name.toUpperCase().includes(filterString.toUpperCase());
                });

              var theTemplateScript = $("#players-list").html();
              var theTemplate = Handlebars.compile(theTemplateScript);
              $("#playersList").html("");
              $("#playersList").append(theTemplate(filteredPlayersList));
              $(".player-to-add").on('click', function() {
                  addPlayerToWatchlist($(this).attr('id'));
              });

            }
        });

    }


});
