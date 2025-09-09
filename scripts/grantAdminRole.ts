import { ethers } from 'hardhat';

async function main() {
  const CONTRACT_ADDRESS = '0x33df937CDdEd8E62BA8B91Df4b97B7309d57f7B1';
  const SERVER_WALLET_ADDRESS = '0xC8c9883F9896c5621689376Bd1b79826965e3621';
  const MANUFACTURER_NAME = 'HORAE';
  const ADMIN_LEVEL = 2;

  console.log('Attaching to HoraeMPT contract at:', CONTRACT_ADDRESS);
  const HoraeMPT = await ethers.getContractFactory('HoraeMPT');
  const contract = HoraeMPT.attach(CONTRACT_ADDRESS);

  console.log(`Granting Level ${ADMIN_LEVEL} Manufacturer Admin role to: ${SERVER_WALLET_ADDRESS}`);
  console.log(`For manufacturer: "${MANUFACTURER_NAME}"`);

  // Convert the manufacturer name to bytes
  const manufacturerBytes = ethers.toUtf8Bytes(MANUFACTURER_NAME);

  // Call the setManufacturerAdmin function
  const tx = await contract.setManufacturerAdmin(
    SERVER_WALLET_ADDRESS,
    ADMIN_LEVEL,
    manufacturerBytes
  );

  console.log('Transaction sent. Waiting for confirmation...');
  console.log('Transaction Hash:', tx.hash);

  await tx.wait();

  console.log('Transaction confirmed!');
  console.log(`Successfully granted admin role to ${SERVER_WALLET_ADDRESS}.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

