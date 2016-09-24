/* Global variables */
var path = window.location.pathname;
var page = path.split("/").pop();
var allplayers;
var myplayers;
var username = 'mary';
var apikey = "9130e31adba74e27b4c44d17ac5f29e5";
var currentweek = 0;

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

Handlebars.registerHelper("getIndex", function (index) {
  return index + 1;
});

function setPlayerList(array) {
    allplayers = array;
}

function setMyPlayerList(array){
    myplayers = array;
}

addPlayerToWatchlist = function(id) {

            var player = allplayers.filter(function(entry) {
                return entry.PlayerID === parseInt(id);
            });

            //console.log(player);
            var myPlayer = player[0];
            //var newMessageRef = messageListRef.push();
            if(myPlayer.Injured === undefined){
              myPlayer.Injured = false;
            }
            //messageListRef.push({ 'user_id': 'fred', 'text': 'Yabba Dabba Doo!' });
            firebase.database().ref(username + '/players/' + myPlayer.PlayerID).set({
              player : myPlayer.Name,
              salary : myPlayer.UpcomingSalary,
              injured : myPlayer.Injured
            });

            var data = {
                PlayerID: myPlayer.PlayerID,
                Name: myPlayer.Name,
                Position: myPlayer.Position,
                Team: myPlayer.Team,
                Active: myPlayer.Active,
                Injured: myPlayer.Injured,
                PhotoUrl: myPlayer.PhotoUrl,
                UpcomingSalary: myPlayer.UpcomingSalary
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

removePlayerFromWatchlist = function(id) {

            /* save player data in db */
            var db = openDatabase();
            db.then(function(db) {
                var tx = db.transaction('myplayers', 'readwrite');
                var store = tx.objectStore('myplayers');
                store.delete(parseInt(id));
                return tx.complete;
            }).catch(function(error) {
                console.log(error);
            }).then(function(response){

            });

            $("#" + id).parent().remove();

};


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
                return (entry.Position === "QB" || entry.Position === "RB" || entry.Position === "WR" || entry.Position === "TE") &&
                    entry.FanDuelPlayerID !== null &&
                    entry.Active === true &&
                    entry.FanDuelPlayerID !== 6828 &&
                    entry.FanDuelPlayerID !== 41922 &&
                    entry.FanDuelPlayerID !== 40857 &&
                    entry.FanDuelPlayerID !== 72676;
            });

            allplayers = sortDscByKey(players, "UpcomingSalary");

            allplayers.forEach(function(thisplayer) {
                thisplayer.PhotoUrl = "https://d17odppiik753x.cloudfront.net/playerimages/nfl/" + thisplayer.FanDuelPlayerID + ".png";
                if(thisplayer.UpcomingSalary === null){
                  thisplayer.UpcomingSalary = 0;
                }
            });

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
                    Price: myPlayer.UpcomingSalary,
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


/* check to see if any of my watched players are injured */
getInjuries = function(myPlayers) {

    var params = {
        // Request parameters
    };

    $.ajax({
            url: "https://api.fantasydata.net/v3/nfl/stats/JSON/Injuries/2016REG/" + currentweek + "?" + $.param(params),
            beforeSend: function(xhrObj) {
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", apikey);
            },
            type: "GET",
            // Request body
            data: "{body}",
        })
        .done(function(injuredPlayers) {

            var myInjuredPlayers = injuredPlayers.filter(function(player) {
                for (var i = 0; i < myPlayers.length; i++) {
                    return player.PlayerID == myPlayers[i].PlayerID && (player.InjuryID != myPlayers[i].Injured) && (player.DeclaredInactive != myPlayers[i].Active);
                }


                /* TODO: use myInjuredPlayers array to update
                status in db and send notifications */

            });
        }).
    fail(function() {

    });

};

/*** salary change, && scoring details!
My current fantasydata.com subscription only allows
changes after games. ***/
function getWatchlistDetails(myPlayers) {

    var params = {
        // Request parameters
    };


    myPlayers.forEach(function(player) {
        $.ajax({
                url: "https://api.fantasydata.net/v3/nfl/stats/JSON/Player/" + player.PlayerID + "?" + $.param(params),
                beforeSend: function(xhrObj) {
                    // Request headers
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", apikey);
                },
                type: "GET",
                // Request body
                data: "{body}",
            })
            .done(function(data) {
                console.log(data);
            })
            .fail(function() {

            });
    });
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
                if (currentweek == 'undefined' || currentweek != data) {


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
 Defining the index controller prototype
*/
function IndexController() {

    this.db = openDatabase();
    this.registerServiceWorker();

}

/*
Register our little helper!
*/
IndexController.prototype.registerServiceWorker = function() {

    if ('serviceWorker' in navigator) {
        //console.log('Service Worker is supported')

      navigator.serviceWorker
        .register('./service-worker.js', {
            scope: './'
        })
        .then(function(reg) {

            reg.pushManager.subscribe({
              userVisibleOnly: true
            }).then(function(sub) {


                  //subscription = JSON.stringify(sub);

                  firebase.database().ref(username + '/endpoints').update({
                    subscription: JSON.stringify(sub)
                  });
                  // Get a key for a new Post.
                  //var newPostKey = firebase.database().ref().child('posts').push().key;

              //console.log('endpoint:', sub.endpoint);
              //onsole.log(subscription.keys);

            }).catch(function(err){
              console.log("could not subscribe");
            });

            if (reg.waiting) {

				      navigator.serviceWorker.postMessage({ action: 'skipWaiting' });
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

  }


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
      self.registration.showNotification("UPDATE AVAILABLE", {
        body: 'Do you want to update to the newest version?',
        icon: 'assets/images/football-launcher-96.png',
        vibrate: [200, 100, 200, 100, 200, 100, 400],
        tag: 'request',

      });

        }
    });
};

var Controller = new IndexController();


$(document).ready(function() {
    setCurrentWeek();

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
        if (response.length === 0) {
            /* no watched players to check...dont bother calling the api */

        } else {
            //getInjuries(response);
            //getWatchlistDetails(response);
        }
    });

});
