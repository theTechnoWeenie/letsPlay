from flask import Flask, render_template
import api

app = Flask(__name__)

#setup the api routes.
app.add_url_rule('/api/v1/steam_id', 'steam_id', view_func=api.get_steam_id)
app.add_url_rule('/api/v1/friends', 'friends', view_func=api.get_friend_list)
app.add_url_rule('/api/v1/games', 'games', view_func=api.get_games)
app.add_url_rule('/api/v1/game_info', 'game_info', view_func=api.get_info_for_game)

@app.route('/')
def index():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
