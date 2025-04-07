// var currentInfoWindow = null; // Setting default value of this variable as none. Will help ensure that when one window is opened the other is closed automatically.
// var markers = [];
// var markersVisible = true;
// var map, directionsService, directionsRenderer;

// // Main function. Takes json data from flask that is connected to the DB (local) and creates a marker for each station on the google map.
// function initMap() {
//     map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 14,
//     center: {lat: 53.346265, lng: -6.259246},
//     mapTypeControl: false,
//     fullScreenControl:false,
// });

// directionsService = new google.maps.DirectionsService();
// directionsRenderer = new google.maps.DirectionsRenderer({
//     map: map,
// });

//     fetch('/stations')
//         .then(response => response.json())
//         .then(data => {
//             console.log(data);
//             data.forEach(function (station) {

//             var lat = parseFloat(station.Latitude);
//             var lon = parseFloat(station.Longitude);

//         if (!isNaN(lat) && !isNaN(lon)) {
//             var marker = new google.maps.Marker({
//                 position: {lat: lat, lng: lon},
//                 map: map,
//                 title:"<b>" + station.Name + "</b>"
//             });

//             markers.push(marker);

//         //  Create info window for each station (station name).
//             var infoWindow = new google.maps.InfoWindow({
//             content: "<b style='font-weight: bold;'>" + station.Name + "</b>",
//             maxWidth: 250,
//             });

//             marker.isOpen = false;

//             marker.addListener('click', function() {
//                 if (currentInfoWindow) {
//                 currentInfoWindow.close();
//             }

//                 if (this.isOpen) {
//                     infoWindow.close();
//                     this.isOpen = false;
//                 } else {
//                     map.setZoom(16);
//                     map.setCenter(marker.getPosition());

//                     fetch(`/dynamic/${station.Number}`)
//                         .then(response => response.json())
//                         .then(data => {
//                             var content = "<div class='info-content'><b style='font-weight: bold;'>"  + station.Name + "</b>";
//                             content += "<p>Station Number: " + station.Number + "</p>"
//                             content += "<p>Available Bikes: " + data.available_bikes + "</p>";
//                             content += "<p>Mechanical Bikes: " + data.mechanical_bikes + "</p></div>";
//                             content += "<p>Electrical Bikes: " + data.electrical_bikes + "</p></div>";
//                             content += "<p>Available Bike Stands: " + data.available_bike_stands + "</p>";
//                             content += "<p>Current Status: " + data.status + "</p>"
//                             content += "<p>Last Updated: " + data.last_update + "</p></div>";

//                             infoWindow.setContent(content);
//                             infoWindow.open(map, marker);
//                             currentInfoWindow = infoWindow;
//                             });

//                         infoWindow.open(map, marker);

//                         currentInfoWindow = infoWindow;
//                         this.isOpen = true;
//                         map.panTo(marker.getPosition());
//                     }
//                 });

//                 google.maps.event.addListener(infoWindow, 'closeclick', function() {
//                     marker.isOpen = false;
//                 });

//                 marker.addListener('mouseover', function() {
//                     if (!marker.isOpen) {
//                     infoWindow.open(map, marker);
//                     }
//                 });

//                 marker.addListener('mouseout', function() {
//                     if (!marker.isOpen) {
//                     infoWindow.close();
//                     }
//                 });

//             } else {
//                 console.error("Invalid lat/lon values:", station);
//             }
//         });
//     });

//     fetchWeather()
// }

// // 使用OpenWeatherMap API获取天气数据
// const apiKey = '597b17711b1b951ff3254b78f58df59d'; // 替换为你的OpenWeatherMap API密钥
// const city = 'Dublin'; // 你可以根据需要更改城市
// const weatherElement = document.getElementById('weather');

// function fetchWeather() {
//     fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
//         .then(response => response.json())
//         .then(data => {
//             const weather = data.weather[0].description;
//             const temp = data.main.temp;
//             weatherElement.textContent = `${city}: ${temp}°C, ${weather}`;
//         })
//         .catch(error => {
//             console.error('Error fetching weather data:', error);
//             weatherElement.textContent = 'Failed to load weather data';
//         });

//     document.getElementById('planJourneyBtn').addEventListener('click', function (e) {
//         e.preventDefault();
//         calculateRoute();
//     });
// }

// function calculateRoute() {
//     var start = document.getElementById('startinglocation').value;
//     var destination = document.getElementById('destination').value;

//     if (start && destination) {
//         start = start + ', Dublin';
//         destination = destination + ', Dublin';

//         var request = {
//             origin: start,
//             destination: destination,
//             travelMode: google.maps.TravelMode.BICYCLING,
//         };

//         directionsService.route(request, function(response, status) {
//             if (status === google.maps.DirectionsStatus.OK) {
//                 directionsRenderer.setDirections(response);

//                 var route = response.routes[0];
//                 var leg = route.legs[0];
//                 var duration = leg.duration.text;
//                 var distance = leg.distance.text;

//                 var journeyDetails = document.getElementById('journeyDetails');
//                 journeyDetails.innerHTML = `<b>Estimated Journey:</b><br>Duration: ${duration}<br>Distance: ${distance}`;
//             } else {
//                 alert('Could not find a route between the locations.');
//             }
//         });
//     } else {
//         alert('Please enter both start and destination locations.');
//     }
// }

// function toggleMarkersVisibility() {
//     markersVisible = !markersVisible;
//     for (let i = 0; i < markers.length; i++) {
//         markers[i].setMap(markersVisible ? map : null);
//     }

//     document.getElementById('station_button').innerText = markersVisible ? 'Hide Stations' : 'Show Stations';
// }

// window.onload = function() {
//     initMap();
// };

