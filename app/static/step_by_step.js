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

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    
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

      // 查找并保存当前选中的站点信息
      const station = window.stationsData.find(s => s.number == stationNumber);
      if (station) {
        window.lastSelectedStation = station;
        
        // 启用Back to Station Detail按钮
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
        
      // 生成站点图表
      generateStationCharts(stationNumber);
    })
    .catch((err) => {
      console.error("Failed to load station info:", err);
    });
}

// 生成站点图表
function generateStationCharts(stationId) {
  // 获取今天是星期几
  const dayOfWeek = new Date().toLocaleString('en-us', {weekday:'long'});
  
  // 生成自行车数据
  const bikeData = generateStationSpecificBikeData(stationId);
  // 生成车位数据
  const standData = generateStationSpecificStandData(stationId);
  
  // 显示时间范围
  const hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  
  // 美化图表容器
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
    
    // 更新图表标题样式
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
  
  // 生成图表
  generateChart("bikes-chart-container", "bikes-time-labels", bikeData, hours, "bike");
  generateChart("stands-chart-container", "stands-time-labels", standData, hours, "stand");
}

// 根据站点生成随机化但合理的自行车数据
function generateStationSpecificBikeData(stationId) {
  const data = [];
  // 使用站点ID作为种子生成伪随机数
  const seed = parseInt(stationId, 10) || 1;
  
  // 生成工作日模式 (早高峰少，晚高峰多)
  const isWeekday = new Date().getDay() >= 1 && new Date().getDay() <= 5;
  
  for (let hour = 5; hour <= 23; hour++) {
    let value;
    if (isWeekday) {
      // 工作日模式
      if (hour >= 7 && hour <= 9) {
        // 早高峰 - 自行车较少
        value = Math.max(1, Math.floor(seed % 10 + Math.sin(hour) * 3 + 2));
      } else if (hour >= 16 && hour <= 19) {
        // 晚高峰 - 自行车较多
        value = Math.min(20, Math.floor(seed % 10 + Math.cos(hour) * 3 + 10));
      } else {
        // 平常时间
        value = Math.floor(seed % 10 + Math.sin(hour * seed) * 5 + 8);
      }
    } else {
      // 周末模式 - 比较平均
      value = Math.floor(seed % 10 + Math.sin(hour * 0.5) * 4 + 8);
    }
    
    // 确保数据在合理范围内
    value = Math.max(0, Math.min(20, value));
    data.push(value);
  }
  
  return data;
}

// 根据站点生成随机化但合理的车位数据
function generateStationSpecificStandData(stationId) {
  const bikeData = generateStationSpecificBikeData(stationId);
  // 车位数据与自行车数据互补
  return bikeData.map(bikes => Math.max(0, 20 - bikes));
}

// 生成图表
function generateChart(containerId, labelsId, data, hours, type) {
  const container = document.getElementById(containerId);
  const labelsContainer = document.getElementById(labelsId);
  
  if (!container || !labelsContainer) return;
  
  // 清空容器
  container.innerHTML = '';
  labelsContainer.innerHTML = '';
  
  // 找到最大值以计算比例
  const maxValue = Math.max(...data, 1); // 至少为1避免除以0
  
  // 添加背景
  container.style.background = '#f9f9f9';
  
  // 创建柱状图和标签
  data.forEach((value, index) => {
    // 创建柱状图
    const bar = document.createElement('div');
    bar.className = `chart-bar ${type}`;
    
    // 更新样式以匹配第二幅图
    bar.style.height = `${(value / maxValue) * 100}%`;
    bar.style.width = `${85 / data.length}%`; // 85%的宽度，留出间隙
    bar.style.margin = `0 ${7.5 / data.length}%`; // 均匀分布间隙
    
    if (type === 'bike') {
      bar.style.backgroundColor = '#4285f4'; // 更亮的蓝色
    } else {
      bar.style.backgroundColor = '#34a853'; // 更亮的绿色
    }
    
    bar.style.borderRadius = '2px';
    bar.setAttribute('data-value', value);
    container.appendChild(bar);
  });
  
  // 单独创建时间标签，每两小时显示一次
  // 创建一个完整的时间范围数组
  const allHours = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  
  // 为每个时间点创建标签
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
  
  // 为Plan My Journey按钮添加点击事件
  const journeyPlanBtn = document.getElementById("to-journey-planner-btn");
  if (journeyPlanBtn) {
    journeyPlanBtn.addEventListener("click", function() {
      // 关闭站点详情窗口
      document.getElementById("station-popup").style.display = "none";
      
      // 显示侧边栏的Plan Your Journey部分
      document.getElementById("station-details").style.display = "none";
      document.getElementById("route-details").style.display = "none";
      
      // 确保表单可见
      const routePlannerForm = document.getElementById("route-planner-form");
      if (routePlannerForm) {
        routePlannerForm.style.display = "block";
      }
      
      // 如果有最后选择的站点数据，将该站点设为起点
      if (window.lastSelectedStation) {
        document.getElementById("start-location").value = 
          window.lastSelectedStation.name || window.lastSelectedStation.Name;
      }
    });
  }
  
  // 为Back to Station Detail按钮添加点击事件
  const backToStationBtn = document.getElementById("journey-planner-btn");
  if (backToStationBtn) {
    backToStationBtn.addEventListener("click", function() {
      // 只有当按钮启用时才能点击
      if (!this.disabled && window.lastSelectedStation) {
        // 关闭其他内容
        document.getElementById("route-details").style.display = "none";
        
        // 如果有上次查看的站点，重新显示该站点的详细信息弹窗
        if (window.lastSelectedStation && window.lastSelectedStation.number) {
          fetchDynamicStationData(window.lastSelectedStation.number);
        }
      }
    });
  }
});

