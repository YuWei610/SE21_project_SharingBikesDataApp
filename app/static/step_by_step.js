// 🌐 Fallback map display (without Google Maps API)
function initMapWithoutAPI() {
  console.log("Fallback map initialization in use.");

  const mapElement = document.getElementById("map");
  mapElement.innerHTML =
    '<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background-color:#f0f0f0;"><p>❌ Map failed to load. You can still use the station list.</p></div>';
}

// 🗺️ Initialize map using Google Maps API
function initMap() {
  try {
    const location = { lat: 53.349805, lng: -6.26031 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 14,
      center: location,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
    });

    window.map = map;
    loadStations(map);
  } catch (e) {
    console.error("Error initializing map:", e);
    initMapWithoutAPI();
  }
}

// 🚲 Load station data
function loadStations(map) {
  fetch("http://localhost:5000/get_stations")
    .then((response) => response.json())
    .then((data) => {
      window.stationsData = data;
      console.log("Loaded station data:", data);
      displayStations(map, data);
    })
    .catch((error) => {
      console.error("Error loading stations:", error);
      const mockStations = generateMockStations();
      window.stationsData = mockStations;
      displayStations(map, mockStations);
    });
}

// 🛠️ Generate mock stations
function generateMockStations() {
  const center = { lat: 53.349805, lng: -6.26031 };
  const mock = [];
  for (let i = 1; i <= 20; i++) {
    const lat = center.lat + (Math.random() - 0.5) * 0.02;
    const lng = center.lng + (Math.random() - 0.5) * 0.03;
    mock.push({
      number: i,
      name: `Mock Station ${i}`,
      address: `Mock address ${i}`,
      latitude: lat,
      longitude: lng,
      bike_stands: Math.floor(Math.random() * 20) + 10,
      available_bikes: Math.floor(Math.random() * 10) + 1,
      available_bike_stands: Math.floor(Math.random() * 10) + 1,
    });
  }
  return mock;
}

// 📍 Display markers
function displayStations(map, stations) {
  if (window.stationMarkers) {
    window.stationMarkers.forEach((marker) => marker.setMap(null));
  }
  window.stationMarkers = [];
  const infoWindow = new google.maps.InfoWindow();
  const hoverCache = new Map();
  let hoverTimeout;

  stations.forEach((station) => {
    const lat = parseFloat(
      station.position_lat || station.latitude || station.Latitude || 0
    );
    const lng = parseFloat(
      station.position_lon || station.longitude || station.Longitude || 0
    );

    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      console.warn(
        "Invalid coordinates for station:",
        station.name || station.Name
      );
      return;
    }

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: station.name || station.Name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#3388ff",
        fillOpacity: 0.8,
        strokeWeight: 1,
        strokeColor: "#ffffff",
        scale: 8,
      },
    });

    window.stationMarkers.push(marker);

    marker.addListener("click", () => {
      closeJourneyPlannerPopup();
      handleStationSelection(station);
      fetchDynamicStationData(station.number);
    });

    marker.addListener("mouseover", () => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (hoverCache.has(station.number)) {
          infoWindow.setContent(hoverCache.get(station.number));
          infoWindow.open(map, marker);
        } else {
          fetch(`http://localhost:5000/dynamic/${station.number}`)
            .then((res) => res.json())
            .then((data) => {
              const content = `
                  <div style="background: rgba(173, 216, 230, 0.5); padding: 15px; border-radius: 12px; font-size: 15px; font-family: 'Segoe UI', sans-serif; color: #333; font-weight: 400;">
                    <div style="font-weight: bold; font-size: 17px; margin-bottom: 8px;">${station.number} - ${station.name}</div>
                    <div><strong>Address:</strong> ${station.address}</div>
                    <div style="margin-top: 8px;">
                      &#8250; <strong>Available Bikes:</strong> ${data.available_bikes} <br>
                      &#8250; <strong>Available Bike Stands:</strong> ${data.available_bike_stands} <br>
                      &#8250; <strong>Mechanical Bikes:</strong> ${data.mechanical_bikes} <br>
                      &#8250; <strong>Electrical Bikes:</strong> ${data.electrical_bikes} <br>
                      &#8250; <strong>Status:</strong> ${data.status} <br>
                      &#8250; <strong>Last Update:</strong> ${data.last_update}
                    </div>
                  </div>
                `;
              hoverCache.set(station.number, content);
              infoWindow.setContent(content);
              infoWindow.open(map, marker);

              // Hide default close button
              const observer = new MutationObserver(() => {
                const closeButton = document.querySelector(
                  ".gm-ui-hover-effect"
                );
                if (closeButton) {
                  closeButton.style.display = "none";
                }
              });
              observer.observe(document.body, {
                childList: true,
                subtree: true,
              });
            })
            .catch((err) => {
              console.error("Failed to load hover info:", err);
            });
        }
      }, 300);
    });

    marker.addListener("mouseout", () => {
      clearTimeout(hoverTimeout);
      infoWindow.close();
    });
  });
  if (
    typeof google !== "undefined" &&
    google.maps &&
    map instanceof google.maps.Map
  ) {
    window.stationMarkers.forEach((marker) => marker.setMap(map));
  }
}

// 🆕 Fetch live station info and show popup
function fetchDynamicStationData(stationNumber) {
  fetch(`http://localhost:5000/dynamic/${stationNumber}`)
    .then((res) => res.json())
    .then((data) => {
      const popup = document.getElementById("station-popup");
      popup.style.display = "block";

      const content = document.getElementById("station-popup-content");
      content.innerHTML = `
          <p><strong>Available Bikes:</strong> ${data.available_bikes}</p>
          <p><strong>Available Stands:</strong> ${data.available_bike_stands}</p>
          <p><strong>Mechanical Bikes:</strong> ${data.mechanical_bikes}</p>
          <p><strong>Electric Bikes:</strong> ${data.electrical_bikes}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Last Update:</strong> ${data.last_update}</p>
        `;
    })
    .catch((err) => {
      console.error("Failed to load station info:", err);
    });
}

// 🌤️ Fetch and display weather summary
function loadWeatherSummary() {
  fetch("http://localhost:5000/get_weather_summary")
    .then((res) => res.json())
    .then((data) => {
      const weatherDiv = document.getElementById("weather");
      if (data.summary) {
        weatherDiv.textContent = data.summary;
      } else {
        weatherDiv.textContent = "Weather unavailable";
      }
    })
    .catch((err) => {
      console.error("Failed to fetch weather:", err);
      document.getElementById("weather").textContent = "Weather error";
    });
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof google !== "undefined" && google.maps && google.maps.Map) {
    console.log("✅ Google Maps API loaded, initializing map.");
    initMap();
  } else {
    console.warn("⚠️ Google Maps API failed to load, using fallback.");
    initMapWithoutAPI();
  }

  // 🌤️ Call weather summary on DOM ready
  loadWeatherSummary();
});

// 🪝 Stub for undefined planner popup close function
function closeJourneyPlannerPopup() {
  console.log(
    "closeJourneyPlannerPopup called (stub). Optional: hide planner if needed."
  );
}

function handleStationSelection(station) {
  console.log("Station selected:", station);
}

function showStationInfoInSidebar(station) {
  console.log("Sidebar info (can be expanded):", station);
}
