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
      $("#myPlayersList").html('<div class="alert"><strong>Warning</strong> You don\'t current have any watched players.  Navigate to the Players tab to start adding players.</div>');
			return Promise.reject();
		} else {

      //sort my players by price
      setMyPlayerList(sortDscByKey(response, "UpcomingSalary"));

      var theTemplateScript = $("#my-players-list").html();
      var theTemplate = Handlebars.compile(theTemplateScript);
      $("#myPlayersList").append(theTemplate(myplayers));
      $(".player-to-remove").on('click', function() {
          removePlayerFromWatchlist($(this).attr('id'));
      });

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
  $("#wr").click(function() {
      filterPlayersBy("WR");
  });
  $("#te").click(function() {
      filterPlayersBy("TE");
  });
  $("#flex").click(function() {
      filterPlayersBy("FLEX");
  });

  $("#namequery").keyup(function(e){
    var filterString = $(this).val();

    filteredPlayersList = myplayers.filter(function(entry){
            return entry.Name.toUpperCase().includes(filterString.toUpperCase());
          });


        var theTemplateScript = $("#my-players-list").html();
        var theTemplate = Handlebars.compile(theTemplateScript);
        $("#myPlayersList").html("");
        $("#myPlayersList").append(theTemplate(filteredPlayersList));
        $(".player-to-remove").on('click', function() {

            removePlayerFromWatchlist($(this).attr('id'));
        });

  });

}

});
