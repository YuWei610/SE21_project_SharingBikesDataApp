// // 添加不依赖Google Maps API的初始化函数
// function initMapWithoutAPI() {
//   console.log("使用备用地图初始化");

//   // 创建一个简单的地图显示区域
//   const mapElement = document.getElementById("map");
//   mapElement.innerHTML =
//     '<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background-color:#f0f0f0;"><p>地图加载失败，但您仍可以使用站点列表功能</p></div>';

//   // 初始化全局对象以避免错误
//   window.map = { getCenter: () => ({ lat: 53.349805, lng: -6.26031 }) };
//   window.google = {
//     maps: {
//       Map: function () {
//         return window.map;
//       },
//       Marker: function () {
//         return {
//           setMap: () => {},
//           getPosition: () => ({ lat: () => 53.349805, lng: () => -6.26031 }),
//         };
//       },
//       InfoWindow: function () {
//         return { open: () => {} };
//       },
//       LatLngBounds: function () {
//         return {
//           extend: () => {},
//           getCenter: () => ({ lat: 53.349805, lng: -6.26031 }),
//         };
//       },
//       SymbolPath: { CIRCLE: 0 },
//       event: { addListener: () => {} },
//     },
//   };

//   // 加载站点数据
//   loadStations(window.map);
// }

// function initMap() {
//   try {
//     // 基本地图初始化
//     var location = { lat: 53.349805, lng: -6.26031 }; // 都柏林中心位置
//     var map = new google.maps.Map(document.getElementById("map"), {
//       zoom: 14,
//       center: location,
//       mapTypeId: google.maps.MapTypeId.ROADMAP,
//       mapTypeControl: false, // 隐藏默认的地图类型控件
//     });

//     // 保存到全局变量
//     window.map = map;

//     // 加载都柏林自行车站点数据
//     loadStations(map);

//     // 注意：事件监听器在页面主DOMContentLoaded中统一处理，此处无需重复添加
//   } catch (e) {
//     console.error("初始化地图时出错:", e);
//     initMapWithoutAPI();
//   }
// }

// // 加载自行车站点数据的函数
// function loadStations(map) {
//   // 从dublin.csv加载数据或通过API获取
//   fetch("http://localhost:5000/get_stations")
//     .then((response) => response.json())
//     .then((data) => {
//       // 保存站点数据到全局，以便路线规划使用
//       window.stationsData = data;

//       // 在地图上显示站点
//       displayStations(map, data);
//     })
//     .catch((error) => {
//       console.error("Error loading stations:", error);
//       const mockStations = generateMockStations();
//       window.stationsData = mockStations;
//       displayStations(map, mockStations);
//     });
// }

// function generateMockStations() {
//   const dublinCenter = { lat: 53.349805, lng: -6.26031 };
//   const mockStations = [];

//   for (let i = 1; i <= 20; i++) {
//     const lat = dublinCenter.lat + (Math.random() - 0.5) * 0.02;
//     const lng = dublinCenter.lng + (Math.random() - 0.5) * 0.03;

//     mockStations.push({
//       Number: i,
//       Name: `Mock station ${i}`,
//       Address: `Mock address ${i}`,
//       Latitude: lat,
//       Longitude: lng,
//       Bike_stands: Math.floor(Math.random() * 20) + 10,
//       Available_bikes: Math.floor(Math.random() * 10) + 1,
//       Available_bike_stands: Math.floor(Math.random() * 10) + 1,
//     });
//   }

//   return mockStations;
// }

// // 在地图上显示站点的函数
// function displayStations(map, stations) {
//   // 清除之前的标记
//   if (window.stationMarkers) {
//     window.stationMarkers.forEach((marker) => marker.setMap(null));
//   }
//   window.stationMarkers = [];

//   // 遍历站点数据创建标记
//   stations.forEach((station) => {
//     // 有些测试站点可能没有坐标，需要处理
//     const lat = parseFloat(station.Position_lat || station.position_lat || 0);
//     const lng = parseFloat(station.Position_lon || station.Position_lon || 0);

//     if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
//       console.warn("站点没有有效的坐标:", station.Name || station.name);
//       return;
//     }

//     // 创建标记
//     const marker = new google.maps.Marker({
//       position: {
//         lat: lat,
//         lng: lng,
//       },
//       map: map,
//       title: station.Name,
//       icon: {
//         path: google.maps.SymbolPath.CIRCLE,
//         fillColor: "#3388ff",
//         fillOpacity: 0.8,
//         strokeWeight: 1,
//         strokeColor: "#ffffff",
//         scale: 8,
//       },
//     });

//     // 保存标记
//     window.stationMarkers.push(marker);

//     // 添加点击事件
//     marker.addListener("click", () => {
//       // 先关闭行程规划弹窗
//       closeJourneyPlannerPopup();

//       // 显示站点信息到侧边栏
//       showStationInfoInSidebar(station);

//       // 设置路线起点或终点
//       handleStationSelection(station);
//     });
//   });

//   // 添加对象到地图
//   window.stationMarkers.forEach((marker) => marker.setMap(map));
// }

// // 用于处理站点选择作为起点或终点
// function handleStationSelection(station) {
//   // 如果没有起点，设为起点
//   if (!document.getElementById("start-location").value) {
//     document.getElementById("start-location").value = station.Name;
//   }
//   // 否则如果没有终点，设为终点
//   else if (!document.getElementById("end-location").value) {
//     document.getElementById("end-location").value = station.Name;

//     // 如果起点和终点都设置了，可以自动规划路线
//     // planJourney(); // 去掉自动规划，让用户点击按钮规划
//   }
//   // 如果起点和终点都已设置，重新设置起点
//   else {
//     document.getElementById("start-location").value = station.Name;
//     document.getElementById("end-location").value = ""; // 清除终点
//   }
// }

// // 在侧边栏显示站点信息
// function showStationInfoInSidebar(station) {
//   if (!station.Available_bikes)
//     station.Available_bikes = Math.floor(Math.random() * 10) + 5;
//   if (!station.Available_bike_stands)
//     station.Available_bike_stands = Math.floor(Math.random() * 15) + 5;
//   const totalCapacity =
//     parseInt(station.Available_bikes) + parseInt(station.Available_bike_stands);

//   // 保存当前站点信息到全局变量，以便后续使用
//   window.lastSelectedStation = station;

//   // 关闭行程规划弹窗，确保不会两个同时显示
//   closeJourneyPlannerPopup();

//   // 显示站点弹窗
//   const popup = document.getElementById("station-popup");
//   popup.style.display = "block";

//   // 设置站点标题
//   document.getElementById("station-popup-title").textContent =
//     station.Name || station.name;

//   // 填充站点信息
//   const content = document.getElementById("station-popup-content");
//   content.innerHTML = `
//     <p><span>站点编号:</span> <span>${
//       station.Number || station.number || "N/A"
//     }</span></p>
//     <p><span>地址:</span> <span>${
//       station.Address ||
//       station.address ||
//       "Mock address " + (station.Number || station.number || "")
//     }</span></p>
//     <p><span>可用自行车:</span> <span>${
//       station.Available_bikes || station.available_bikes || "0"
//     } 辆</span></p>
//     <p><span>空位数量:</span> <span>${
//       station.Available_bike_stands || station.available_bike_stands || "0"
//     } 个</span></p>
//     <p><span>总容量:</span> <span>${
//       station.Bike_stands || station.bike_stands || totalCapacity || "0"
//     } 辆</span></p>
//   `;

//   // 生成并显示站点图表
//   generateStationCharts(station.Number || 1);

//   // 设置按钮点击事件
//   const startBtn = document.getElementById("set-as-start-btn");
//   const endBtn = document.getElementById("set-as-end-btn");
//   const toJourneyBtn = document.getElementById("to-journey-planner-btn");

//   // 清除旧事件监听器
//   startBtn.replaceWith(startBtn.cloneNode(true));
//   endBtn.replaceWith(endBtn.cloneNode(true));
//   toJourneyBtn.replaceWith(toJourneyBtn.cloneNode(true));

//   // 获取新的按钮引用
//   const newStartBtn = document.getElementById("set-as-start-btn");
//   const newEndBtn = document.getElementById("set-as-end-btn");
//   const newToJourneyBtn = document.getElementById("to-journey-planner-btn");

//   // 添加新的事件监听器
//   newStartBtn.addEventListener("click", function () {
//     setAsStart(station.Name);
//     closeStationPopup();
//   });

//   newEndBtn.addEventListener("click", function () {
//     setAsEnd(station.Name);
//     closeStationPopup();
//   });

//   // 添加跳转到行程规划的事件监听器
//   newToJourneyBtn.addEventListener("click", function () {
//     closeStationPopup();
//     showJourneyPlannerPopup();
//   });
// }

// // 生成站点图表
// function generateStationCharts(stationId) {
//   // 生成小时数据 - 从早上4点到晚上22点
//   const hours = [
//     4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
//   ];

//   // 使用随机种子生成两种不同模式的数据
//   const stationSeed = stationId % 5;

//   // 生成自行车可用性数据
//   const bikeData = generateHourlyDataForStation(stationSeed, hours, "bike");
//   generateChart(
//     "bikes-chart-container",
//     "bikes-time-labels",
//     bikeData,
//     hours,
//     "bike"
//   );

//   // 生成车位可用性数据
//   const standData = generateHourlyDataForStation(stationSeed, hours, "stand");
//   generateChart(
//     "stands-chart-container",
//     "stands-time-labels",
//     standData,
//     hours,
//     "stand"
//   );
// }

// // 基于种子生成站点数据
// function generateHourlyDataForStation(seed, hours, type) {
//   const totalCapacity = 20 + seed * 5;
//   const data = [];

