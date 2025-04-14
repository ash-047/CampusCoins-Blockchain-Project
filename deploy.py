import json
import os
import re

def update_contract_address():
    try:
        with open('build/contracts/CampusCoin.json', 'r') as f:
            contract_data = json.load(f)
        networks = contract_data.get('networks', {})
        if not networks:
            print("Error: No deployed networks found in contract artifacts")
            return False
        network_id = list(networks.keys())[0]
        contract_address = networks[network_id]['address']
        app_js_path = 'static/js/app.js'
        with open(app_js_path, 'r') as f:
            content = f.read()
        updated_content = re.sub(r"const CONTRACT_ADDRESS = '.*?';", 
                               f"const CONTRACT_ADDRESS = '{contract_address}';", 
                               content)
        with open(app_js_path, 'w') as f:
            f.write(updated_content)
        print(f"Contract address updated to {contract_address}")
        return True
    except Exception as e:
        print(f"Error updating contract address: {e}")
        return False

if __name__ == "__main__":
    update_contract_address()
