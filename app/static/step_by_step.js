// Fallback map display (without Google Maps API)
function initMapWithoutAPI() {
  console.log("Fallback map initialization in use.");

  const mapElement = document.getElementById("map");
  mapElement.innerHTML =
    '<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background-color:#f0f0f0;"><p>❌ Map failed to load. You can still use the station list.</p></div>';
}

// Initialize map using Google Maps API
function initMap() {
  try {
    const location = { lat: 53.349805, lng: -6.26031 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 14,
      center: location,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    
    window.map = map;
    loadStations(map);
    
    // Add event listeners for "Set as Start" and "Set as End" buttons
    document.getElementById("set-as-start-btn").addEventListener("click", function() {
      if (window.lastSelectedStation) {
        document.getElementById("start-location").value = window.lastSelectedStation.address;
        closeStationPopup();
      }
    });
    
    document.getElementById("set-as-end-btn").addEventListener("click", function() {
      if (window.lastSelectedStation) {
        document.getElementById("end-location").value = window.lastSelectedStation.address;
        closeStationPopup();
      }
    });
    
    // Add map view toggle functionality
    const mapViewBtn = document.getElementById("map-view-btn");
    const satelliteViewBtn = document.getElementById("satellite-view-btn");
    
    if (mapViewBtn) {
      mapViewBtn.addEventListener("click", function() {
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        mapViewBtn.style.backgroundColor = "#333";
        satelliteViewBtn.style.backgroundColor = "#555";
      });
    }
    
    if (satelliteViewBtn) {
      satelliteViewBtn.addEventListener("click", function() {
        map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        satelliteViewBtn.style.backgroundColor = "#333";
        mapViewBtn.style.backgroundColor = "#555";
      });
    }
    
  } catch (e) {
    console.error("Error initializing map:", e);
    initMapWithoutAPI();
  }
}

// Load station data
function loadStations(map) {
  fetch("http://localhost:5001/get_stations")
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

// Generate mock stations
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

// Display markers
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
          fetch(`http://localhost:5001/dynamic/${station.number}`)
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

// Fetch live station info and show popup
function fetchDynamicStationData(stationNumber) {
  fetch(`http://localhost:5001/dynamic/${stationNumber}`)
    .then((res) => res.json())
    .then((data) => {
      const popup = document.getElementById("station-popup");
      popup.style.display = "block";

      // Find and store information of the currently selected station
      const station = window.stationsData.find(s => s.number == stationNumber);
      if (station) {
        window.lastSelectedStation = station;
        
        // Enable "Back to Station Detail" button
        const backButton = document.getElementById("journey-planner-btn");
        if (backButton) {
          backButton.disabled = false;
          backButton.style.backgroundColor = "#4285f4";
          backButton.style.opacity = "1";
          backButton.style.cursor = "pointer";
        }
      }

      const content = document.getElementById("station-popup-content");
      content.innerHTML = `
          <p><strong>Available Bikes:</strong> ${data.available_bikes}</p>
          <p><strong>Available Stands:</strong> ${data.available_bike_stands}</p>
          <p><strong>Mechanical Bikes:</strong> ${data.mechanical_bikes}</p>
          <p><strong>Electric Bikes:</strong> ${data.electrical_bikes}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Last Update:</strong> ${data.last_update}</p>
        `;
        
      // Generate station chart
      generateStationCharts(stationNumber);
      
      // Bind event listeners for "Set as Start" and "Set as End" buttons
      const startBtn = document.getElementById("set-as-start-btn");
      const endBtn = document.getElementById("set-as-end-btn");
      
      if (startBtn) {
        startBtn.onclick = function() {
          document.getElementById("start-location").value = station.address;
          closeStationPopup();
        };
      }
      
      if (endBtn) {
        endBtn.onclick = function() {
          document.getElementById("end-location").value = station.address;
          closeStationPopup();
        };
      }
    })
    .catch((err) => {
      console.error("Failed to load station info:", err);
    });
}

// Generate station chart
function generateStationCharts(stationId) {
  // Get the current day of the week
  const dayOfWeek = new Date().toLocaleString('en-us', {weekday:'long'});
  
  // Generate bike data
  const bikeData = generateStationSpecificBikeData(stationId);
  // Generate bike station data
  const standData = generateStationSpecificStandData(stationId);
  
  // Display time range
  const hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  
  // Style the chart container
  const bikeChartContainer = document.getElementById("bikes-chart-container");
  const standChartContainer = document.getElementById("stands-chart-container");
  
  if (bikeChartContainer && standChartContainer) {
    bikeChartContainer.style.background = "#f8f9fa";
    bikeChartContainer.style.borderRadius = "8px";
    bikeChartContainer.style.marginBottom = "10px";
    bikeChartContainer.style.boxShadow = "inset 0 0 5px rgba(0,0,0,0.05)";
    
    standChartContainer.style.background = "#f8f9fa";
    standChartContainer.style.borderRadius = "8px";
    standChartContainer.style.marginBottom = "10px";
    standChartContainer.style.boxShadow = "inset 0 0 5px rgba(0,0,0,0.05)";
    
    // Update chart title styles
    const bikesTitle = document.querySelector(".station-chart:first-child h4");
    const standsTitle = document.querySelector(".station-chart:last-child h4");
    
    if (bikesTitle && standsTitle) {
      bikesTitle.style.fontSize = "16px";
      bikesTitle.style.fontWeight = "600";
      bikesTitle.style.padding = "10px 0";
      bikesTitle.style.color = "#333";
      
      standsTitle.style.fontSize = "16px";
      standsTitle.style.fontWeight = "600";
      standsTitle.style.padding = "10px 0";
      standsTitle.style.color = "#333";
    }
  }
  
  // Generate chart
  generateChart("bikes-chart-container", "bikes-time-labels", bikeData, hours, "bike");
  generateChart("stands-chart-container", "stands-time-labels", standData, hours, "stand");
}

// Generate randomized but reasonable bike data based on the station
function generateStationSpecificBikeData(stationId) {
  const data = [];
  // Use station ID as a seed to generate pseudo-random numbers
  const seed = parseInt(stationId, 10) || 1;
  
  // Generate weekday mode (low in the morning rush, high in the evening rush)
  const isWeekday = new Date().getDay() >= 1 && new Date().getDay() <= 5;
  
  for (let hour = 5; hour <= 23; hour++) {
    let value;
    if (isWeekday) {
      // Weekday mode
      if (hour >= 7 && hour <= 9) {
        // Morning rush - Fewer bikes
        value = Math.max(1, Math.floor(seed % 10 + Math.sin(hour) * 3 + 2));
      } else if (hour >= 16 && hour <= 19) {
        // Evening rush - More bikes
        value = Math.min(20, Math.floor(seed % 10 + Math.cos(hour) * 3 + 10));
      } else {
        // Off-peak hours
        value = Math.floor(seed % 10 + Math.sin(hour * seed) * 5 + 8);
      }
    } else {
      // Weekend mode - More balanced
      value = Math.floor(seed % 10 + Math.sin(hour * 0.5) * 4 + 8);
    }
    
    // Ensure data is within a reasonable range
    value = Math.max(0, Math.min(20, value));
    data.push(value);
  }
  
  return data;
}

// Generate randomized but reasonable bike station data based on the station
function generateStationSpecificStandData(stationId) {
  const bikeData = generateStationSpecificBikeData(stationId);
  // Bike station data complements bike data
  return bikeData.map(bikes => Math.max(0, 20 - bikes));
}

// Generate chart
function generateChart(containerId, labelsId, data, hours, type) {
  const container = document.getElementById(containerId);
  const labelsContainer = document.getElementById(labelsId);
  
  if (!container || !labelsContainer) return;
  
  // Clear container
  container.innerHTML = '';
  labelsContainer.innerHTML = '';
  
  // Find the maximum value to calculate the ratio
  const maxValue = Math.max(...data, 1); // 至少为1避免除以0
  
  // Add background
  container.style.background = '#f9f9f9';
  
  // Create bar chart and labels
  data.forEach((value, index) => {
    // Create bar chart
    const bar = document.createElement('div');
    bar.className = `chart-bar ${type}`;
    
    // Update styles to match the second image
    bar.style.height = `${(value / maxValue) * 100}%`;
    bar.style.width = `${85 / data.length}%`; // 85% width, leaving gaps
    bar.style.margin = `0 ${7.5 / data.length}%`; // Evenly distribute gaps
    
    if (type === 'bike') {
      bar.style.backgroundColor = '#4285f4'; // Brighter blue
    } else {
      bar.style.backgroundColor = '#34a853'; // Brighter green
    }
    
    bar.style.borderRadius = '2px';
    bar.setAttribute('data-value', value);
    container.appendChild(bar);
  });
  
  // Create individual time labels, displayed every two hours
  // Create a complete time range array
  const allHours = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  
  // Create labels for each time point
  allHours.forEach(hour => {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = `${hour}:00`;
    label.style.width = `${100/allHours.length}%`;
    label.style.color = '#666';
    label.style.fontSize = '12px';
    labelsContainer.appendChild(label);
  });
  
  // 调整标签容器样式
  labelsContainer.style.display = 'flex';
  labelsContainer.style.justifyContent = 'space-between';
  labelsContainer.style.width = '100%';
  labelsContainer.style.marginTop = '5px';
}

// Fetch and display weather summary
function loadWeatherSummary() {
  fetch("http://localhost:5001/get_weather_summary")
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
    console.log("Google Maps API loaded, initializing map.");
    initMap();
  } else {
    console.warn("⚠️ Google Maps API failed to load, using fallback.");
    initMapWithoutAPI();
  }

  // 🌤️ Call weather summary on DOM ready
  loadWeatherSummary();
  
  // Add click event to "Plan My Journey" button
  const journeyPlanBtn = document.getElementById("to-journey-planner-btn");
  if (journeyPlanBtn) {
    journeyPlanBtn.addEventListener("click", function() {
      // Close the station details window
      document.getElementById("station-popup").style.display = "none";
      
      // Display the "Plan Your Journey" section of the sidebar
      document.getElementById("station-details").style.display = "none";
      document.getElementById("route-details").style.display = "none";
      
      // Ensure the form is visible
      const routePlannerForm = document.getElementById("route-planner-form");
      if (routePlannerForm) {
        routePlannerForm.style.display = "block";
      }
      
      // If there is data for the last selected station, set that station as the starting point
      if (window.lastSelectedStation) {
        document.getElementById("start-location").value = 
          window.lastSelectedStation.name || window.lastSelectedStation.Name;
      }
    });
  }
  
  // Add click event to "Back to Station Detail" button
  const backToStationBtn = document.getElementById("journey-planner-btn");
  if (backToStationBtn) {
    backToStationBtn.addEventListener("click", function() {
      // Clickable only when the button is enabled
      if (!this.disabled && window.lastSelectedStation) {
        // Close other content
        document.getElementById("route-details").style.display = "none";
        
        // If there is a previously viewed station, redisplay the details popup for that station
        if (window.lastSelectedStation && window.lastSelectedStation.number) {
          fetchDynamicStationData(window.lastSelectedStation.number);
        }
      }
    });
  }
  
  // Add click event to map type toggle button (ensure the button exists)
  const mapViewBtn = document.getElementById("map-view-btn");
  const satelliteViewBtn = document.getElementById("satellite-view-btn");
  
  if (mapViewBtn && satelliteViewBtn && window.map) {
    mapViewBtn.addEventListener("click", function() {
      if (window.map) {
        window.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        this.style.backgroundColor = "#333";
        satelliteViewBtn.style.backgroundColor = "#555";
      }
    });
    
    satelliteViewBtn.addEventListener("click", function() {
      if (window.map) {
        window.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        this.style.backgroundColor = "#333";
        mapViewBtn.style.backgroundColor = "#555";
      }
    });
    
    console.log("Map type buttons initialized");
  }
  
  // Initialize "Set as Start" button
  const startBtn = document.getElementById("set-as-start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", function() {
      if (window.lastSelectedStation) {
        document.getElementById("start-location").value = window.lastSelectedStation.address;
        closeStationPopup();
      }
    });
  }
  
  // Initialize "Set as End" button
  const endBtn = document.getElementById("set-as-end-btn");
  if (endBtn) {
    endBtn.addEventListener("click", function() {
      if (window.lastSelectedStation) {
        document.getElementById("end-location").value = window.lastSelectedStation.address;
        closeStationPopup();
      }
    });
  }
  
  console.log("All button event listeners initialized");
});

