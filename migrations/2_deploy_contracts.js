const CampusCoin = artifacts.require("CampusCoin");

module.exports = async function(deployer, network, accounts) {
  // Deploy the contract
  await deployer.deploy(CampusCoin);
  const campusCoin = await CampusCoin.deployed();
  
  // Set up initial roles
  console.log("Setting up initial roles...");
  
  // Admin is already set in the constructor (account[0])
  const admin = accounts[0];
  
  // Set organizers (accounts 1 and 2)
  await campusCoin.setOrganizer(accounts[1], true, {from: admin});
  await campusCoin.setOrganizer(accounts[2], true, {from: admin});
  
  // Set canteen staff (accounts 3 and 4)
  await campusCoin.setCanteenStaff(accounts[3], true, {from: admin});
  await campusCoin.setCanteenStaff(accounts[4], true, {from: admin});
  
  // Mint initial tokens to admin
  await campusCoin.mint(admin, 1000, {from: admin});
  
  console.log("Initial setup completed successfully!");
};
