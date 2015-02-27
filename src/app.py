from flask import Flask, request, render_template, url_for, send_from_directory
import api

app = Flask(__name__)

#setup the api routes.
app.add_url_rule('/api/v1/steam_id', 'steam_id', view_func=api.get_steam_id)
app.add_url_rule('/api/v1/friends', 'friends', view_func=api.get_friend_list)
app.add_url_rule('/api/v1/games', 'games', view_func=api.get_games)
app.add_url_rule('/api/v1/unplayed_games', 'unplayed_games', view_func=api.get_unplayed_games)
app.add_url_rule('/api/v1/played_games', 'played_games', view_func=api.get_played_games)
app.add_url_rule('/api/v1/game_info', 'game_info', view_func=api.get_info_for_game)

@app.route('/')
def index():
    return "Hello, world!"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
