const CampusCoin = artifacts.require("CampusCoin");

module.exports = function(deployer, network, accounts) {
  // Make sure we're using the right accounts
  const admin = accounts[0]; // Account 0 as admin
  const organizers = [accounts[1], accounts[2]]; // Accounts 1-2 as organizers
  const canteenStaff = [accounts[3], accounts[4]]; // Accounts 3-4 as canteen staff
  // Accounts 5-9 will be students by default
  
  console.log('Deploying CampusCoin with roles:');
  console.log(`Admin (deployer): ${admin}`);
  console.log(`Organizers: ${organizers.join(', ')}`);
  console.log(`Canteen Staff: ${canteenStaff.join(', ')}`);
  
  deployer.deploy(CampusCoin, organizers, canteenStaff, { from: admin });
};
