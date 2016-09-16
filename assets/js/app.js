function sortAscByKey(e,t){return e.sort(function(e,r){var n=e[t],a=r[t];return n<a?-1:n>a?1:0})}function sortDscByKey(e,t){return e.sort(function(e,r){var n=e[t],a=r[t];return n>a?-1:n<a?1:0})}function fetchPlayers(){var e={};$.ajax({url:"https://api.fantasydata.net/v3/nfl/stats/JSON/Players?"+$.param(e),beforeSend:function(e){e.setRequestHeader("Ocp-Apim-Subscription-Key",apikey)},type:"GET",data:"{body}"}).done(function(e){var t=e.filter(function(e){return("QB"===e.Position||"RB"===e.Position||"WR"===e.Position||"K"===e.Position||"TE"===e.Position)&&e.Active===!0});allplayers=sortDscByKey(t,"UpcomingYahooSalary");var r=$("#players-list").html(),n=Handlebars.compile(r);$("#playersList").append(n(allplayers)),$(".player-to-add").on("click",function(){addPlayerToWatchlist($(this).attr("id"))});var a=[];allplayers.forEach(function(e){a.push({PlayerID:e.PlayerID,Name:e.Name,Position:e.Position,Team:e.Team,Active:e.Active,Injured:e.Injured,PhotoUrl:e.PhotoUrl,Price:e.UpcomingYahooSalary})});var o=openDatabase();o.then(function(e){var t=e.transaction("allplayers","readwrite"),r=t.objectStore("allplayers");for(i=0;i<a.length;i++)r.put(a[i]);return t.complete})["catch"](function(e){console.log(e)})})}function openDatabase(){return navigator.serviceWorker?idb.open("fantasy-football-watchlist",1,function(e){e.createObjectStore("allplayers",{keyPath:"PlayerID"}),e.createObjectStore("myplayers",{keyPath:"PlayerID"}),e.createObjectStore("currentweek",{keyPath:"week"})}):Promise.resolve()}function IndexController(){this.db=openDatabase(),this.registerServiceWorker()}function setCurrentWeek(){var e=openDatabase();e.then(function(e){if(!e)return void console.log("No database!");var t=e.transaction("currentweek","readwrite"),r=t.objectStore("week");return r.getAll()})["catch"](function(e){}).then(function(e){var t={};$.ajax({url:"https://api.fantasydata.net/v3/nfl/scores/JSON/CurrentWeek?"+$.param(t),beforeSend:function(e){e.setRequestHeader("Ocp-Apim-Subscription-Key",apikey)},type:"GET",data:"{body}"}).done(function(t){if(e=t,"undefined"==t||currentweek!=t){var r=openDatabase();r.then(function(e){var r=e.transaction("currentweek","readwrite"),n=r.objectStore("currentweek"),a={week:t};return n.put(a),r.complete})["catch"](function(e){console.log(e)})}}).fail(function(){console.log("unable to reach api")})})}var path=window.location.pathname,page=path.split("/fantasy-football-watchlist").pop(),allplayers,apikey="9130e31adba74e27b4c44d17ac5f29e5",currentweek;IndexController.prototype.registerServiceWorker=function(){if(!("serviceWorker"in navigator))return void alert("WARNING: your web browser doesn't fully support this app.  Try this app in chrome.",null,"dismiss");navigator.serviceWorker.register("./service-worker.js",{scope:"./"}).then(function(e){if(!e.waiting)return e.installing?void Controller.trackInstalling(e.installing):void e.addEventListener("updatefound",function(){Controller.trackInstalling(e.installing)})})["catch"](function(e){console.log("Service Worker Failed to Register",e)});var e;navigator.serviceWorker.addEventListener("controllerchange",function(){e||(window.location.reload(),e=!0)})},IndexController.prototype.trackInstalling=function(e){e.addEventListener("statechange",function(){"installed"==e.state})};var Controller=new IndexController;$(document).ready(function(){setCurrentWeek()}),addPlayerToWatchlist=function(e){var t=allPlayers.filter(function(t){return t.PlayerID===parseInt(e)}),r=t[0],n={PlayerID:r.PlayerID,Name:r.Name,Position:r.Position,Team:r.Team,Active:r.Active,Injured:r.Injured,PhotoUrl:r.PhotoUrl,Price:r.UpcomingYahooSalary},a=openDatabase();a.then(function(e){var t=e.transaction("myplayers","readwrite"),r=t.objectStore("myplayers");return r.put(n),t.complete})["catch"](function(e){console.log(e)})},filterPlayersBy=function(e){var t;t="ALL"==e?allPlayers:"FLEX"==e?allPlayers.filter(function(e){return"RB"===e.Position||"WR"===e.Position||"TE"===e.Position}):allPlayers.filter(function(t){return t.Position===e});var r=$("#players-list").html(),n=Handlebars.compile(r);$("#playersList").html(""),$("#playersList").append(n(t)),$(".player-to-add").on("click",function(){addPlayerToWatchlist($(this).attr("id"))})},$(document).ready(function(){if("/fantasy-football-watchlist/all-players.html"==path){var e=openDatabase();e.then(function(e){if(!e)return void console.log("No database!");var t=e.transaction("allplayers","readwrite"),r=t.objectStore("allplayers");return r.getAll()})["catch"](function(e){}).then(function(e){if(0===e.length)return Promise.reject();allPlayers=sortDscByKey(e,"Price");var t=$("#players-list").html(),r=Handlebars.compile(t);$("#playersList").append(r(sortDscByKey(e,"Price"))),$(".player-to-add").on("click",function(){addPlayerToWatchlist($(this).attr("id"))})})["catch"](function(e){fetchPlayers()}),$("#all").click(function(){filterPlayersBy("ALL")}),$("#qb").click(function(){filterPlayersBy("QB")}),$("#rb").click(function(){filterPlayersBy("RB")}),$("#k").click(function(){filterPlayersBy("K")}),$("#wr").click(function(){filterPlayersBy("WR")}),$("#te").click(function(){filterPlayersBy("TE")}),$("#flex").click(function(){filterPlayersBy("FLEX")})}}),$(document).ready(function(){"/fantasy-football-watchlist/nfl-schedule.html"==path&&fetch("./assets/data/schedule.json").then(function(e){return e.json()})["catch"](function(e){return console.log(e),e}).then(function(e){var t=e.Schedule,r=$("#schedule-list").html(),n=Handlebars.compile(r);$("#scheduleList").append(n(t))})["catch"](function(e){return console.log(e),e})}),$(document).ready(function(){if("/fantasy-football-watchlist/"==path||"/index.html"==path){var e=openDatabase();e.then(function(e){if(!e)return void console.log("No database!");var t=e.transaction("myplayers","readwrite"),r=t.objectStore("myplayers");return r.getAll()})["catch"](function(e){}).then(function(e){if(0===e.length)return Promise.reject();var t=e,r=$("#my-players-list").html(),n=Handlebars.compile(r);$("#myPlayersList").append(n(t))})["catch"](function(e){}),$("#all").click(function(){filterPlayersBy("ALL")}),$("#qb").click(function(){filterPlayersBy("QB")}),$("#rb").click(function(){filterPlayersBy("RB")}),$("#k").click(function(){filterPlayersBy("K")}),$("#wr").click(function(){filterPlayersBy("WR")}),$("#te").click(function(){filterPlayersBy("TE")}),$("#flex").click(function(){filterPlayersBy("FLEX")})}});