// 添加不依赖Google Maps API的初始化函数
function initMapWithoutAPI() {
  console.log("使用备用地图初始化");

  // 创建一个简单的地图显示区域
  const mapElement = document.getElementById("map");
  mapElement.innerHTML =
    '<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background-color:#f0f0f0;"><p>地图加载失败，但您仍可以使用站点列表功能</p></div>';

  // 初始化全局对象以避免错误
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

  // 加载站点数据
  loadStations(window.map);

  // 设置路线规划按钮事件
  document
    .getElementById("plan-journey-btn")
    .addEventListener("click", planJourney);
}

function initMap() {
  try {
    // 基本地图初始化
    var location = { lat: 53.349805, lng: -6.26031 }; // 都柏林中心位置
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 14,
      center: location,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    // 保存到全局变量
    window.map = map;

    // 加载都柏林自行车站点数据
    loadStations(map);

    // 设置路线规划按钮点击事件
    document
      .getElementById("plan-journey-btn")
      .addEventListener("click", planJourney);
  } catch (e) {
    console.error("初始化地图时出错:", e);
    initMapWithoutAPI();
  }
}

// 加载自行车站点数据的函数
function loadStations(map) {
  // 从dublin.csv加载数据或通过API获取
  fetch("http://localhost:5000/get_stations")
    .then((response) => response.json())
    .then((data) => {
      // 保存站点数据到全局，以便路线规划使用
      window.stationsData = data;
      console.log("Fetched stations:", data);
      // 在地图上显示站点
      displayStations(map, data);
    })
    .catch((error) => {
      console.error("Error loading stations:", error);
      const mockStations = generateMockStations();
      window.stationsData = mockStations;
      displayStations(map, mockStations);
    });
}

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

// 在地图上显示站点的函数
function displayStations(map, stations) {
  const hideButton = document.getElementById("zoom-out");
  if (hideButton) {
    hideButton.textContent = "Hide Stations";
    hideButton.dataset.visible = "true";
  }

  // 清除现有标记
  if (window.stationMarkers && window.stationMarkers.length > 0) {
    window.stationMarkers.forEach((marker) => marker.setMap(null));
  }

  // 创建新标记数组
  window.stationMarkers = [];

  // 创建每个站点的标记
  stations.forEach((station) => {
    // 创建标记
    const marker = new google.maps.Marker({
      position: {
        lat: parseFloat(station.Latitude),
        lng: parseFloat(station.Longitude),
      },
      map: map,
      title: station.Name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#3388ff",
        fillOpacity: 0.8,
        strokeWeight: 1,
        strokeColor: "#ffffff",
        scale: 8,
      },
    });

    // 保存标记
    window.stationMarkers.push(marker);

    // 添加点击事件
    marker.addListener("click", () => {
      // 显示站点信息到侧边栏
      showStationInfoInSidebar(station);

      // 设置路线起点或终点
      handleStationSelection(station);
    });
  });

  // 添加对象到地图
  window.stationMarkers.forEach((marker) => marker.setMap(map));
}

// 用于处理站点选择作为起点或终点
function handleStationSelection(station) {
  // 如果没有起点，设为起点
  if (!document.getElementById("start-location").value) {
    document.getElementById("start-location").value = station.Name;
  }
  // 否则如果没有终点，设为终点
  else if (!document.getElementById("end-location").value) {
    document.getElementById("end-location").value = station.Name;

    // 如果起点和终点都设置了，可以自动规划路线
    // planJourney(); // 去掉自动规划，让用户点击按钮规划
  }
  // 如果起点和终点都已设置，重新设置起点
  else {
    document.getElementById("start-location").value = station.Name;
    document.getElementById("end-location").value = ""; // 清除终点
  }
}

// 在侧边栏显示站点信息
function showStationInfoInSidebar(station) {
  if (!station.Available_bikes)
    station.Available_bikes = Math.floor(Math.random() * 10) + 5;
  if (!station.Available_bike_stands)
    station.Available_bike_stands = Math.floor(Math.random() * 15) + 5;
  const totalCapacity =
    parseInt(station.Available_bikes) + parseInt(station.Available_bike_stands);

  // 显示站点弹窗
  const popup = document.getElementById("station-popup");
  popup.style.display = "block";

  // 设置站点标题
  document.getElementById("station-popup-title").textContent =
    station.Name || station.name;

  // 填充站点信息
  const content = document.getElementById("station-popup-content");
  content.innerHTML = `
<p><span>站点编号:</span> <span>${
    station.Number || station.number || "N/A"
  }</span></p>
<p><span>地址:</span> <span>${
    station.Address || station.address || "未知地址"
  }</span></p>
<p><span>可用自行车:</span> <span>${
    station.Available_bikes || station.available_bikes || "0"
  }</span></p>
<p><span>空位数量:</span> <span>${
    station.Available_bike_stands || station.available_bike_stands || "0"
  }</span></p>
<p><span>总容量:</span> <span>${
    station.Bike_stands || station.bike_stands || totalCapacity || "0"
  }</span></p>
`;

  // 生成并显示站点图表
  generateStationCharts(station.Number || 1);

  // 设置按钮点击事件
  const startBtn = document.getElementById("set-as-start-btn");
  const endBtn = document.getElementById("set-as-end-btn");

  // 清除旧事件监听器
  startBtn.replaceWith(startBtn.cloneNode(true));
  endBtn.replaceWith(endBtn.cloneNode(true));

  // 获取新的按钮引用
  const newStartBtn = document.getElementById("set-as-start-btn");
  const newEndBtn = document.getElementById("set-as-end-btn");

  // 添加新的事件监听器
  newStartBtn.addEventListener("click", function () {
    setAsStart(station.Name);
    closeStationPopup();
  });

  newEndBtn.addEventListener("click", function () {
    setAsEnd(station.Name);
    closeStationPopup();
  });
}

