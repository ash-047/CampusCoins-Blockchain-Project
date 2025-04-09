let web3;
let campusCoinContract;
let userAccount;
let userRole;

// Role mappings from Ganache accounts
const ROLE_MAPPINGS = {
    '0x10787572daaE58789b74b131c48EF4e93E00dA06': 'admin',
    '0x4977451329D69861613A220837b2f1C61F31C531': 'organizer',
    '0xFCEe892f01345D3364a86c79Ac2C1CD7c53da0Cd': 'organizer',
    '0x9c86495CF5d83Af41a376E1865dac9F3E127a688': 'canteen',
    '0xCa5D12aE19785C30a4Dc90aD26B96DC00e2053eB': 'canteen',
    '0x839B74A47a63e4cDdfB02a52EcD98c4aB23183fe': 'student',
    '0xC9ecEf5042F913c65AA0Fcd81E0D6202f90DE2f7': 'student',
    '0xFe9b60BE72C7666901303732d37aF49B09871c35': 'student',
    '0x1D9CE4f79d7ccFD9cf08Eb747c610C6c045d1B94': 'student',
    '0xb0059F146C41178960684b1F74d8e6c3e1E204b8': 'student',
};

// Contract address - to be updated after deployment
const CONTRACT_ADDRESS = '0x76bD69B1594161b92006BA0ad6b6901006f70772';

async function connectWallet() {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            
            document.getElementById('walletAddress').innerText = userAccount;
            document.getElementById('connectWallet').style.display = 'none';
            document.getElementById('walletInfo').style.display = 'block';
            
            // Get contract ABI and instantiate contract
            const response = await fetch('/contract-abi');
            const abi = await response.json();
            campusCoinContract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
            
            // Verify roles from the blockchain
            await verifyRoleFromBlockchain();
            
            // Redirect to role-specific dashboard
            window.location.href = `/${userRole}`;
            
        } catch (error) {
            console.error("Connection error:", error);
            alert("Could not connect to MetaMask. Please make sure it is installed and unlocked.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function verifyRoleFromBlockchain() {
    try {
        // Check if admin
        const adminAddress = await campusCoinContract.methods.admin().call();
        if (userAccount.toLowerCase() === adminAddress.toLowerCase()) {
            userRole = 'admin';
            console.log("Role verified from blockchain: admin");
            return;
        }
        
        // Check if organizer
        const isOrganizer = await campusCoinContract.methods.isOrganizer(userAccount).call();
        if (isOrganizer) {
            userRole = 'organizer';
            console.log("Role verified from blockchain: organizer");
            return;
        }
        
        // Check if canteen staff
        const isCanteen = await campusCoinContract.methods.isCanteenStaff(userAccount).call();
        if (isCanteen) {
            userRole = 'canteen';
            console.log("Role verified from blockchain: canteen");
            return;
        }
        
        // Default to student
        userRole = 'student';
        console.log("Role verified from blockchain: student (default)");
    } catch (error) {
        console.error("Error verifying role from blockchain:", error);
        // Fallback to role mappings if blockchain verification fails
        const formattedAccount = userAccount.toLowerCase();
        for (const [address, role] of Object.entries(ROLE_MAPPINGS)) {
            if (address.toLowerCase() === formattedAccount) {
                userRole = role;
                console.log("Role determined from mappings:", userRole);
                return;
            }
        }
        userRole = 'student';
    }
}

async function checkWalletConnection() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                userAccount = accounts[0];
                
                // Get contract ABI and instantiate contract
                const response = await fetch('/contract-abi');
                const abi = await response.json();
                campusCoinContract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
                
                // Verify roles from the blockchain
                await verifyRoleFromBlockchain();
                
                return true;
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error);
        }
    }
    return false;
}

async function getBalance(address) {
    try {
        const balance = await campusCoinContract.methods.balanceOf(address).call();
        return balance;
    } catch (error) {
        console.error("Error getting balance:", error);
        return 0;
    }
}

// Function to update displayed balance
async function updateBalance() {
    if (!userAccount || !campusCoinContract) return;
    
    try {
        const balance = await getBalance(userAccount);
        if (document.getElementById('balance')) {
            document.getElementById('balance').innerText = balance;
        }
        console.log(`Balance updated: ${balance} CC for ${userAccount}`);
    } catch (error) {
        console.error("Error updating balance:", error);
    }
}

// Function to display transaction status
function showTransactionStatus(message, isError = false) {
    const statusElement = document.getElementById('transactionStatus');
    if (statusElement) {
        statusElement.innerText = message;
        statusElement.className = isError ? 'transaction-status error' : 'transaction-status success';
        statusElement.style.display = 'block';
        
        // Hide status after 10 seconds instead of 5
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 10000);
    }
    
    // Also log to console for debugging
    if (isError) {
        console.error(message);
    } else {
        console.log(message);
    }
}

// Load accounts for dropdowns
async function loadAccounts(selectElementId, role = null) {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;
    
    // Clear existing options
    selectElement.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.text = "Select an account";
    defaultOption.value = "";
    selectElement.add(defaultOption);
    
    // Add accounts based on role filter
    Object.entries(ROLE_MAPPINGS).forEach(([address, accountRole]) => {
        if (role === null || accountRole === role) {
            const option = document.createElement('option');
            option.text = `${address} (${accountRole})`;
            option.value = address;
            selectElement.add(option);
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }
    
    const isConnected = await checkWalletConnection();
    if (isConnected) {
        if (document.getElementById('walletAddress')) {
            document.getElementById('walletAddress').innerText = userAccount;
            document.getElementById('connectWallet').style.display = 'none';
            document.getElementById('walletInfo').style.display = 'block';
        }
        
        // Update balance if on a dashboard page
        updateBalance();
    }
});
