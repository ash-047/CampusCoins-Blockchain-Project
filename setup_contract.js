const Web3 = require('web3');
const fs = require('fs');
const axios = require('axios');

async function getContractInfo(web3, contractAddress) {
    // Get the ABI from the contract JSON
    const contractJson = JSON.parse(fs.readFileSync('./build/contracts/CampusCoin.json', 'utf8'));
    const abi = contractJson.abi;
    
    // Create contract instance
    const campusCoin = new web3.eth.Contract(abi, contractAddress);
    
    // Get admin address
    const admin = await campusCoin.methods.admin().call();
    
    // Get all accounts
    const accounts = await web3.eth.getAccounts();
    
    // Check roles for all accounts
    const roleMap = {
        admin: [],
        organizers: [],
        canteenStaff: [],
        students: []
    };
    
    for (const account of accounts) {
        if (account.toLowerCase() === admin.toLowerCase()) {
            roleMap.admin.push(account);
            continue;
        }
        
        const isOrganizer = await campusCoin.methods.isEventOrganizer(account).call();
        if (isOrganizer) {
            roleMap.organizers.push(account);
            continue;
        }
        
        const isCanteen = await campusCoin.methods.isCanteenStaff(account).call();
        if (isCanteen) {
            roleMap.canteenStaff.push(account);
            continue;
        }
        
        roleMap.students.push(account);
    }
    
    return roleMap;
}

async function setup() {
  try {
    // Initialize Web3 correctly
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    
    console.log('Reading contract artifacts...');
    // Check if build directory exists
    if (!fs.existsSync('./build/contracts/CampusCoin.json')) {
      console.error('Contract artifacts not found! Make sure you run "truffle compile" and "truffle migrate" first.');
      return;
    }
    
    const contractJson = JSON.parse(fs.readFileSync('./build/contracts/CampusCoin.json', 'utf8'));
    
    if (!contractJson.networks || !contractJson.networks['5777'] || !contractJson.networks['5777'].address) {
      console.error('Contract deployment information not found! Make sure the contract is deployed to Ganache.');
      return;
    }
    
    const contractAddress = contractJson.networks['5777'].address;
    console.log(`Contract deployed at: ${contractAddress}`);
    
    console.log('Setting contract address in Flask app...');
    try {
      await axios.post('http://localhost:5000/set_contract_address', {
        address: contractAddress
      });
    } catch (error) {
      console.error('Failed to communicate with Flask app. Make sure the Flask server is running on port 5000.');
      console.error('You can manually set the contract address in app.py to:', contractAddress);
      
      // Create a contract_address.json file as a fallback
      fs.writeFileSync('./contract_address.json', JSON.stringify({ address: contractAddress }, null, 2));
      console.log('Contract address saved to contract_address.json');
      return;
    }
    
    // Define specific roles matching your Ganache accounts
    const addressMap = {
      admin: '0x10787572daaE58789b74b131c48EF4e93E00dA06',
      organizers: [
        '0x4977451329D69861613A220837b2f1C61F31C531',
        '0xFCEe892f01345D3364a86c79Ac2C1CD7c53da0Cd'
      ],
      canteenStaff: [
        '0x9c86495CF5d83Af41a376E1865dac9F3E127a688',
        '0xCa5D12aE19785C30a4Dc90aD26B96DC00e2053eB'
      ],
      students: [
        '0x839B74A47a63e4cDdfB02a52EcD98c4aB23183fe',
        '0xC9ecEf5042F913c65AA0Fcd81E0D6202f90DE2f7',
        '0xFe9b60BE72C7666901303732d37aF49B09871c35',
        '0x1D9CE4f79d7ccFD9cf08Eb747c610C6c045d1B94',
        '0xb0059F146C41178960684b1F74d8e6c3e1E204b8'
      ]
    };
    
    console.log('Setup complete!');
    console.log('\nROLE ASSIGNMENTS:');
    console.log(`Admin: ${addressMap.admin}`);
    console.log(`Event Organizers: ${addressMap.organizers.join(', ')}`);
    console.log(`Canteen Staff: ${addressMap.canteenStaff.join(', ')}`);
    console.log(`Students: ${addressMap.students.join(', ')}`);
    
    console.log('\nTOKEN BALANCES:');
    console.log(`Admin: 1000 CPC`);
    console.log(`Each Organizer: 200 CPC`);
    console.log(`Canteen Staff and Students: 0 CPC (initially)`);
    
    // Create a config file for reference
    const config = {
      contractAddress,
      roles: addressMap,
      balances: {
        admin: "1000 CPC",
        organizers: "200 CPC each",
        canteenStaff: "0 CPC",
        students: "0 CPC"
      }
    };
    
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    console.log('\nConfig saved to config.json');
    
    // Get actual role assignments from the contract
    console.log('Retrieving role information from contract...');
    const roleMap = await getContractInfo(web3, contractAddress);
    
    console.log('ACTUAL ROLE ASSIGNMENTS (from contract):');
    console.log(`Admin: ${roleMap.admin[0] || 'None'}`);
    console.log(`Event Organizers: ${roleMap.organizers.join(', ') || 'None'}`);
    console.log(`Canteen Staff: ${roleMap.canteenStaff.join(', ') || 'None'}`);
    console.log(`Students: ${roleMap.students.join(', ') || 'None'}`);
    
    // Create a config file based on actual contract state
    const actualConfig = {
        contractAddress,
        roles: roleMap,
        balances: {
            admin: "1000 CPC",
            organizers: "200 CPC each",
            canteenStaff: "0 CPC",
            students: "0 CPC"
        }
    };
    
    fs.writeFileSync('./config.json', JSON.stringify(actualConfig, null, 2));
    console.log('\nActual contract roles saved to config.json');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

setup();
