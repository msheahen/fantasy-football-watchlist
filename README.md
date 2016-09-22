# fantasy-football-watchlist
Progressive web app which lets you receive some push notifications for players.

# Demo
https://fantasy-football-watchlist.firebaseapp.com

# Description
This app consists of 3 mains parts:

1. Firebase database & google cloud messaging service.
2. Front end client which receives push notifications from gcm.
3. Web server which sends push notifications to gcm and reads from firebase database.

# Installing

Client side:
```npm install```
```gulp serve```

Web server side:
```npm install```
```node index.js```

# Technologies Used

1. Node.js
2. Firebase
3. Handlebars.js
4. Google Cloud Messaging
5. jQuery
6. Twitter Bootstrap