//   // 根据种子和类型创建不同的使用模式
//   if (type === "bike") {
//     // 自行车可用性模式
//     switch (seed) {
//       case 0: // 早晚低，中午高（上班区域）
//         hours.forEach((hour) => {
//           let value;
//           if (hour < 7) value = totalCapacity * 0.9; // 早上大部分可用
//           else if (hour < 10) value = totalCapacity * 0.3; // 上班高峰少
//           else if (hour < 16) value = totalCapacity * 0.7; // 中午大部分回来
//           else if (hour < 19) value = totalCapacity * 0.2; // 下班高峰少
//           else value = totalCapacity * 0.8; // 晚上大部分回来
//           data.push({
//             hour,
//             value: Math.round(value + (Math.random() * 3 - 1.5)),
//           });
//         });
//         break;
//       case 1: // 早晚高，中午低（居住区域）
//         hours.forEach((hour) => {
//           let value;
//           if (hour < 7) value = totalCapacity * 0.3; // 早上很少
//           else if (hour < 10) value = totalCapacity * 0.8; // 上班高峰多
//           else if (hour < 16) value = totalCapacity * 0.4; // 中午少
//           else if (hour < 19) value = totalCapacity * 0.9; // 下班高峰多
//           else value = totalCapacity * 0.5; // 晚上一般
//           data.push({
//             hour,
//             value: Math.round(value + (Math.random() * 3 - 1.5)),
//           });
//         });
//         break;
//       case 2: // 周末模式（相对平稳但中午低）
//         hours.forEach((hour) => {
//           let value;
//           if (hour < 10) value = totalCapacity * 0.7;
//           else if (hour < 14) value = totalCapacity * 0.4;
//           else if (hour < 18) value = totalCapacity * 0.5;
//           else value = totalCapacity * 0.7;
//           data.push({
//             hour,
//             value: Math.round(value + (Math.random() * 3 - 1.5)),
//           });
//         });
//         break;
//       case 3: // 旅游区（上午高，下午逐步减少）
//         hours.forEach((hour) => {
//           let value = totalCapacity * (0.8 - (hour - 4) * 0.03);
//           data.push({
//             hour,
//             value: Math.round(value + (Math.random() * 3 - 1.5)),
//           });
//         });
//         break;
//       default: // 平稳模式
//         hours.forEach((hour) => {
//           let value = totalCapacity * 0.6 + Math.random() * 0.2;
//           data.push({ hour, value: Math.round(value) });
//         });
//     }
//   } else {
//     // 车位数据（与自行车相反）
//     const bikeData = generateHourlyDataForStation(seed, hours, "bike");
//     hours.forEach((hour, index) => {
//       data.push({
//         hour,
//         value: Math.round(totalCapacity - bikeData[index].value),
//       });
//     });
//   }

//   return data;
// }

// // 生成图表
// function generateChart(containerId, labelsId, data, hours, type) {
//   const container = document.getElementById(containerId);
//   const labelsContainer = document.getElementById(labelsId);

//   // 清空容器
//   container.innerHTML = "";
//   labelsContainer.innerHTML = "";

//   // 找到最大值
//   const maxValue = Math.max(...data.map((item) => item.value)) * 1.1; // 增加10%空间

//   // 绘制条形图
//   data.forEach((item) => {
//     const barHeight = (item.value / maxValue) * 100;
//     const bar = document.createElement("div");
//     bar.className = `chart-bar ${type}`;
//     bar.style.height = `${barHeight}%`;
//     bar.setAttribute("data-value", item.value);
//     container.appendChild(bar);
//   });

//   // 添加时间标签（显示更多时间点以提高可读性）
//   const showLabels = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
//   hours.forEach((hour) => {
//     const label = document.createElement("div");
//     label.className = "time-label";
//     label.textContent = showLabels.includes(hour) ? `${hour}:00` : "";
//     labelsContainer.appendChild(label);
//   });
// }

// // 关闭站点弹窗
// function closeStationPopup() {
//   const popup = document.getElementById("station-popup");
//   popup.style.display = "none";

//   // 不隐藏遮罩层，注释掉以下行
//   // document.getElementById('overlay').style.display = 'none';
// }

// // 将站点设为起点
// function setAsStart(stationName) {
//   document.getElementById("start-location").value = stationName;
//   // 如果终点已经设置，可以考虑自动规划路线
//   // if (document.getElementById('end-location').value) {
//   //   planJourney();
//   // }
// }

// // 将站点设为终点
// function setAsEnd(stationName) {
//   document.getElementById("end-location").value = stationName;
//   // 如果起点已经设置，可以考虑自动规划路线
//   // if (document.getElementById('start-location').value) {
//   //   planJourney();
//   // }
// }

// // 规划路线
// function planJourney() {
//   console.log("执行路线规划...");

//   // 获取Journey Planner弹窗中的输入值
//   let startLocation, endLocation;

//   // 检查是否在Journey Planner弹窗中
//   const journeyPlannerPopup = document.getElementById("journey-planner-popup");
//   if (journeyPlannerPopup && journeyPlannerPopup.style.display === "block") {
//     // 从Journey Planner弹窗获取值
//     startLocation = document.querySelector(
//       "#journey-planner-popup #start-location"
//     ).value;
//     endLocation = document.querySelector(
//       "#journey-planner-popup #end-location"
//     ).value;
//   } else {
//     // 从侧边栏获取值
//     startLocation = document.getElementById("start-location").value;
//     endLocation = document.getElementById("end-location").value;
//   }

//   console.log("获取到的起点:", startLocation);
//   console.log("获取到的终点:", endLocation);

//   const selectedDay =
//     document.querySelector('input[name="journey-date"]:checked')?.value ||
//     "today";
//   const selectedTime =
//     document.getElementById("journey-time")?.value || "00:05";

//   if (!startLocation || !endLocation) {
//     alert("请输入起点和终点位置");
//     return;
//   }

//   // 显示加载状态
//   const planButton =
//     document.getElementById("plan-journey-btn") ||
//     document.querySelector(".btn");
//   if (planButton) {
//     const originalText = planButton.textContent;
//     planButton.textContent = "正在计算路线...";
//     planButton.disabled = true;

//     // 恢复按钮状态的函数
//     const restoreButton = () => {
//       planButton.textContent = originalText;
//       planButton.disabled = false;
//     };

//     try {
//       // 获取站点数据
//       fetch("http://localhost:5000/get_stations")
//         .then((response) => response.json())
//         .then((stationsData) => {
//           window.stations = stationsData;

//           // 查找匹配用户输入的站点
//           const startStation = findStationByNameOrAddress(
//             stationsData,
//             startLocation
//           );
//           const endStation = findStationByNameOrAddress(
//             stationsData,
//             endLocation
//           );

//           if (!startStation) {
//             alert(`找不到匹配的起点站点: "${startLocation}"`);
//             restoreButton();
//             return;
//           }

//           if (!endStation) {
//             alert(`找不到匹配的终点站点: "${endLocation}"`);
//             restoreButton();
//             return;
//           }

//           // 计算路线
//           calculateRoute(startStation, endStation);

//           // 恢复按钮状态
//           restoreButton();
//         })
//         .catch((error) => {
//           console.error("加载站点数据出错:", error);

//           // 使用模拟数据作为后备方案
//           if (window.stationMarkers && window.stationMarkers.length > 0) {
//             // 从地图标记生成临时站点数据
//             const mockStations = window.stationMarkers
//               .map((marker, index) => {
//                 if (!marker.station) return null;
//                 return marker.station;
//               })
//               .filter(Boolean);

//             if (mockStations.length === 0) {
//               // 生成一些简单的模拟站点数据以便演示
//               const mockData = [];
//               for (let i = 1; i <= 20; i++) {
//                 mockData.push({
//                   Number: i,
//                   Name: `Mock station ${i}`,
//                   Address: `Mock address ${i}`,
//                   Latitude: 53.349805 + (Math.random() - 0.5) * 0.02,
//                   Longitude: -6.26031 + (Math.random() - 0.5) * 0.02,
//                   Available_bikes: Math.floor(Math.random() * 10) + 1,
//                   Available_bike_stands: Math.floor(Math.random() * 10) + 1,
//                 });
//               }
//               window.stations = mockData;
//             } else {
//               window.stations = mockStations;
//             }

//             // 查找匹配的站点
//             const startStation = findStationByNameOrAddress(
//               window.stations,
//               startLocation
//             );
//             const endStation = findStationByNameOrAddress(
//               window.stations,
//               endLocation
//             );

//             if (!startStation) {
//               alert(`找不到匹配的起点站点: "${startLocation}"`);
//               restoreButton();
//               return;
//             }

//             if (!endStation) {
//               alert(`找不到匹配的终点站点: "${endLocation}"`);
//               restoreButton();
//               return;
//             }

//             // 计算路线
//             calculateRoute(startStation, endStation);
//           } else {
//             alert("无法获取站点数据，使用模拟数据进行演示");

//             // 创建模拟站点数据
//             const mockStart = {
//               Number: 17,
//               Name: startLocation,
//               Address: "Mock address for " + startLocation,
//               Latitude: 53.349805 + (Math.random() - 0.5) * 0.01,
//               Longitude: -6.26031 + (Math.random() - 0.5) * 0.01,
//               Available_bikes: Math.floor(Math.random() * 10) + 1,
//               Available_bike_stands: Math.floor(Math.random() * 10) + 1,
//             };

//             const mockEnd = {
//               Number: 3,
//               Name: endLocation,
//               Address: "Mock address for " + endLocation,
//               Latitude: 53.349805 + (Math.random() - 0.5) * 0.01,
//               Longitude: -6.26031 + (Math.random() - 0.5) * 0.01,
//               Available_bikes: Math.floor(Math.random() * 10) + 1,
//               Available_bike_stands: Math.floor(Math.random() * 10) + 1,
//             };

//             // 计算路线
//             calculateRoute(mockStart, mockEnd);
//           }

//           // 恢复按钮状态
//           restoreButton();
//         });
//     } catch (error) {
//       console.error("路线规划错误:", error);
//       alert("路线规划发生错误: " + error.message);
//       restoreButton();
//     }
//   } else {
//     alert("找不到计划路线按钮");
//   }
// }

// // 查找匹配用户输入的站点
// function findStationByNameOrAddress(stations, searchText) {
//   if (!searchText || !stations || stations.length === 0) {
//     return null;
//   }

//   // 准备搜索文本（去除空格，转为小写）
//   const normalizedSearch = searchText.toLowerCase().trim();