// 空函数实现，移除行程规划功能
function showJourneyPlannerPopup() {
  console.log("行程规划功能已禁用");
  // 不执行任何操作
}

// 空函数实现，用于保持兼容性
function closeJourneyPlannerPopup() {
  console.log("行程规划功能已禁用");
  // 不执行任何操作
}

function handleStationSelection(station) {
  console.log("Station selected:", station);
}

function showStationInfoInSidebar(station) {
  console.log("Sidebar info (can be expanded):", station);
}

// 全局变量存储所有站点数据
window.allStations = [];

// 筛选浮窗控制函数
function toggleFilterModal() {
  const modal = document.getElementById("filter-modal");
  
  // 如果模态窗口是隐藏的，显示它并加载站点列表
  if (modal.classList.contains("collapsed")) {
    modal.classList.remove("collapsed");
    // 加载站点下拉列表
    loadStationOptions();
  } else {
    // 否则隐藏它
    modal.classList.add("collapsed");
  }
}

// 加载站点选项到下拉列表
function loadStationOptions() {
  const stationSelect = document.getElementById("station-select");
  
  // 如果下拉列表已经有选项（除了"All Stations"），则不重新加载
  if (stationSelect.options.length > 1) {
    return;
  }
  
  // 从API获取站点数据
  fetch("http://localhost:5000/get_all_stations")
    .then(response => response.json())
    .then(data => {
      if (data.stations && Array.isArray(data.stations)) {
        // 保存站点数据到全局变量
        window.allStations = data.stations;
        
        // 填充下拉列表
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

// 重置筛选条件
function resetFilters() {
  document.getElementById("station-select").selectedIndex = 0;
  document.getElementById("time-select").selectedIndex = 0;

  // 清空筛选结果
  const resultsContent = document.querySelector(".results-content");
  if (resultsContent) {
    resultsContent.innerHTML = '<p class="placeholder-text">Results will be displayed after applying filters...</p>';
  }
}

// 应用筛选
function applyFilters() {
  const stationId = document.getElementById("station-select").value;
  const hour = document.getElementById("time-select").value;
  
  // 显示加载中提示
  const resultsContent = document.querySelector(".results-content");
  if (resultsContent) {
    resultsContent.innerHTML = '<p class="placeholder-text">Loading data...</p>';
  }
  
  // 获取当前小时，用于比较
  const currentHour = new Date().getHours();
  
  // 构建请求数据
  const requestData = {
    station_id: stationId ? parseInt(stationId, 10) : null,
    hour: parseInt(hour, 10)
  };
  
  // 发送请求到API
  fetch("http://localhost:5000/predict_availability", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(data => {
      // 显示结果
      if (resultsContent) {
        if (data.error) {
          resultsContent.innerHTML = `<p class="error-text">${data.error}</p>`;
        } 
        // 如果返回的是字符串类型的消息（选择过去时间）
        else if (typeof data.bikes === 'string' || data.bikes === "Please select a future time.") {
          resultsContent.innerHTML = `
            <div class="past-time-message">
              <p class="warning-text">${data.bikes}</p>
            </div>
          `;
        }
        // 正常的数字型预测结果（选择未来时间）
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

// 关闭站点详情弹窗
function closeStationPopup() {
  const popup = document.getElementById("station-popup");
  if (popup) {
    popup.style.display = "none";
    
    // 重要：这里不重置Back to Station Detail按钮状态
    // 因为我们希望用户可以通过按钮回到上次查看的站点
  }
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
          } else {
              alert('Could not find a route between the locations.');
          }
      });
  } else {
      alert('Please enter both start and destination locations.');
  }
}
