var currentCacheName="fantasy-football-watchlist-v1";self.addEventListener("install",function(t){var e=["./","./index.html","./all-players.html","./assets/js/vendor.js","./assets/js/app.js","./assets/css/bootstrap.min.css","./assets/css/main.css","./assets/data/players.json","./assets/data/schedule.json","./assets/data/teams.json"];t.waitUntil(caches.open(currentCacheName).then(function(t){return t.addAll(e)}))}),self.addEventListener("activate",function(t){t.waitUntil(caches.keys().then(function(t){return Promise.all(t.filter(function(t){return t.startsWith("mtba-trans-")&&t!=currentCacheName}).map(function(t){return caches["delete"](t)}))}))}),self.addEventListener("fetch",function(t){t.respondWith(caches.match(t.request).then(function(e){return e||fetch(t.request)}))}),self.addEventListener("message",function(t){"skipWaiting"===t.data.action&&self.skipWaiting()});