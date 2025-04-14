const CampusCoin = artifacts.require("CampusCoin");

module.exports = async function(callback) {
  try {
    const campusCoin = await CampusCoin.deployed();
    const accounts = await web3.eth.getAccounts();
    
    console.log("\n=== Setting up CampusCoin Roles ===\n");
    
    // Get admin - always the first account
    const admin = accounts[0];
    console.log(`Admin: ${admin}`);
    
    // Set organizers (accounts 1 and 2)
    console.log("Setting organizers...");
    if (accounts.length > 1) {
      await campusCoin.setOrganizer(accounts[1], true, {from: admin});
      console.log(`Set ${accounts[1]} as organizer 1`);
    }
    
    if (accounts.length > 2) {
      await campusCoin.setOrganizer(accounts[2], true, {from: admin});
      console.log(`Set ${accounts[2]} as organizer 2`);
    }
    
    // Set canteen staff (accounts 3 and 4)
    console.log("\nSetting canteen staff...");
    if (accounts.length > 3) {
      await campusCoin.setCanteenStaff(accounts[3], true, {from: admin});
      console.log(`Set ${accounts[3]} as canteen staff 1`);
    }
    
    if (accounts.length > 4) {
      await campusCoin.setCanteenStaff(accounts[4], true, {from: admin});
      console.log(`Set ${accounts[4]} as canteen staff 2`);
    }
    
    // Verify all roles are set correctly
    console.log("\nVerifying roles...");
    
    if (accounts.length > 1) {
      const isOrg1 = await campusCoin.isOrganizer(accounts[1]);
      console.log(`Account 1 (${accounts[1]}) is organizer: ${isOrg1}`);
    }
    
    if (accounts.length > 2) {
      const isOrg2 = await campusCoin.isOrganizer(accounts[2]);
      console.log(`Account 2 (${accounts[2]}) is organizer: ${isOrg2}`);
    }
    
    if (accounts.length > 3) {
      const isCant1 = await campusCoin.isCanteenStaff(accounts[3]);
      console.log(`Account 3 (${accounts[3]}) is canteen: ${isCant1}`);
    }
    
    if (accounts.length > 4) {
      const isCant2 = await campusCoin.isCanteenStaff(accounts[4]);
      console.log(`Account 4 (${accounts[4]}) is canteen: ${isCant2}`);
    }
    
    // Log student account range
    if (accounts.length > 5) {
      console.log(`\nStudent accounts: ${accounts.length - 5} accounts available`);
      console.log(`Student accounts start at index 5 (${accounts[5]}) with SRN PES2UG22CS001`);
      
      const lastIndex = accounts.length - 1;
      const lastStudentNumber = lastIndex - 4;
      console.log(`Last student account is at index ${lastIndex} (${accounts[lastIndex]}) with SRN PES2UG22CS${lastStudentNumber.toString().padStart(3, '0')}`);
    } else {
      console.log("\nNo accounts available for students");
    }
    
    console.log("\nRole setup completed successfully!");
    callback();
  } catch (error) {
    console.error("Role setup failed:", error);
    callback(error);
  }
};
