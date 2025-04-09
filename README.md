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
git clone <repository-url>
cd Blockchain-Project
```

2. Install dependencies:
```
npm install
pip install flask
```

3. Start Ganache:
- Launch Ganache and make sure it's running on port 7545
- Make note of the account addresses provided by Ganache

4. Deploy the smart contract:
```
truffle compile
truffle migrate
```

5. Update the contract address:
```
python deploy.py
```

6. Start the Flask application:
```
python app.py
```

7. Access the application:
- Open your browser and navigate to http://localhost:5000
- Connect MetaMask to Ganache network (127.0.0.1:7545)
- Import Ganache accounts into MetaMask using private keys

## User Roles

The system has the following roles:

1. **Admin** (Account #0):
   - Can mint new tokens
   - Can slash tokens from students
   - Can assign organizer and canteen staff roles

2. **Event Organizer** (Accounts #1-2):
   - Can reward students with tokens
   - Can view student balances

3. **Canteen Staff** (Accounts #3-4):
   - Can redeem tokens from students
   - Can check student balances

4. **Students** (Accounts #5-9):
   - Can view their token balance
   - Can transfer tokens to others

## Role Assignments

- Admin: 0x10787572daaE58789b74b131c48EF4e93E00dA06
- Organizers: 
  - 0x4977451329D69861613A220837b2f1C61F31C531
  - 0xFCEe892f01345D3364a86c79Ac2C1CD7c53da0Cd
- Canteen Staff:
  - 0x9c86495CF5d83Af41a376E1865dac9F3E127a688
  - 0xCa5D12aE19785C30a4Dc90aD26B96DC00e2053eB
- Students:
  - 0x839B74A47a63e4cDdfB02a52EcD98c4aB23183fe
  - 0xC9ecEf5042F913c65AA0Fcd81E0D6202f90DE2f7
  - 0xFe9b60BE72C7666901303732d37aF49B09871c35
  - 0x1D9CE4f79d7ccFD9cf08Eb747c610C6c045d1B94
  - 0xb0059F146C41178960684b1F74d8e6c3e1E204b8
