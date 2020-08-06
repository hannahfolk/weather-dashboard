$(document).ready(function() {

    // Grab dates using moment.js
    var currentDate = moment().format("MM/DD/YYYY");
    var currentHour = moment().format("HH");

    // Make an array of cities to go in local storage
    var cities = [];

    // Grab name of city that has been searched
    $("#searchIcon").on("click", function(event) {
        event.preventDefault();

        if (($("#search").val() !== null) && ($("#search").val() !== "")) {
            extractInfo();
        } else {
            return;
        };

    });
    
    // Will extract info from the OpenWeatherMap API and display it to the page
    function extractInfo() {

        // The if statement will assign cityName to value that user has searched
        if (($("#search").val() !== null) && ($("#search").val() !== "")) {
            var cityName = $("#search").val().trim();
        } else {
            // The else part will assign cityName to city that user has clicked in search history
            var cityName = $(this).val();
        };

        // queryURL is the url for regular weather
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&apikey=572d14321ae6789e9c768be6fb36520d";
        // fiveDayURL is the url for five day forecast
        var fiveDayURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&apikey=572d14321ae6789e9c768be6fb36520d";

        // Resets the five day forecast section to empty
        var fiveDayRow = $("<div>");
        fiveDayRow.attr("class", "row");
        fiveDayRow.attr("id", "five-day-forecast-row");
        $("#five-day-forecast").empty();
        $("#five-day-forecast").append(fiveDayRow);

        // Capitalize the city name in case the user puts it in lower case
        cityName = capitalize(cityName);

        // AJAX call for regular weather
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            var temp = response.main.temp;
            var iconCode = response.weather[0].icon;
            var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
            var imgIcon = $("<img>");
            imgIcon.attr("src", iconURL);
            $("#infoHeader").append(imgIcon);
            $("#temperature").text("Temperature: " + temp + " \xB0F");
            $("#humidity").text("Humidity: " + response.main.humidity + "%");
            $("#wind-speed").text("Wind Speed: " + response.wind.speed + " MPH");
            
            // uvURL is the url for UV index
            var uvURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&apikey=572d14321ae6789e9c768be6fb36520d";

            // AJAX call for UV index
            $.ajax({
                url: uvURL,
                method: "GET"
            }).then(function(uvData) {
                $("#uv-index-label").text("UV Index: ");
                var uvIndexEl = $("<span>");
                uvIndexEl.attr("id", "uv-index");
                uvIndexEl.text(uvData.value);
                $("#uv-index-label").append(uvIndexEl);
            });
        });

        // AJAX call for five day forecast
        $.ajax({
            url: fiveDayURL,
            method: "GET"
        }).then(function(fiveDayData) {
          console.log(fiveDayData);
            var fiveDayList = fiveDayData.list;
            var currentTimeBlock = "00:00:00";

            // Change the current time block of three hours based on currentHour
            if (currentHour >= 0 && currentHour < 3) {
                currentTimeBlock = "00:00:00";
            } else if (currentHour >= 3 && currentHour < 6) {
                currentTimeBlock = "03:00:00";
            } else if (currentHour >= 6 && currentHour < 9) {
                currentTimeBlock = "06:00:00";
            } else if (currentHour >= 9 && currentHour < 12) {
                currentTimeBlock = "09:00:00";
            } else if (currentHour >= 12 && currentHour < 15) {
                currentTimeBlock = "12:00:00";
            } else if (currentHour >= 15 && currentHour < 18) {
                currentTimeBlock = "15:00:00";
            } else if (currentHour >= 18 && currentHour < 21) {
                currentTimeBlock = "18:00:00";
            } else if (currentHour >= 21 && currentHour < 24) {
                currentTimeBlock = "21:00:00";
            };
            
            // Append the forecasted information to the 5-day forecast area on the HTML
            for (var i = 0; i < fiveDayList.length; i++) {
                if (fiveDayList[i].dt_txt.includes(currentTimeBlock)) {
                    // Create the necessary elements
                    var divCol = $("<div>");
                    var divCard = $("<div>");
                    var divCardBody = $("<div>");
                    var h5El = $("<h5>");
                    var fiveDayImgIcon = $("<img>");
                    var pTemp = $("<p>");
                    var pHumidity = $("<p>");
                    var fiveDayDate = moment(fiveDayList[i].dt_txt).format("MM/DD/YYYY");
                    var fiveDayIconURL = "http://openweathermap.org/img/w/" + fiveDayList[i].weather[0].icon + ".png";

                    // Set attributes for the newly created elements
                    divCol.attr("class", "col forecasted-day");
                    divCol.attr("id", "day-" + (i + 2));
                    divCard.attr("class", "card");
                    divCardBody.attr("class", "card-body forecast");
                    h5El.attr("class", "card-title");
                    h5El.attr("id", "date-" + (i + 2));
                    pTemp.attr("class", "lead");
                    pHumidity.attr("class", "lead");

                    // Set the text content of the elements using the arrays that hold the data
                    // For the dates
                    h5El.text(fiveDayDate);
                    // For the temps
                    pTemp.text("Temp: " + fiveDayList[i].main.temp + " \xB0F");
                    // For the humidity
                    pHumidity.text("Humidity: " + fiveDayList[i].main.humidity + "%");

                    // Set the img src
                    fiveDayImgIcon.attr("src", fiveDayIconURL);

                    // Append elements to the five day forecast divs
                    $("#five-day-forecast-row").append(divCol);
                    divCol.append(divCard);
                    divCard.append(divCardBody);
                    divCardBody.append(h5El);
                    divCardBody.append(fiveDayImgIcon);
                    divCardBody.append(pTemp);
                    divCardBody.append(pHumidity);
                };
            };
        });

        // Store the recently searched city name into cities array
            // Then store the cities array in local storage
        cities.push(cityName);
        // To remove duplicates from an array
            // "..." will spread over the set "cities"
            // "new Set" changes cities into a set
            // Sets cannot have multiples of the same value so any duplicates get removed
            // [] around all of this changes it back into an array
        cities = [...new Set(cities)];
        localStorage.setItem("cities", JSON.stringify(cities));

        // Put current date into HTML
        $("#infoHeader").text(cityName + " " + "(" + currentDate + ")");

        // Put the header "5-Day Forecast" on the page
        var h3El = $("<h3>");
        h3El.text("5-Day Forecast");
        $("#five-day-forecast").prepend(h3El);

        // Reset the value of the input form to empty for good user experience
        $("#search").val("");

        renderCities();
    };

    // Proper case user-inputted city name
    function capitalize(name) {
        var splitName = name.split(" ");
        for (var i = 0; i < splitName.length; i++) {
            splitName[i] = splitName[i].charAt(0).toUpperCase() + splitName[i].substr(1).toLowerCase();
            // console.log(newName);
            var properName = splitName.join(" ");
            // console.log(properName);
        };
        return properName;
    };

    // Build the page with the most recently searched items added from local storage (as buttons)
    function renderCities() {
        $("#cities").empty();

        // Go backwards since most recent should be at the top
        for (var i = cities.length - 1; i >= 0; i--) {
            // Create a new div with class "card", and div with class "card-body", and button for each city
                // in the cities array
            var divCityCard = $("<div>");
            var divCityCardBody = $("<div>");
            var cityButton = $("<button>");

            cityButton.text(cities[i]);
    
            // Set the attributes for those elements
            divCityCard.attr("class", "card");
            divCityCardBody.attr("class", "card-body city");
            cityButton.attr("class", "btn btn-link navCity");
            cityButton.attr("value", cities[i]);
    
            // Append the attributes to the page
            $("#cities").append(divCityCard);
            divCityCard.append(divCityCardBody);
            divCityCardBody.append(cityButton);
        };
    };

    function init() {
        // Get the stored cities from local storage
        // Parse the JSON string into an object
        var storedCities = JSON.parse(localStorage.getItem("cities"));

        if (storedCities !== null) {
            cities = storedCities;
        }

        renderCities();
    }

    init();
    
    // Adding click event listeners to all elements with a class of "navCity"
    $(document).on("click", ".navCity", extractInfo);
});