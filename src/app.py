from flask import Flask, request, redirect, render_template, url_for, send_from_directory, jsonify
import requests

API_KEY = ""
with open("steam.key") as key:
    API_KEY = key.readline().replace("\n", "")

app = Flask(__name__)

@app.route('/')
def index():
    return "Hello, world!"

@app.route('/api/v1/steam_id')
def get_steam_id():
    endpoint = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=%s&vanityurl=%s"%(API_KEY, request.args.get("vanity_url"))
    r = requests.get(endpoint)
    response = r.json()["response"]
    if response["success"] is not 1:
        return jsonify({}), 404
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
