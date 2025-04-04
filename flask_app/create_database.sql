-- 创建数据库
CREATE DATABASE IF NOT EXISTS se21_local;
USE se21_local;

-- 创建站点表
CREATE TABLE IF NOT EXISTS station (
    number INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    position_lat DECIMAL(10, 8) NOT NULL,
    position_lon DECIMAL(11, 8) NOT NULL,
    bike_stands INT NOT NULL DEFAULT 0
);

-- 创建可用性表
CREATE TABLE IF NOT EXISTS availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number INT NOT NULL,
    available_bikes INT NOT NULL DEFAULT 0,
    available_bike_stands INT NOT NULL DEFAULT 0,
    last_update DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (number) REFERENCES station(number)
);

-- 插入示例站点数据
INSERT INTO station (number, name, address, position_lat, position_lon, bike_stands) VALUES
(42, 'SMITHFIELD NORTH', 'Smithfield North', 53.349562, -6.278198, 30),
(30, 'PARNELL SQUARE NORTH', 'Parnell Square North', 53.353462, -6.265305, 20),
(54, 'CLONMEL STREET', 'Clonmel Street', 53.336021, -6.26298, 33),
(108, 'AVONDALE ROAD', 'Avondale Road', 53.359405, -6.276142, 40),
(56, 'MOUNT STREET LOWER', 'Mount Street Lower', 53.33796, -6.24153, 40),
(6, 'CHRISTCHURCH PLACE', 'Christchurch Place', 53.343368, -6.27012, 20),
(18, 'GRANTHAM STREET', 'Grantham Street', 53.334123, -6.265436, 30),
(32, 'PEARSE STREET', 'Pearse Street', 53.344304, -6.250427, 30),
(52, 'YORK STREET EAST', 'York Street East', 53.338755, -6.262003, 40),
(48, 'EXCISE WALK', 'Excise Walk', 53.347777, -6.244239, 40);

-- 插入示例可用性数据（不同小时）
-- 10点数据
INSERT INTO availability (number, available_bikes, available_bike_stands, last_update) VALUES
(42, 15, 15, '2023-04-01 10:00:00'),
(30, 10, 10, '2023-04-01 10:00:00'),
(54, 20, 13, '2023-04-01 10:00:00'),
(108, 25, 15, '2023-04-01 10:00:00'),
(56, 18, 22, '2023-04-01 10:00:00'),
(6, 8, 12, '2023-04-01 10:00:00'),
(18, 12, 18, '2023-04-01 10:00:00'),
(32, 14, 16, '2023-04-01 10:00:00'),
(52, 22, 18, '2023-04-01 10:00:00'),
(48, 19, 21, '2023-04-01 10:00:00');

-- 12点数据
INSERT INTO availability (number, available_bikes, available_bike_stands, last_update) VALUES
(42, 12, 18, '2023-04-01 12:00:00'),
(30, 8, 12, '2023-04-01 12:00:00'),
(54, 18, 15, '2023-04-01 12:00:00'),
(108, 20, 20, '2023-04-01 12:00:00'),
(56, 15, 25, '2023-04-01 12:00:00'),
(6, 6, 14, '2023-04-01 12:00:00'),
(18, 10, 20, '2023-04-01 12:00:00'),
(32, 11, 19, '2023-04-01 12:00:00'),
(52, 19, 21, '2023-04-01 12:00:00'),
(48, 16, 24, '2023-04-01 12:00:00');

-- 14点数据
INSERT INTO availability (number, available_bikes, available_bike_stands, last_update) VALUES
(42, 10, 20, '2023-04-01 14:00:00'),
(30, 5, 15, '2023-04-01 14:00:00'),
(54, 15, 18, '2023-04-01 14:00:00'),
(108, 18, 22, '2023-04-01 14:00:00'),
(56, 12, 28, '2023-04-01 14:00:00'),
(6, 4, 16, '2023-04-01 14:00:00'),
(18, 8, 22, '2023-04-01 14:00:00'),
(32, 9, 21, '2023-04-01 14:00:00'),
(52, 16, 24, '2023-04-01 14:00:00'),
(48, 13, 27, '2023-04-01 14:00:00');

-- 16点数据
INSERT INTO availability (number, available_bikes, available_bike_stands, last_update) VALUES
(42, 8, 22, '2023-04-01 16:00:00'),
(30, 3, 17, '2023-04-01 16:00:00'),
(54, 12, 21, '2023-04-01 16:00:00'),
(108, 15, 25, '2023-04-01 16:00:00'),
(56, 10, 30, '2023-04-01 16:00:00'),
(6, 2, 18, '2023-04-01 16:00:00'),
(18, 5, 25, '2023-04-01 16:00:00'),
(32, 7, 23, '2023-04-01 16:00:00'),
(52, 14, 26, '2023-04-01 16:00:00'),
(48, 10, 30, '2023-04-01 16:00:00');

-- 18点数据
INSERT INTO availability (number, available_bikes, available_bike_stands, last_update) VALUES
(42, 6, 24, '2023-04-01 18:00:00'),
(30, 2, 18, '2023-04-01 18:00:00'),
(54, 10, 23, '2023-04-01 18:00:00'),
(108, 12, 28, '2023-04-01 18:00:00'),
(56, 8, 32, '2023-04-01 18:00:00'),
(6, 1, 19, '2023-04-01 18:00:00'),
(18, 3, 27, '2023-04-01 18:00:00'),
(32, 5, 25, '2023-04-01 18:00:00'),
(52, 12, 28, '2023-04-01 18:00:00'),
(48, 8, 32, '2023-04-01 18:00:00');

-- 20点数据
INSERT INTO availability (number, available_bikes, available_bike_stands, last_update) VALUES
(42, 20, 10, '2023-04-01 20:00:00'),
(30, 16, 4, '2023-04-01 20:00:00'),
(54, 25, 8, '2023-04-01 20:00:00'),
(108, 30, 10, '2023-04-01 20:00:00'),
(56, 28, 12, '2023-04-01 20:00:00'),
(6, 15, 5, '2023-04-01 20:00:00'),
(18, 24, 6, '2023-04-01 20:00:00'),
(32, 22, 8, '2023-04-01 20:00:00'),
(52, 30, 10, '2023-04-01 20:00:00'),
(48, 26, 14, '2023-04-01 20:00:00');

-- 22点数据
INSERT INTO availability (number, available_bikes, available_bike_stands, last_update) VALUES
(42, 25, 5, '2023-04-01 22:00:00'),
(30, 18, 2, '2023-04-01 22:00:00'),
(54, 28, 5, '2023-04-01 22:00:00'),
(108, 35, 5, '2023-04-01 22:00:00'),
(56, 32, 8, '2023-04-01 22:00:00'),
(6, 17, 3, '2023-04-01 22:00:00'),
(18, 27, 3, '2023-04-01 22:00:00'),
(32, 25, 5, '2023-04-01 22:00:00'),
(52, 35, 5, '2023-04-01 22:00:00'),
(48, 30, 10, '2023-04-01 22:00:00'); 
