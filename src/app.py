from flask import Flask, request, redirect, render_template, url_for, send_from_directory, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return "Hello, world!"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
