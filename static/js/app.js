let web3;
let campusCoinContract;
let userAccount;
let userRole;
let allAccounts = []; 

const CONTRACT_ADDRESS = window.CONTRACT_ADDRESS;

async function decodeTransactionError(error) {
    console.log('Error details:', error);
    let errorMessage = 'Transaction failed';
    if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('revert')) {
            const revertMatch = error.message.match(/reverted with reason string '(.+?)'/);
            if (revertMatch && revertMatch[1]) {
                errorMessage = revertMatch[1];
            }
        }
        errorMessage = errorMessage
            .replace('Error: Returned error: execution reverted: ', '')
            .replace('Error: Returned error: ', '')
            .replace('Internal JSON-RPC error.', 'Transaction error - Please check your Metamask wallet')
            .split('\n')[0]; 
    } 
    console.error('Transaction error details:', {
        originalError: error,
        parsedMessage: errorMessage,
        timestamp: new Date().toISOString()
    });
    
    return errorMessage;
}

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

async function sendEnhancedTransaction(contract, methodName, params, fromAddress) {
    try {
        const gasEstimate = await estimateGasAndReport(contract, methodName, params, fromAddress);
        const gasLimit = Math.floor(gasEstimate * 1.2);
        
        console.log(`Sending ${methodName} transaction with gas limit: ${gasLimit}`);
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
            const response = await fetch('/contract-abi');
            const abi = await response.json();
            campusCoinContract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
            await verifyRoleFromBlockchain();
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
        const adminAddress = await campusCoinContract.methods.admin().call();
        if (userAccount.toLowerCase() === adminAddress.toLowerCase()) {
            userRole = 'admin';
            console.log("Role verified from blockchain: admin");
            await setRoleInSession(userAccount, userRole);
            return;
        }
        
        const isOrganizer = await campusCoinContract.methods.isOrganizer(userAccount).call();
        if (isOrganizer) {
            userRole = 'organizer';
            console.log("Role verified from blockchain: organizer");
            await setRoleInSession(userAccount, userRole);
            return;
        }
        const isCanteen = await campusCoinContract.methods.isCanteenStaff(userAccount).call();
        if (isCanteen) {
            userRole = 'canteen';
            console.log("Role verified from blockchain: canteen");
            await setRoleInSession(userAccount, userRole);
            return;
        }
        userRole = 'student';
        console.log("Role verified from blockchain: student (default)");
        await setRoleInSession(userAccount, userRole);
    } catch (error) {
        console.error("Error verifying role from blockchain:", error);
        userRole = 'student';
        await setRoleInSession(userAccount, userRole);
    }
}

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
                const response = await fetch('/contract-abi');
                const abi = await response.json();
                campusCoinContract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
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

function showTransactionStatus(message, isError = false) {
    const statusElement = document.getElementById('transactionStatus');
    if (statusElement) {
        statusElement.innerText = message;
        statusElement.className = isError ? 'transaction-status error' : 'transaction-status success';
        statusElement.style.display = 'block';
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 10000);
    }
    if (isError) {
        console.error(message);
    } else {
        console.log(message);
    }
}

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

async function loadAccounts(selectElementId, role = null) {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;
    selectElement.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.text = "Select an account";
    defaultOption.value = "";
    selectElement.add(defaultOption);
    
    try {
        if (allAccounts.length === 0) {
            allAccounts = await fetchAccountsFromBackend();
        }
        for (const account of allAccounts) {
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
                const response = await fetch('/logout');
                if (!response.ok) {
                    throw new Error('Logout failed');
                }
                if (userAccount) {
                    localStorage.removeItem(`activities_${userAccount}`);
                }
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
        updateBalance();
    }
});
