import { ethers } from 'hardhat';

async function main() {
  const CONTRACT_ADDRESS = '0x33df937CDdEd8E62BA8B91Df4b97B7309d57f7B1';
  const MANUFACTURER_NAME = 'HORAE';
  // Using the server's wallet as the default admin and vault
  const ADMIN_VAULT_ADDRESS = '0xC8c9883F9896c5621689376Bd1b79826965e3621';
  const FEE_BPS = 0; // Basis points (0% fee)
  const WITHDRAWAL_DAYS = 30;
  const DELEGATED_TRANSFER = true;

  console.log(`Attaching to HoraeMPT contract at: ${CONTRACT_ADDRESS}`);
  const HoraeMPT = await ethers.getContractFactory('HoraeMPT');
  const contract = HoraeMPT.attach(CONTRACT_ADDRESS);

  // Convert manufacturer name to bytes
  const manufacturerBytes = ethers.toUtf8Bytes(MANUFACTURER_NAME);

  // Check if manufacturer already exists
  const info = await contract.manufacturerInfo(manufacturerBytes);
  if (info.vaultAddress !== ethers.ZeroAddress) {
    console.log(`Manufacturer "${MANUFACTURER_NAME}" is already registered.`);
    console.log('Vault Address:', info.vaultAddress);
    return;
  }

  console.log(`Registering manufacturer "${MANUFACTURER_NAME}"...`);
  const withdrawalTime = Math.floor(Date.now() / 1000) + (WITHDRAWAL_DAYS * 24 * 60 * 60);

  const tx = await contract.addManufacturer(
    manufacturerBytes,
    ADMIN_VAULT_ADDRESS,
    ADMIN_VAULT_ADDRESS,
    FEE_BPS,
    withdrawalTime,
    DELEGATED_TRANSFER
  );

  console.log('Transaction sent. Waiting for confirmation...');
  console.log('Transaction Hash:', tx.hash);

  await tx.wait();

  console.log('Transaction confirmed!');
  console.log(`Successfully registered manufacturer "${MANUFACTURER_NAME}".`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

