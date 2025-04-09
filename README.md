# CampusCoins - Blockchain-Based Campus Reward System

A reward system where students earn tokens for participating in campus activities and lose tokens for rule violations.

## Setup Instructions

### Prerequisites
- Node.js and npm
- Python 3.6+
- Flask
- Ganache
- MetaMask browser extension
- Truffle

### Installation

1. Clone the repository:
```
git clone https://github.com/ash-047/CampusCoins-Blockchain-Project.git
cd Blockchain-Project
```

2. Install dependencies:
```
npm install truffle -g  # If truffle is not installed globally
pip install flask
```

3. Start Ganache:
- Launch Ganache and make sure it's running on port 7545
- Make note of the account addresses provided by Ganache

4. Deploy the smart contract:
```
truffle compile
truffle migrate --reset
```
This will automatically set up the roles for all accounts.
5. Update the contract address:
```Verify roles are properly set:
python deploy.py
```ffle exec check_roles.js
```
6. Start the Flask application:
```If roles need to be set up manually:
python app.py
```ffle exec setup_roles.js
```
7. Access the application:
- Open your browser and navigate to http://localhost:5000
- Connect MetaMask to Ganache network (127.0.0.1:7545)
- Import Ganache accounts into MetaMask using private keys

## MetaMask Configuration

1. Start the Flask application:
2. Add a new network to MetaMask:
   - Network Name: Ganachepython app.py
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - Currency Symbol: ETH
ost:5000
3. Import accounts from Ganache:- Connect MetaMask to Ganache network (127.0.0.1:7545)
   - Click the key icon next to each Ganache account to copy the private key using private keys
   - In MetaMask, click your account icon → Import Account
   - Paste the private key and click Import

## User Roles

The system has the following roles:
   - Can mint new tokens
1. **Admin** (Account #0):nts
   - Can mint new tokensteen staff roles
   - Can slash tokens from students
   - Can assign organizer and canteen staff roles2. **Event Organizer** (Accounts #1-2):
dents with tokens
2. **Event Organizer** (Accounts #1-2):   - Can view student balances
   - Can reward students with tokens
   - Can view student balancestaff** (Accounts #3-4):

3. **Canteen Staff** (Accounts #3-4):
   - Can redeem tokens from students
   - Can check student balances

4. **Students** (Accounts #5-9):ansfer tokens to others
   - Can view their token balance
   - Can transfer tokens to others