//   // 精确匹配
//   let matchedStation = stations.find(
//     (station) =>
//       (station.Name && station.Name.toLowerCase() === normalizedSearch) ||
//       (station.name && station.name.toLowerCase() === normalizedSearch) ||
//       (station.Address && station.Address.toLowerCase() === normalizedSearch) ||
//       (station.address && station.address.toLowerCase() === normalizedSearch)
//   );

//   // 如果没有精确匹配，尝试部分匹配
//   if (!matchedStation) {
//     matchedStation = stations.find(
//       (station) =>
//         (station.Name &&
//           station.Name.toLowerCase().includes(normalizedSearch)) ||
//         (station.name &&
//           station.name.toLowerCase().includes(normalizedSearch)) ||
//         (station.Address &&
//           station.Address.toLowerCase().includes(normalizedSearch)) ||
//         (station.address &&
//           station.address.toLowerCase().includes(normalizedSearch))
//     );
//   }

//   return matchedStation;
// }

// // 计算路线
// function calculateRoute(startStation, endStation) {
//   // 清除之前的路线和标记
//   if (window.currentRoute) {
//     window.currentRoute.setMap(null);
//   }

//   if (window.routeMarkers) {
//     window.routeMarkers.forEach((marker) => marker.setMap(null));
//   }
//   window.routeMarkers = [];

//   if (window.directionsRenderer) {
//     window.directionsRenderer.setMap(null);
//   }

//   // 创建起点和终点位置对象
//   const startPos = {
//     lat: parseFloat(startStation.Latitude || startStation.latitude),
//     lng: parseFloat(startStation.Longitude || startStation.longitude),
//   };

//   const endPos = {
//     lat: parseFloat(endStation.Latitude || endStation.latitude),
//     lng: parseFloat(endStation.Longitude || endStation.longitude),
//   };

//   // 创建起点标记
//   const startMarker = new google.maps.Marker({
//     position: startPos,
//     map: window.map,
//     title: startStation.Name || startStation.name,
//     icon: {
//       path: google.maps.SymbolPath.CIRCLE,
//       fillColor: "#4CAF50", // 绿色
//       fillOpacity: 1,
//       strokeWeight: 2,
//       strokeColor: "#FFFFFF",
//       scale: 12,
//     },
//   });
//   window.routeMarkers = [startMarker];

//   // 创建终点标记
//   const endMarker = new google.maps.Marker({
//     position: endPos,
//     map: window.map,
//     title: endStation.Name || endStation.name,
//     icon: {
//       path: google.maps.SymbolPath.CIRCLE,
//       fillColor: "#F44336", // 红色
//       fillOpacity: 1,
//       strokeWeight: 2,
//       strokeColor: "#FFFFFF",
//       scale: 12,
//     },
//   });
//   window.routeMarkers.push(endMarker);

//   // 使用增强版直线路径
//   createEnhancedPathBetweenPoints(startPos, endPos);

//   // 计算距离、时间，并显示路线详情
//   const distanceKm = calculateDistance(
//     startPos.lat,
//     startPos.lng,
//     endPos.lat,
//     endPos.lng
//   );

//   const adjustedDistance = distanceKm * 1.3;
//   const durationMin = Math.round((adjustedDistance / 15) * 60);
//   const durationText =
//     durationMin > 60
//       ? Math.floor(durationMin / 60) + " 小时 " + (durationMin % 60) + " 分钟"
//       : durationMin + " 分钟";
//   const distanceText = adjustedDistance.toFixed(2) + " 公里";

//   // 调整地图视野以包含所有标记
//   const bounds = new google.maps.LatLngBounds();
//   bounds.extend(startPos);
//   bounds.extend(endPos);
//   window.map.fitBounds(bounds);

//   // 记录路线日志
//   console.log("使用增强路径规划:", {
//     start: startStation.Name || startStation.name,
//     end: endStation.Name || endStation.name,
//     distance: distanceText,
//     duration: durationText,
//   });

//   // 显示路线详情
//   showRouteDetails(startStation, endStation, distanceText, durationText);

//   // 如果是从Journey Planner弹窗调用的，关闭弹窗
//   if (
//     document.getElementById("journey-planner-popup").style.display === "block"
//   ) {
//     closeJourneyPlannerPopup();
//   }
// }

// // 创建增强的路径线
// function createEnhancedPathBetweenPoints(startPos, endPos) {
//   if (window.currentRoute) {
//     window.currentRoute.setMap(null);
//   }

//   const waypoints = generateWaypoints(startPos, endPos, 2);

//   // 添加起点和终点
//   const fullPath = [startPos, ...waypoints, endPos];

//   // 创建平滑曲线路径
//   window.currentRoute = new google.maps.Polyline({
//     path: fullPath,
//     geodesic: true,
//     strokeColor: "#3366FF",
//     strokeOpacity: 0.8,
//     strokeWeight: 5,
//     icons: [
//       {
//         icon: {
//           path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
//           scale: 3,
//         },
//         repeat: "100px",
//       },
//     ],
//   });

//   window.currentRoute.setMap(window.map);
// }

// // 生成路径中间点
// function generateWaypoints(start, end, numPoints) {
//   const waypoints = [];

//   // 计算两点之间的向量
//   const dx = end.lng - start.lng;
//   const dy = end.lat - start.lat;

//   // 生成沿着主方向的随机偏移中间点
//   for (let i = 1; i <= numPoints; i++) {
//     // 位置系数 - 均匀分布在路径上
//     const fraction = i / (numPoints + 1);

//     // 基础位置
//     const baseLng = start.lng + dx * fraction;
//     const baseLat = start.lat + dy * fraction;

//     // 添加垂直于主方向的随机偏移
//     // 偏移量随距离增加而减小，使路径看起来更自然
//     const offsetFactor = 0.2 * (1 - Math.abs(fraction - 0.5) * 2);

//     // 创建垂直于主方向的偏移
//     const perpDx = -dy * offsetFactor;
//     const perpDy = dx * offsetFactor;

//     // 随机确定偏移方向(可能为正或负)
//     const randomSign = Math.random() > 0.5 ? 1 : -1;

//     waypoints.push({
//       lat: baseLat + (perpDy * randomSign) / 100,
//       lng: baseLng + (perpDx * randomSign) / 100,
//     });
//   }

//   return waypoints;
// }

// // 显示路线详情
// function showRouteDetails(startStation, endStation, distance, duration) {
//   // 显示路线详情面板
//   const detailsContainer = document.getElementById("route-details");
//   if (!detailsContainer) {
//     console.error("未找到路线详情容器");
//     return;
//   }

//   const content = document.getElementById("route-details-content");
//   if (!content) {
//     console.error("未找到路线详情内容元素");
//     return;
//   }

//   // 计算随机的步行距离
//   const walkDistanceStart = Math.round(Math.random() * 100) / 100; // 0.00-1.00km之间的随机距离
//   const walkTimeStart = Math.round(walkDistanceStart * 12);

//   const walkDistanceEnd = Math.round(Math.random() * 100) / 100; // 0.00-1.00km之间的随机距离
//   const walkTimeEnd = Math.round(walkDistanceEnd * 12);

//   // 从路线距离和时间中提取数字
//   const bikeDistance = parseFloat(distance.split(" ")[0]);
//   let bikeTime = 0;
//   if (duration.includes("小时")) {
//     const parts = duration.split("小时");
//     const hours = parseInt(parts[0].trim());
//     const mins = parseInt(parts[1].split("分钟")[0].trim());
//     bikeTime = hours * 60 + mins;
//   } else {
//     bikeTime = parseInt(duration.split("分钟")[0].trim());
//   }

//   // 构建路线详情HTML
//   content.innerHTML = `
//       <h3>路线详情</h3>
//       <div class="detail-item">
//           <strong>总距离:</strong> ${distance}
//       </div>
//       <div class="detail-item">
//           <strong>预计时间:</strong> ${duration}
//       </div>
//       <hr>
//       <div class="detail-item">
//           <strong>步行至起点站:</strong> ${walkDistanceStart.toFixed(
//             2
//           )} 公里 (约 ${walkTimeStart} 分钟)
//       </div>
//       <div class="detail-item">
//           <strong>骑行:</strong> ${bikeDistance.toFixed(
//             2
//           )} 公里 (约 ${bikeTime} 分钟)
//       </div>
//       <div class="detail-item">
//           <strong>步行至目的地:</strong> ${walkDistanceEnd.toFixed(
//             2
//           )} 公里 (约 ${walkTimeEnd} 分钟)
//       </div>
//       <hr>
//       <div class="detail-item">
//           <strong>起点站:</strong> ${startStation.Name || startStation.name}
//           <div>可用自行车: ${
//             startStation.Available_bikes || startStation.available_bikes || 5
//           } 辆</div>
//       </div>
//       <div class="detail-item">
//           <strong>终点站:</strong> ${endStation.Name || endStation.name}
//           <div>可用停车位: ${
//             endStation.Available_bike_stands ||
//             endStation.available_bike_stands ||
//             8
//           } 个</div>
//       </div>
//   `;

//   // 显示详情面板
//   detailsContainer.style.display = "block";
// }

// // 计算两点之间的距离（公里）
// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // 地球半径（公里）
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// // 使用Haversine公式计算两点间的距离（公里）
// function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // 地球半径（公里）
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c;
//   return distance;
// }

// // 使用OpenWeatherMap API获取天气数据
// const weatherApiKey = "1e5d3d18989bed9a0ed5f59d50a821ac"; // OpenWeatherMap API密钥
// const city = "Dublin"; // 你可以根据需要更改城市
// const weatherElement = document.getElementById("weather");

// function fetchWeather() {
//   fetch(
//     `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       const weather = data.weather[0].description;
//       const temp = data.main.temp;
//       weatherElement.textContent = `${city}: ${temp}°C, ${weather}`;
//     })
//     .catch((error) => {
//       console.error("Error fetching weather data:", error);
//       weatherElement.textContent = "Failed to load weather data";
//     });
// }

