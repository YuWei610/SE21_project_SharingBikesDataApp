from flask import Flask, render_template


from flask import Flask
app = Flask(__name__)

# @app.route('/')
# def index():
#     # 将此处替换为你自己的 Google Maps API 密钥
#     google_maps_api_key = "YOUR_API_KEY"
#     return render_template('index.html', google_maps_api_key=google_maps_api_key)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/user")
def user():
    return app.send_static_file('user.html')

@app.route("/map")
def main():
    return render_template("map.html")

if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host="0.0.0.0", port=5001)
