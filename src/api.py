import requests
from flask import Flask, request, jsonify

API_KEY = ""
with open("steam.key") as key:
    API_KEY = key.readline().replace("\n", "")

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

def get_friend_list():
    steam_id = request.args.get('steam_id')
    if steam_id is None:
        return create_error_json("steam_id must be supplied")
    endpoint = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=%s&steamid=%s&relationship=friend'%(API_KEY, steam_id)
    raw_response = requests.get(endpoint)
    friends = {'friends': [{'steam_id':x['steamid'], 'since': x['friend_since']} for x in raw_response.json()['friendslist']['friends']]}
    return jsonify(friends)

def get_games():
    steam_id = request.args.get('steam_id')
    if steam_id is None:
        return create_error_json('steam_id must be provided')
    endpoint = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=%s&steamid=%s&format=json"%(API_KEY, steam_id)
    raw_response = requests.get(endpoint)
    if raw_response.status_code is not 200:
        return create_error_json('There was an unexpected api error'), raw_response.status_code
    return jsonify(raw_response.json())

def create_error_json(message):
    return jsonify({'message':message,'success':False})

#technoweenie = 76561197995672622
#bear_dreadnaught = 76561198005189020