// // 页面加载完成后执行
// document.addEventListener("DOMContentLoaded", function () {
//   // 初始化地图
//   initMap();

//   // 加载天气信息
//   fetchWeather();

//   // 添加事件监听器到行程规划按钮
//   document
//     .getElementById("journey-planner-btn")
//     .addEventListener("click", showJourneyPlannerPopup);

//   // 加载站点数据并填充选择器
//   fetch("http://localhost:5000/get_stations")
//     .then((response) => response.json())
//     .then((stations) => {
//       window.stationsData = stations;
//       window.allStations = stations;
//       populateStationSelect();
//     })
//     .catch((error) => {
//       console.error("Error loading stations:", error);
//     });

//   // 为 Submit 和 Directions 按钮添加事件处理
//   // 为 Submit 按钮添加点击事件
//   var submitJourneyBtn = document.getElementById("submit-journey");
//   if (submitJourneyBtn) {
//     submitJourneyBtn.addEventListener("click", handleSubmitJourney);
//   }

//   // 为 Directions 按钮添加点击事件
//   var directionsBtn = document.getElementById("directions-button");
//   if (directionsBtn) {
//     directionsBtn.addEventListener("click", handleDirections);
//   }

//   // 获取地图和卫星视图按钮
//   const mapBtn = document.getElementById("map-view-btn");
//   const satelliteBtn = document.getElementById("satellite-view-btn");

//   if (mapBtn && satelliteBtn) {
//     // 地图视图按钮点击事件
//     mapBtn.addEventListener("click", function () {
//       if (window.map && google) {
//         window.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
//         mapBtn.style.backgroundColor = "#4285f4";
//         satelliteBtn.style.backgroundColor = "#333";
//       }
//     });

//     // 卫星视图按钮点击事件
//     satelliteBtn.addEventListener("click", function () {
//       if (window.map && google) {
//         window.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
//         satelliteBtn.style.backgroundColor = "#4285f4";
//         mapBtn.style.backgroundColor = "#333";
//       }
//     });

//     // 默认选中地图视图
//     mapBtn.style.backgroundColor = "#4285f4";
//   }
// });

// // 根据站点ID更新统计图表
// function updateStationCharts(stationId) {
//   console.log(`更新站点 ${stationId} 的统计图表`);

//   // 尝试从后端获取特定站点数据
//   fetch(`http://localhost:5000/get_station_hourly_data/${stationId}`)
//     .then((response) => response.json())
//     .then((data) => {
//       const hours = Array.from({ length: 13 }, (_, i) => i + 10);

//       // 如果API返回了合并数据，直接使用
//       if (data.bikes && data.stands) {
//         renderCharts(data.bikes, data.stands, hours, stationId);
//       } else {
//         const bikeData = generateStationSpecificBikeData(stationId);
//         const standData = generateStationSpecificStandData(stationId);
//         renderCharts(bikeData, standData, hours, stationId);
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching station-specific data:", error);
//       const hours = Array.from({ length: 13 }, (_, i) => i + 10);
//       const bikeData = generateStationSpecificBikeData(stationId);
//       const standData = generateStationSpecificStandData(stationId);
//       renderCharts(bikeData, standData, hours, stationId);
//     });
// }

// // 渲染站点特定的图表
// function renderCharts(bikeData, standData, hours, stationId) {
//   // 获取容器元素 - 如果不存在就创建
//   let bikeChartContainer = document.getElementById("bike-chart-container");
//   let standChartContainer = document.getElementById("stand-chart-container");

//   // 如果容器不存在，创建并添加到侧边栏
//   if (!bikeChartContainer) {
//     // 创建图表区域的父容器
//     const chartsArea = document.createElement("div");
//     chartsArea.className = "charts-area";
//     chartsArea.style.backgroundColor = "white";
//     chartsArea.style.padding = "15px";
//     chartsArea.style.margin = "20px 0";
//     chartsArea.style.borderRadius = "5px";
//     chartsArea.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

//     // 创建标题
//     const chartsTitle = document.createElement("h3");
//     chartsTitle.textContent = "站点使用统计";
//     chartsTitle.style.textAlign = "center";
//     chartsTitle.style.margin = "0 0 15px 0";
//     chartsArea.appendChild(chartsTitle);

//     // 创建自行车可用性图表容器
//     bikeChartContainer = document.createElement("div");
//     bikeChartContainer.id = "bike-chart-container";
//     bikeChartContainer.style.marginBottom = "20px";
//     chartsArea.appendChild(bikeChartContainer);

//     // 创建停车位可用性图表容器
//     standChartContainer = document.createElement("div");
//     standChartContainer.id = "stand-chart-container";
//     chartsArea.appendChild(standChartContainer);

//     // 将图表区域添加到侧边栏
//     const sidebar = document.querySelector(".sidebar");
//     if (sidebar) {
//       // 如果路线详情面板存在且显示，在其后添加图表
//       const routeDetails = document.getElementById("route-details");
//       if (routeDetails && routeDetails.style.display !== "none") {
//         routeDetails.after(chartsArea);
//       } else {
//         // 否则在表单后添加
//         const form = document.getElementById("route-planner-form");
//         if (form) {
//           form.after(chartsArea);
//         } else {
//           // 如果都没找到，只能尝试添加到侧边栏
//           sidebar.appendChild(chartsArea);
//         }
//       }
//     }
//   }

//   // 渲染自行车可用性图表
//   renderChart(
//     bikeChartContainer,
//     bikeData,
//     hours,
//     `站点 ${stationId} 自行车可用量`,
//     "bike"
//   );

//   // 渲染停车位可用性图表
//   renderChart(
//     standChartContainer,
//     standData,
//     hours,
//     `站点 ${stationId} 停车位可用量`,
//     "stand"
//   );
// }

// // 渲染单个图表
// function renderChart(container, data, hours, title, type) {
//   // 清空容器
//   container.innerHTML = "";

//   // 添加标题
//   const titleElement = document.createElement("h4");
//   titleElement.textContent = title;
//   titleElement.style.textAlign = "center";
//   titleElement.style.margin = "5px 0";
//   titleElement.style.fontSize = "14px";
//   titleElement.style.color = "#333";
//   container.appendChild(titleElement);

//   // 创建图表容器
//   const chartElement = document.createElement("div");
//   chartElement.style.display = "flex";
//   chartElement.style.alignItems = "flex-end";
//   chartElement.style.height = "150px";
//   chartElement.style.position = "relative";
//   chartElement.style.borderBottom = "1px solid #ddd";
//   chartElement.style.marginBottom = "25px";

//   // 找出最大值，用于计算比例
//   const maxValue = Math.max(...data.map((item) => item.value));

//   // 创建每个柱形
//   data.forEach((item) => {
//     const barHeight = (item.value / maxValue) * 130; // 最大高度130px
//     const bar = document.createElement("div");
//     bar.style.flex = "1";
//     bar.style.margin = "0 3px";
//     bar.style.backgroundColor = type === "bike" ? "#FF5722" : "#4CAF50";
//     bar.style.borderRadius = "3px 3px 0 0";
//     bar.style.position = "relative";
//     bar.style.height = `${barHeight}px`;
//     bar.style.transition = "height 0.3s ease";

//     // 创建提示工具
//     const tooltip = document.createElement("div");
//     tooltip.style.position = "absolute";
//     tooltip.style.bottom = "100%";
//     tooltip.style.left = "50%";
//     tooltip.style.transform = "translateX(-50%)";
//     tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
//     tooltip.style.color = "white";
//     tooltip.style.padding = "3px 8px";
//     tooltip.style.borderRadius = "4px";
//     tooltip.style.fontSize = "12px";
//     tooltip.style.display = "none";
//     tooltip.textContent = item.value;

//     // 鼠标悬停时显示提示
//     bar.addEventListener("mouseover", () => {
//       tooltip.style.display = "block";
//     });

//     // 鼠标离开时隐藏提示
//     bar.addEventListener("mouseout", () => {
//       tooltip.style.display = "none";
//     });

//     bar.appendChild(tooltip);
//     chartElement.appendChild(bar);
//   });

//   container.appendChild(chartElement);

//   // 添加时间标签
//   const timeLabels = document.createElement("div");
//   timeLabels.style.display = "flex";
//   timeLabels.style.justifyContent = "space-between";
//   timeLabels.style.width = "100%";

//   const startLabel = document.createElement("span");
//   startLabel.textContent = "10:00";
//   startLabel.style.fontSize = "12px";
//   startLabel.style.color = "#777";

//   const endLabel = document.createElement("span");
//   endLabel.textContent = "22:00";
//   endLabel.style.fontSize = "12px";
//   endLabel.style.color = "#777";

//   timeLabels.appendChild(startLabel);
//   timeLabels.appendChild(endLabel);

//   container.appendChild(timeLabels);
// }

// function generateStationSpecificBikeData(stationId) {
//   const seed = stationId % 5; // 使用5种不同模式

//   // 站点基础容量 - 根据站点ID有所变化
//   const baseCapacity = 10 + (stationId % 20);

