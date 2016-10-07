/* Global variables */
var path = window.location.pathname;
var page = path.split("/").pop();
var allplayers;
var myplayers;
var username = null;
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

Handlebars.registerHelper("getIndex", function(index) {
    return index + 1;
});

function setPlayerList(array) {
    allplayers = array;
}

function setMyPlayerList(array) {
    myplayers = array;
}

/************************************
function to add a player to our Watchlist
************************************/
addPlayerToWatchlist = function(id) {

    var player = allplayers.filter(function(entry) {
        return entry.PlayerID === parseInt(id);
    });

    var myPlayer = player[0];

    if (myPlayer.Injured === undefined) {
        myPlayer.Injured = false;
    }

    firebase.database().ref('mary/players/' + myPlayer.PlayerID).set({
        player: myPlayer.Name,
        salary: myPlayer.UpcomingSalary,
        injured: myPlayer.Injured
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

/****************************************
function to remove player from our Watchlist
*****************************************/
removePlayerFromWatchlist = function(id) {

    var db = openDatabase();
    db.then(function(db) {
        firebase.database().ref('mary/players/' + id).remove();
        var tx = db.transaction('myplayers', 'readwrite');
        var store = tx.objectStore('myplayers');
        store.delete(parseInt(id));
        return tx.complete;
    }).catch(function(error) {
        console.log(error);
    });

    $("#" + id).parent().remove();

};



/*************************************
Function to filter players using the buttons at the top
*************************************/
filterPlayersBy = function(param) {

    if (allplayers !== undefined) {

        var filteredPlayersList;
        if (param == "ALL") {
            filteredPlayersList = allplayers;
        } else if (param == "FLEX") {
            filteredPlayersList = allplayers.filter(function(entry) {
                return entry.Position === "RB" ||
                    entry.Position === "WR" ||
                    entry.Position === "TE";
            });
        } else {
            filteredPlayersList = allplayers.filter(function(entry) {
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
    }
};

/*************************************
Function to filter watchlist players using the buttons at the top
*************************************/
filterMyPlayersBy = function(param) {

    if (myplayers !== undefined) {

        var filteredPlayersList;
        if (param == "ALL") {
            filteredPlayersList = myplayers;
        } else if (param == "FLEX") {
            filteredPlayersList = myplayers.filter(function(entry) {
                return entry.Position === "RB" ||
                    entry.Position === "WR" ||
                    entry.Position === "TE";
            });
        } else {
            filteredPlayersList = myplayers.filter(function(entry) {
                return entry.Position === param;
            });
        }

        var theTemplateScript = $("#my-players-list").html();
        var theTemplate = Handlebars.compile(theTemplateScript);
        $("#myPlayersList").html("");
        $("#myPlayersList").append(theTemplate(filteredPlayersList));
        $(".player-to-remove").on('click', function() {

            removePlayerFromWatchlist($(this).attr('id'));
        });
    }
};




/**********************************************************************
 Function to get all the current active players from the fantasydata API
 *********************************************************************/
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
                if (thisplayer.UpcomingSalary === null) {
                    thisplayer.UpcomingSalary = 0;
                }
            });

            var theTemplateScript = $("#players-list").html();
            var theTemplate = Handlebars.compile(theTemplateScript);
            $("#playersList").append(theTemplate(allplayers));
            $("#load").css({
                "display": "none"
            });

            $(".player-to-add").on('click', function() {
                addPlayerToWatchlist($(this).attr('id'));
            });

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
                    UpcomingSalary: myPlayer.UpcomingSalary,
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


/**********************************
function to open database in idb
************************************/
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

/*******************************
 This is how we find the current week of the 2016 season.
 *********************************/
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


                }

            })
            .fail(function() {
                console.log('unable to reach api');
            });


    });

}



/********************************
 Defining the index controller prototype
************************************/

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

                if (reg.waiting) {
                    navigator.serviceWorker.postMessage({
                        action: 'skipWaiting'
                    });
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


        /* Once the service worker is ready, subscribe add add the endpoint to our db!*/
        navigator.serviceWorker.ready.then(function(reg) {
            reg.pushManager.subscribe({
                userVisibleOnly: true
            }).then(function(sub) {

                subscription = JSON.stringify(sub);

                //insert endpoint into firebase DB to receive notifications
                firebase.database().ref('mary/endpoint/').set(subscription);

            }).catch(function(err) {
                console.log("could not subscribe");
            });
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

            console.log('update available!');

        }
    });
};

var Controller = new IndexController();


$(document).ready(function() {

    setCurrentWeek();

});
