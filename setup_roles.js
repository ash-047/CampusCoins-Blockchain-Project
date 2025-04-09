const CampusCoin = artifacts.require("CampusCoin");

module.exports = async function(callback) {
  try {
    const campusCoin = await CampusCoin.deployed();
    const accounts = await web3.eth.getAccounts();
    
    console.log("\n=== Setting up CampusCoin Roles ===\n");
    
    // Get admin
    const admin = accounts[0];
    console.log(`Admin: ${admin}`);
    
    // Set organizers (accounts 1 and 2)
    console.log("Setting organizers...");
    await campusCoin.setOrganizer(accounts[1], true, {from: admin});
    await campusCoin.setOrganizer(accounts[2], true, {from: admin});
    console.log(`Set ${accounts[1]} as organizer`);
    console.log(`Set ${accounts[2]} as organizer`);
    
    // Set canteen staff (accounts 3 and 4)
    console.log("\nSetting canteen staff...");
    await campusCoin.setCanteenStaff(accounts[3], true, {from: admin});
    await campusCoin.setCanteenStaff(accounts[4], true, {from: admin});
    console.log(`Set ${accounts[3]} as canteen staff`);
    console.log(`Set ${accounts[4]} as canteen staff`);
    
    // Verify all roles are set correctly
    console.log("\nVerifying roles...");
    const isOrg1 = await campusCoin.isOrganizer(accounts[1]);
    const isOrg2 = await campusCoin.isOrganizer(accounts[2]);
    const isCant1 = await campusCoin.isCanteenStaff(accounts[3]);
    const isCant2 = await campusCoin.isCanteenStaff(accounts[4]);
    
    console.log(`Account 1 is organizer: ${isOrg1}`);
    console.log(`Account 2 is organizer: ${isOrg2}`);
    console.log(`Account 3 is canteen: ${isCant1}`);
    console.log(`Account 4 is canteen: ${isCant2}`);
    
    console.log("\nRole setup completed successfully!");
    callback();
  } catch (error) {
    console.error("Role setup failed:", error);
    callback(error);
  }
};
