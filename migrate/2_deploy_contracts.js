const CampusCoin = artifacts.require("CampusCoin");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(CampusCoin);
  const campusCoin = await CampusCoin.deployed();
  console.log("Setting up initial roles...");
  const admin = accounts[0];
  await campusCoin.setOrganizer(accounts[1], true, {from: admin});
  await campusCoin.setOrganizer(accounts[2], true, {from: admin});
  await campusCoin.setCanteenStaff(accounts[3], true, {from: admin});
  await campusCoin.setCanteenStaff(accounts[4], true, {from: admin});
  await campusCoin.mint(admin, 1000, {from: admin});
  console.log("Initial setup completed successfully!");
};
