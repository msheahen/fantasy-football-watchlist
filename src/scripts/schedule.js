var allgames;
var allTeams;

$(document).ready(function() {

    if (path == '/nfl-schedule.html') {

        fetch('./assets/data/teams.json')
            .then(function(response) {
                return response.json();
            }).then(function(teams) {
                allTeams = teams.NFLteams;
            });

        var db = openDatabase();

        db.then(function(db) {

            if (!db) {
                console.log('No database!');
                return;
            }
            var tx = db.transaction('currentweek', 'readwrite');
            var store = tx.objectStore('currentweek');

            return store.getAll();
        }).then(function(thisweek) {
            if (thisweek.length === 0 || thisweek === 'undefined') {
                $("#week").val("1");
            } else {
                $("#week").val(thisweek[0].week.toString());
            }

            fetch('./assets/data/schedule.json')
                .then(function(response) {
                    return response.json();
                }).catch(function(error) {
                    console.log(error);
                    return error;
                }).then(function(response) {

                    allgames = response.Schedule;

                    var games = allgames.filter(function(game) {
                        return game.gameWeek === $("#week").val();
                    });
                    var theTemplateScript = $("#schedule-list").html();
                    var theTemplate = Handlebars.compile(theTemplateScript);
                    $("#scheduleList").append(theTemplate(games));
                }).catch(function(error) {
                    console.log(error);
                    return error;
                });
        }).catch(function(err) {

            $("#week").val("1");
            fetch('./assets/data/schedule.json')
                .then(function(response) {
                    return response.json();
                }).catch(function(error) {
                    console.log(error);
                    return error;
                }).then(function(response) {

                    allgames = response.Schedule;
                    var games = allgames.filter(function(game) {
                        return game.gameWeek === $("#week").val();
                    });

                    var theTemplateScript = $("#schedule-list").html();
                    var theTemplate = Handlebars.compile(theTemplateScript);
                    $("#scheduleList").append(theTemplate(games));
                }).catch(function(error) {
                    console.log(error);
                    return error;
                });
        });



        $("#week").change(function(e) {

            $("#scheduleList").html("");
            var selectedWeek = $(this).val();

            var filteredgames = allgames.filter(function(game) {
                return game.gameWeek === selectedWeek;
            });

            var theTemplateScript = $("#schedule-list").html();
            var theTemplate = Handlebars.compile(theTemplateScript);
            $("#scheduleList").append(theTemplate(filteredgames));

        });

    }

});