// 生成站点图表
function generateStationCharts(stationId) {
  // 生成小时数据 - 从早上4点到晚上22点
  const hours = [
    4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  ];

  // 使用随机种子生成两种不同模式的数据
  const stationSeed = stationId % 5;

  // 生成自行车可用性数据
  const bikeData = generateHourlyDataForStation(stationSeed, hours, "bike");
  generateChart(
    "bikes-chart-container",
    "bikes-time-labels",
    bikeData,
    hours,
    "bike"
  );

  // 生成车位可用性数据
  const standData = generateHourlyDataForStation(stationSeed, hours, "stand");
  generateChart(
    "stands-chart-container",
    "stands-time-labels",
    standData,
    hours,
    "stand"
  );
}

// 基于种子生成站点数据
function generateHourlyDataForStation(seed, hours, type) {
  const totalCapacity = 20 + seed * 5;
  const data = [];

  // 根据种子和类型创建不同的使用模式
  if (type === "bike") {
    // 自行车可用性模式
    switch (seed) {
      case 0: // 早晚低，中午高（上班区域）
        hours.forEach((hour) => {
          let value;
          if (hour < 7) value = totalCapacity * 0.9; // 早上大部分可用
          else if (hour < 10) value = totalCapacity * 0.3; // 上班高峰少
          else if (hour < 16) value = totalCapacity * 0.7; // 中午大部分回来
          else if (hour < 19) value = totalCapacity * 0.2; // 下班高峰少
          else value = totalCapacity * 0.8; // 晚上大部分回来
          data.push({
            hour,
            value: Math.round(value + (Math.random() * 3 - 1.5)),
          });
        });
        break;
      case 1: // 早晚高，中午低（居住区域）
        hours.forEach((hour) => {
          let value;
          if (hour < 7) value = totalCapacity * 0.3; // 早上很少
          else if (hour < 10) value = totalCapacity * 0.8; // 上班高峰多
          else if (hour < 16) value = totalCapacity * 0.4; // 中午少
          else if (hour < 19) value = totalCapacity * 0.9; // 下班高峰多
          else value = totalCapacity * 0.5; // 晚上一般
          data.push({
            hour,
            value: Math.round(value + (Math.random() * 3 - 1.5)),
          });
        });
        break;
      case 2: // 周末模式（相对平稳但中午低）
        hours.forEach((hour) => {
          let value;
          if (hour < 10) value = totalCapacity * 0.7;
          else if (hour < 14) value = totalCapacity * 0.4;
          else if (hour < 18) value = totalCapacity * 0.5;
          else value = totalCapacity * 0.7;
          data.push({
            hour,
            value: Math.round(value + (Math.random() * 3 - 1.5)),
          });
        });
        break;
      case 3: // 旅游区（上午高，下午逐步减少）
        hours.forEach((hour) => {
          let value = totalCapacity * (0.8 - (hour - 4) * 0.03);
          data.push({
            hour,
            value: Math.round(value + (Math.random() * 3 - 1.5)),
          });
        });
        break;
      default: // 平稳模式
        hours.forEach((hour) => {
          let value = totalCapacity * 0.6 + Math.random() * 0.2;
          data.push({ hour, value: Math.round(value) });
        });
    }
  } else {
    // 车位数据（与自行车相反）
    const bikeData = generateHourlyDataForStation(seed, hours, "bike");
    hours.forEach((hour, index) => {
      data.push({
        hour,
        value: Math.round(totalCapacity - bikeData[index].value),
      });
    });
  }

  return data;
}

// 生成图表
function generateChart(containerId, labelsId, data, hours, type) {
  const container = document.getElementById(containerId);
  const labelsContainer = document.getElementById(labelsId);

  // 清空容器
  container.innerHTML = "";
  labelsContainer.innerHTML = "";

  // 找到最大值
  const maxValue = Math.max(...data.map((item) => item.value)) * 1.1; // 增加10%空间

  // 绘制条形图
  data.forEach((item) => {
    const barHeight = (item.value / maxValue) * 100;
    const bar = document.createElement("div");
    bar.className = `chart-bar ${type}`;
    bar.style.height = `${barHeight}%`;
    bar.setAttribute("data-value", item.value);
    container.appendChild(bar);
  });

  // 添加时间标签（只显示部分时间点以避免拥挤）
  const showLabels = [4, 8, 12, 16, 20];
  hours.forEach((hour) => {
    const label = document.createElement("div");
    label.className = "time-label";
    label.textContent = showLabels.includes(hour) ? `${hour}` : "";
    labelsContainer.appendChild(label);
  });
}

// 关闭站点弹窗
function closeStationPopup() {
  const popup = document.getElementById("station-popup");
  popup.style.display = "none";
}

// 将站点设为起点
function setAsStart(stationName) {
  document.getElementById("start-location").value = stationName;
  // 如果终点已经设置，可以考虑自动规划路线
  // if (document.getElementById('end-location').value) {
  //   planJourney();
  // }
}

// 将站点设为终点
function setAsEnd(stationName) {
  document.getElementById("end-location").value = stationName;
  // 如果起点已经设置，可以考虑自动规划路线
  // if (document.getElementById('start-location').value) {
  //   planJourney();
  // }
}