//   switch (seed) {
//     case 0: // 工作日模式：早晚高峰，中午低谷
//       return [
//         { hour: 10, value: Math.round(baseCapacity * 0.8) }, // 上午较多
//         { hour: 11, value: Math.round(baseCapacity * 0.6) },
//         { hour: 12, value: Math.round(baseCapacity * 0.5) }, // 中午最少
//         { hour: 13, value: Math.round(baseCapacity * 0.4) },
//         { hour: 14, value: Math.round(baseCapacity * 0.5) },
//         { hour: 15, value: Math.round(baseCapacity * 0.6) },
//         { hour: 16, value: Math.round(baseCapacity * 0.7) },
//         { hour: 17, value: Math.round(baseCapacity * 0.8) }, // 下午较多
//         { hour: 18, value: Math.round(baseCapacity * 1.0) }, // 晚上最多
//         { hour: 19, value: Math.round(baseCapacity * 1.1) },
//         { hour: 20, value: Math.round(baseCapacity * 1.2) },
//         { hour: 21, value: Math.round(baseCapacity * 1.1) },
//         { hour: 22, value: Math.round(baseCapacity * 1.0) },
//       ];
//     case 1: // 周末模式：中午高峰
//       return [
//         { hour: 10, value: Math.round(baseCapacity * 0.7) },
//         { hour: 11, value: Math.round(baseCapacity * 0.8) },
//         { hour: 12, value: Math.round(baseCapacity * 1.0) }, // 中午最多
//         { hour: 13, value: Math.round(baseCapacity * 1.1) },
//         { hour: 14, value: Math.round(baseCapacity * 1.2) },
//         { hour: 15, value: Math.round(baseCapacity * 1.1) },
//         { hour: 16, value: Math.round(baseCapacity * 1.0) },
//         { hour: 17, value: Math.round(baseCapacity * 0.9) },
//         { hour: 18, value: Math.round(baseCapacity * 0.8) },
//         { hour: 19, value: Math.round(baseCapacity * 0.7) },
//         { hour: 20, value: Math.round(baseCapacity * 0.6) },
//         { hour: 21, value: Math.round(baseCapacity * 0.5) }, // 晚上最少
//         { hour: 22, value: Math.round(baseCapacity * 0.6) },
//       ];
//     case 2: // 平稳模式
//       return [
//         { hour: 10, value: Math.round(baseCapacity * 0.9) },
//         { hour: 11, value: Math.round(baseCapacity * 0.9) },
//         { hour: 12, value: Math.round(baseCapacity * 0.8) },
//         { hour: 13, value: Math.round(baseCapacity * 0.8) },
//         { hour: 14, value: Math.round(baseCapacity * 0.8) },
//         { hour: 15, value: Math.round(baseCapacity * 0.9) },
//         { hour: 16, value: Math.round(baseCapacity * 0.9) },
//         { hour: 17, value: Math.round(baseCapacity * 0.8) },
//         { hour: 18, value: Math.round(baseCapacity * 0.8) },
//         { hour: 19, value: Math.round(baseCapacity * 0.9) },
//         { hour: 20, value: Math.round(baseCapacity * 0.9) },
//         { hour: 21, value: Math.round(baseCapacity * 0.8) },
//         { hour: 22, value: Math.round(baseCapacity * 0.8) },
//       ];
//     case 3: // 旅游景点模式：上午少，下午多
//       return [
//         { hour: 10, value: Math.round(baseCapacity * 0.4) }, // 上午最少
//         { hour: 11, value: Math.round(baseCapacity * 0.5) },
//         { hour: 12, value: Math.round(baseCapacity * 0.6) },
//         { hour: 13, value: Math.round(baseCapacity * 0.7) },
//         { hour: 14, value: Math.round(baseCapacity * 0.8) },
//         { hour: 15, value: Math.round(baseCapacity * 0.9) },
//         { hour: 16, value: Math.round(baseCapacity * 1.0) },
//         { hour: 17, value: Math.round(baseCapacity * 1.1) },
//         { hour: 18, value: Math.round(baseCapacity * 1.2) }, // 下午最多
//         { hour: 19, value: Math.round(baseCapacity * 1.1) },
//         { hour: 20, value: Math.round(baseCapacity * 1.0) },
//         { hour: 21, value: Math.round(baseCapacity * 0.9) },
//         { hour: 22, value: Math.round(baseCapacity * 0.8) },
//       ];
//     case 4: // 波动模式
//       return [
//         { hour: 10, value: Math.round(baseCapacity * 0.5) },
//         { hour: 11, value: Math.round(baseCapacity * 0.9) },
//         { hour: 12, value: Math.round(baseCapacity * 0.6) },
//         { hour: 13, value: Math.round(baseCapacity * 1.0) },
//         { hour: 14, value: Math.round(baseCapacity * 0.7) },
//         { hour: 15, value: Math.round(baseCapacity * 1.1) },
//         { hour: 16, value: Math.round(baseCapacity * 0.8) },
//         { hour: 17, value: Math.round(baseCapacity * 1.2) },
//         { hour: 18, value: Math.round(baseCapacity * 0.9) },
//         { hour: 19, value: Math.round(baseCapacity * 1.3) },
//         { hour: 20, value: Math.round(baseCapacity * 1.0) },
//         { hour: 21, value: Math.round(baseCapacity * 1.4) },
//         { hour: 22, value: Math.round(baseCapacity * 1.1) },
//       ];
//     default:
//       // 默认使用平均模式
//       return [
//         { hour: 10, value: Math.round(baseCapacity * 0.7) },
//         { hour: 11, value: Math.round(baseCapacity * 0.8) },
//         { hour: 12, value: Math.round(baseCapacity * 0.9) },
//         { hour: 13, value: Math.round(baseCapacity * 0.8) },
//         { hour: 14, value: Math.round(baseCapacity * 0.7) },
//         { hour: 15, value: Math.round(baseCapacity * 0.8) },
//         { hour: 16, value: Math.round(baseCapacity * 0.9) },
//         { hour: 17, value: Math.round(baseCapacity * 1.0) },
//         { hour: 18, value: Math.round(baseCapacity * 0.9) },
//         { hour: 19, value: Math.round(baseCapacity * 0.8) },
//         { hour: 20, value: Math.round(baseCapacity * 0.7) },
//         { hour: 21, value: Math.round(baseCapacity * 0.8) },
//         { hour: 22, value: Math.round(baseCapacity * 0.9) },
//       ];
//   }
// }

// function generateStationSpecificStandData(stationId) {
//   // 基于stationId设置随机种子
//   const seed = stationId % 5;

//   // 总停车位数量
//   const totalStands = 20 + (stationId % 15);

//   // 获取自行车数据（停车位数据与自行车数据相反）
//   const bikeData = generateStationSpecificBikeData(stationId);

//   // 计算停车位（总数减去自行车数）
//   return bikeData.map((item) => ({
//     hour: item.hour,
//     value: totalStands - item.value,
//   }));
// }

// // 全局变量存储所有站点数据
// window.allStations = [];

// // 浮窗控制函数
// function toggleFilterModal() {
//   const modal = document.getElementById("filter-modal");
//   modal.classList.toggle("collapsed");
// }

// // 填充站点选择器
// function populateStationSelect() {
//   const stationSelect = document.getElementById("station-select");
//   // 清空当前选项（保留"所有站点"选项）
//   while (stationSelect.options.length > 1) {
//     stationSelect.remove(1);
//   }

//   // 如果有站点数据，填充选项
//   if (window.allStations && window.allStations.length > 0) {
//     // 按站点名称排序
//     const sortedStations = [...window.allStations]
//       .filter((s) => s.Name || s.name)
//       .sort((a, b) => (a.Name || a.name).localeCompare(b.Name || b.name));

//     // 添加选项
//     sortedStations.forEach((station) => {
//       const option = document.createElement("option");
//       option.value = station.Number;
//       option.textContent = `${station.Name} (${station.Number})`;
//       stationSelect.appendChild(option);
//     });
//   }
// }

// // 应用筛选
// function applyFilters() {
//   const stationId = document.getElementById("station-select").value;
//   const timeValue = document.getElementById("time-select").value;

//   // 如果没有选择站点，显示错误消息
//   if (!stationId) {
//     const resultsContent = document.getElementById("filter-results");
//     resultsContent.querySelector(".results-content").innerHTML =
//       '<p class="error-text">Please select a station</p>';
//     return;
//   }

//   // 显示加载中提示
//   const resultsContent = document.getElementById("filter-results");
//   resultsContent.querySelector(".results-content").innerHTML =
//     '<p style="text-align:center">Loading...</p>';

//   // 发送请求到predict_availability接口
//   fetch("/predict_availability", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       station_id: stationId,
//       hour: timeValue,
//     }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       // 处理筛选结果
//       const resultsContent = document
//         .getElementById("filter-results")
//         .querySelector(".results-content");

//       // 检查是否有错误
//       if (data.error) {
//         resultsContent.innerHTML = `<p class="error-text">Error: ${data.error}</p>`;
//         return;
//       }

//       // 使用要求的格式显示结果（全英文）
//       resultsContent.innerHTML = `
//             <div class="prediction-result">
//                 <p style="font-size: 18px; margin: 10px 0;"><strong>Bikes:</strong> ${data.bikes}</p>
//                 <p style="font-size: 18px; margin: 10px 0;"><strong>Stands:</strong> ${data.bike_stands}</p>
//             </div>
//         `;
//     })
//     .catch((error) => {
//       console.error("Error filtering data:", error);
//       const resultsContent = document
//         .getElementById("filter-results")
//         .querySelector(".results-content");
//       resultsContent.innerHTML =
//         '<p class="error-text">Error getting data, please try again</p>';
//     });
// }

// // 重置筛选条件
// function resetFilters() {
//   document.getElementById("station-select").selectedIndex = 0;
//   document.getElementById("time-select").selectedIndex = 0;

//   // 清空筛选结果
//   const resultsContent = document.querySelector(".results-content");
//   resultsContent.innerHTML =
//     '<p class="placeholder-text">应用筛选后将显示结果...</p>';

//   // 清空路线规划的输入框
//   document.getElementById("start-location").value = "";
//   document.getElementById("end-location").value = "";

//   // 清除地图标记和路线
//   clearRouteAndMarkers();

//   // 提供反馈
//   alert("已重置筛选条件");
// }

// // 清除地图上的路线和标记
// function clearRouteAndMarkers() {
//   // 如果有定义地图对象和标记，清除它们
//   if (window.startMarker) {
//     window.startMarker.setMap(null);
//   }
//   if (window.endMarker) {
//     window.endMarker.setMap(null);
//   }
//   if (window.routeLine) {
//     window.routeLine.setMap(null);
//   }

//   // 清空路线详情
//   const routeDetailsElement = document.getElementById("route-details");
//   if (routeDetailsElement) {
//     routeDetailsElement.innerHTML = "";
//   }
// }

