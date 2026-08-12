const { ethers } = require('hardhat');

async function main() {
  const CONTRACT_ADDRESS = '0x99E5d76dEb15731c51695FB33A0bd9c554400705';
  const TOKEN_ID = '99726030914145444867035086124957362378533675094698';

  console.log('🔍 Checking Claimed Token Details...');
  console.log('='.repeat(60));

  // Connect to contract
  const HoraeMPT = await ethers.getContractFactory('HoraeMPT');
  const contract = HoraeMPT.attach(CONTRACT_ADDRESS);

  try {
    // Get product info
    console.log('\n📋 Product Info:');
    const productInfo = await contract.productInfo(TOKEN_ID);
    console.log(`  - Token ID: ${productInfo.tokenId.toString()}`);
    console.log(`  - Claim Date: ${productInfo.claimDate.toString()}`);
    console.log(`  - Is Stolen: ${productInfo.isStolen}`);
    
    // Convert claim date to readable format
    if (productInfo.claimDate.toString() !== '0') {
      const claimDate = new Date(Number(productInfo.claimDate) * 1000);
      console.log(`  - Claim Date (readable): ${claimDate.toISOString()}`);
    } else {
      console.log(`  - Claim Date: Not claimed yet`);
    }

    // Get manufacturer info
    console.log('\n🏭 Manufacturer Info:');
    const manufacturerInfo = await contract.manufacturerInfo(productInfo.manufacturer);
    console.log(`  - Vault Address: ${manufacturerInfo.vaultAddress}`);
    console.log(`  - Withdrawal Date: ${manufacturerInfo.withdrawal_date.toString()}`);
    console.log(`  - Fee: ${manufacturerInfo.fee.toString()}`);
    console.log(`  - Delegated Transfer: ${manufacturerInfo.delegatedTransfer}`);

    // Check current timestamp
    console.log('\n⏰ Current Status:');
    const currentBlock = await ethers.provider.getBlock('latest');
    const currentTimestamp = currentBlock.timestamp;
    console.log(`  - Current Timestamp: ${currentTimestamp}`);
    console.log(`  - Current Time: ${new Date(currentTimestamp * 1000).toISOString()}`);

    // Check if token is expired for retraction
    if (productInfo.claimDate.toString() !== '0') {
      const expirationTime = Number(productInfo.claimDate) + Number(manufacturerInfo.withdrawal_date);
      const isExpired = currentTimestamp >= expirationTime;
      console.log(`  - Expiration Time: ${expirationTime}`);
      console.log(`  - Expiration Date: ${new Date(expirationTime * 1000).toISOString()}`);
      console.log(`  - Is Expired for Retraction: ${isExpired}`);
    }

    // Check token owner
    console.log('\n👤 Token Owner:');
    const owner = await contract.ownerOf(TOKEN_ID);
    console.log(`  - Current Owner: ${owner}`);

    // Check if owner is vault
    const isOwnerVault = owner.toLowerCase() === manufacturerInfo.vaultAddress.toLowerCase();
    console.log(`  - Is Owner Vault: ${isOwnerVault}`);

    // Check if token is claimed (has claim date)
    const isClaimed = productInfo.claimDate.toString() !== '0';
    console.log(`  - Is Token Claimed: ${isClaimed}`);

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
