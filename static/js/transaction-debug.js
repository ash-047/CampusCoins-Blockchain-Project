// This file helps with debugging transaction issues

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
