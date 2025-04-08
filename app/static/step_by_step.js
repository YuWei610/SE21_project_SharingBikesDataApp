// 🌐 Initialize map without relying on Google Maps API
function initMapWithoutAPI() {
  console.log("Fallback map initialization in use.");

  // Show a simple placeholder map view
  const mapElement = document.getElementById("map");
  mapElement.innerHTML =
    '<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background-color:#f0f0f0;"><p>Map failed to load. You can still use the station list.</p></div>';

  // Create mock map and google objects to prevent runtime errors
  window.map = { getCenter: () => ({ lat: 53.349805, lng: -6.26031 }) };
  window.google = {
    maps: {
      Map: function () {
        return window.map;
      },
      Marker: function () {
        return {
          setMap: () => {},
          getPosition: () => ({ lat: () => 53.349805, lng: () => -6.26031 }),
        };
      },
      InfoWindow: function () {
        return { open: () => {} };
      },
      LatLngBounds: function () {
        return {
          extend: () => {},
          getCenter: () => ({ lat: 53.349805, lng: -6.26031 }),
        };
      },
      SymbolPath: { CIRCLE: 0 },
      event: { addListener: () => {} },
    },
  };

  // Load stations as fallback
  loadStations(window.map);
}

// 🗺️ Initialize map using Google Maps API
function initMap() {
  try {
    const location = { lat: 53.349805, lng: -6.26031 }; // Center of Dublin
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 14,
      center: location,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
    });

    window.map = map;

    // Load station data from backend
    loadStations(map);
  } catch (e) {
    console.error("Error initializing map:", e);
    initMapWithoutAPI();
  }
}

// 🚲 Load bike stations from database (via API)
function loadStations(map) {
  fetch("http://localhost:5000/get_stations")
    .then((response) => response.json())
    .then((data) => {
      window.stationsData = data;
      console.log("++++++++++++++++++++++++++");
      console.log(data);

      // Place markers on the map
      displayStations(map, data);
    })
    .catch((error) => {
      console.error("Error loading stations:", error);

      // If fetch fails, fall back to generated mock data
      const mockStations = generateMockStations();
      window.stationsData = mockStations;
      displayStations(map, mockStations);
    });
}

// 🛠️ Generate fake stations for fallback display
function generateMockStations() {
  const dublinCenter = { lat: 53.349805, lng: -6.26031 };
  const mockStations = [];

  for (let i = 1; i <= 20; i++) {
    const lat = dublinCenter.lat + (Math.random() - 0.5) * 0.02;
    const lng = dublinCenter.lng + (Math.random() - 0.5) * 0.03;

    mockStations.push({
      Number: i,
      Name: `Mock station ${i}`,
      Address: `Mock address ${i}`,
      Latitude: lat,
      Longitude: lng,
      Bike_stands: Math.floor(Math.random() * 20) + 10,
      Available_bikes: Math.floor(Math.random() * 10) + 1,
      Available_bike_stands: Math.floor(Math.random() * 10) + 1,
    });
  }

  return mockStations;
}

// 📍 Display station markers on the map
function displayStations(map, stations) {
  // Clear existing markers
  if (window.stationMarkers) {
    window.stationMarkers.forEach((marker) => marker.setMap(null));
  }
  window.stationMarkers = [];

  // Iterate through each station and place a marker
  stations.forEach((station) => {
    // Parse latitude and longitude (from different key cases)
    const lat = parseFloat(station.position_lat || station.Latitude || 0);
    const lng = parseFloat(station.position_lon || station.Longitude || 0);

    // Skip stations with invalid coordinates
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      console.warn(
        "Invalid coordinates for station:",
        station.name || station.Name
      );
      return;
    }

    // Create and place marker on map
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: station.name, // Tooltip label
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#3388ff",
        fillOpacity: 0.8,
        strokeWeight: 1,
        strokeColor: "#ffffff",
        scale: 8,
      },
    });

    // Store marker for future reference
    window.stationMarkers.push(marker);

    // Attach click event to marker
    marker.addListener("click", () => {
      closeJourneyPlannerPopup(); // Close planner if open
      showStationInfoInSidebar(station); // Show station info
      handleStationSelection(station); // Set start/end for journey
    });
  });

  // Add all markers to the map
  window.stationMarkers.forEach((marker) => marker.setMap(map));
}

// 🚀 When page is ready, initialize the map (with fallback)
document.addEventListener("DOMContentLoaded", function () {
  if (typeof google === "undefined" || !google.maps) {
    console.warn("Google Maps API failed to load, using fallback map.");
    initMapWithoutAPI();
  } else {
    console.log("Google Maps API loaded, initializing map.");
    initMap();
  }
});
