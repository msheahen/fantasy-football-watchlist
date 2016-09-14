$(document).ready(function(){

if(path == '/' || path == '/index.html'){

  var db = openDatabase();

  db.then(function(db) {

    if (!db){
      console.log('No database!');
      return;
    }
		var tx = db.transaction('players', 'readwrite');
		var store = tx.objectStore('players');

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

}

});
