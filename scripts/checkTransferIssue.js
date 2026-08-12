const { ethers } = require('hardhat');

async function main() {
  const CONTRACT_ADDRESS = '0x99E5d76dEb15731c51695FB33A0bd9c554400705';
  const RELAYER_ADDRESS = '0x2ba190287a390cfa282e4b9ae57f758f28ba96d5';
  const TOKEN_ID = '99726030914145444867035086124957362378533675094698';
  const FROM_ADDRESS = '0x250e1230F2a7cF7140BeBBf88299D14538c5E380';
  const TO_ADDRESS = '0x6B4E4F2B29f784eED3Ad12ad737eF32a134a5336';

  console.log('🔍 Checking Transfer Issue...');
  console.log('='.repeat(60));

  // Connect to contract
  const HoraeMPT = await ethers.getContractFactory('HoraeMPT');
  const contract = HoraeMPT.attach(CONTRACT_ADDRESS);

  // Check relayer balance
  console.log('\n💰 Checking Relayer Balance:');
  const relayerBalance = await ethers.provider.getBalance(RELAYER_ADDRESS);
  console.log(`Relayer ${RELAYER_ADDRESS} balance: ${ethers.formatEther(relayerBalance)} ETH`);

  // Check if relayer is system admin
  console.log('\n👑 Checking System Admin Status:');
  const isSystemAdmin = await contract.systemAdmins(RELAYER_ADDRESS);
  console.log(`Is relayer system admin: ${isSystemAdmin}`);

  // Check token ownership
  console.log('\n🔑 Checking Token Ownership:');
  try {
    const owner = await contract.ownerOf(TOKEN_ID);
    console.log(`Token ${TOKEN_ID} owner: ${owner}`);
    console.log(`Expected owner: ${FROM_ADDRESS}`);
    console.log(`Ownership match: ${owner.toLowerCase() === FROM_ADDRESS.toLowerCase()}`);
  } catch (error) {
    console.log(`❌ Error checking ownership: ${error.message}`);
  }

  // Check if token is stolen
  console.log('\n🚨 Checking Stolen Status:');
  try {
    const productInfo = await contract.productInfo(TOKEN_ID);
    console.log(`Token ${TOKEN_ID} is stolen: ${productInfo.isStolen}`);
    console.log(`Manufacturer: ${ethers.decodeBytes32String(productInfo.manufacturer)}`);
  } catch (error) {
    console.log(`❌ Error checking product info: ${error.message}`);
  }

  // Check approval status
  console.log('\n✅ Checking Approval Status:');
  try {
    const isApprovedForAll = await contract.isApprovedForAll(FROM_ADDRESS, RELAYER_ADDRESS);
    const approvedAddress = await contract.getApproved(TOKEN_ID);
    console.log(`Is relayer approved for all: ${isApprovedForAll}`);
    console.log(`Approved address for token: ${approvedAddress}`);
  } catch (error) {
    console.log(`❌ Error checking approval: ${error.message}`);
  }

  // Check if contract is paused
  console.log('\n⏸️ Checking Contract Status:');
  try {
    const isPaused = await contract.paused();
    console.log(`Contract is paused: ${isPaused}`);
  } catch (error) {
    console.log(`❌ Error checking pause status: ${error.message}`);
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
