import { ethers } from 'hardhat';

async function main() {
  const CONTRACT_ADDRESS = '0x99E5d76dEb15731c51695FB33A0bd9c554400705';
  const RELAYER_ADDRESS = '0x2ba190287a390cfa282e4b9ae57f758f28ba96d5'; // Defender relayer address

  console.log(`Attaching to HoraeMPT contract at: ${CONTRACT_ADDRESS}`);
  const HoraeMPT = await ethers.getContractFactory('HoraeMPT');
  const contract = HoraeMPT.attach(CONTRACT_ADDRESS);

  const [owner] = await ethers.getSigners();
  console.log(`Executing with wallet: ${owner.address}`);

  // Check if relayer is already a system admin
  console.log(`Checking if relayer is already a system admin...`);
  const isSystemAdmin = await contract.systemAdmins(RELAYER_ADDRESS);
  console.log(`Relayer ${RELAYER_ADDRESS} is system admin: ${isSystemAdmin}`);

  if (isSystemAdmin) {
    console.log('✅ Relayer is already a system admin. No action needed.');
    return;
  }

  console.log(`Granting System Admin role to relayer: ${RELAYER_ADDRESS}`);

  const tx = await contract.connect(owner).setSystemAdmin(RELAYER_ADDRESS, true);

  console.log('Transaction sent. Waiting for confirmation...');
  console.log('Transaction Hash:', tx.hash);

  await tx.wait();

  console.log('Transaction confirmed!');
  console.log(`✅ Successfully granted System Admin role to relayer ${RELAYER_ADDRESS}.`);
  
  // Verify the change
  const isSystemAdminAfter = await contract.systemAdmins(RELAYER_ADDRESS);
  console.log(`Verification: Relayer ${RELAYER_ADDRESS} is now system admin: ${isSystemAdminAfter}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
