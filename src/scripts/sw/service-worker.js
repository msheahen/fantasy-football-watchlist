var currentCacheName = 'fantasy-football-watchlist-v2';
var imageCache = 'fantasy-football-watchlist-images';

var allCaches = [
  currentCacheName,
  imageCache
];

self.addEventListener('install', function(event) {

	var filesToCache = [
		'./',
		'./index.html',
    './all-players.html',
    './nfl-schedule.html',
    './assets/js/vendor.js',
    './assets/js/app.js',
    './assets/css/bootstrap.min.css',
		'./assets/css/main.css',
    './assets/data/players.json',
    './assets/data/schedule.json',
    './assets/images/teams/ATL.gif',
    './assets/images/teams/ARI.gif',
    './assets/images/teams/BAL.gif',
    './assets/images/teams/BUF.gif',
    './assets/images/teams/CAR.gif',
    './assets/images/teams/CHI.gif',
    './assets/images/teams/CIN.gif',
    './assets/images/teams/CLE.gif',
    './assets/images/teams/DAL.gif',
    './assets/images/teams/DEN.gif',
    './assets/images/teams/DET.gif',
    './assets/images/teams/GB.gif',
    './assets/images/teams/HOU.gif',
    './assets/images/teams/IND.gif',
    './assets/images/teams/JAC.gif',
    './assets/images/teams/KC.gif',
    './assets/images/teams/LA.gif',
    './assets/images/teams/MIA.gif',
    './assets/images/teams/MIN.gif',
    './assets/images/teams/NE.gif',
    './assets/images/teams/NO.gif',
    './assets/images/teams/NYG.gif',
    './assets/images/teams/NYJ.gif',
    './assets/images/teams/OAK.gif',
    './assets/images/teams/PHI.gif',
    './assets/images/teams/PIT.gif',
    './assets/images/teams/SD.gif',
    './assets/images/teams/SEA.gif',
    './assets/images/teams/SF.gif',
    './assets/images/teams/TB.gif',
    './assets/images/teams/TEN.gif',
    './assets/images/teams/WAS.gif'
	];

	event.waitUntil(
		caches.open(currentCacheName).then(function(cache) {
			return cache.addAll(filesToCache);
		})
	);

});


//
self.addEventListener('activate', function(event) {

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('fantasy-football-watchlist') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});


self.addEventListener('fetch', function(event) {

	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);

});


self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});


/* sends push notifications and payload! */
self.addEventListener('push', function(event) {

	var jsonobj = event.data.text();

	self.registration.showNotification("ALERT", {
    body: jsonobj,
    icon: 'assets/images/football-launcher-96.png',
    vibrate: [200, 100, 200, 100, 200, 100, 400],
    tag: 'request'
  });

});
