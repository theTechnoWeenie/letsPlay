from flask import Flask, request, redirect, render_template, url_for, send_from_directory, jsonify
import requests

STEAM_API_BASE = "http://api.steampowered.com/"
API_KEY = ""
with open("steam.key") as key:
    API_KEY = key.readline().replace("\n", "")

app = Flask(__name__)

@app.route('/')
def index():
    return "Hello, world!"

@app.route('/api/v1/steam_id')
def get_steam_id():
    vanity_url = request.args.get("vanity_url")
    if vanity_url is None:
        return create_error_json('You must provide vainty_url as a get parameter')
    endpoint = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=%s&vanityurl=%s"%(API_KEY, vanity_url)
    r = requests.get(endpoint)
    response = r.json()["response"]
    if response["success"] is not 1:
        return create_error_json('A user with url %s was not found'%vanity_url)
    return jsonify({'steam_id':response['steamid'], 'success':True})

@app.route('/api/v1/friends')
def get_friend_list():
    steam_id = request.args.get('steam_id')
    if steam_id is None:
        return create_error_json("steam_id must be supplied")
    endpoint = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=%s&steamid=%s&relationship=friend'%(API_KEY, steam_id)
    raw_response = requests.get(endpoint)
    friends = {'friends': [{'steam_id':x['steamid'], 'since': x['friend_since']} for x in raw_response.json()['friendslist']['friends']]}
    return jsonify(friends)

def create_error_json(message):
    return jsonify({'message':message,'success':False})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")


#technoweenie = 76561197995672622
#bear_dreadnaught = 76561198005189020
