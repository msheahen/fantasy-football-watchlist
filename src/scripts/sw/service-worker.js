var currentCacheName = 'fantasy-football-watchlist-v1';
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

self.addEventListener('activate', function(event) {
	self.registration.pushManager.subscribe({
			userVisibleOnly: true
	}).then(function(sub) {
	/*  navigator.serviceWorker.registration.showNotification("SOMETHING HAPPENED!", {
			body: 'Are you free tonight?',
			icon: 'images/joe.png',
			vibrate: [200, 100, 200, 100, 200, 100, 400],
			tag: 'request',
			actions: [
				{ action: 'yes', title: 'Yes!' },
				{ action: 'no', title: 'No'}
			]
		});*/
			console.log('endpoint:', sub.endpoint);
	});
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

	if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/photos/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
  }


	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);

});

function servePhoto(request) {
  var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      if (response) return response;

      return fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});


self.addEventListener('push', function(event) {
  console.log('Push message received', event);
	self.registration.showNotification("SOMETHING HAPPENED!", {
    body: 'Are you free tonight?',
    icon: 'images/joe.png',
    vibrate: [200, 100, 200, 100, 200, 100, 400],
    tag: 'request',
    actions: [
      { action: 'yes', title: 'Yes!' },
      { action: 'no', title: 'No'}
    ]
  });
  // TODO
});