// // Show station info in popup with selection message
// function showStationInfoInPopup(station, selectionMessage) {
//   // Get real-time station availability data
//   fetch(
//     `http://localhost:5000/get_station_details/${
//       station.Number || station.number
//     }`
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       const available_bikes =
//         data.available_bikes || station.Available_bikes || 0;
//       const available_bike_stands =
//         data.available_bike_stands || station.Available_bike_stands || 0;
//       const total_capacity =
//         data.bike_stands ||
//         parseInt(available_bikes) + parseInt(available_bike_stands) ||
//         0;

//       // 关闭行程规划弹窗
//       closeJourneyPlannerPopup();

//       // Display station popup
//       const popup = document.getElementById("station-popup");
//       popup.style.display = "block";

//       // Set station title
//       document.getElementById("station-popup-title").textContent =
//         station.Name || station.name;

//       // Fill station information
//       const content = document.getElementById("station-popup-content");
//       content.innerHTML = `
//         <p><span>Station Number:</span> <span>${
//           station.Number || station.number || "N/A"
//         }</span></p>
//         <p><span>Address:</span> <span>${
//           station.Address || station.address || "Unknown address"
//         }</span></p>
//         <p><span>Available Bikes:</span> <span>${available_bikes}</span></p>
//         <p><span>Available Stands:</span> <span>${available_bike_stands}</span></p>
//         <p><span>Total Capacity:</span> <span>${total_capacity}</span></p>
//         <div class="selection-message">${selectionMessage}</div>
//       `;

//       // Generate and display station charts with real data
//       fetchStationHourlyData(station.Number || station.number || 1);

//       // Set button click events
//       const startBtn = document.getElementById("set-as-start-btn");
//       const endBtn = document.getElementById("set-as-end-btn");

//       // Clear old event listeners
//       startBtn.replaceWith(startBtn.cloneNode(true));
//       endBtn.replaceWith(endBtn.cloneNode(true));

//       // Get new button references
//       const newStartBtn = document.getElementById("set-as-start-btn");
//       const newEndBtn = document.getElementById("set-as-end-btn");

//       // Add new event listeners
//       newStartBtn.addEventListener("click", function () {
//         selectAsStart(station.Name || station.name);
//         closeStationPopup();
//       });

//       newEndBtn.addEventListener("click", function () {
//         setAsEnd(station.Name || station.name);
//         closeStationPopup();
//       });
//     })
//     .catch((error) => {
//       console.error("Error fetching station details:", error);
//       // Fallback to using the station data we already have
//       fallbackStationInfo(station, selectionMessage);
//     });
// }

// // Fallback method for displaying station info when API fails
// function fallbackStationInfo(station, selectionMessage) {
//   // Use whatever data we already have for the station
//   const available_bikes =
//     station.Available_bikes || station.available_bikes || "10";
//   const available_bike_stands =
//     station.Available_bike_stands || station.available_bike_stands || "5";
//   const total_capacity =
//     parseInt(available_bikes) + parseInt(available_bike_stands);

//   // 关闭行程规划弹窗
//   closeJourneyPlannerPopup();

//   // Display station popup
//   const popup = document.getElementById("station-popup");
//   popup.style.display = "block";

//   // Set station title
//   document.getElementById("station-popup-title").textContent =
//     station.Name || station.name;

//   // Fill station information
//   const content = document.getElementById("station-popup-content");
//   content.innerHTML = `
//     <p><span>Station Number:</span> <span>${
//       station.Number || station.number || "N/A"
//     }</span></p>
//     <p><span>Address:</span> <span>${
//       station.Address || station.address || "Unknown address"
//     }</span></p>
//     <p><span>Available Bikes:</span> <span>${available_bikes}</span></p>
//     <p><span>Available Stands:</span> <span>${available_bike_stands}</span></p>
//     <p><span>Total Capacity:</span> <span>${total_capacity}</span></p>
//     <div class="selection-message">${selectionMessage}</div>
//   `;

//   // Generate and display station charts with simulated data
//   generateStationCharts(station.Number || station.number || 1);

//   // Set button click events same as in main function
//   const startBtn = document.getElementById("set-as-start-btn");
//   const endBtn = document.getElementById("set-as-end-btn");

//   startBtn.replaceWith(startBtn.cloneNode(true));
//   endBtn.replaceWith(endBtn.cloneNode(true));

//   const newStartBtn = document.getElementById("set-as-start-btn");
//   const newEndBtn = document.getElementById("set-as-end-btn");

//   newStartBtn.addEventListener("click", function () {
//     selectAsStart(station.Name || station.name);
//     window.selectionMode = "end";
//     updateSelectionModeIndicator();
//     closeStationPopup();
//   });

//   newEndBtn.addEventListener("click", function () {
//     selectAsEnd(station.Name || station.name);
//     window.selectionMode = "start";
//     updateSelectionModeIndicator();
//     closeStationPopup();
//   });
// }

// // Fetch station hourly data from API
// function fetchStationHourlyData(stationId) {
//   fetch(`http://localhost:5000/get_station_hourly_data/${stationId}`)
//     .then((response) => response.json())
//     .then((data) => {
//       if (data && data.bikes && data.stands) {
//         // If we have real data, use it
//         // Convert hours for display
//         const hours = data.bikes.map((item) => item.hour);

//         // Generate charts with real data
//         generateChart(
//           "bikes-chart-container",
//           "bikes-time-labels",
//           data.bikes,
//           hours,
//           "bike"
//         );
//         generateChart(
//           "stands-chart-container",
//           "stands-time-labels",
//           data.stands,
//           hours,
//           "stand"
//         );
//       } else {
//         // If no real data, fall back to simulated data
//         generateStationCharts(stationId);
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching station hourly data:", error);
//       // Fall back to simulated data
//       generateStationCharts(stationId);
//     });
// }

// // 在初始化地图后设置按钮点击事件
// function initMap() {
//   try {
//     // 基本地图初始化
//     var location = { lat: 53.349805, lng: -6.26031 }; // 都柏林中心位置
//     var map = new google.maps.Map(document.getElementById("map"), {
//       zoom: 14,
//       center: location,
//       mapTypeId: google.maps.MapTypeId.ROADMAP,
//       mapTypeControl: false, // 隐藏默认的地图类型控件
//     });

//     // 保存到全局变量
//     window.map = map;

//     // 加载都柏林自行车站点数据
//     loadStations(map);

//     // 注意：事件监听器在页面主DOMContentLoaded中统一处理，此处无需重复添加
//   } catch (e) {
//     console.error("初始化地图时出错:", e);
//     initMapWithoutAPI();
//   }
// }

// // 添加显示行程规划器弹窗的函数
// function showJourneyPlannerPopup() {
//   console.log("显示行程规划弹窗");

//   // 关闭站点信息弹窗，确保不会两个同时显示
//   closeStationPopup();

//   var journeyPlannerPopup = document.getElementById("journey-planner-popup");
//   if (journeyPlannerPopup) {
//     journeyPlannerPopup.style.display = "block";
//     journeyPlannerPopup.classList.add("active");

//     // 添加返回站点详情的事件处理
//     const backToStationBtn = document.getElementById("back-to-station-btn");

//     // 清除旧事件监听器
//     backToStationBtn.replaceWith(backToStationBtn.cloneNode(true));

//     // 获取新按钮引用
//     const newBackBtn = document.getElementById("back-to-station-btn");

//     // 添加事件监听
//     newBackBtn.addEventListener("click", function () {
//       if (window.lastSelectedStation) {
//         closeJourneyPlannerPopup();
//         showStationInfoInSidebar(window.lastSelectedStation);
//       } else {
//         console.log("无法返回站点详情：未找到上一个站点信息");
//       }
//     });
//   } else {
//     console.error("找不到行程规划弹窗元素");
//   }
// }

// // 添加关闭行程规划器弹窗的函数
// function closeJourneyPlannerPopup() {
//   console.log("关闭行程规划弹窗");

//   // 不隐藏遮罩层，注释掉以下行
//   // document.getElementById('overlay').style.display = 'none';

//   var journeyPlannerPopup = document.getElementById("journey-planner-popup");
//   if (journeyPlannerPopup) {
//     journeyPlannerPopup.style.display = "none";
//     journeyPlannerPopup.classList.remove("active");
//   }
// }

// // 添加 Submit 处理函数
// function handleSubmitJourney() {
//   // 获取表单数据
//   var journeyDate = document.querySelector(
//     'input[name="journey-date"]:checked'
//   ).value;
//   var journeyTime = document.getElementById("journey-time").value;
//   var startLocation = document.getElementById("start-location").value;
//   var endLocation = document.getElementById("end-location").value;

//   // 这里可以添加表单验证
//   if (!startLocation || !endLocation) {
//     alert("请输入起点和终点位置");
//     return;
//   }

//   // 处理路线规划 (可根据需要调用 Google Maps API 或其他服务)
//   console.log("规划行程: ", {
//     journeyDate,
//     journeyTime,
//     startLocation,
//     endLocation,
//   });

//   // 显示路线详情
//   var routeDetails = document.getElementById("route-details");
//   var routeInfoContent = document.getElementById("route-info-content");

//   // 模拟路线计算
//   var distance = (Math.random() * 5 + 2).toFixed(1); // 随机距离2-7公里
//   var durationMin = Math.round(distance * 4); // 骑行速度约15km/h
//   var durationText =
//     durationMin > 60
//       ? Math.floor(durationMin / 60) + "小时" + (durationMin % 60) + "分钟"
//       : durationMin + "分钟";

//   var caloriesBurned = Math.round(durationMin * 8); // 大约8卡路里每分钟
//   var co2Saved = (distance * 0.2).toFixed(2); // 大约0.2kg CO2每公里

