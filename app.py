from flask import Flask, render_template, redirect, url_for, request, jsonify, session
import json
import os
import re
from web3 import Web3
from functools import wraps
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Secret key for sessions

# Connect to Ganache
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))

# Get contract address from environment variable
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')

# Role checking decorator
def role_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'role' not in session:
                return redirect(url_for('index'))
            
            if session['role'] not in roles:
                return render_template('unauthorized.html')
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Load contract ABI
@app.route("/contract-abi")
def contract_abi():
    with open(os.path.join("build", "contracts", "CampusCoin.json"), "r") as f:
        contract_json = json.load(f)
        return jsonify(contract_json["abi"])

# Get Ganache accounts and their roles
@app.route("/accounts")
def get_accounts():
    try:
        # Get accounts directly using Web3.py
        accounts = w3.eth.accounts
        
        # Load contract ABI and address
        with open(os.path.join("build", "contracts", "CampusCoin.json"), "r") as f:
            contract_json = json.load(f)
            abi = contract_json["abi"]
        
        # Get contract address from deploy.py output
        contract_address = CONTRACT_ADDRESS
        if not contract_address:
            try:
                with open(os.path.join("static", "js", "app.js"), "r") as f:
                    for line in f:
                        if "CONTRACT_ADDRESS" in line:
                            match = re.search(r"'0x[a-fA-F0-9]{40}'", line)
                            if match:
                                contract_address = match.group().strip("'")
                                break
            except Exception as e:
                print(f"Error finding contract address: {e}")
                contract_address = None
            
        if not contract_address:
            # Fallback to the network section of the contract JSON
            try:
                networks = contract_json.get("networks", {})
                if networks:
                    # Get the latest network deployment
                    latest_network = max(networks.keys())
                    contract_address = networks[latest_network]["address"]
            except Exception as e:
                print(f"Error finding contract address from networks: {e}")
        
        result = {"accounts": []}
        
        # Check if we have a contract address
        contract = None
        if contract_address:
            try:
                contract = w3.eth.contract(address=contract_address, abi=abi)
            except Exception as e:
                print(f"Error creating contract instance: {e}")
                
        # Process all accounts
        for i, address in enumerate(accounts):
            role = 'student'
            display_name = ''
            
            # Determine role and display name based on index
            if i == 0:
                role = 'admin'
                display_name = f"Admin"
            elif i == 1:
                role = 'organizer'
                display_name = f"Organizer 1"
            elif i == 2:
                role = 'organizer'
                display_name = f"Organizer 2"
            elif i == 3:
                role = 'canteen'
                display_name = f"Canteen Staff 1"
            elif i == 4:
                role = 'canteen'
                display_name = f"Canteen Staff 2"
            else:
                # For students, calculate their SRN
                student_number = i - 4
                padded_number = str(student_number).zfill(3)
                display_name = f"PES2UG22CS{padded_number}"
                role = 'student'
                
            result["accounts"].append({
                "address": address,
                "index": i,
                "role": role,
                "displayName": display_name
            })
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Set user role in session
@app.route("/set-role", methods=["POST"])
def set_role():
    data = request.json
    if not data or 'address' not in data or 'role' not in data:
        return jsonify({"error": "Invalid request"}), 400
    
    session['address'] = data['address']
    session['role'] = data['role']
    return jsonify({"success": True})

@app.route("/")
def index():
    return render_template("index.html", contract_address=CONTRACT_ADDRESS)

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html", contract_address=CONTRACT_ADDRESS)

@app.route("/admin")
@role_required(['admin'])
def admin():
    return render_template("admin.html", contract_address=CONTRACT_ADDRESS)

@app.route("/organizer")
@role_required(['admin', 'organizer'])
def organizer():
    return render_template("organizer.html", contract_address=CONTRACT_ADDRESS)

@app.route("/canteen")
@role_required(['admin', 'canteen'])
def canteen():
    return render_template("canteen.html", contract_address=CONTRACT_ADDRESS)

@app.route("/student")
@role_required(['admin', 'organizer', 'canteen', 'student'])
def student():
    return render_template("student.html", contract_address=CONTRACT_ADDRESS)

@app.route("/setup")
def setup():
    return render_template("setup_instructions.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == "__main__":
    app.run(debug=True)
