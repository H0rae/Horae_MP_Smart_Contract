const { ethers } = require('hardhat');

async function main() {
  const CONTRACT_ADDRESS = '0x99E5d76dEb15731c51695FB33A0bd9c554400705';
  const TOKEN_ID = '99726030914145444867035086124957362378533675094698';

  console.log('🏭 Checking Manufacturer Registration...');
  console.log('='.repeat(60));

  // Connect to contract
  const HoraeMPT = await ethers.getContractFactory('HoraeMPT');
  const contract = HoraeMPT.attach(CONTRACT_ADDRESS);

  try {
    // Get product info to find manufacturer
    console.log('\n📋 Getting Product Info:');
    const productInfo = await contract.productInfo(TOKEN_ID);
    const manufacturerBytes = productInfo.manufacturer;
    console.log(`Manufacturer bytes: ${manufacturerBytes}`);
    
    // Try to decode manufacturer name
    try {
      const manufacturerName = ethers.decodeBytes32String(manufacturerBytes);
      console.log(`Manufacturer name: ${manufacturerName}`);
    } catch (error) {
      console.log(`❌ Cannot decode manufacturer name: ${error.message}`);
    }

    // Check manufacturer info
    console.log('\n🏭 Checking Manufacturer Info:');
    const manufacturerInfo = await contract.manufacturerInfo(manufacturerBytes);
    console.log('Manufacturer Info:');
    console.log(`  - Vault Address: ${manufacturerInfo.vaultAddress}`);
    console.log(`  - Withdrawal Date: ${manufacturerInfo.withdrawal_date.toString()}`);
    console.log(`  - Fee: ${manufacturerInfo.fee.toString()}`);
    console.log(`  - Delegated Transfer: ${manufacturerInfo.delegatedTransfer}`);

    // Check if manufacturer is registered
    console.log('\n✅ Checking Manufacturer Registration:');
    const isRegistered = await contract.isManufacturerRegistered(manufacturerBytes);
    console.log(`Is manufacturer registered: ${isRegistered}`);

    // Check manufacturer admins
    console.log('\n👥 Checking Manufacturer Admins:');
    try {
      const adminLevel = await contract.administrators(manufacturerBytes, "0x2ba190287a390cfa282e4b9ae57f758f28ba96d5");
      console.log(`Relayer admin level: ${adminLevel.toString()}`);
    } catch (error) {
      console.log(`❌ Error checking admin level: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Check completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
