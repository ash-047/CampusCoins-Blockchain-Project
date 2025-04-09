from flask import Flask, render_template, redirect, url_for, request, jsonify
import json
import os

app = Flask(__name__)

# Contract address will be stored here after deployment
CONTRACT_ADDRESS = None

# Try to load contract address from file if available
try:
    if os.path.exists('contract_address.json'):
        with open('contract_address.json', 'r') as f:
            CONTRACT_ADDRESS = json.load(f)['address']
        print(f"Loaded contract address from file: {CONTRACT_ADDRESS}")
except Exception as e:
    print(f"Error loading contract address from file: {e}")

@app.route('/')
def index():
    # If contract address is not set yet, show a message
    if not CONTRACT_ADDRESS:
        return render_template('setup_needed.html')
    return render_template('index.html')

@app.route('/dashboard/<role>')
def dashboard(role):
    if role not in ['admin', 'student', 'organizer', 'canteen']:
        return redirect(url_for('index'))
    return render_template(f'{role}_dashboard.html')

@app.route('/contract_address')
def contract_address():
    # Return the contract address (set after deployment)
    return jsonify({'address': CONTRACT_ADDRESS})

@app.route('/accounts')
def get_accounts():
    # Return the specific Ganache accounts with labels
    accounts = [
        {'address': '0x10787572daaE58789b74b131c48EF4e93E00dA06', 'label': 'Admin', 'role': 'admin'},
        {'address': '0x4977451329D69861613A220837b2f1C61F31C531', 'label': 'Organizer 1', 'role': 'organizer'},
        {'address': '0xFCEe892f01345D3364a86c79Ac2C1CD7c53da0Cd', 'label': 'Organizer 2', 'role': 'organizer'},
        {'address': '0x9c86495CF5d83Af41a376E1865dac9F3E127a688', 'label': 'Canteen 1', 'role': 'canteen'},
        {'address': '0xCa5D12aE19785C30a4Dc90aD26B96DC00e2053eB', 'label': 'Canteen 2', 'role': 'canteen'},
        {'address': '0x839B74A47a63e4cDdfB02a52EcD98c4aB23183fe', 'label': 'Student 1', 'role': 'student'},
        {'address': '0xC9ecEf5042F913c65AA0Fcd81E0D6202f90DE2f7', 'label': 'Student 2', 'role': 'student'},
        {'address': '0xFe9b60BE72C7666901303732d37aF49B09871c35', 'label': 'Student 3', 'role': 'student'},
        {'address': '0x1D9CE4f79d7ccFD9cf08Eb747c610C6c045d1B94', 'label': 'Student 4', 'role': 'student'},
        {'address': '0xb0059F146C41178960684b1F74d8e6c3e1E204b8', 'label': 'Student 5', 'role': 'student'}
    ]
    return jsonify({'accounts': accounts})

# Route to set contract address after deployment
@app.route('/set_contract_address', methods=['POST'])
def set_contract_address():
    global CONTRACT_ADDRESS
    data = request.json
    CONTRACT_ADDRESS = data.get('address')
    print(f"Contract address set to: {CONTRACT_ADDRESS}")
    
    # Also save to file for persistence
    with open('contract_address.json', 'w') as f:
        json.dump({'address': CONTRACT_ADDRESS}, f, indent=2)
    
    return jsonify({'success': True})

# Add a route to get all available roles
@app.route('/roles')
def get_roles():
    if os.path.exists('config.json'):
        with open('config.json', 'r') as f:
            config = json.load(f)
            return jsonify(config.get('roles', {}))
    return jsonify({
        'admin': [],
        'organizers': [],
        'canteenStaff': [],
        'students': []
    })

if __name__ == '__main__':
    app.run(debug=True)
