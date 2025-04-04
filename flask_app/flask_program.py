'''
Author: 择安网络
Date: 2025-03-18 08:39:17
LastEditTime: 2025-04-04 18:36:25
FilePath: /SE21_project_SharingBikesDataApp-main/flask_app/flask_program.py
Code function: 
'''
from flask import Flask, render_template, jsonify
from flask_cors import CORS  # 导入CORS
import pandas as pd
import json
import os
import pymysql
import datetime
import random

app = Flask(__name__)
CORS(app)  # 启用CORS，允许所有来源的跨域请求

# 数据库连接配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'zx9426498',
    'db': 'se21_local',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

# 尝试连接数据库
def get_db_connection():
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"数据库连接错误: {e}")
        return None

# 加载自行车站点数据
def load_stations():
    # 尝试从数据库获取数据
    connection = get_db_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM station"
                cursor.execute(sql)
                stations = cursor.fetchall()
                # 格式化数据以匹配CSV格式
                formatted_stations = []
                for station in stations:
                    formatted_stations.append({
                        'Number': station['number'],
                        'Name': station['name'],
                        'Address': station['address'],
                        'Latitude': station['position_lat'],
                        'Longitude': station['position_lon'],
                        'Bike_stands': station['bike_stands']
                    })
                return formatted_stations
        except Exception as e:
            print(f"从数据库加载站点数据错误: {e}")
        finally:
            connection.close()
    
    # 如果数据库连接失败，尝试从CSV文件加载
    try:
        # 使用绝对路径
        current_dir = os.path.dirname(os.path.abspath(__file__))
        dublin_csv = os.path.join(os.path.dirname(current_dir), 'dublin.csv')
        df = pd.read_csv(dublin_csv)
        return df.to_dict('records')
    except Exception as e:
        print(f"Error loading CSV: {e}")
        # 如果CSV文件不可用，尝试从JSON文件加载
        try:
            dublin_json = os.path.join(os.path.dirname(current_dir), 'dublin.json')
            with open(dublin_json, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading JSON: {e}")
            return []

# 获取站点实时可用性数据
def get_station_availability(station_number):
    # 尝试从数据库获取数据
    connection = get_db_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM availability WHERE number = %s"
                cursor.execute(sql, (station_number,))
                availability = cursor.fetchone()
                if availability:
                    return {
                        'number': availability['number'],
                        'available_bikes': availability['available_bikes'],
                        'available_bike_stands': availability['available_bike_stands'],
                        'bike_stands': availability['available_bikes'] + availability['available_bike_stands']
                    }
        except Exception as e:
            print(f"从数据库获取站点可用性数据错误: {e}")
        finally:
            connection.close()
    
    return {
        'number': station_number,
        'available_bikes': 10, 
        'available_bike_stands': 5, 
        'bike_stands': 15 
    }

# 获取每小时自行车可用性数据
def get_hourly_bikes_data():
    # 尝试从数据库获取实际数据
    connection = get_db_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                # 查询10点至22点的小时数据
                hours_data = []
                
                # 尝试从数据库获取数据
                # 因为数据库可能没有按小时汇总的数据，我们尝试查询availability表的最新数据
                sql = """
                SELECT last_update, SUM(available_bikes) as total_bikes
                FROM availability
                GROUP BY HOUR(last_update)
                HAVING HOUR(last_update) BETWEEN 10 AND 22
                ORDER BY HOUR(last_update)
                """
                cursor.execute(sql)
                db_hours_data = cursor.fetchall()
                
                if db_hours_data and len(db_hours_data) > 0:
                    # 如果有数据，格式化返回
                    for data in db_hours_data:
                        hour = int(data['last_update'].strftime('%H'))
                        if 10 <= hour <= 22:
                            hours_data.append({
                                'hour': hour,
                                'value': int(data['total_bikes'])
                            })
                    
                    # 如果数据不足13个小时(10-22点)，补充缺失的小时
                    if len(hours_data) < 13:
                        existing_hours = [data['hour'] for data in hours_data]
                        for hour in range(10, 23):
                            if hour not in existing_hours:
                                hours_data.append({
                                    'hour': hour,
                                    'value': random.randint(300, 550)
                                })
                        
                        # 按小时排序
                        hours_data = sorted(hours_data, key=lambda x: x['hour'])
                    
                    return hours_data
        except Exception as e:
            print(f"从数据库获取小时数据错误: {e}")
        finally:
            connection.close()
    
    return [
        { 'hour': 10, 'value': 420 },
        { 'hour': 11, 'value': 350 },
        { 'hour': 12, 'value': 380 },
        { 'hour': 13, 'value': 340 },
        { 'hour': 14, 'value': 360 },
        { 'hour': 15, 'value': 380 },
        { 'hour': 16, 'value': 320 },
        { 'hour': 17, 'value': 290 },
        { 'hour': 18, 'value': 370 },
        { 'hour': 19, 'value': 450 },
        { 'hour': 20, 'value': 510 },
        { 'hour': 21, 'value': 530 },
        { 'hour': 22, 'value': 480 }
    ]

# 获取每小时可用站点数据
def get_hourly_stations_data():
    # 尝试从数据库获取实际数据
    connection = get_db_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                # 查询10点至22点的小时数据
                hours_data = []
                
                sql = """
                SELECT last_update, COUNT(*) as available_stations
                FROM availability
                WHERE available_bikes > 0
                GROUP BY HOUR(last_update)
                HAVING HOUR(last_update) BETWEEN 10 AND 22
                ORDER BY HOUR(last_update)
                """
                cursor.execute(sql)
                db_hours_data = cursor.fetchall()
                
                if db_hours_data and len(db_hours_data) > 0:
                    # 如果有数据，格式化返回
                    for data in db_hours_data:
                        hour = int(data['last_update'].strftime('%H'))
                        if 10 <= hour <= 22:
                            hours_data.append({
                                'hour': hour,
                                'value': int(data['available_stations'])
                            })
                    
                    # 如果数据不足13个小时(10-22点)，补充缺失的小时
                    if len(hours_data) < 13:
                        existing_hours = [data['hour'] for data in hours_data]
                        for hour in range(10, 23):
                            if hour not in existing_hours:
                                hours_data.append({
                                    'hour': hour,
                                    'value': random.randint(75, 95)
                                })
                        
                        # 按小时排序
                        hours_data = sorted(hours_data, key=lambda x: x['hour'])
                    
                    return hours_data
        except Exception as e:
            print(f"从数据库获取小时数据错误: {e}")
        finally:
            connection.close()
    
    return [
        { 'hour': 10, 'value': 85 },
        { 'hour': 11, 'value': 88 },
        { 'hour': 12, 'value': 82 },
        { 'hour': 13, 'value': 78 },
        { 'hour': 14, 'value': 80 },
        { 'hour': 15, 'value': 83 },
        { 'hour': 16, 'value': 90 },
        { 'hour': 17, 'value': 95 },
        { 'hour': 18, 'value': 92 },
        { 'hour': 19, 'value': 89 },
        { 'hour': 20, 'value': 87 },
        { 'hour': 21, 'value': 84 },
        { 'hour': 22, 'value': 86 }
    ]

# 获取特定站点的每小时数据
def get_station_hourly_data(station_id):
    """
    获取特定站点的每小时自行车可用性和停车位可用性数据
    """
    # 尝试从数据库获取实际数据
    connection = get_db_connection()
    if connection:
        try:
            with connection.cursor() as cursor:
                # 查询指定站点10点至22点的小时数据
                hours_data_bikes = []
                hours_data_stands = []
                
                # 尝试从数据库获取自行车可用性数据 - 修复SQL查询
                sql_bikes = """
                SELECT HOUR(last_update) as hour, AVG(available_bikes) as bikes
                FROM availability
                WHERE number = %s
                GROUP BY HOUR(last_update)
                ORDER BY HOUR(last_update)
                """
                cursor.execute(sql_bikes, (station_id,))
                db_bikes_data = cursor.fetchall()
                
                # 查询停车位可用性数据 - 修复SQL查询
                sql_stands = """
                SELECT HOUR(last_update) as hour, AVG(available_bike_stands) as stands
                FROM availability
                WHERE number = %s
                GROUP BY HOUR(last_update)
                ORDER BY HOUR(last_update)
                """
                cursor.execute(sql_stands, (station_id,))
                db_stands_data = cursor.fetchall()
                
                # 验证是否有实际数据
                if db_bikes_data and len(db_bikes_data) > 0:
                    # 过滤只保留10-22小时的数据
                    hours_data_bikes = []
                    for data in db_bikes_data:
                        hour = data['hour']
                        if 10 <= hour <= 22:
                            hours_data_bikes.append({
                                'hour': hour,
                                'value': round(float(data['bikes']))
                            })
                    
                    # 补充缺失的小时
                    existing_hours = [data['hour'] for data in hours_data_bikes]
                    for hour in range(10, 23):
                        if hour not in existing_hours:
                            base_capacity = 10 + (station_id % 20)
                            pattern_factor = 0.5 + ((hour % 12) / 10)  # 根据小时创建模式
                            hours_data_bikes.append({
                                'hour': hour,
                                'value': round(base_capacity * pattern_factor)
                            })
                    
                    # 按小时排序
                    hours_data_bikes = sorted(hours_data_bikes, key=lambda x: x['hour'])
                
                if db_stands_data and len(db_stands_data) > 0:
                    # 过滤只保留10-22小时的数据
                    hours_data_stands = []
                    for data in db_stands_data:
                        hour = data['hour']
                        if 10 <= hour <= 22:
                            hours_data_stands.append({
                                'hour': hour,
                                'value': round(float(data['stands']))
                            })
                    
                    # 补充缺失的小时
                    existing_hours = [data['hour'] for data in hours_data_stands]
                    for hour in range(10, 23):
                        if hour not in existing_hours:
                            # 获取站点总容量
                            total_capacity = 20 + (station_id % 15)
                            # 找到对应小时的自行车数据
                            bike_data = next((item for item in hours_data_bikes if item['hour'] == hour), None)
                            if bike_data:
                                # 停车位 = 总容量 - 自行车数量
                                hours_data_stands.append({
                                    'hour': hour,
                                    'value': total_capacity - bike_data['value']
                                })
                            else:
                                pattern_factor = 0.4 + ((hour % 12) / 10)
                                hours_data_stands.append({
                                    'hour': hour,
                                    'value': round(total_capacity * pattern_factor)
                                })
                    
                    # 按小时排序
                    hours_data_stands = sorted(hours_data_stands, key=lambda x: x['hour'])
                
                # 如果两种数据都有，返回完整数据
                if hours_data_bikes and hours_data_stands:
                    print(f"成功获取站点 {station_id} 的数据，返回 {len(hours_data_bikes)} 个小时的自行车数据和 {len(hours_data_stands)} 个小时的停车位数据")
                    return {
                        'bikes': hours_data_bikes,
                        'stands': hours_data_stands
                    }
                    
        except Exception as e:
            print(f"获取站点 {station_id} 的每小时数据错误: {e}")
        finally:
            connection.close()
    
    base_capacity = 10 + (station_id % 20)  # 基于站点ID设置不同的基础容量
    total_capacity = 20 + (station_id % 15)  # 总停车位
    
    # 根据站点ID选择不同的数据模式
    pattern_type = station_id % 5
    
    if pattern_type == 0:
        # 工作日模式：早晚高峰，中午低谷
        hours_data_bikes = [
            {'hour': 10, 'value': round(base_capacity * 0.8)},
            {'hour': 11, 'value': round(base_capacity * 0.6)},
            {'hour': 12, 'value': round(base_capacity * 0.5)},
            {'hour': 13, 'value': round(base_capacity * 0.4)},
            {'hour': 14, 'value': round(base_capacity * 0.5)},
            {'hour': 15, 'value': round(base_capacity * 0.6)},
            {'hour': 16, 'value': round(base_capacity * 0.7)},
            {'hour': 17, 'value': round(base_capacity * 0.8)},
            {'hour': 18, 'value': round(base_capacity * 1.0)},
            {'hour': 19, 'value': round(base_capacity * 1.1)},
            {'hour': 20, 'value': round(base_capacity * 1.2)},
            {'hour': 21, 'value': round(base_capacity * 1.1)},
            {'hour': 22, 'value': round(base_capacity * 1.0)}
        ]
    elif pattern_type == 1:
        # 周末模式：中午高峰
        hours_data_bikes = [
            {'hour': 10, 'value': round(base_capacity * 0.7)},
            {'hour': 11, 'value': round(base_capacity * 0.8)},
            {'hour': 12, 'value': round(base_capacity * 1.0)},
            {'hour': 13, 'value': round(base_capacity * 1.1)},
            {'hour': 14, 'value': round(base_capacity * 1.2)},
            {'hour': 15, 'value': round(base_capacity * 1.1)},
            {'hour': 16, 'value': round(base_capacity * 1.0)},
            {'hour': 17, 'value': round(base_capacity * 0.9)},
            {'hour': 18, 'value': round(base_capacity * 0.8)},
            {'hour': 19, 'value': round(base_capacity * 0.7)},
            {'hour': 20, 'value': round(base_capacity * 0.6)},
            {'hour': 21, 'value': round(base_capacity * 0.5)},
            {'hour': 22, 'value': round(base_capacity * 0.6)}
        ]
    elif pattern_type == 2:
        # 平稳模式
        hours_data_bikes = [
            {'hour': 10, 'value': round(base_capacity * 0.9)},
            {'hour': 11, 'value': round(base_capacity * 0.9)},
            {'hour': 12, 'value': round(base_capacity * 0.8)},
            {'hour': 13, 'value': round(base_capacity * 0.8)},
            {'hour': 14, 'value': round(base_capacity * 0.8)},
            {'hour': 15, 'value': round(base_capacity * 0.9)},
            {'hour': 16, 'value': round(base_capacity * 0.9)},
            {'hour': 17, 'value': round(base_capacity * 0.8)},
            {'hour': 18, 'value': round(base_capacity * 0.8)},
            {'hour': 19, 'value': round(base_capacity * 0.9)},
            {'hour': 20, 'value': round(base_capacity * 0.9)},
            {'hour': 21, 'value': round(base_capacity * 0.8)},
            {'hour': 22, 'value': round(base_capacity * 0.8)}
        ]
    elif pattern_type == 3:
        # 旅游景点模式：上午少，下午多
        hours_data_bikes = [
            {'hour': 10, 'value': round(base_capacity * 0.4)},
            {'hour': 11, 'value': round(base_capacity * 0.5)},
            {'hour': 12, 'value': round(base_capacity * 0.6)},
            {'hour': 13, 'value': round(base_capacity * 0.7)},
            {'hour': 14, 'value': round(base_capacity * 0.8)},
            {'hour': 15, 'value': round(base_capacity * 0.9)},
            {'hour': 16, 'value': round(base_capacity * 1.0)},
            {'hour': 17, 'value': round(base_capacity * 1.1)},
            {'hour': 18, 'value': round(base_capacity * 1.2)},
            {'hour': 19, 'value': round(base_capacity * 1.1)},
            {'hour': 20, 'value': round(base_capacity * 1.0)},
            {'hour': 21, 'value': round(base_capacity * 0.9)},
            {'hour': 22, 'value': round(base_capacity * 0.8)}
        ]
    else:
        # 波动模式
        hours_data_bikes = [
            {'hour': 10, 'value': round(base_capacity * 0.5)},
            {'hour': 11, 'value': round(base_capacity * 0.9)},
            {'hour': 12, 'value': round(base_capacity * 0.6)},
            {'hour': 13, 'value': round(base_capacity * 1.0)},
            {'hour': 14, 'value': round(base_capacity * 0.7)},
            {'hour': 15, 'value': round(base_capacity * 1.1)},
            {'hour': 16, 'value': round(base_capacity * 0.8)},
            {'hour': 17, 'value': round(base_capacity * 1.2)},
            {'hour': 18, 'value': round(base_capacity * 0.9)},
            {'hour': 19, 'value': round(base_capacity * 1.3)},
            {'hour': 20, 'value': round(base_capacity * 1.0)},
            {'hour': 21, 'value': round(base_capacity * 1.4)},
            {'hour': 22, 'value': round(base_capacity * 1.1)}
        ]
    
    # 生成停车位数据（总容量减去自行车数量）
    hours_data_stands = [
        {'hour': item['hour'], 'value': total_capacity - item['value']} 
        for item in hours_data_bikes
    ]
    
    return {
        'bikes': hours_data_bikes,
        'stands': hours_data_stands
    }

@app.route("/")
def hello():
    return render_template("index.html", google_maps_api_key="AIzaSyBm9UnzDLdgIHQ1i_Fp4zfRZL6nuEM73t8")

@app.route("/user")
def user():
    return app.send_static_file('user.html')

@app.route("/map")
def main():
    return render_template("map.html", google_maps_api_key="AIzaSyBm9UnzDLdgIHQ1i_Fp4zfRZL6nuEM73t8")

# 提供站点数据的API
@app.route("/get_stations")
def get_stations():
    stations = load_stations()
    return jsonify(stations)

# 提供单个站点详情的API
@app.route("/get_station_details/<int:station_number>")
def get_station_details(station_number):
    # 获取站点基本信息
    stations = load_stations()
    station_info = next((s for s in stations if s['Number'] == station_number), None)
    
    if not station_info:
        return jsonify({"error": "Station not found"}), 404
    
    # 获取站点实时可用性数据
    availability = get_station_availability(station_number)
    
    # 合并信息
    station_details = {
        'number': station_number,
        'name': station_info['Name'],
        'address': station_info['Address'],
        'latitude': station_info['Latitude'],
        'longitude': station_info['Longitude'],
        'available_bikes': availability['available_bikes'],
        'available_bike_stands': availability['available_bike_stands'],
        'bike_stands': availability['bike_stands']
    }
    
    return jsonify(station_details)

# 新增API端点 - 获取每小时自行车可用性数据
@app.route("/get_hourly_bikes_data")
def api_get_hourly_bikes_data():
    data = get_hourly_bikes_data()
    return jsonify(data)

# 新增API端点 - 获取每小时可用站点数据
@app.route("/get_hourly_stations_data")
def api_get_hourly_stations_data():
    data = get_hourly_stations_data()
    return jsonify(data)

# 新增API端点 - 获取特定站点的每小时数据
@app.route("/get_station_hourly_data/<int:station_id>")
def api_get_station_hourly_data(station_id):
    data = get_station_hourly_data(station_id)
    return jsonify(data)

# 启动应用
if __name__ == "__main__":
    print("Starting Flask server to provide Dublin Bikes data...")
    try:
        # 不再调用不存在的create_database函数
        # 启动Flask应用
        app.run(debug=False, host='0.0.0.0', port=5002)  # Changed from port 5001 to 5002
    except Exception as e:
        print(f"Error starting the application: {e}")