// 规划路线
function planJourney() {
  try {
    console.log("规划路线...");

    // 获取用户选择的起点和终点
    const startInput = document.getElementById("start-location").value.trim();
    const endInput = document.getElementById("end-location").value.trim();

    if (!startInput || !endInput) {
      alert("请输入起点和终点站点名称");
      return;
    }

    // 获取站点数据（确保已加载）
    const stations = window.stationsData || [];
    if (!stations.length) {
      alert("未加载站点数据，请稍后再试");
      return;
    }

    // 查找匹配的站点
    const startStation = findStationByNameOrAddress(stations, startInput);
    const endStation = findStationByNameOrAddress(stations, endInput);

    if (!startStation) {
      alert(`未找到名为"${startInput}"的起点站，请检查拼写或从地图选择站点`);
      return;
    }

    if (!endStation) {
      alert(`未找到名为"${endInput}"的终点站，请检查拼写或从地图选择站点`);
      return;
    }

    // 保存所选站点作为全局变量（用于标记）
    window.selectedStartStation = startStation.Name;
    window.selectedEndStation = endStation.Name;

    // 创建起点和终点位置
    const startPos = {
      lat: parseFloat(startStation.Latitude),
      lng: parseFloat(startStation.Longitude),
    };
    const endPos = {
      lat: parseFloat(endStation.Latitude),
      lng: parseFloat(endStation.Longitude),
    };

    // 高亮显示所选站点
    highlightSelectedStations();

    // 计算和显示路线
    calculateAndDisplayRoute(startPos, endPos, startStation, endStation);
  } catch (e) {
    console.error("路线规划错误:", e);
    alert("路线规划发生错误，请稍后再试");
  }
}

// 查找站点的函数
function findStationByNameOrAddress(stations, searchText) {
  if (!searchText || !stations || stations.length === 0) return null;

  // 标准化搜索文本（转小写并去除多余空格）
  const normalizedSearchText = searchText.toLowerCase().trim();

  // 首先尝试精确匹配
  let station = stations.find(
    (s) =>
      s.Name.toLowerCase() === normalizedSearchText ||
      s.Address.toLowerCase() === normalizedSearchText
  );

  // 如果没有精确匹配，尝试部分匹配
  if (!station) {
    station = stations.find(
      (s) =>
        s.Name.toLowerCase().includes(normalizedSearchText) ||
        s.Address.toLowerCase().includes(normalizedSearchText)
    );
  }

  return station;
}

// 计算与显示路线
function calculateAndDisplayRoute(startPos, endPos) {
  // 清除之前的路线
  if (window.currentRoute) {
    window.currentRoute.setMap(null);
  }

  // 计算两点间距离
  const distanceInKm = calculateDistance(
    startPos.lat,
    startPos.lng,
    endPos.lat,
    endPos.lng
  );

  // 估算骑行时间
  const adjustedDistance = distanceInKm * 1.3; // 路线弯曲系数
  const durationMin = Math.round((adjustedDistance / 15) * 60);
  const durationText =
    durationMin > 60
      ? Math.floor(durationMin / 60) + " 小时 " + (durationMin % 60) + " 分钟"
      : durationMin + " 分钟";

  // 创建一条表示路线的线
  const routePath = [startPos, endPos];
  window.currentRoute = new google.maps.Polyline({
    path: routePath,
    geodesic: true,
    strokeColor: "#3388ff",
    strokeOpacity: 1.0,
    strokeWeight: 3,
  });

  window.currentRoute.setMap(map);

  // 显示路线详情
  const routeDetails = document.getElementById("route-details");
  routeDetails.style.display = "block";

  // 隐藏站点详情面板
  document.getElementById("station-details").style.display = "none";

  // 查找起点和终点站点信息
  const startStation = window.stationsData.find(
    (s) => s.Name === document.getElementById("start-location").value
  );
  const endStation = window.stationsData.find(
    (s) => s.Name === document.getElementById("end-location").value
  );

  if (startStation && endStation) {
    // 填充路线详情
    document.getElementById("route-details-content").innerHTML = `
<div class="detail-item">
<h4>全程距离</h4>
<p>${adjustedDistance.toFixed(2)} 公里</p>
</div>
<div class="detail-item">
<h4>预计时间</h4>
<p>${durationText}</p>
</div>
<div class="detail-item">
<h4>起点站</h4>
<p>${startStation.Name}</p>
<p>可用车辆: ${
      startStation.Available_bikes || Math.floor(Math.random() * 10) + 5
    }</p>
</div>
<div class="detail-item">
<h4>终点站</h4>
<p>${endStation.Name}</p>
<p>可用停车位: ${
      endStation.Available_bike_stands || Math.floor(Math.random() * 15) + 5
    }</p>
</div>
`;
  }
}

// 使用Haversine公式计算两点间的距离（公里）
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径（公里）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// 使用OpenWeatherMap API获取天气数据
const weatherApiKey = "1e5d3d18989bed9a0ed5f59d50a821ac"; // OpenWeatherMap API密钥
const city = "Dublin"; // 你可以根据需要更改城市
const weatherElement = document.getElementById("weather");

function fetchWeather() {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      const weather = data.weather[0].description;
      const temp = data.main.temp;
      weatherElement.textContent = `${city}: ${temp}°C, ${weather}`;
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      weatherElement.textContent = "Failed to load weather data";
    });
}

// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", function () {
  // 初始化地图
  initMap();

  // 加载天气信息
  fetchWeather();

  // 添加事件监听器到规划路线按钮
  document
    .getElementById("plan-journey-btn")
    .addEventListener("click", planJourney);

  // 加载站点数据并填充选择器
  fetch("http://localhost:5000/get_stations")
    .then((response) => response.json())
    .then((stations) => {
      window.stationsData = stations;
      window.allStations = stations;
      populateStationSelect();
    })
    .catch((error) => {
      console.error("Error loading stations:", error);
    });
});

