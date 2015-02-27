import requests, lxml.html
from flask import Flask, request, jsonify
from caches.Cache import Cache

API_KEY = ""
with open("steam.key") as key:
    API_KEY = key.readline().replace("\n", "")

GAME_LIBRARY_CACHE = Cache()
GAME_INFO_CACHE = Cache()

def get_steam_id():
    """
    Gets a steam_id for a given custom url
    """
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
    """
    Gets the steam_ids of all friends associated with steam_id
    """
    steam_id = request.args.get('steam_id')
    if steam_id is None:
        return create_error_json("steam_id must be supplied")
    endpoint = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=%s&steamid=%s&relationship=friend'%(API_KEY, steam_id)
    raw_response = requests.get(endpoint)
    friends = {'friends': [{'steam_id':x['steamid'], 'since': x['friend_since']} for x in raw_response.json()['friendslist']['friends']]}
    return jsonify(friends)

def get_games():
    """
    Gets all game appid's associated with steam_id
    """
    steam_id = request.args.get('steam_id')
    return jsonify(get_games_request(steam_id))


def get_games_request(steam_id):
    """
    Performs the REST request to get the games of user <steam_id>
    Returns the json for total games, and a list of games and forever_playtime
    """
    if steam_id is None:
        return create_error_json('steam_id must be provided')
    cached = GAME_LIBRARY_CACHE.get(steam_id)
    if cached is None:
        endpoint = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=%s&steamid=%s&format=json"%(API_KEY, steam_id)
        raw_response = requests.get(endpoint)
        if raw_response.status_code is not 200:
            return create_error_json('There was an unexpected api error'), raw_response.status_code
        cached = raw_response.json()["response"]
        GAME_LIBRARY_CACHE.set(steam_id, cached)
    return cached

def get_played_games():
    """
    Returns a list of only games that have been played.
    """
    steam_id = request.args.get('steam_id')
    all_games = get_games_request(steam_id)
    played = [{"app_id":game["appid"]} for game in all_games["games"] if game["playtime_forever"] != 0]
    return jsonify({"game_count": len(played), "games":played, "success":True})


def get_unplayed_games():
    """
    Returns the list of all games for steam_id that have not been played.
    """
    steam_id = request.args.get('steam_id')
    all_games = get_games_request(steam_id)
    unplayed = [{"app_id":game["appid"]} for game in all_games["games"] if game["playtime_forever"] == 0]
    return jsonify({"game_count": len(unplayed), "games":unplayed, "success":True})

def get_info_for_game():
    """
    Returns the game schema for a game with associated appid.
    """
    app_id = request.args.get('app_id')
    game_info = GAME_INFO_CACHE.get(app_id)
    if game_info is None:
        #TODO: This is technically the right way to do this, but the steam API is a little busted.
        # endpoint = "http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=%s&appid=%s"%(API_KEY, app_id)
        # raw_response = requests.get(endpoint)
        # game_info = raw_response.json()
        #TODO: So we're going to do it the wrong way... HTML PARSING GO!!
        game_info = lxml.html.parse("http://store.steampowered.com/app/%s"%app_id)
        game_info = game_info.find(".//title").text.replace(" on Steam", "")
        GAME_INFO_CACHE.set(app_id, game_info)
    return jsonify({"title":game_info, "success":True})

def create_error_json(message):
    """
    Boiler plate for creating an error json blob.
    """
    return jsonify({'message':message,'success':False})
