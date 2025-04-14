# CampusCoins Campus Token Rewards System

## Overview

CampusCoins is a blockchain-based token reward system designed to encourage student 
participation in academic and extracurricular activities. By leveraging smart contracts on 
the blockchain, students can earn tokens for various achievements (such as scoring 
well in assessments or attending events) and redeem them at campus facilities like the 
canteen and bookstore. Additionally, a slashing mechanism deducts tokens for rule 
violations, ensuring discipline and fairness in the reward system.

## Setup Instructions

1. Clone the repository: 

```
git clone https://github.com/ash-047/CampusCoins-Blockchain-Project.git
cd CampusCoins-Blockchain-Project
```

2. Install dependencies:

```
npm install truffle -g  # If truffle is not installed globally
pip install flask
```

3. Start Ganache:

- Launch Ganache and create a workspace with desirable number of accounts. 
- Start/run the workspace and make sure it is running on port 7545

4. Deploy the smart contract:

```
truffle compile
truffle migrate --reset
```
This will automatically set up the roles for all accounts. 

To manually set up the roles, you can run the following command: 
```
truffle exec setup_roles.js
```

And to verify the assigned roles, run the following command:

```
truffle exec check_roles.js
```

5. Update the contract address:

```
python deploy.py
```

6. Start the Flask application:

```
python app.py
```
