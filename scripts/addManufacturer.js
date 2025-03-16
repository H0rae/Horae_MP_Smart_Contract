const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  try {
    // Read deploy.json to get contract addresses
    const deployData = JSON.parse(fs.readFileSync('deploy.json', 'utf8'));
    const horaeAddress = deployData.HoraeProxy;
    
    console.log(`Using Horae contract at: ${horaeAddress}`);

    // Connect to the contract
    const Horae = await ethers.getContractFactory('HoraeMPT');
    const horae = await Horae.attach(horaeAddress);

    // Define manufacturer parameters
    // For ethers v6, use ethers.encodeBytes32String instead of formatBytes32String
    const manufacturerName = "TEST"; // Replace with actual manufacturer name
    const manufacturer = ethers.encodeBytes32String(manufacturerName);
    const adminAddress = "0x7cE7615a84195caF6CC412f1555aF445d1175073"; // Replace with actual admin address
    const vaultAddress = "0x7cE7615a84195caF6CC412f1555aF445d1175073"; // Replace with actual vault address
    const feePercentage = 0; // 0% fee, expressed as basis points (multiply percentage by 100)
    
    // Convert fee to the correct format (uint96)
    const fee = ethers.toBigInt(feePercentage);
    
    // Set withdrawal time (e.g., 30 days from now in seconds)
    const withdrawalTimeInDays = 30;
    const withdrawalTime = Math.floor(Date.now() / 1000) + (withdrawalTimeInDays * 24 * 60 * 60);
    
    // Set delegated transfer flag
    const delegatedTransfer = true;

    console.log(`Adding manufacturer with parameters:
      - Name: ${manufacturerName}
      - Admin: ${adminAddress}
      - Vault: ${vaultAddress}
      - Fee: ${feePercentage / 100}%
      - Withdrawal Time: ${new Date(withdrawalTime * 1000).toLocaleDateString()}
      - Delegated Transfer: ${delegatedTransfer}`);

    // Add manufacturer
    const tx = await horae.addManufacturer(
      manufacturer,
      adminAddress,
      vaultAddress,
      fee,
      withdrawalTime,
      delegatedTransfer
    );

    console.log(`Transaction sent: ${tx.hash}`);
    console.log('Waiting for confirmation...');
    
    await tx.wait();
    console.log('Manufacturer added successfully!');

    // Verify the manufacturer was added
    const manufacturerInfo = await horae.manufacturerInfo(manufacturer);
    console.log(`
    Manufacturer verified:
    - Fee: ${Number(manufacturerInfo.fee) / 100}%
    - Tokens Minted: ${manufacturerInfo.tokenMinted}
    - Withdrawal Date: ${new Date(Number(manufacturerInfo.withdrawal_date) * 1000).toLocaleDateString()}
    - Vault Address: ${manufacturerInfo.vaultAddress}
    - Delegated Transfer: ${manufacturerInfo.delegatedTransfer}
    `);

  } catch (error) {
    console.error('Error adding manufacturer:', error);
    process.exitCode = 1;
  }
}

main();