// 根据站点ID更新统计图表
function updateStationCharts(stationId) {
  console.log(`更新站点 ${stationId} 的统计图表`);

  // 尝试从后端获取特定站点数据
  fetch(`http://localhost:5000/get_station_hourly_data/${stationId}`)
    .then((response) => response.json())
    .then((data) => {
      const hours = Array.from({ length: 13 }, (_, i) => i + 10);

      // 如果API返回了合并数据，直接使用
      if (data.bikes && data.stands) {
        renderCharts(data.bikes, data.stands, hours, stationId);
      } else {
        const bikeData = generateStationSpecificBikeData(stationId);
        const standData = generateStationSpecificStandData(stationId);
        renderCharts(bikeData, standData, hours, stationId);
      }
    })
    .catch((error) => {
      console.error("Error fetching station-specific data:", error);
      const hours = Array.from({ length: 13 }, (_, i) => i + 10);
      const bikeData = generateStationSpecificBikeData(stationId);
      const standData = generateStationSpecificStandData(stationId);
      renderCharts(bikeData, standData, hours, stationId);
    });
}

// 渲染站点特定的图表
function renderCharts(bikeData, standData, hours, stationId) {
  // 获取容器元素 - 如果不存在就创建
  let bikeChartContainer = document.getElementById("bike-chart-container");
  let standChartContainer = document.getElementById("stand-chart-container");

  // 如果容器不存在，创建并添加到侧边栏
  if (!bikeChartContainer) {
    // 创建图表区域的父容器
    const chartsArea = document.createElement("div");
    chartsArea.className = "charts-area";
    chartsArea.style.backgroundColor = "white";
    chartsArea.style.padding = "15px";
    chartsArea.style.margin = "20px 0";
    chartsArea.style.borderRadius = "5px";
    chartsArea.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

    // 创建标题
    const chartsTitle = document.createElement("h3");
    chartsTitle.textContent = "站点使用统计";
    chartsTitle.style.textAlign = "center";
    chartsTitle.style.margin = "0 0 15px 0";
    chartsArea.appendChild(chartsTitle);

    // 创建自行车可用性图表容器
    bikeChartContainer = document.createElement("div");
    bikeChartContainer.id = "bike-chart-container";
    bikeChartContainer.style.marginBottom = "20px";
    chartsArea.appendChild(bikeChartContainer);

    // 创建停车位可用性图表容器
    standChartContainer = document.createElement("div");
    standChartContainer.id = "stand-chart-container";
    chartsArea.appendChild(standChartContainer);

    // 将图表区域添加到侧边栏
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      // 如果路线详情面板存在且显示，在其后添加图表
      const routeDetails = document.getElementById("route-details");
      if (routeDetails && routeDetails.style.display !== "none") {
        routeDetails.after(chartsArea);
      } else {
        // 否则在表单后添加
        const form = document.getElementById("route-planner-form");
        if (form) {
          form.after(chartsArea);
        } else {
          // 如果都没找到，只能尝试添加到侧边栏
          sidebar.appendChild(chartsArea);
        }
      }
    }
  }

  // 渲染自行车可用性图表
  renderChart(
    bikeChartContainer,
    bikeData,
    hours,
    `站点 ${stationId} 自行车可用量`,
    "bike"
  );

  // 渲染停车位可用性图表
  renderChart(
    standChartContainer,
    standData,
    hours,
    `站点 ${stationId} 停车位可用量`,
    "stand"
  );
}

// 渲染单个图表
function renderChart(container, data, hours, title, type) {
  // 清空容器
  container.innerHTML = "";

  // 添加标题
  const titleElement = document.createElement("h4");
  titleElement.textContent = title;
  titleElement.style.textAlign = "center";
  titleElement.style.margin = "5px 0";
  titleElement.style.fontSize = "14px";
  titleElement.style.color = "#333";
  container.appendChild(titleElement);

  // 创建图表容器
  const chartElement = document.createElement("div");
  chartElement.style.display = "flex";
  chartElement.style.alignItems = "flex-end";
  chartElement.style.height = "150px";
  chartElement.style.position = "relative";
  chartElement.style.borderBottom = "1px solid #ddd";
  chartElement.style.marginBottom = "25px";

  // 找出最大值，用于计算比例
  const maxValue = Math.max(...data.map((item) => item.value));

  // 创建每个柱形
  data.forEach((item) => {
    const barHeight = (item.value / maxValue) * 130; // 最大高度130px
    const bar = document.createElement("div");
    bar.style.flex = "1";
    bar.style.margin = "0 3px";
    bar.style.backgroundColor = type === "bike" ? "#FF5722" : "#4CAF50";
    bar.style.borderRadius = "3px 3px 0 0";
    bar.style.position = "relative";
    bar.style.height = `${barHeight}px`;
    bar.style.transition = "height 0.3s ease";

    // 创建提示工具
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.bottom = "100%";
    tooltip.style.left = "50%";
    tooltip.style.transform = "translateX(-50%)";
    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    tooltip.style.color = "white";
    tooltip.style.padding = "3px 8px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.fontSize = "12px";
    tooltip.style.display = "none";
    tooltip.textContent = item.value;

    // 鼠标悬停时显示提示
    bar.addEventListener("mouseover", () => {
      tooltip.style.display = "block";
    });

    // 鼠标离开时隐藏提示
    bar.addEventListener("mouseout", () => {
      tooltip.style.display = "none";
    });

    bar.appendChild(tooltip);
    chartElement.appendChild(bar);
  });

  container.appendChild(chartElement);

  // 添加时间标签
  const timeLabels = document.createElement("div");
  timeLabels.style.display = "flex";
  timeLabels.style.justifyContent = "space-between";
  timeLabels.style.width = "100%";

  const startLabel = document.createElement("span");
  startLabel.textContent = "10:00";
  startLabel.style.fontSize = "12px";
  startLabel.style.color = "#777";

  const endLabel = document.createElement("span");
  endLabel.textContent = "22:00";
  endLabel.style.fontSize = "12px";
  endLabel.style.color = "#777";

  timeLabels.appendChild(startLabel);
  timeLabels.appendChild(endLabel);

  container.appendChild(timeLabels);
}

