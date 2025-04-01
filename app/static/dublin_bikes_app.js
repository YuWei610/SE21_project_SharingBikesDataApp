var currentInfoWindow = null; // Setting default value of this variable as none. Will help ensure that when one window is opened the other is closed automatically.
var markers = [];
var markersVisible = true;
var map, directionsService, directionsRenderer;

// Main function. Takes json data from flask that is connected to the DB (local) and creates a marker for each station on the google map.
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: {lat: 53.346265, lng: -6.259246},
    mapTypeControl: false,
    fullScreenControl:false,
});

directionsService = new google.maps.DirectionsService();
directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
});

    fetch('/stations') 
        .then(response => response.json())
        .then(data => {
            console.log(data);
            data.forEach(function (station) {

            var lat = parseFloat(station.Latitude);
            var lon = parseFloat(station.Longitude);

        if (!isNaN(lat) && !isNaN(lon)) {
            var marker = new google.maps.Marker({
                position: {lat: lat, lng: lon},
                map: map,
                title:"<b>" + station.Name + "</b>"
            });

            markers.push(marker);

        //  Create info window for each station (station name).
            var infoWindow = new google.maps.InfoWindow({
            content: "<b style='font-weight: bold;'>" + station.Name + "</b>",
            maxWidth: 250,
            });

            marker.isOpen = false;

            marker.addListener('click', function() {
                if (currentInfoWindow) {
                currentInfoWindow.close();
            }

                if (this.isOpen) {
                    infoWindow.close();
                    this.isOpen = false;
                } else {
                    map.setZoom(16);
                    map.setCenter(marker.getPosition());
            
                    fetch(`/dynamic/${station.Number}`)
                        .then(response => response.json())
                        .then(data => {
                            var content = "<div class='info-content'><b style='font-weight: bold;'>"  + station.Name + "</b>";
                            content += "<p>Station Number: " + station.Number + "</p>"
                            content += "<p>Available Bikes: " + data.available_bikes + "</p>";
                            content += "<p>Mechanical Bikes: " + data.mechanical_bikes + "</p></div>";
                            content += "<p>Electrical Bikes: " + data.electrical_bikes + "</p></div>";
                            content += "<p>Available Bike Stands: " + data.available_bike_stands + "</p>";
                            content += "<p>Current Status: " + data.status + "</p>"
                            content += "<p>Last Updated: " + data.last_update + "</p></div>";
                            
                            infoWindow.setContent(content);
                            infoWindow.open(map, marker);
                            currentInfoWindow = infoWindow;
                            });
                                                
                        infoWindow.open(map, marker);
                    
                        currentInfoWindow = infoWindow;
                        this.isOpen = true;
                        map.panTo(marker.getPosition());
                    }
                });

                google.maps.event.addListener(infoWindow, 'closeclick', function() {
                    marker.isOpen = false;
                });

                marker.addListener('mouseover', function() {
                    if (!marker.isOpen) {
                    infoWindow.open(map, marker);
                    }
                });

                marker.addListener('mouseout', function() {
                    if (!marker.isOpen) {
                    infoWindow.close();
                    }
                });

            } else {
                console.error("Invalid lat/lon values:", station);
            }
        });
    });

    fetchWeather()
}

// 使用OpenWeatherMap API获取天气数据
const apiKey = '597b17711b1b951ff3254b78f58df59d'; // 替换为你的OpenWeatherMap API密钥
const city = 'Dublin'; // 你可以根据需要更改城市
const weatherElement = document.getElementById('weather');

function fetchWeather() {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const weather = data.weather[0].description;
            const temp = data.main.temp;
            weatherElement.textContent = `${city}: ${temp}°C, ${weather}`;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            weatherElement.textContent = 'Failed to load weather data';
        });

    document.getElementById('planJourneyBtn').addEventListener('click', function (e) {
        e.preventDefault(); 
        calculateRoute();
    });
}

function calculateRoute() {
    var start = document.getElementById('startinglocation').value;
    var destination = document.getElementById('destination').value;

    if (start && destination) {
        start = start + ', Dublin';
        destination = destination + ', Dublin';
        
        var request = {
            origin: start,
            destination: destination,
            travelMode: google.maps.TravelMode.BICYCLING,  
        };

        directionsService.route(request, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);

                var route = response.routes[0];
                var leg = route.legs[0]; 
                var duration = leg.duration.text; 
                var distance = leg.distance.text; 

                var journeyDetails = document.getElementById('journeyDetails');
                journeyDetails.innerHTML = `<b>Estimated Journey:</b><br>Duration: ${duration}<br>Distance: ${distance}`;
            } else {
                alert('Could not find a route between the locations.');
            }
        });
    } else {
        alert('Please enter both start and destination locations.');
    }
}

function toggleMarkersVisibility() {
    markersVisible = !markersVisible;
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(markersVisible ? map : null);
    }

    document.getElementById('station_button').innerText = markersVisible ? 'Hide Stations' : 'Show Stations';
}

window.onload = function() {
    initMap();
};