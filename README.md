# CampusCoins - Blockchain-Based Campus Reward System

A blockchain-based token reward system for university campuses, allowing students to earn tokens for participating in campus activities and redeem them at campus facilities.

## Overview

CampusCoins is a web application that uses a local blockchain network (Ganache) to manage a custom ERC-20-like token called CampusCoin (CPC). The system supports role-based access using MetaMask wallet authentication:

- **Admin**: Can mint tokens and slash tokens from students for rule violations
- **Event Organizers**: Can reward students with tokens for participating in events
- **Canteen Staff**: Can redeem tokens from students in exchange for food or services
- **Students**: Can view their balance and transaction history

## Technical Components

1. **Smart Contract (CampusCoin)**: Custom ERC-20-like token with campus-specific functions
2. **MetaMask Integration**: For wallet-based authentication and transaction signing
3. **Flask Backend**: Serving web interfaces and handling role-based access
4. **Web Frontend**: HTML/JavaScript/Web3.js interface for interacting with the blockchain

## Setup Instructions (Simplified)

Follow these steps in order:

### 1. Start Ganache
- Launch Ganache and start a new workspace
- Make sure it's running on port 7545

### 2. Deploy the Contract
```bash
# Install dependencies
npm install
npm install -g truffle
pip install flask

# Compile and deploy the contract
truffle compile
truffle migrate --reset
```

### 3. Set up the Application
```bash
# Install additional dependencies for the setup script
npm install axios

# Run the setup script to configure the Flask app
node setup_contract.js
```

### 4. Start the Flask App
```bash
# In a new terminal
python app.py
```

### 5. Open in Browser
- Navigate to http://localhost:5000
- Connect with MetaMask (make sure it's connected to Ganache)

## Role Assignments and Token Balances

The smart contract automatically assigns roles and initial token balances:

### Roles
- Admin: Account #0 (0x10787572daaE58789b74b131c48EF4e93E00dA06)
- Event Organizers: 
  - Account #1 (0x4977451329D69861613A220837b2f1C61F31C531)
  - Account #2 (0xFCEe892f01345D3364a86c79Ac2C1CD7c53da0Cd)
- Canteen Staff:
  - Account #3 (0x9c86495CF5d83Af41a376E1865dac9F3E127a688)
  - Account #4 (0xCa5D12aE19785C30a4Dc90aD26B96DC00e2053eB)
- Students: Accounts #5-9 (remaining accounts)

### Initial Token Balances
- Admin: 1000 CPC tokens
- Event Organizers: 200 CPC tokens each
- Canteen Staff: 0 CPC tokens
- Students: 0 CPC tokens

The setup script will save this information to a `config.json` file for reference.

## Using the Application

1. Import at least one account from each role into MetaMask
   - In Ganache, click on the key icon next to an account
   - In MetaMask, import account using the private key

2. Navigate to http://localhost:5000 and connect wallet
   - Your role will be automatically detected
   - You'll be redirected to the appropriate dashboard

3. Use the application based on your role:
   - Admin: Mint tokens and manage users
   - Event Organizers: Reward students for participation
   - Canteen Staff: Redeem tokens from students
   - Students: View balance and transaction history
