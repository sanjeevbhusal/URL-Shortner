from flask import Flask, redirect, render_template
from firebase_admin import db, credentials, initialize_app
import os

#firebase Config
cred = credentials.Certificate("./privateKey.json")
initialize_app(cred, {
    "databaseURL" : "https://react-flask-fb44a-default-rtdb.firebaseio.com/" 
})

app = Flask(__name__, static_folder="./build/static", template_folder="./build")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/<string:path>", methods=["GET"])
def redirect_to_main(path):
    #we have to fetch the data with a attribute of path from database.
    pathRef = db.reference("/" + path)
    data = pathRef.get()
    if not data :
        return "URL doesnot exist."
    longUrl = data["longUrl"]
    return redirect(longUrl)