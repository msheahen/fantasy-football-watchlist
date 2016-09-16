/* Global variables */

var path = window.location.pathname;
var page = path.split("/").pop();
var allplayers;
var apikey = "9130e31adba74e27b4c44d17ac5f29e5";
var currentweek;

function sortAscByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function sortDscByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

function fetchPlayers() {

    var params = {
        // Request parameters
    };

    $.ajax({
            url: "https://api.fantasydata.net/v3/nfl/stats/JSON/Players?" + $.param(params),
            beforeSend: function(xhrObj) {
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", apikey);
            },
            type: "GET",
            // Request body
            data: "{body}",
        })
        .done(function(data) {
            /* return only the offensive players */
             var players = data.filter(function(entry) {
                return (entry.Position === "QB" || entry.Position === "RB" || entry.Position === "WR" || entry.Position === "K" || entry.Position === "TE") &&
                    entry.Active === true;
            });

            allplayers = sortDscByKey(players, "UpcomingYahooSalary");
            var theTemplateScript = $("#players-list").html();
            var theTemplate = Handlebars.compile(theTemplateScript);
            $("#playersList").append(theTemplate(allplayers));

            $(".player-to-add").on('click', function() {
                addPlayerToWatchlist($(this).attr('id'));
            });
            //console.log(players);

            var playerData = [];
            allplayers.forEach(function(myPlayer) {
                playerData.push({
                    PlayerID: myPlayer.PlayerID,
                    Name: myPlayer.Name,
                    Position: myPlayer.Position,
                    Team: myPlayer.Team,
                    Active: myPlayer.Active,
                    Injured: myPlayer.Injured,
                    PhotoUrl: myPlayer.PhotoUrl,
                    Price: myPlayer.UpcomingYahooSalary
                });
            });

            /* save player data in db */
            var db = openDatabase();
            db.then(function(db) {
                var tx = db.transaction('allplayers', 'readwrite');
                var store = tx.objectStore('allplayers');

                for (i = 0; i < playerData.length; i++) {
                    store.put(playerData[i]);
                }

                return tx.complete;
            }).catch(function(error) {
                console.log(error);
            });



        });

}

/*
Index controller stuff!
*/

function openDatabase() {
    if (!navigator.serviceWorker) {
        /*  displayMessage("WARNING: your web browser doesn't fully support this app", null, "dismiss");*/
        return Promise.resolve();
    }

    return idb.open('fantasy-football-watchlist', 1, function(upgradeDb) {
        var store = upgradeDb.createObjectStore('allplayers', {
            keyPath: 'PlayerID'
        });
        var store2 = upgradeDb.createObjectStore('myplayers', {
            keyPath: 'PlayerID'
        });
        var store3 = upgradeDb.createObjectStore('currentweek', {
            keyPath: 'week'
        });
    });
}


/*
 Defining the index controller prototype
*/
function IndexController() {

    this.db = openDatabase();
    this.registerServiceWorker();

}

function setCurrentWeek() {

    var db = openDatabase();

    db.then(function(db) {

        if (!db) {
            console.log('No database!');
            return;
        }
        var tx = db.transaction('currentweek', 'readwrite');
        var store = tx.objectStore('week');

        return store.getAll();

    }).catch(function(err) {}).then(function(response) {

      var params = {
          // Request parameters
      };

        $.ajax({
                url: "https://api.fantasydata.net/v3/nfl/scores/JSON/CurrentWeek?" + $.param(params),
                beforeSend: function(xhrObj) {
                    // Request headers
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", apikey);
                },
                type: "GET",
                // Request body
                data: "{body}",
            })
            .done(function(data) {
                response = data;

                /*we either do not have a week yet or we're out of date.
                We'll try and fetch the latest standings*/
                if (data == 'undefined' || currentweek != data) {


                    var db = openDatabase();
                    db.then(function(db) {
                        var tx = db.transaction('currentweek', 'readwrite');
                        var store = tx.objectStore('currentweek');

                        var info = {
                          week: data
                        };

                        store.put(info);

                        return tx.complete;
                    }).catch(function(error) {
                        console.log(error);
                    });
                    //fetchPlayers();


                }

            })
            .fail(function() {
              console.log('unable to reach api');
            });


    });

}


/*
Register our little helper!
*/
IndexController.prototype.registerServiceWorker = function() {

    if (!('serviceWorker' in navigator)) {
        alert("WARNING: your web browser doesn't fully support this app.  Try this app in chrome.", null, "dismiss");
        return;
    }

    navigator.serviceWorker
        .register('./service-worker.js', {
            scope: './'
        })
        .then(function(reg) {

            if (reg.waiting) {

                /*displayMessage("New update available!", "Refresh", "dismiss", function(worker){
				worker.postMessage({ action: 'skipWaiting' });
			}, reg.waiting);
      */
                return;
            }

            if (reg.installing) {
                Controller.trackInstalling(reg.installing);
                return;
            }

            reg.addEventListener('updatefound', function() {
                Controller.trackInstalling(reg.installing);
            });

        })
        .catch(function(err) {
            console.log('Service Worker Failed to Register', err);
        });

    /* useful tip on preventing chrome from refreshing endlessly when
    update on reload is checked (from Jake Archibalds' wittr)*/
    var refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function() {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });

};

/*
We have to watch our index controller if it's status is installing
*/
IndexController.prototype.trackInstalling = function(worker) {
    var indexController = this;
    worker.addEventListener('statechange', function() {
        if (worker.state == 'installed') {
            /*displayMessage("New Update available!", "update now!", "dismiss", function(worker) {
				worker.postMessage({ action: 'skipWaiting' });
			}, worker);*/
        }
    });
};

var Controller = new IndexController();

$(document).ready(function(){
  setCurrentWeek();
});
