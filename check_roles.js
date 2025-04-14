const CampusCoin = artifacts.require("CampusCoin");

module.exports = async function(callback) {
  try {
    const campusCoin = await CampusCoin.deployed();
    const accounts = await web3.eth.getAccounts();
    console.log("\n=== CampusCoin Role Verification ===\n");
    const admin = await campusCoin.admin();
    console.log(`Admin address: ${admin}`);
    console.log(`Is accounts[0] admin? ${admin.toLowerCase() === accounts[0].toLowerCase()}`);
    console.log("\nOrganizers:");
    for (let i = 0; i < accounts.length; i++) {
      const isOrganizer = await campusCoin.isOrganizer(accounts[i]);
      if (isOrganizer) {
        const expectedRole = (i === 1 || i === 2) ? "Expected" : "UNEXPECTED";
        console.log(`Account ${i} (${accounts[i]}) is an organizer - ${expectedRole}`);
      }
    }
    console.log("\nCanteen Staff:");
    for (let i = 0; i < accounts.length; i++) {
      const isCanteen = await campusCoin.isCanteenStaff(accounts[i]);
      if (isCanteen) {
        const expectedRole = (i === 3 || i === 4) ? "Expected" : "UNEXPECTED";
        console.log(`Account ${i} (${accounts[i]}) is canteen staff - ${expectedRole}`);
      }
    }
    console.log("\n=== Token Balances ===\n");
    for (let i = 0; i < accounts.length; i++) {
      const balance = await campusCoin.balanceOf(accounts[i]);
      let roleLabel;
      if (i === 0) roleLabel = "Admin";
      else if (i === 1) roleLabel = "Organizer 1";
      else if (i === 2) roleLabel = "Organizer 2";
      else if (i === 3) roleLabel = "Canteen Staff 1";
      else if (i === 4) roleLabel = "Canteen Staff 2";
      else {
        const studentNumber = i - 4;
        const srn = `PES2UG22CS${studentNumber.toString().padStart(3, '0')}`;
        roleLabel = `Student ${srn}`;
      }
      console.log(`Account ${i} (${roleLabel}) - ${accounts[i]}: ${balance.toString()} CC`);
    }
    console.log("\nVerification completed successfully!");
    callback();
  } catch (error) {
    console.error("Verification failed:", error);
    callback(error);
  }
};
