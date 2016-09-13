$(document).ready(function(){

if(path != '/'){
  fetch('./assets/data/players.json')
    .then(function(response){
      return response.json();
    }).catch(function(error){
      console.log(error);
    }).then(function(response){

      var players = response.Players;
      var theTemplateScript = $("#players-list").html();
      var theTemplate = Handlebars.compile(theTemplateScript);
      $("#playersList").append(theTemplate(players));

    });

  }

});
