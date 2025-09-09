import { ethers } from 'hardhat';

async function main() {
  const CONTRACT_ADDRESS = '0x33df937CDdEd8E62BA8B91Df4b97B7309d57f7B1';
  const SERVER_WALLET_ADDRESS = '0xC8c9883F9896c5621689376Bd1b79826965e3621';

  console.log(`Attaching to HoraeMPT contract at: ${CONTRACT_ADDRESS}`);
  const HoraeMPT = await ethers.getContractFactory('HoraeMPT');
  const contract = HoraeMPT.attach(CONTRACT_ADDRESS);

  const [owner] = await ethers.getSigners();
  console.log(`Executing with wallet: ${owner.address}`);

  console.log(`Granting System Admin role to: ${SERVER_WALLET_ADDRESS}`);

  const tx = await contract.connect(owner).setSystemAdmin(SERVER_WALLET_ADDRESS, true);

  console.log('Transaction sent. Waiting for confirmation...');
  console.log('Transaction Hash:', tx.hash);

  await tx.wait();

  console.log('Transaction confirmed!');
  console.log(`Successfully granted System Admin role to ${SERVER_WALLET_ADDRESS}.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

