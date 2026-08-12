import { ethers } from 'hardhat';
import { readFileSync } from 'fs';

async function main() {
  // Read contract address from deploy.json
  const deployData = readFileSync('deploy.json', 'utf8');
  const deployInfo = JSON.parse(deployData);
  const CONTRACT_ADDRESS = deployInfo.HoraeProxy;

  console.log(`Attaching to HoraeMPT contract at: ${CONTRACT_ADDRESS}`);
  const HoraeMPT = await ethers.getContractFactory('HoraeMPT');
  const contract = HoraeMPT.attach(CONTRACT_ADDRESS);

  // Get signer (current account)
  const [signer] = await ethers.getSigners();
  console.log(`Testing with account: ${signer.address}`);

  // Check if current account is system admin
  try {
    const isSystemAdmin = await contract.systemAdmins(signer.address);
    console.log(`Is system admin: ${isSystemAdmin}`);
  } catch (error) {
    console.log('Error checking system admin status:', error.message);
  }

  // Check owner
  try {
    const owner = await contract.owner();
    console.log(`Contract owner: ${owner}`);
    console.log(`Is current account owner: ${owner.toLowerCase() === signer.address.toLowerCase()}`);
  } catch (error) {
    console.log('Error checking owner:', error.message);
  }

  // Test getting manufacturer admin level for a sample manufacturer
  try {
    const sampleManufacturer = ethers.encodeBytes32String("SAMPLE_MANUFACTURER");
    const adminLevel = await contract.manufacturerAdmins(sampleManufacturer, signer.address);
    console.log(`Admin level for sample manufacturer: ${adminLevel}`);
  } catch (error) {
    console.log('Error checking manufacturer admin level:', error.message);
  }

  console.log('\n=== setStolenStatus Function Analysis ===');
  console.log('This function requires one of the following roles:');
  console.log('1. Product Owner (NFT owner)');
  console.log('2. Manufacturer Administrator (level >= 1)');
  console.log('3. System Administrator');
  console.log('==========================================');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
