const CampusCoin = artifacts.require("CampusCoin");

module.exports = async function(callback) {
  try {
    const campusCoin = await CampusCoin.deployed();
    const accounts = await web3.eth.getAccounts();
    const accountData = {
      accounts: []
    };
    for (let i = 0; i < accounts.length; i++) {
      const address = accounts[i];
      let role = 'student';
      let displayName = '';
      if (i === 0) {
        role = 'admin';
        displayName = `Admin`;
      } else if (i === 1) {
        role = 'organizer';
        displayName = `Organizer 1`;
      } else if (i === 2) {
        role = 'organizer';
        displayName = `Organizer 2`;
      } else if (i === 3) {
        role = 'canteen';
        displayName = `Canteen Staff 1`;
      } else if (i === 4) {
        role = 'canteen';
        displayName = `Canteen Staff 2`;
      } else {
        const studentNumber = i - 4;
        const paddedNumber = studentNumber.toString().padStart(3, '0');
        displayName = `PES2UG22CS${paddedNumber}`;
        role = 'student';
      }
      if (i === 0) {
        const adminAddress = await campusCoin.admin.call();
        if (address.toLowerCase() !== adminAddress.toLowerCase()) {
          console.log(`Warning: Account ${i} expected to be admin but doesn't match contract admin`);
        }
      } else if (i === 1 || i === 2) {
        const isOrganizer = await campusCoin.isOrganizer(address);
        if (!isOrganizer) {
          console.log(`Warning: Account ${i} expected to be organizer but is not set as organizer in contract`);
        }
      } else if (i === 3 || i === 4) {
        const isCanteen = await campusCoin.isCanteenStaff(address);
        if (!isCanteen) {
          console.log(`Warning: Account ${i} expected to be canteen staff but is not set as canteen in contract`);
        }
      }
      accountData.accounts.push({
        address: address,
        index: i,
        role: role,
        displayName: displayName
      });
    }
    console.log(JSON.stringify(accountData));
    callback();
  } catch (error) {
    console.error("Error getting accounts:", error);
    callback(error);
  }
};