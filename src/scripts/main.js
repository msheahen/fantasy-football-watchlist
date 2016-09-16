var path = window.location.pathname;
var page = path.split("/").pop();
var currentweek;

function sortAscByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function sortDscByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
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

    /* get week from cache*/
    $.ajax({
            url: "https://api.fantasydata.net/v3/nfl/scores/{format}/CurrentWeek?" + $.param(params),
            beforeSend: function(xhrObj) {
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", apikey);
            },
            type: "GET",
            // Request body
            data: "{body}",
        })
        .done(function(data) {
            currentweek = data;
        })
        .fail(function() {

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
