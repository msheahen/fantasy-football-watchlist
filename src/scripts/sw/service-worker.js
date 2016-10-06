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
    './assets/js/vendor.js',
    './assets/js/app.js',
    './assets/css/bootstrap.min.css',
		'./assets/css/main.css',
    './assets/data/players.json',
    './assets/data/schedule.json',
    './assets/data/teams.json'
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
    reg.pushManager.subscribe({
        userVisibleOnly: true
    }).then(function(sub) {

        console.log(sub);
        //subscription = JSON.stringify(sub);
        // Create a callback to handle the result of the authentication
        firebase.database().ref('mary/endpoints/').set({
          endpoint: sub.subscription,
        });

        //username = sub.endpoint;
        // Get a key for a new Post.
        //var newPostKey = firebase.database().ref().child('posts').push().key;

        //console.log('endpoint:', sub.endpoint);
        //onsole.log(subscription.keys);

    }).catch(function(err) {
        console.log("could not subscribe");
    });
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