function generateStationSpecificBikeData(stationId) {
  const seed = stationId % 5; // 使用5种不同模式

  // 站点基础容量 - 根据站点ID有所变化
  const baseCapacity = 10 + (stationId % 20);

  switch (seed) {
    case 0: // 工作日模式：早晚高峰，中午低谷
      return [
        { hour: 10, value: Math.round(baseCapacity * 0.8) }, // 上午较多
        { hour: 11, value: Math.round(baseCapacity * 0.6) },
        { hour: 12, value: Math.round(baseCapacity * 0.5) }, // 中午最少
        { hour: 13, value: Math.round(baseCapacity * 0.4) },
        { hour: 14, value: Math.round(baseCapacity * 0.5) },
        { hour: 15, value: Math.round(baseCapacity * 0.6) },
        { hour: 16, value: Math.round(baseCapacity * 0.7) },
        { hour: 17, value: Math.round(baseCapacity * 0.8) }, // 下午较多
        { hour: 18, value: Math.round(baseCapacity * 1.0) }, // 晚上最多
        { hour: 19, value: Math.round(baseCapacity * 1.1) },
        { hour: 20, value: Math.round(baseCapacity * 1.2) },
        { hour: 21, value: Math.round(baseCapacity * 1.1) },
        { hour: 22, value: Math.round(baseCapacity * 1.0) },
      ];
    case 1: // 周末模式：中午高峰
      return [
        { hour: 10, value: Math.round(baseCapacity * 0.7) },
        { hour: 11, value: Math.round(baseCapacity * 0.8) },
        { hour: 12, value: Math.round(baseCapacity * 1.0) }, // 中午最多
        { hour: 13, value: Math.round(baseCapacity * 1.1) },
        { hour: 14, value: Math.round(baseCapacity * 1.2) },
        { hour: 15, value: Math.round(baseCapacity * 1.1) },
        { hour: 16, value: Math.round(baseCapacity * 1.0) },
        { hour: 17, value: Math.round(baseCapacity * 0.9) },
        { hour: 18, value: Math.round(baseCapacity * 0.8) },
        { hour: 19, value: Math.round(baseCapacity * 0.7) },
        { hour: 20, value: Math.round(baseCapacity * 0.6) },
        { hour: 21, value: Math.round(baseCapacity * 0.5) }, // 晚上最少
        { hour: 22, value: Math.round(baseCapacity * 0.6) },
      ];
    case 2: // 平稳模式
      return [
        { hour: 10, value: Math.round(baseCapacity * 0.9) },
        { hour: 11, value: Math.round(baseCapacity * 0.9) },
        { hour: 12, value: Math.round(baseCapacity * 0.8) },
        { hour: 13, value: Math.round(baseCapacity * 0.8) },
        { hour: 14, value: Math.round(baseCapacity * 0.8) },
        { hour: 15, value: Math.round(baseCapacity * 0.9) },
        { hour: 16, value: Math.round(baseCapacity * 0.9) },
        { hour: 17, value: Math.round(baseCapacity * 0.8) },
        { hour: 18, value: Math.round(baseCapacity * 0.8) },
        { hour: 19, value: Math.round(baseCapacity * 0.9) },
        { hour: 20, value: Math.round(baseCapacity * 0.9) },
        { hour: 21, value: Math.round(baseCapacity * 0.8) },
        { hour: 22, value: Math.round(baseCapacity * 0.8) },
      ];
    case 3: // 旅游景点模式：上午少，下午多
      return [
        { hour: 10, value: Math.round(baseCapacity * 0.4) }, // 上午最少
        { hour: 11, value: Math.round(baseCapacity * 0.5) },
        { hour: 12, value: Math.round(baseCapacity * 0.6) },
        { hour: 13, value: Math.round(baseCapacity * 0.7) },
        { hour: 14, value: Math.round(baseCapacity * 0.8) },
        { hour: 15, value: Math.round(baseCapacity * 0.9) },
        { hour: 16, value: Math.round(baseCapacity * 1.0) },
        { hour: 17, value: Math.round(baseCapacity * 1.1) },
        { hour: 18, value: Math.round(baseCapacity * 1.2) }, // 下午最多
        { hour: 19, value: Math.round(baseCapacity * 1.1) },
        { hour: 20, value: Math.round(baseCapacity * 1.0) },
        { hour: 21, value: Math.round(baseCapacity * 0.9) },
        { hour: 22, value: Math.round(baseCapacity * 0.8) },
      ];
    case 4: // 波动模式
      return [
        { hour: 10, value: Math.round(baseCapacity * 0.5) },
        { hour: 11, value: Math.round(baseCapacity * 0.9) },
        { hour: 12, value: Math.round(baseCapacity * 0.6) },
        { hour: 13, value: Math.round(baseCapacity * 1.0) },
        { hour: 14, value: Math.round(baseCapacity * 0.7) },
        { hour: 15, value: Math.round(baseCapacity * 1.1) },
        { hour: 16, value: Math.round(baseCapacity * 0.8) },
        { hour: 17, value: Math.round(baseCapacity * 1.2) },
        { hour: 18, value: Math.round(baseCapacity * 0.9) },
        { hour: 19, value: Math.round(baseCapacity * 1.3) },
        { hour: 20, value: Math.round(baseCapacity * 1.0) },
        { hour: 21, value: Math.round(baseCapacity * 1.4) },
        { hour: 22, value: Math.round(baseCapacity * 1.1) },
      ];
    default:
      // 默认使用平均模式
      return [
        { hour: 10, value: Math.round(baseCapacity * 0.7) },
        { hour: 11, value: Math.round(baseCapacity * 0.8) },
        { hour: 12, value: Math.round(baseCapacity * 0.9) },
        { hour: 13, value: Math.round(baseCapacity * 0.8) },
        { hour: 14, value: Math.round(baseCapacity * 0.7) },
        { hour: 15, value: Math.round(baseCapacity * 0.8) },
        { hour: 16, value: Math.round(baseCapacity * 0.9) },
        { hour: 17, value: Math.round(baseCapacity * 1.0) },
        { hour: 18, value: Math.round(baseCapacity * 0.9) },
        { hour: 19, value: Math.round(baseCapacity * 0.8) },
        { hour: 20, value: Math.round(baseCapacity * 0.7) },
        { hour: 21, value: Math.round(baseCapacity * 0.8) },
        { hour: 22, value: Math.round(baseCapacity * 0.9) },
      ];
  }
}