//   // 填充路线信息 (使用更详细的数据)
//   routeInfoContent.innerHTML = `
//         <div class="detail-item">
//             <strong>起点:</strong>
//             ${startLocation}
//         </div>
//         <div class="detail-item">
//             <strong>终点:</strong>
//             ${endLocation}
//         </div>
//         <div class="detail-item">
//             <strong>计划日期:</strong>
//             ${
//               journeyDate === "today"
//                 ? "今天"
//                 : journeyDate === "tomorrow"
//                 ? "明天"
//                 : "后天"
//             }
//         </div>
//         <div class="detail-item">
//             <strong>计划时间:</strong>
//             ${journeyTime}
//         </div>
//         <hr>
//         <div class="detail-item">
//             <strong>预计距离:</strong>
//             ${distance} 公里
//         </div>
//         <div class="detail-item">
//             <strong>预计骑行时间:</strong>
//             ${durationText}
//         </div>
//         <div class="detail-item">
//             <strong>消耗卡路里:</strong>
//             约 ${caloriesBurned} 卡路里
//         </div>
//         <div class="detail-item">
//             <strong>减少碳排放:</strong>
//             约 ${co2Saved} 千克
//         </div>
//         <div class="detail-item">
//             <strong>最佳骑行时段:</strong>
//             早上9点-11点或下午2点-4点
//         </div>
//     `;

//   routeDetails.style.display = "block";
// }

// // 添加 Directions 处理函数
// function handleDirections() {
//   var startLocation = document.getElementById("start-location").value;
//   var endLocation = document.getElementById("end-location").value;

//   if (!startLocation || !endLocation) {
//     alert("请输入起点和终点位置");
//     return;
//   }

//   // 首先尝试在内部显示路线
//   if (
//     window.google &&
//     window.google.maps &&
//     window.google.maps.DirectionsService
//   ) {
//     // 显示加载中的提示
//     var routeDetails = document.getElementById("route-details");
//     var routeInfoContent = document.getElementById("route-info-content");
//     routeDetails.style.display = "block";
//     routeInfoContent.innerHTML =
//       '<div style="text-align:center;padding:20px;">正在获取路线导航信息...</div>';

//     // 尝试使用 Google 导航服务
//     var directionsService = new google.maps.DirectionsService();
//     var request = {
//       origin: startLocation,
//       destination: endLocation,
//       travelMode: google.maps.TravelMode.BICYCLING,
//     };

//     directionsService.route(request, function (result, status) {
//       if (status == google.maps.DirectionsStatus.OK) {
//         // 成功获取路线
//         var route = result.routes[0];
//         var steps = route.legs[0].steps;
//         var totalDistance = route.legs[0].distance.text;
//         var totalDuration = route.legs[0].duration.text;

//         // 构建导航指引HTML
//         var directionsHtml = `
//                     <div class="detail-item">
//                         <strong>路线总览</strong>
//                         <div>总距离: ${totalDistance}</div>
//                         <div>预计时间: ${totalDuration}</div>
//                     </div>
//                     <hr>
//                     <div class="detail-item">
//                         <strong>详细导航</strong>
//                     </div>
//                 `;

//         // 添加每个步骤
//         steps.forEach(function (step, index) {
//           directionsHtml += `
//                         <div class="direction-step">
//                             <div class="step-number">${index + 1}</div>
//                             <div class="step-instruction">${
//                               step.instructions
//                             }</div>
//                             <div class="step-distance">${
//                               step.distance.text
//                             }</div>
//                         </div>
//                     `;
//         });

//         // 更新内容
//         routeInfoContent.innerHTML = directionsHtml;
//       } else {
//         // 如果失败，提供后备选项
//         routeInfoContent.innerHTML = `
//                     <div class="detail-item">
//                         <strong>无法获取详细导航</strong>
//                         <p>请点击下方按钮，在Google Maps中查看完整导航。</p>
//                         <button id="open-google-maps" class="btn">打开Google Maps</button>
//                     </div>
//                 `;

//         // 添加打开Google Maps的事件
//         document
//           .getElementById("open-google-maps")
//           .addEventListener("click", function () {
//             var mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
//               startLocation
//             )}&destination=${encodeURIComponent(
//               endLocation
//             )}&travelmode=bicycling`;
//             window.open(mapsUrl, "_blank");
//           });
//       }
//     });
//   } else {
//     // 如果Google Maps API不可用，直接打开Google Maps
//     var mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
//       startLocation
//     )}&destination=${encodeURIComponent(endLocation)}&travelmode=bicycling`;
//     window.open(mapsUrl, "_blank");
//   }
// }

// // 添加 Submit 和 Directions 按钮的事件处理
// document.addEventListener("DOMContentLoaded", function () {
//   // 代码已移至页面主要的 DOMContentLoaded 事件中，避免重复绑定
// });

// // 添加关闭所有弹窗的函数
// function closeAllPopups() {
//   // 只在用户直接点击关闭按钮时才关闭对应的弹窗
//   // 这个函数现在保留但不执行任何操作
//   // 注释掉以下代码
//   /*
//   document.getElementById('station-popup').style.display = 'none';

//   var journeyPlannerPopup = document.getElementById('journey-planner-popup');
//   if (journeyPlannerPopup) {
//     journeyPlannerPopup.style.display = 'none';
//     journeyPlannerPopup.classList.remove('active');
//   }

//   document.getElementById('overlay').style.display = 'none';
//   */
// }

// // 确保页面加载完成后初始化所有事件监听器
// document.addEventListener("DOMContentLoaded", function () {
//   console.log("页面已加载，初始化事件监听器");

//   // 行程规划按钮点击事件
//   const journeyPlannerBtn = document.getElementById("journey-planner-btn");
//   if (journeyPlannerBtn) {
//     journeyPlannerBtn.addEventListener("click", showJourneyPlannerPopup);
//     console.log("已添加行程规划按钮事件");
//   } else {
//     console.error("找不到行程规划按钮");
//   }

//   // 路线规划按钮事件
//   const planJourneyBtn = document.getElementById("plan-journey-btn");
//   if (planJourneyBtn) {
//     planJourneyBtn.addEventListener("click", planJourney);
//     console.log("已添加路线规划按钮事件");
//   } else {
//     console.error("找不到路线规划按钮");
//   }

//   // Journey Planner弹窗中的Submit按钮
//   const submitJourneyBtn = document.getElementById("submit-journey");
//   if (submitJourneyBtn) {
//     submitJourneyBtn.addEventListener("click", planJourney);
//     console.log("已添加提交行程按钮事件");
//   } else {
//     console.error("找不到提交行程按钮");
//   }

//   // Journey Planner弹窗中的Directions按钮
//   const directionsBtn = document.getElementById("directions-button");
//   if (directionsBtn) {
//     directionsBtn.addEventListener("click", planJourney);
//     console.log("已添加方向指引按钮事件");
//   } else {
//     console.error("找不到方向指引按钮");
//   }

//   // 地图类型切换按钮
//   const mapViewBtn = document.getElementById("map-view-btn");
//   const satelliteViewBtn = document.getElementById("satellite-view-btn");

//   if (mapViewBtn) {
//     mapViewBtn.addEventListener("click", function () {
//       if (window.map && window.map.setMapTypeId) {
//         window.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
//       }
//     });
//   }

//   if (satelliteViewBtn) {
//     satelliteViewBtn.addEventListener("click", function () {
//       if (window.map && window.map.setMapTypeId) {
//         window.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
//       }
//     });
//   }

//   console.log("所有事件监听器初始化完成");
// });

// // 添加各种全局变量
// window.stationMarkers = [];
// window.lastSelectedStation = null; // 存储上次选中的站点信息

// // 筛选功能相关代码
// // 显示/隐藏筛选模态窗口
// function toggleFilterModal() {
//   const modal = document.getElementById("filter-modal");
//   if (modal.style.display === "block") {
//     modal.style.display = "none";
//   } else {
//     modal.style.display = "block";
//     // 如果站点下拉列表为空，则加载站点列表
//     loadStationOptions();
//   }
// }

// // 加载站点列表到下拉菜单
// function loadStationOptions() {
//   const stationSelect = document.getElementById("station-select");

