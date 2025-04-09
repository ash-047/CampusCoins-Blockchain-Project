const CampusCoin = artifacts.require("CampusCoin");

module.exports = async function(callback) {
  try {
    const campusCoin = await CampusCoin.deployed();
    const accounts = await web3.eth.getAccounts();
    
    console.log("\n=== CampusCoin Role Verification ===\n");
    
    // Check admin
    const admin = await campusCoin.admin();
    console.log(`Admin address: ${admin}`);
    console.log(`Is accounts[0] admin? ${admin.toLowerCase() === accounts[0].toLowerCase()}`);
    
    // Check organizers
    for (let i = 0; i < accounts.length; i++) {
      const isOrganizer = await campusCoin.isOrganizer(accounts[i]);
      if (isOrganizer) {
        console.log(`Account ${i} (${accounts[i]}) is an organizer`);
      }
    }
    
    // Check canteen staff
    for (let i = 0; i < accounts.length; i++) {
      const isCanteen = await campusCoin.isCanteenStaff(accounts[i]);
      if (isCanteen) {
        console.log(`Account ${i} (${accounts[i]}) is canteen staff`);
      }
    }
    
    // Check balances
    console.log("\n=== Token Balances ===\n");
    for (let i = 0; i < accounts.length; i++) {
      const balance = await campusCoin.balanceOf(accounts[i]);
      console.log(`Account ${i} (${accounts[i]}): ${balance.toString()} CC`);
    }
    
    console.log("\nVerification completed successfully!");
    callback();
  } catch (error) {
    console.error("Verification failed:", error);
    callback(error);
  }
};