function generateStationSpecificStandData(stationId) {
  // 基于stationId设置随机种子
  const seed = stationId % 5;

  // 总停车位数量
  const totalStands = 20 + (stationId % 15);

  // 获取自行车数据（停车位数据与自行车数据相反）
  const bikeData = generateStationSpecificBikeData(stationId);

  // 计算停车位（总数减去自行车数）
  return bikeData.map((item) => ({
    hour: item.hour,
    value: totalStands - item.value,
  }));
}

// 全局变量存储所有站点数据
window.allStations = [];

// 浮窗控制函数
function toggleFilterModal() {
  const modal = document.getElementById("filter-modal");
  modal.classList.toggle("collapsed");
}

// 填充站点选择器
function populateStationSelect() {
  const stationSelect = document.getElementById("station-select");
  // 清空当前选项（保留"所有站点"选项）
  while (stationSelect.options.length > 1) {
    stationSelect.remove(1);
  }

  // 如果有站点数据，填充选项
  if (window.allStations && window.allStations.length > 0) {
    // 按站点名称排序
    const sortedStations = [...window.allStations].sort((a, b) => {
      return a.Name.localeCompare(b.Name);
    });

    // 添加选项
    sortedStations.forEach((station) => {
      const option = document.createElement("option");
      option.value = station.Number;
      option.textContent = `${station.Name} (${station.Number})`;
      stationSelect.appendChild(option);
    });
  }
}

// 应用筛选条件
function applyFilters() {
  const stationId = document.getElementById("station-select").value;
  const timeValue = document.getElementById("time-select").value;

  // 设置起点和终点站点选择
  if (stationId) {
    // 如果选择了特定站点，更新出行计划
    const station = window.allStations.find((s) => s.Number == stationId);
    if (station) {
      document.getElementById("start-location").value = station.Name;
      // 随机选择一个不同的站点作为终点
      const otherStations = window.allStations.filter(
        (s) => s.Number != stationId
      );
      if (otherStations.length > 0) {
        const randomEndStation =
          otherStations[Math.floor(Math.random() * otherStations.length)];
        document.getElementById("end-location").value = randomEndStation.Name;

        // 触发路线规划
        planJourney();
      }
    }
  }

  // 从后端获取筛选结果
  fetchFilterResults(stationId, timeValue);
}

