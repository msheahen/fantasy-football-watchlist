# fantasy-football-watchlist
Progressive web app which lets you receive some push notifications for players.

# Demo
https://fantasy-football-watchlist.firebaseapp.com

# Description
This app consists of 3 mains parts:

1. Firebase database & google cloud messaging service(gcm).
2. Front end client which receives push notifications from gcm.
3. Web server which sends push notifications to gcm and reads from firebase database.

## Firebase database and google cloud messaging service
Third party hosting, database, and messaging service that store user choices and endpoints.  (an endpoint will tell gcm where to send a notification)

## Client side app pages:
1. Watchlist: This is the page where saved players can be seen with their salaries and rank
2. Player list:  List of all active offensive players in the league currently, where users can select which players to add to their list.
3. Schedule:  This is a page with offline-first capability where the user can always see the NFL schedule for 2016, regardless of whether the fantasy football api is up or not.

## Web server for sending notifications
The Node.js web server is meant to connect the firebase database, check a user's list of watched players, and continually query the fantasy football api in order to see if the player's statuses (salary or injury status change are the only notifications sent currently) and can send notifications to endpoints for those users watching a particular player.

# Installing

## Client side:
1. Navigate inside project root folder
2. In terminal, run the command ```npm install```
3. Run the command ```gulp serve```

The project should now be running on localhost:3000

## Web server side:
1. Open a new terminal window, and navigate inside the same project.  Once inside the project, navigate inside the 'server' folder
2. In terminal, run the command ```npm install```
3. Run the command ```node index.js```

The server code should now be running on localhost:3030

## See the notifications in action!
1. Open the web app on port 3000, and add a player to your watchlist by clicking the "+" button to add them
2. If you are using chrome, you should see a notification that their salary has changed.  This is an example of how the notifications could be used.

Enjoy!

## Offline Functionality
For this app, the nfl schedule is fully visible offline.  The watchlist and players pages are visible offline if the user has previously loaded those pages on that particular browser before.

# Technologies Used

1. Node.js
2. Firebase (Hosting and database)
3. Handlebars.js
4. Google Cloud Messaging
5. jQuery
6. Twitter Bootstrap
