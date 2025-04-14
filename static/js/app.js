let web3;
let campusCoinContract;
let userAccount;
let userRole;
let allAccounts = []; // Will store account data from the backend

// Get contract address from window.CONTRACT_ADDRESS which will be set by the template
const CONTRACT_ADDRESS = window.CONTRACT_ADDRESS;

// Helper function to decode transaction errors
async function decodeTransactionError(error) {
    console.log('Error details:', error);
    
    // Extract detailed error from Metamask/Web3 error object
    let errorMessage = 'Transaction failed';
    
    // Check for common patterns in error objects
    if (error.message) {
        errorMessage = error.message;
        
        // Try to extract revert reason if it exists
        if (error.message.includes('revert')) {
            const revertMatch = error.message.match(/reverted with reason string '(.+?)'/);
            if (revertMatch && revertMatch[1]) {
                errorMessage = revertMatch[1];
            }
        }
        
        // Clean up common verbose prefixes
        errorMessage = errorMessage
            .replace('Error: Returned error: execution reverted: ', '')
            .replace('Error: Returned error: ', '')
            .replace('Internal JSON-RPC error.', 'Transaction error - Please check your Metamask wallet')
            .split('\n')[0]; // Take only first line of error
    }
    
    // Log detailed error information for debugging
    console.error('Transaction error details:', {
        originalError: error,
        parsedMessage: errorMessage,
        timestamp: new Date().toISOString()
    });
    
    return errorMessage;
}

// Test gas estimation before sending transaction
async function estimateGasAndReport(contract, method, params, from) {
    try {
        console.log(`Estimating gas for ${method} with params:`, params);
        const gasEstimate = await contract.methods[method](...params).estimateGas({ from });
        console.log(`Gas estimate for ${method}: ${gasEstimate}`);
        return gasEstimate;
    } catch (error) {
        console.error(`Gas estimation failed for ${method}:`, error);
        throw new Error(`Transaction would fail: ${await decodeTransactionError(error)}`);
    }
}

// Enhanced transaction sender
async function sendEnhancedTransaction(contract, methodName, params, fromAddress) {
    try {
        // First estimate gas to see if the transaction would succeed
        const gasEstimate = await estimateGasAndReport(contract, methodName, params, fromAddress);
        
        // Add 20% buffer to gas estimate
        const gasLimit = Math.floor(gasEstimate * 1.2);
        
        console.log(`Sending ${methodName} transaction with gas limit: ${gasLimit}`);
        
        // Send the transaction with our calculated gas limit
        const tx = await contract.methods[methodName](...params).send({
            from: fromAddress,
            gas: gasLimit
        });
        
        console.log(`${methodName} transaction successful:`, tx);
        return {
            success: true,
            tx: tx,
            message: `${methodName} successful`
        };
    } catch (error) {
        const errorMessage = await decodeTransactionError(error);
        return {
            success: false,
            error: error,
            message: errorMessage
        };
    }
}

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
            // Set role in session
            await setRoleInSession(userAccount, userRole);
            return;
        }
        
        // Check if organizer
        const isOrganizer = await campusCoinContract.methods.isOrganizer(userAccount).call();
        if (isOrganizer) {
            userRole = 'organizer';
            console.log("Role verified from blockchain: organizer");
            // Set role in session
            await setRoleInSession(userAccount, userRole);
            return;
        }
        
        // Check if canteen staff
        const isCanteen = await campusCoinContract.methods.isCanteenStaff(userAccount).call();
        if (isCanteen) {
            userRole = 'canteen';
            console.log("Role verified from blockchain: canteen");
            // Set role in session
            await setRoleInSession(userAccount, userRole);
            return;
        }
        
        // Default to student
        userRole = 'student';
        console.log("Role verified from blockchain: student (default)");
        // Set role in session
        await setRoleInSession(userAccount, userRole);
    } catch (error) {
        console.error("Error verifying role from blockchain:", error);
        // We'll still default to student role
        userRole = 'student';
        await setRoleInSession(userAccount, userRole);
    }
}

// Function to set the user's role in the Flask session
async function setRoleInSession(address, role) {
    try {
        const response = await fetch('/set-role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                address: address,
                role: role
            })
        });
        
        const data = await response.json();
        if (!data.success) {
            console.error('Failed to set role in session:', data.error);
        }
    } catch (error) {
        console.error('Error setting role in session:', error);
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
        
        // Hide status after 10 seconds
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

// Fetch all account data from backend
async function fetchAccountsFromBackend() {
    try {
        showTransactionStatus('Loading accounts...');
        const response = await fetch('/accounts');
        const data = await response.json();
        
        if (data.error) {
            console.error('Error fetching accounts:', data.error);
            showTransactionStatus('Error loading accounts: ' + data.error, true);
            return [];
        }
        
        console.log('Accounts loaded:', data.accounts.length);
        showTransactionStatus(`Successfully loaded ${data.accounts.length} accounts`);
        return data.accounts;
    } catch (error) {
        console.error('Error fetching accounts:', error);
        showTransactionStatus('Error loading accounts: ' + error.message, true);
        return [];
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
    
    try {
        // Get accounts from backend API if not already loaded
        if (allAccounts.length === 0) {
            allAccounts = await fetchAccountsFromBackend();
        }
        
        // Add accounts based on role filter
        for (const account of allAccounts) {
            // Add to dropdown if role matches filter or no filter is applied
            if (role === null || account.role === role) {
                const option = document.createElement('option');
                option.text = account.displayName;
                option.value = account.address;
                selectElement.add(option);
            }
        }
    } catch (error) {
        console.error("Error loading accounts:", error);
        showTransactionStatus('Failed to load accounts: ' + error.message, true);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                // Clear session
                const response = await fetch('/logout');
                if (!response.ok) {
                    throw new Error('Logout failed');
                }
                
                // Clear local storage for this account if it exists
                if (userAccount) {
                    localStorage.removeItem(`activities_${userAccount}`);
                }
                
                // Reset MetaMask connection by reloading the page
                window.location.href = '/';
            } catch (error) {
                console.error('Logout error:', error);
                showTransactionStatus('Failed to logout', true);
            }
        });
    }
    
    const isConnected = await checkWalletConnection();
    if (isConnected) {
        const walletAddressElement = document.getElementById('walletAddress');
        if (walletAddressElement) {
            walletAddressElement.innerText = userAccount;
        }
        
        const connectWalletBtn = document.getElementById('connectWallet');
        const walletInfoElement = document.getElementById('walletInfo');
        
        if (connectWalletBtn) {
            connectWalletBtn.style.display = 'none';
        }
        
        if (walletInfoElement) {
            walletInfoElement.style.display = 'block';
        }
        
        // Update balance if on a dashboard page
        updateBalance();
    }
});