// 从后端获取筛选结果
function fetchFilterResults(stationId, timeValue) {
  const resultsContent = document.querySelector(".results-content");
  resultsContent.innerHTML = "<p>正在加载数据...</p>";

  // 构建查询参数
  const params = new URLSearchParams();
  if (stationId) params.append("station_id", stationId);
  params.append("time", timeValue);

  // 发送请求到后端API
  fetch(`http://localhost:5000/get_filtered_data?${params.toString()}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("网络请求失败");
      }
      return response.json();
    })
    .then((data) => {
      // 显示返回的数据
      displayFilterResults(data);
    })
    .catch((error) => {
      console.error("获取筛选数据失败:", error);
      displayMockFilterResults(stationId, timeValue);
    });
}

// 显示筛选结果
function displayFilterResults(data) {
  const resultsContent = document.querySelector(".results-content");

  if (!data || Object.keys(data).length === 0) {
    resultsContent.innerHTML =
      '<p class="placeholder-text">没有找到匹配的数据</p>';
    return;
  }

  // 创建结果HTML
  let html = '<div class="results-data">';

  if (data.summary) {
    html += `<p><strong>概要:</strong> ${data.summary}</p>`;
  }

  if (data.details) {
    html += "<ul>";
    Object.entries(data.details).forEach(([key, value]) => {
      html += `<li><strong>${key}:</strong> ${value}</li>`;
    });
    html += "</ul>";
  }

  html += "</div>";
  resultsContent.innerHTML = html;
}

function displayMockFilterResults(stationId, timeValue) {
  const resultsContent = document.querySelector(".results-content");
  const time = timeValue || "全天";
  const station = stationId ? `站点 ${stationId}` : "所有站点";

  const mockData = {
    summary: `${station} 在 ${time}:00 的数据`,
    details: {
      平均可用车辆: Math.floor(Math.random() * 10) + 5,
      平均可用车位: Math.floor(Math.random() * 15) + 10,
      使用率: `${Math.floor(Math.random() * 100)}%`,
      数据采集时间: new Date().toLocaleString(),
    },
  };

  displayFilterResults(mockData);
}

// 重置筛选条件
function resetFilters() {
  document.getElementById("station-select").selectedIndex = 0;
  document.getElementById("time-select").selectedIndex = 0;

  // 清空筛选结果
  const resultsContent = document.querySelector(".results-content");
  resultsContent.innerHTML =
    '<p class="placeholder-text">应用筛选后将显示结果...</p>';

  // 清空路线规划的输入框
  document.getElementById("start-location").value = "";
  document.getElementById("end-location").value = "";

  // 清除地图标记和路线
  clearRouteAndMarkers();

  // 提供反馈
  alert("已重置筛选条件");
}

// 清除地图上的路线和标记
function clearRouteAndMarkers() {
  // 如果有定义地图对象和标记，清除它们
  if (window.startMarker) {
    window.startMarker.setMap(null);
  }
  if (window.endMarker) {
    window.endMarker.setMap(null);
  }
  if (window.routeLine) {
    window.routeLine.setMap(null);
  }

  // 清空路线详情
  const routeDetailsElement = document.getElementById("route-details");
  if (routeDetailsElement) {
    routeDetailsElement.innerHTML = "";
  }
}

// Show station info in popup with selection message
function showStationInfoInPopup(station, selectionMessage) {
  // Get real-time station availability data
  fetch(
    `http://localhost:5000/get_station_details/${
      station.Number || station.number
    }`
  )
    .then((response) => response.json())
    .then((data) => {
      const available_bikes =
        data.available_bikes || station.Available_bikes || 0;
      const available_bike_stands =
        data.available_bike_stands || station.Available_bike_stands || 0;
      const total_capacity =
        data.bike_stands ||
        parseInt(available_bikes) + parseInt(available_bike_stands) ||
        0;

      // Display station popup
      const popup = document.getElementById("station-popup");
      popup.style.display = "block";

      // Set station title
      document.getElementById("station-popup-title").textContent =
        station.Name || station.name;

      // Fill station information
      const content = document.getElementById("station-popup-content");
      content.innerHTML = `
<p><span>Station Number:</span> <span>${
        station.Number || station.number || "N/A"
      }</span></p>
<p><span>Address:</span> <span>${
        station.Address || station.address || "Unknown address"
      }</span></p>
<p><span>Available Bikes:</span> <span>${available_bikes}</span></p>
<p><span>Available Stands:</span> <span>${available_bike_stands}</span></p>
<p><span>Total Capacity:</span> <span>${total_capacity}</span></p>
<div class="selection-message">${selectionMessage}</div>
`;

      // Generate and display station charts with real data
      fetchStationHourlyData(station.Number || station.number || 1);

      // Set button click events
      const startBtn = document.getElementById("set-as-start-btn");
      const endBtn = document.getElementById("set-as-end-btn");

      // Clear old event listeners
      startBtn.replaceWith(startBtn.cloneNode(true));
      endBtn.replaceWith(endBtn.cloneNode(true));

      // Get new button references
      const newStartBtn = document.getElementById("set-as-start-btn");
      const newEndBtn = document.getElementById("set-as-end-btn");

      // Add new event listeners
      newStartBtn.addEventListener("click", function () {
        selectAsStart(station.Name || station.name);
        window.selectionMode = "end";
        updateSelectionModeIndicator();
        closeStationPopup();
      });

      newEndBtn.addEventListener("click", function () {
        selectAsEnd(station.Name || station.name);
        window.selectionMode = "start";
        updateSelectionModeIndicator();
        closeStationPopup();
      });
    })
    .catch((error) => {
      console.error("Error fetching station details:", error);
      // Fallback to using the station data we already have
      fallbackStationInfo(station, selectionMessage);
    });
}

// Fallback method for displaying station info when API fails
function fallbackStationInfo(station, selectionMessage) {
  // Use whatever data we already have for the station
  const available_bikes =
    station.Available_bikes || station.available_bikes || "10";
  const available_bike_stands =
    station.Available_bike_stands || station.available_bike_stands || "5";
  const total_capacity =
    parseInt(available_bikes) + parseInt(available_bike_stands);

  // Display station popup
  const popup = document.getElementById("station-popup");
  popup.style.display = "block";

  // Set station title
  document.getElementById("station-popup-title").textContent =
    station.Name || station.name;

  // Fill station information
  const content = document.getElementById("station-popup-content");
  content.innerHTML = `
<p><span>Station Number:</span> <span>${
    station.Number || station.number || "N/A"
  }</span></p>
<p><span>Address:</span> <span>${
    station.Address || station.address || "Unknown address"
  }</span></p>
<p><span>Available Bikes:</span> <span>${available_bikes}</span></p>
<p><span>Available Stands:</span> <span>${available_bike_stands}</span></p>
<p><span>Total Capacity:</span> <span>${total_capacity}</span></p>
<div class="selection-message">${selectionMessage}</div>
`;

  // Generate and display station charts with simulated data
  generateStationCharts(station.Number || station.number || 1);

  // Set button click events same as in main function
  const startBtn = document.getElementById("set-as-start-btn");
  const endBtn = document.getElementById("set-as-end-btn");

  startBtn.replaceWith(startBtn.cloneNode(true));
  endBtn.replaceWith(endBtn.cloneNode(true));

  const newStartBtn = document.getElementById("set-as-start-btn");
  const newEndBtn = document.getElementById("set-as-end-btn");

  newStartBtn.addEventListener("click", function () {
    selectAsStart(station.Name || station.name);
    window.selectionMode = "end";
    updateSelectionModeIndicator();
    closeStationPopup();
  });

  newEndBtn.addEventListener("click", function () {
    selectAsEnd(station.Name || station.name);
    window.selectionMode = "start";
    updateSelectionModeIndicator();
    closeStationPopup();
  });
}

// Fetch station hourly data from API
function fetchStationHourlyData(stationId) {
  fetch(`http://localhost:5000/get_station_hourly_data/${stationId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.bikes && data.stands) {
        // If we have real data, use it
        // Convert hours for display
        const hours = data.bikes.map((item) => item.hour);

        // Generate charts with real data
        generateChart(
          "bikes-chart-container",
          "bikes-time-labels",
          data.bikes,
          hours,
          "bike"
        );
        generateChart(
          "stands-chart-container",
          "stands-time-labels",
          data.stands,
          hours,
          "stand"
        );
      } else {
        // If no real data, fall back to simulated data
        generateStationCharts(stationId);
      }
    })
    .catch((error) => {
      console.error("Error fetching station hourly data:", error);
      // Fall back to simulated data
      generateStationCharts(stationId);
    });
}