// Empty function implementation to remove route planning functionality
function showJourneyPlannerPopup() {
  console.log("行程规划功能已禁用");
  // Do not perform any operation
}

// Empty function implementation to maintain compatibility
function closeJourneyPlannerPopup() {
  console.log("行程规划功能已禁用");
  // Do not perform any operation
}

function handleStationSelection(station) {
  console.log("Station selected:", station);
}

function showStationInfoInSidebar(station) {
  console.log("Sidebar info (can be expanded):", station);
}

// Global variable to store all station data
window.allStations = [];

// Function to control filter modal visibility
function toggleFilterModal() {
  const modal = document.getElementById("filter-modal");
  
  // If the modal is hidden, display it and load the station list
  if (modal.classList.contains("collapsed")) {
    modal.classList.remove("collapsed");
    // Load the station dropdown list
    loadStationOptions();
  } else {
    // Otherwise, hide it
    modal.classList.add("collapsed");
  }
}

// Load station options into the dropdown list
function loadStationOptions() {
  const stationSelect = document.getElementById("station-select");
  
  // If the dropdown already has options (other than "All Stations"), do not reload
  if (stationSelect.options.length > 1) {
    return;
  }
  
  // Fetch station data from the API
  fetch("http://localhost:5001/get_all_stations")
    .then(response => response.json())
    .then(data => {
      if (data.stations && Array.isArray(data.stations)) {
        // Save station data to the global variable
        window.allStations = data.stations;
        
        // Populate the dropdown list
        data.stations.forEach(station => {
          const option = document.createElement("option");
          option.value = station.number;
          option.textContent = station.name;
          stationSelect.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error("加载站点数据失败:", error);
    });
}

// Reset the filter conditions
function resetFilters() {
  document.getElementById("station-select").selectedIndex = 0;
  document.getElementById("time-select").selectedIndex = 0;

  // Clear the filter results
  const resultsContent = document.querySelector(".results-content");
  if (resultsContent) {
    resultsContent.innerHTML = '<p class="placeholder-text">Results will be displayed after applying filters...</p>';
  }
}

// Apply the filter
function applyFilters() {
  const stationId = document.getElementById("station-select").value;
  const hour = document.getElementById("time-select").value;
  
  // Display loading indicator
  const resultsContent = document.querySelector(".results-content");
  if (resultsContent) {
    resultsContent.innerHTML = '<p class="placeholder-text">Loading data...</p>';
  }
  
  // Get the current hour for comparison
  const currentHour = new Date().getHours();
  
  // Build the request data
  const requestData = {
    station_id: stationId ? parseInt(stationId, 10) : null,
    hour: parseInt(hour, 10)
  };
  
  // Send the request to the API
  fetch("http://localhost:5001/predict_availability", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(data => {
      // Display the results
      if (resultsContent) {
        if (data.error) {
          resultsContent.innerHTML = `<p class="error-text">${data.error}</p>`;
        } 
        // If the response is a string message (e.g., select a past time)
        else if (typeof data.bikes === 'string' || data.bikes === "Please select a future time.") {
          resultsContent.innerHTML = `
            <div class="past-time-message">
              <p class="warning-text">${data.bikes}</p>
            </div>
          `;
        }
        // Normal numeric prediction result (e.g., select a future time)
        else {
          resultsContent.innerHTML = `
            <div class="result-item">
              <span>Predicted Available Bikes:</span>
              <span class="highlight">${data.bikes}</span>
            </div>
            <div class="result-item">
              <span>Predicted Available Stands:</span>
              <span class="highlight">${data.bike_stands}</span>
            </div>
          `;
        }
      }
    })
    .catch(error => {
      console.error("预测请求失败:", error);
      if (resultsContent) {
        resultsContent.innerHTML = '<p class="error-text">Failed to get prediction data. Please try again.</p>';
      }
    });
}

// Close the station details popup
function closeStationPopup() {
  const popup = document.getElementById("station-popup");
  if (popup) {
    popup.style.display = "none";
    
    // Important: Do not reset the "Back to Station Detail" button state here
    // Because we want the user to be able to return to the last viewed station via the button
  }
}

function calculateRoute() {
  var start = document.getElementById('start-location').value;
  var destination = document.getElementById('end-location').value;

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
          } else {
              alert('Could not find a route between the locations.');
          }
      });
  } else {
      alert('Please enter both start and destination locations.');
  }
}
