$(document).ready(function(){

if(path == '/nfl-schedule.html'){
  fetch('./assets/data/schedule.json')
    .then(function(response){
      return response.json();
    }).catch(function(error){
      console.log(error);
      return error;
    }).then(function(response){

      var games = response.Schedule;
      var theTemplateScript = $("#schedule-list").html();
      var theTemplate = Handlebars.compile(theTemplateScript);
      $("#scheduleList").append(theTemplate(games));

    }).catch(function(error){
      console.log(error);
      return error;
    });
  }

});
