from flask import Flask, render_template, redirect, url_for, request, jsonify
import json
import os

app = Flask(__name__)

# Load contract ABI
@app.route("/contract-abi")
def contract_abi():
    with open(os.path.join("build", "contracts", "CampusCoin.json"), "r") as f:
        contract_json = json.load(f)
        return jsonify(contract_json["abi"])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/admin")
def admin():
    return render_template("admin.html")

@app.route("/organizer")
def organizer():
    return render_template("organizer.html")

@app.route("/canteen")
def canteen():
    return render_template("canteen.html")

@app.route("/student")
def student():
    return render_template("student.html")

@app.route("/debug")
def debug():
    return render_template("debug.html")

@app.route("/transaction-debug")
def transaction_debug():
    return render_template("transaction-debug.html")

@app.route("/setup")
def setup():
    return render_template("setup_instructions.html")

if __name__ == "__main__":
    app.run(debug=True)
