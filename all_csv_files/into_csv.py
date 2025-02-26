import mysql.connector
import pandas as pd

# 連接到 MySQL 資料庫
conn = mysql.connector.connect(
    host="localhost",      
    user="root",     
    password="betty766", 
    database="se21_local" 
)

cursor = conn.cursor()

# 取得所有的表格名稱
cursor.execute("SHOW TABLES;")
tables = [table[0] for table in cursor.fetchall()]
print(tables)

# 逐個表格導出成 CSV
for table in tables:
    df = pd.read_sql(f"SELECT * FROM {table}", conn)
    df.to_csv(f"{table}.csv", index=False)
    print(f"已導出: {table}.csv")

# 關閉連線
cursor.close()
conn.close()
