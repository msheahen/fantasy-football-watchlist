function openDatabase(){return navigator.serviceWorker?idb.open("fantasy-football-watchlist",1,function(t){t.createObjectStore("players",{keyPath:"playerId"})}):Promise.resolve()}function IndexController(){this.db=openDatabase(),this.registerServiceWorker()}var path=window.location.pathname,page=path.split("/").pop();IndexController.prototype.registerServiceWorker=function(){if(!("serviceWorker"in navigator))return void alert("WARNING: your web browser doesn't fully support this app.  Try this app in chrome.",null,"dismiss");navigator.serviceWorker.register("./service-worker.js",{scope:"./"}).then(function(t){if(!t.waiting)return t.installing?void Controller.trackInstalling(t.installing):void t.addEventListener("updatefound",function(){Controller.trackInstalling(t.installing)})})["catch"](function(t){console.log("Service Worker Failed to Register",t)});var t;navigator.serviceWorker.addEventListener("controllerchange",function(){t||(window.location.reload(),t=!0)})},IndexController.prototype.trackInstalling=function(t){t.addEventListener("statechange",function(){"installed"==t.state})};var Controller=new IndexController,allplayers;addPlayerToWatchlist=function(t){fetch("assets/data/players.json").then(function(t){return t.json()})["catch"](function(t){return console.log(t),t}).then(function(e){var n=e.Players.filter(function(e){return e.playerId===t}),r=n[0],a={playerId:r.playerId,displayName:r.displayName,position:r.position,team:r.team,active:r.active},o=openDatabase();o.then(function(t){var e=t.transaction("players","readwrite"),n=e.objectStore("players");return n.put(a),e.complete})["catch"](function(t){console.log(t)})})},filterPlayersBy=function(t){fetch("assets/data/players.json").then(function(t){return t.json()})["catch"](function(t){return console.log(t),t}).then(function(e){var n;n="ALL"==t?e.Players:"FLEX"==t?e.Players.filter(function(t){return"RB"===t.position||"WR"===t.position||"TE"===t.position}):e.Players.filter(function(e){return e.position===t});var r=$("#players-list").html(),a=Handlebars.compile(r);$("#playersList").html(""),$("#playersList").append(a(n)),$(".player-to-add").on("click",function(){addPlayerToWatchlist($(this).attr("id"))})})},$(document).ready(function(){"/fantasy-football-watchlist/all-players.html"==path&&(allplayers=fetch("assets/data/players.json").then(function(t){return t.json()})["catch"](function(t){return console.log(t),t}).then(function(t){var e=t.Players,n=$("#players-list").html(),r=Handlebars.compile(n);return $("#playersList").append(r(e)),$(".player-to-add").on("click",function(){addPlayerToWatchlist($(this).attr("id"))}),e})["catch"](function(t){return console.log(t),t}),$("#all").click(function(){filterPlayersBy("ALL")}),$("#qb").click(function(){filterPlayersBy("QB")}),$("#rb").click(function(){filterPlayersBy("RB")}),$("#wr").click(function(){filterPlayersBy("WR")}),$("#te").click(function(){filterPlayersBy("TE")}),$("#flex").click(function(){filterPlayersBy("FLEX")}))}),$(document).ready(function(){"/fantasy-football-watchlist/nfl-schedule.html"==path&&fetch("assets/data/schedule.json").then(function(t){return t.json()})["catch"](function(t){return console.log(t),t}).then(function(t){var e=t.Schedule,n=$("#schedule-list").html(),r=Handlebars.compile(n);$("#scheduleList").append(r(e))})["catch"](function(t){return console.log(t),t})}),$(document).ready(function(){if("/fantasy-football-watchlist/"==path||"/fantasy-football-watchlist/index.html"==path){var t=openDatabase();t.then(function(t){if(!t)return void console.log("No database!");var e=t.transaction("players","readwrite"),n=e.objectStore("players");return n.getAll()})["catch"](function(t){}).then(function(t){if(0===t.length)return Promise.reject();var e=t,n=$("#my-players-list").html(),r=Handlebars.compile(n);$("#myPlayersList").append(r(e))})["catch"](function(t){})}});
