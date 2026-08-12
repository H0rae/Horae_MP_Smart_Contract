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

  const owner = await contract.owner();

  console.log(`The owner of the contract is: ${owner}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

