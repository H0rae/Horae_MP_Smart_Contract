const { ethers } = require('hardhat');

async function main() {
  const CONTRACT_ADDRESS = '0x99E5d76dEb15731c51695FB33A0bd9c554400705';
  const TOKEN_ID = '99726030914145444867035086124957362378533675094698';
  const FROM_ADDRESS = '0x250e1230F2a7cF7140BeBBf88299D14538c5E380';
  const TO_ADDRESS = '0x6B4E4F2B29f784eED3Ad12ad737eF32a134a5336';

  console.log('🔍 Debugging Transfer Issue...');
  console.log('='.repeat(60));

  // Connect to contract
  const HoraeMPT = await ethers.getContractFactory('HoraeMPT');
  const contract = HoraeMPT.attach(CONTRACT_ADDRESS);

  try {
    // Check if token exists
    console.log('\n🔍 Checking Token Existence:');
    const owner = await contract.ownerOf(TOKEN_ID);
    console.log(`✅ Token ${TOKEN_ID} exists, owner: ${owner}`);

    // Check product info
    console.log('\n📋 Checking Product Info:');
    try {
      const productInfo = await contract.productInfo(TOKEN_ID);
      console.log('Product Info:');
      console.log(`  - Token ID: ${productInfo.tokenId.toString()}`);
      console.log(`  - Hash ID: ${productInfo.hashID}`);
      console.log(`  - Manufacturer: ${ethers.decodeBytes32String(productInfo.manufacturer)}`);
      console.log(`  - Category: ${ethers.decodeBytes32String(productInfo.category)}`);
      console.log(`  - Model: ${ethers.decodeBytes32String(productInfo.model)}`);
      console.log(`  - Collection: ${ethers.decodeBytes32String(productInfo.collection)}`);
      console.log(`  - Product Reference: ${ethers.decodeBytes32String(productInfo.productReference)}`);
      console.log(`  - Production Date: ${ethers.decodeBytes32String(productInfo.productionDate)}`);
      console.log(`  - Claim Date: ${productInfo.claimDate.toString()}`);
      console.log(`  - Maintenance Counter: ${productInfo.maintenanceCounter.toString()}`);
      console.log(`  - Is Stolen: ${productInfo.isStolen}`);
    } catch (error) {
      console.log(`❌ Error getting product info: ${error.message}`);
    }

    // Check manufacturer info
    console.log('\n🏭 Checking Manufacturer Info:');
    try {
      const manufacturerBytes = ethers.encodeBytes32String("HORAE"); // Assuming manufacturer is HORAE
      const manufacturerInfo = await contract.manufacturerInfo(manufacturerBytes);
      console.log('Manufacturer Info:');
      console.log(`  - Vault Address: ${manufacturerInfo.vaultAddress}`);
      console.log(`  - Withdrawal Date: ${manufacturerInfo.withdrawal_date.toString()}`);
      console.log(`  - Fee: ${manufacturerInfo.fee.toString()}`);
      console.log(`  - Delegated Transfer: ${manufacturerInfo.delegatedTransfer}`);
    } catch (error) {
      console.log(`❌ Error getting manufacturer info: ${error.message}`);
    }

    // Try to simulate the transfer call
    console.log('\n🧪 Simulating Transfer Call:');
    try {
      // Check if we can call transferFrom directly
      const relayerAddress = '0x2ba190287a390cfa282e4b9ae57f758f28ba96d5';
      const isSystemAdmin = await contract.systemAdmins(relayerAddress);
      console.log(`Relayer is system admin: ${isSystemAdmin}`);
      
      if (isSystemAdmin) {
        console.log('✅ Relayer is system admin, should be able to transfer');
      } else {
        console.log('❌ Relayer is not system admin');
      }
    } catch (error) {
      console.log(`❌ Error checking system admin: ${error.message}`);
    }

    // Check if contract is paused
    console.log('\n⏸️ Checking Contract Status:');
    try {
      const isPaused = await contract.paused();
      console.log(`Contract is paused: ${isPaused}`);
    } catch (error) {
      console.log(`❌ Error checking pause status: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ General error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Debug completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
