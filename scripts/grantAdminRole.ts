import { ethers } from 'hardhat';

async function main() {
  const CONTRACT_ADDRESS = '0x99E5d76dEb15731c51695FB33A0bd9c554400705';
  const SERVER_WALLET_ADDRESS = '0x69fcfa65DfFC217792F7639381dfBDb843170561';
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