//   // 避免重复加载
//   if (stationSelect.options.length <= 1) {
//     fetch("/get_all_stations")
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.stations && data.stations.length > 0) {
//           data.stations.forEach((station) => {
//             const option = document.createElement("option");
//             option.value = station.number;
//             option.textContent = station.name;
//             stationSelect.appendChild(option);
//           });
//           console.log(`加载了 ${data.stations.length} 个站点选项`);
//         } else {
//           console.warn("没有获取到站点数据");
//         }
//       })
//       .catch((error) => {
//         console.error("加载站点列表出错:", error);
//       });
//   }
// }

// // 应用筛选
// function applyFilters() {
//   const stationId = document.getElementById("station-select").value;
//   const timeValue = document.getElementById("time-select").value;

//   // 如果没有选择站点，显示错误消息
//   if (!stationId) {
//     const resultsContent = document.getElementById("filter-results");
//     resultsContent.querySelector(".results-content").innerHTML =
//       '<p class="error-text">Please select a station</p>';
//     return;
//   }

//   // 显示加载中提示
//   const resultsContent = document.getElementById("filter-results");
//   resultsContent.querySelector(".results-content").innerHTML =
//     '<p style="text-align:center">Loading...</p>';

//   // 发送请求到predict_availability接口
//   fetch("/predict_availability", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       station_id: stationId,
//       hour: timeValue,
//     }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       // 处理筛选结果
//       const resultsContent = document
//         .getElementById("filter-results")
//         .querySelector(".results-content");

//       // 检查是否有错误
//       if (data.error) {
//         resultsContent.innerHTML = `<p class="error-text">Error: ${data.error}</p>`;
//         return;
//       }

//       // 使用要求的格式显示结果（全英文）
//       resultsContent.innerHTML = `
//             <div class="prediction-result">
//                 <p style="font-size: 18px; margin: 10px 0;"><strong>Bikes:</strong> ${data.bikes}</p>
//                 <p style="font-size: 18px; margin: 10px 0;"><strong>Stands:</strong> ${data.bike_stands}</p>
//             </div>
//         `;
//     })
//     .catch((error) => {
//       console.error("Error filtering data:", error);
//       const resultsContent = document
//         .getElementById("filter-results")
//         .querySelector(".results-content");
//       resultsContent.innerHTML =
//         '<p class="error-text">Error getting data, please try again</p>';
//     });
// }

// // 显示筛选结果
// function displayFilterResults(data) {
//   const resultsContainer = document.getElementById("filter-results");
//   const resultsContent = resultsContainer.querySelector(".results-content");

//   // 清空现有内容
//   resultsContent.innerHTML = "";

//   if (data.error) {
//     resultsContent.innerHTML = `<p class="error-text">错误: ${data.error}</p>`;
//     return;
//   }

//   if (!data.results || data.results.length === 0) {
//     resultsContent.innerHTML = "<p>没有找到匹配的数据</p>";
//     return;
//   }

//   // 创建结果表格
//   const table = document.createElement("table");
//   table.className = "filter-results-table";

//   // 创建表头
//   const thead = document.createElement("thead");
//   const headerRow = document.createElement("tr");

//   // 添加表头列
//   const columns = [
//     { id: "name", label: "站点名称" },
//     { id: "available_bikes", label: "可用车辆" },
//     { id: "available_bike_stands", label: "可用车位" },
//     { id: "usage_percentage", label: "使用率 (%)" },
//   ];

//   // 如果有预测数据，添加预测列
//   if (data.results[0].hasOwnProperty("predicted_bikes")) {
//     columns.push(
//       {
//         id: "predicted_bikes",
//         label: `预测车辆 (${data.results[0].prediction_time})`,
//       },
//       {
//         id: "predicted_stands",
//         label: `预测车位 (${data.results[0].prediction_time})`,
//       }
//     );
//   }

//   columns.forEach((column) => {
//     const th = document.createElement("th");
//     th.textContent = column.label;
//     headerRow.appendChild(th);
//   });

//   thead.appendChild(headerRow);
//   table.appendChild(thead);

//   // 创建表格内容
//   const tbody = document.createElement("tbody");

//   data.results.forEach((station) => {
//     const row = document.createElement("tr");

//     // 为每一列添加单元格
//     columns.forEach((column) => {
//       const cell = document.createElement("td");

//       if (column.id === "usage_percentage") {
//         // 用进度条显示使用率
//         const percentage = station[column.id];
//         cell.innerHTML = `
//                     <div class="progress-bar">
//                         <div class="progress" style="width: ${percentage}%; background-color: ${getColorForPercentage(
//           percentage
//         )}"></div>
//                         <span>${percentage}%</span>
//             </div>
//         `;
//       } else {
//         cell.textContent = station[column.id];
//       }

//       row.appendChild(cell);
//     });

//     // 添加点击事件，点击行时在地图上高亮显示该站点
//     row.addEventListener("click", function () {
//       highlightStationOnMap(station.number);
//     });

//     tbody.appendChild(row);
//   });

//   table.appendChild(tbody);
//   resultsContent.appendChild(table);

//   // 显示结果计数
//   const countInfo = document.createElement("p");
//   countInfo.className = "results-count";
//   countInfo.textContent = `共显示 ${data.results.length} 个结果`;
//   resultsContent.appendChild(countInfo);
// }

// // 根据使用率获取颜色（红色表示使用率高，绿色表示使用率低）
// function getColorForPercentage(percentage) {
//   // 从绿色渐变到红色
//   const red = Math.floor((percentage / 100) * 255);
//   const green = Math.floor(255 - (percentage / 100) * 255);
//   return `rgb(${red}, ${green}, 0)`;
// }

// // 在地图上高亮显示选中的站点
// function highlightStationOnMap(stationId) {
//   if (!window.map || !window.stationMarkers) return;

//   // 查找对应的标记
//   const marker = window.stationMarkers.find((m) => m.station_id === stationId);

//   if (marker) {
//     // 定位到该站点
//     window.map.setCenter(marker.getPosition());
//     window.map.setZoom(16);

//     // 触发标记点击事件
//     google.maps.event.trigger(marker, "click");
//   }
// }

// // 重置筛选条件
// function resetFilters() {
//   document.getElementById("station-select").value = "";
//   document.getElementById("time-select").value = "0";

//   // 清空结果区域
//   const resultsContent = document
//     .getElementById("filter-results")
//     .querySelector(".results-content");
//   resultsContent.innerHTML =
//     '<p class="placeholder-text">申请筛选后将显示结果...</p>';
// }

// // 当页面加载完成后，初始化筛选功能
// document.addEventListener("DOMContentLoaded", function () {
//   // 初始化筛选模态窗口
//   const filterModal = document.getElementById("filter-modal");
//   if (filterModal) {
//     filterModal.style.display = "none";
//   }

//   // 添加键盘事件监听器，按ESC键关闭模态窗口
//   document.addEventListener("keydown", function (event) {
//     if (event.key === "Escape" && filterModal.style.display === "block") {
//       toggleFilterModal();
//     }
//   });
// });

// // // 頁面載入後自動初始化地圖
// // window.onload = function () {
// //   if (typeof google === "undefined") {
// //     console.log("Google Maps API 不可用，使用备用地图显示");
// //     initMapWithoutAPI();
// //   } else {
// //     initMap();
// //   }
// // };

// 🌍 MAP INITIALIZATION
window.initMap = function () {
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
};

// 🗺️ FALLBACK MAP WITHOUT GOOGLE API
function initMapWithoutAPI() {
  console.warn("Using fallback map initialization");
  const mapElement = document.getElementById("map");
  mapElement.innerHTML =
    '<div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background-color:#f0f0f0;"><p>Map failed to load. Station list remains available.</p></div>';

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

  loadStations(window.map);
}

// 🔄 FETCH WEATHER
function fetchWeather() {
  const weatherApiKey = "1e5d3d18989bed9a0ed5f59d50a821ac";
  const city = "Dublin";
  const weatherElement = document.getElementById("weather");

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

// 🚴 STATION MARKERS
function loadStations(map) {
  fetch("http://localhost:5000/get_stations")
    .then((response) => response.json())
    .then((data) => {
      window.stationsData = data;
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
  const center = { lat: 53.349805, lng: -6.26031 };
  const mock = [];
  for (let i = 1; i <= 20; i++) {
    const lat = center.lat + (Math.random() - 0.5) * 0.02;
    const lng = center.lng + (Math.random() - 0.5) * 0.03;
    mock.push({
      Number: i,
      Name: `Mock Station ${i}`,
      Address: `Mock address ${i}`,
      Latitude: lat,
      Longitude: lng,
      Bike_stands: Math.floor(Math.random() * 20) + 10,
      Available_bikes: Math.floor(Math.random() * 10) + 1,
      Available_bike_stands: Math.floor(Math.random() * 10) + 1,
    });
  }
  return mock;
}

function displayStations(map, stations) {
  if (window.stationMarkers) {
    window.stationMarkers.forEach((marker) => marker.setMap(null));
  }
  window.stationMarkers = [];

  stations.forEach((station) => {
    const lat = parseFloat(
      station.Position_lat || station.position_lat || station.Latitude || 0
    );
    const lng = parseFloat(
      station.Position_lon || station.position_lon || station.Longitude || 0
    );

    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      console.warn("Station missing valid coordinates:", station.Name);
      return;
    }

    const marker = new google.maps.Marker({
      position: { lat, lng },
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

    marker.station_id = station.Number;
    window.stationMarkers.push(marker);

    marker.addListener("click", () => {
      showStationInfoInSidebar(station);
      handleStationSelection(station);
    });
  });
}

// 📍 STATION INTERACTION
function handleStationSelection(station) {
  const startInput = document.getElementById("start-location");
  const endInput = document.getElementById("end-location");
  if (!startInput.value) {
    startInput.value = station.Name;
  } else if (!endInput.value) {
    endInput.value = station.Name;
  } else {
    startInput.value = station.Name;
    endInput.value = "";
  }
}

function showStationInfoInSidebar(station) {
  console.log("Selected station:", station);
  const popup = document.getElementById("station-popup");
  popup.style.display = "block";
  document.getElementById("station-popup-title").textContent = station.Name;
  const content = document.getElementById("station-popup-content");
  content.innerHTML = `
      <p><strong>Address:</strong> ${station.Address}</p>
      <p><strong>Available Bikes:</strong> ${station.Available_bikes}</p>
      <p><strong>Available Stands:</strong> ${station.Available_bike_stands}</p>
      <p><strong>Total Capacity:</strong> ${station.Bike_stands}</p>
    `;
}

// 🚀 DOM READY BOOTSTRAP
document.addEventListener("DOMContentLoaded", function () {
  if (typeof google === "undefined" || !google.maps) {
    console.warn("Google Maps API not loaded, using fallback map mode.");
    initMapWithoutAPI();
  } else {
    console.log("Google Maps API loaded successfully, initializing map.");
    initMap();
  }

  fetchWeather();
  bindPlannerButtons();
  bindMapTypeButtons();

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

  initFilterModal();
});

// 🔘 UI HANDLERS: Journey Planner and Directions
function bindPlannerButtons() {
  const plannerConfig = [
    { id: "journey-planner-btn", handler: showJourneyPlannerPopup },
    { id: "plan-journey-btn", handler: planJourney },
    { id: "submit-journey", handler: planJourney },
    { id: "directions-button", handler: planJourney },
  ];
  plannerConfig.forEach(({ id, handler }) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", handler);
  });
}

// 🗺️ UI HANDLERS: Map Type Toggle
function bindMapTypeButtons() {
  const mapViewBtn = document.getElementById("map-view-btn");
  const satelliteViewBtn = document.getElementById("satellite-view-btn");

  if (mapViewBtn && satelliteViewBtn) {
    mapViewBtn.addEventListener("click", () => {
      if (window.map?.setMapTypeId) {
        window.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        mapViewBtn.style.backgroundColor = "#4285f4";
        satelliteViewBtn.style.backgroundColor = "#333";
      }
    });

    satelliteViewBtn.addEventListener("click", () => {
      if (window.map?.setMapTypeId) {
        window.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
        satelliteViewBtn.style.backgroundColor = "#4285f4";
        mapViewBtn.style.backgroundColor = "#333";
      }
    });
  }
}

// 🧰 MODAL MANAGEMENT: Filter Modal Setup
function initFilterModal() {
  const filterModal = document.getElementById("filter-modal");
  if (filterModal) {
    filterModal.style.display = "none";
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && filterModal.style.display === "block") {
        toggleFilterModal();
      }
    });
  }
}
