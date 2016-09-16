$(document).ready(function(){

if(path == '/' || path == '/index.html'){

  var db = openDatabase();

  db.then(function(db) {

    if (!db){
      console.log('No database!');
      return;
    }
		var tx = db.transaction('myplayers', 'readwrite');
		var store = tx.objectStore('myplayers');

		return store.getAll();

	}).catch(function(err){
  }).then(function(response) {

		if ( response.length === 0 ) {

			return Promise.reject();
		} else {

      var players = response;
      var theTemplateScript = $("#my-players-list").html();
      var theTemplate = Handlebars.compile(theTemplateScript);
      $("#myPlayersList").append(theTemplate(players));


		}

	}).catch(function(error){

  });

  $("#all").click(function() {
      filterPlayersBy("ALL");
  });
  $("#qb").click(function() {
      filterPlayersBy("QB");
  });
  $("#rb").click(function() {
      filterPlayersBy("RB");
  });
  $("#k").click(function() {
      filterPlayersBy("K");
  });
  $("#wr").click(function() {
      filterPlayersBy("WR");
  });
  $("#te").click(function() {
      filterPlayersBy("TE");
  });
  $("#flex").click(function() {
      filterPlayersBy("FLEX");
  });

}

});
