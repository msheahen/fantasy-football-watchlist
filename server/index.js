/**************************************

The webserver applet for the Fantasy Football Watchlist app.
The purpose of this server is to :

1. connect with firebase DB and periodically use user information to
   query fantasydata api about players.
2. If there's an event (player gets injured, player's weekly salary changes, or
   the app wants to send some other kind of notifications), the web server sends
   notifications via the GCM service!

This is written in Node.js

*************************************/

const express = require('express')
const app = express()
const port = 3030;
var apikey = "006d878c64fb4fffa74b4e6b4ce448e6";
var request = require('request-promise');
var firebase = require("firebase");
const webpush = require('web-push');
var $;

require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    } else {

        $ = require("jquery")(window);
    }
});

// VAPID keys should only be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();

/* check to see if any of my watched players are injured */
getInjuries = function(users) {

    var params = {
        // Request parameters
    };

    $.ajax({
            url: "https://api.fantasydata.net/v3/nfl/stats/JSON/Injuries/2016REG/" + currentweek,
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

function getPlayerDetails(player, id) {

    var message = null;
    var params = {
        // Request parameters
    };

    var options = {
        uri: 'https://api.fantasydata.net/v3/nfl/stats/JSON/Player/' + id,
        headers: {
            'Ocp-Apim-Subscription-Key': apikey
        },
        json: true // Automatically parses the JSON string in the response
    };

    var note = request(options)
        .then(function(info) {
            //console.log(info.UpcomingFanDuelSalary);
            if (info.UpcomingFanDuelSalary !== player.salary) {
                message = player.player + "'s Salary changed this week!";
            }

            return message;
        })
        .catch(function(err) {
            console.log(err);
        });

    return note;
}


firebase.initializeApp({
    serviceAccount: "creds.json",
    databaseURL: "https://fantasy-football-watchlist.firebaseio.com"
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);

    /* query database users, then get all user information (endpoints and players) */
    var db = firebase.database();
    var ref = db.ref("mary/endpoints/subscription");
    ref.on("value", function(snapshot) {

        var subscription = JSON.parse(snapshot.val());

        playerref = db.ref("mary/players");

        playerref.on("value", function(snap) {
            var players = snap.val();
            var playerIds = Object.keys(snap.val());

            /* check to see if each player ID has something notify-worthy */
            playerIds.forEach(function(playerId) {
                var message = getPlayerDetails(players[playerId], playerId);

                if (message !== null) {
                    console.log(message);
                    const options = {
                        gcmAPIKey: 'AIzaSyCldhOJ-zwVrkPXUcl9-UJqN7cymbZc5F4',
                        vapidDetails: {
                            subject: 'sheahen.m@gmail.com',
                            publicKey: vapidKeys.publicKey,
                            privateKey: vapidKeys.privateKey
                        },
                        userPublicKey: subscription.keys.p256dh,
                        userAuth: subscription.keys.auth,
                        payload: message,
                        TTL: 60
                    };

                    webpush.sendNotification(subscription.endpoint, options)
                        .then(function(response) {
                            //console.log(response);
                        }).catch(function(error) {
                            console.log(error);
                        });
                }

            });


        });


    });

});
