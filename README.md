Let's Play!
===
Find games to play with your friends easier than ever before!

This is a simple app based on the Steam api that will pull a user's friends list, and suggest games that both of you own and are multiplayer.  

Currently deployed to heroku: https://whattoplay.herokuapp.com/

## Note about steam ids. 
A steam id can be found on the profile page of a user in the url.
Grab the steam id from your profile page (or vanity url if you are that cool) and plop it in to start.
```
http://steamcommunity.com/id/<YOU WANT THIS PART>/home
```

## Notes for developers:
There is a backend wrapper API that IMHO is a little more sane than Steam's but also a little more limited.

To run this service, it is recommended that you use virtualenv.

From the root of the project, run
```
pip install -r requirements.txt
wheel install lxml-3.4.2-cp27-none-win32.whl
```
for 32-bit python installs on windows. On linux run

```
pip install -r requirements.txt
pip install lxml
```
## Contributing:
* Fork
* Commit
* PR!

**Note:** that all of the api is contained in src/api.py and the front end is a single page app with all of the code handled in src/static/js/letsplay.js

## TODO:
* Swagger docs for the backend api
* Prettier UI
* Error handling so that it doesn't fail silently.

