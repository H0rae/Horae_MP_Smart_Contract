const { ethers, upgrades, run, network } = require('hardhat');
const { writeFileSync } = require('fs'); 

async function main() {
  console.log("Starting deployment process...");
  
  // Deploy forwarder
  const forwarder = await ethers.getContractFactory('ERC2771ForwarderUpgradeable');
  const forwarder_instance = await forwarder.deploy();
  await forwarder_instance.waitForDeployment();
  const forwarderAddress = await forwarder_instance.getAddress();
  console.log(`ERC2771Forwarder deployed to: ${forwarderAddress}`);
  
  // Deploy Horae
  const horae = await ethers.getContractFactory('HoraeMPT');  
  const horae_instance = await upgrades.deployProxy(horae, ["ipfs://"], { 
    initializer: 'initialize', 
    kind: 'uups', 
    constructorArgs: [forwarderAddress], 
    unsafeAllow: ["constructor"]
  });
  await horae_instance.waitForDeployment();
  const horaeAddress = await horae_instance.getAddress();
  console.log(`Horae proxy deployed to: ${horaeAddress}`);
  
  // Get implementation address
  const implAddress = await upgrades.erc1967.getImplementationAddress(horaeAddress);
  console.log(`Horae implementation deployed to: ${implAddress}`);
  
  // Save addresses
  writeFileSync(
    'deploy.json',
    JSON.stringify(
      {
        Forwarder: forwarderAddress,
        HoraeProxy: horaeAddress,
        HoraeImplementation: implAddress,
        Network: network.name
      },
      null,
      2
    )
  );

  // Wait for confirmations
  console.log("Waiting for confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

  // Verify contracts
  console.log(`Verifying contracts on ${network.name}...`);
  
  try {
    // Verify forwarder
    await run("verify:verify", {
      address: forwarderAddress,
      // Let Hardhat find the contract automatically
    });
    console.log("Forwarder verified successfully!");
  } catch (error) {
    console.log("Error verifying forwarder:", error);
  }

  // For upgradeable contracts, verify the implementation
  try {
    await run("verify:verify", {
      address: implAddress,
      constructorArguments: [forwarderAddress],
      // Let Hardhat find the contract automatically
    });
    console.log("Horae implementation verified successfully!");
  } catch (error) {
    console.log("Error verifying Horae implementation:", error);
  }

  // Display summary of all deployed addresses
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`Network: ${network.name}`);
  console.log(`Forwarder: ${forwarderAddress}`);
  console.log(`Horae Proxy: ${horaeAddress}`);
  console.log(`Horae Implementation: ${implAddress}`);
  console.log("========================\n");

  console.log("Deployment and verification completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});