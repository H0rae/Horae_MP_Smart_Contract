const { ethers, upgrades, run, network } = require('hardhat');
const { writeFileSync, readFileSync } = require('fs');

async function main() {
  console.log("Starting upgrade process...");
  
  // Read current deployment info
  let deployInfo;
  try {
    const deployData = readFileSync('deploy.json', 'utf8');
    deployInfo = JSON.parse(deployData);
    console.log(`Current deployment info:`, deployInfo);
  } catch (error) {
    console.error("Error reading deploy.json:", error);
    process.exit(1);
  }

  const proxyAddress = deployInfo.HoraeProxy;
  console.log(`Upgrading Horae contract at proxy address: ${proxyAddress}`);
  
  // Get the new implementation contract factory
  const HoraeV2 = await ethers.getContractFactory('HoraeMPT');
  
  // Upgrade the contract
  console.log("Upgrading contract...");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, HoraeV2, {
    kind: 'uups',
    constructorArgs: [deployInfo.Forwarder],
    unsafeAllow: ["constructor"]
  });
  
  await upgraded.waitForDeployment();
  console.log("Contract upgraded successfully!");
  
  // Get new implementation address
  const newImplAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log(`New implementation address: ${newImplAddress}`);
  
  // Update deploy.json with new implementation address
  deployInfo.HoraeImplementation = newImplAddress;
  writeFileSync('deploy.json', JSON.stringify(deployInfo, null, 2));
  console.log("Updated deploy.json with new implementation address");

  // Wait for confirmations
  console.log("Waiting for confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

  // Verify the new implementation
  console.log(`Verifying new implementation on ${network.name}...`);
  try {
    await run("verify:verify", {
      address: newImplAddress,
      constructorArguments: [deployInfo.Forwarder],
    });
    console.log("New implementation verified successfully!");
  } catch (error) {
    console.log("Error verifying new implementation:", error);
  }

  // Display upgrade summary
  console.log("\n=== UPGRADE SUMMARY ===");
  console.log(`Network: ${network.name}`);
  console.log(`Proxy Address: ${proxyAddress}`);
  console.log(`New Implementation: ${newImplAddress}`);
  console.log(`Forwarder: ${deployInfo.Forwarder}`);
  console.log("=====================\n");

  console.log("Upgrade completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
