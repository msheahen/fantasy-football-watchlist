$(document).ready(function() {
    // If we are on our home page
    if (path == '/' || path == '/index.html') {

        var db = openDatabase();

        db.then(function(db) {

            if (!db) {
                console.log('No database!');
                return;
            }
            var tx = db.transaction('myplayers', 'readwrite');
            var store = tx.objectStore('myplayers');

            return store.getAll();

        }).catch(function(err) {}).then(function(response) {

            // show error to user if we don't have any saved players in our watchlist
            if (response.length === 0) {
                $("#myPlayersList").html('<div class="alert"><strong>Warning</strong> You don\'t current have any watched players.  Navigate to the Players tab to start adding players.</div>');
                return Promise.reject();
            } else {

                //sort my players by price
                setMyPlayerList(sortDscByKey(response, "UpcomingSalary"));

                var theTemplateScript = $("#my-players-list").html();
                var theTemplate = Handlebars.compile(theTemplateScript);
                $("#myPlayersList").append(theTemplate(myplayers));

                //remove player
                $(".player-to-remove").on('click', function() {
                    removePlayerFromWatchlist($(this).attr('id'));
                });

            }

        }).catch(function(error) {
          console.log(error);
        });

        //filtering settings
        $("#all").click(function() {
            filterMyPlayersBy("ALL");
        });
        $("#qb").click(function() {
            filterMyPlayersBy("QB");
        });
        $("#rb").click(function() {
            filterMyPlayersBy("RB");
        });
        $("#wr").click(function() {
            filterMyPlayersBy("WR");
        });
        $("#te").click(function() {
            filterMyPlayersBy("TE");
        });
        $("#flex").click(function() {
            filterMyPlayersBy("FLEX");
        });

        $("#namequery").keyup(function(e) {
            if (myplayers !== undefined) {
                var filterString = $(this).val();

                //search using javascript filter
                filteredPlayersList = myplayers.filter(function(entry) {
                    return entry.Name.toUpperCase().includes(filterString.toUpperCase());
                });


                var theTemplateScript = $("#my-players-list").html();
                var theTemplate = Handlebars.compile(theTemplateScript);
                $("#myPlayersList").html("");
                $("#myPlayersList").append(theTemplate(filteredPlayersList));

                //remove player
                $(".player-to-remove").on('click', function() {
                    removePlayerFromWatchlist($(this).attr('id'));
                });
            }
        });

    }

});
