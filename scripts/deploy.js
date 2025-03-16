const {ethers,upgrades} = require('hardhat');
const { writeFileSync } = require('fs'); 

async function main() {
  const forwarder = await ethers.getContractFactory('MinimalForwarder')
  const forwarder_instance = await forwarder.deploy();
  await forwarder_instance.deployed(); 
  console.log(forwarder_instance.address); 
  const horae = await ethers.getContractFactory('HoraeMPT');  
  const horae_instance = await upgrades.deployProxy(horae,["ipfs://"],{ initializer: 'initialize',kind: 'uups', constructorArgs: [forwarder_instance.address], unsafeAllow: ["constructor"]});
  await horae_instance.deployed();
  
  writeFileSync(
    'deploy.json',
    JSON.stringify(
      {
        MinimalForwarder: forwarder_instance.address,
        Horae: horae_instance.address,
      },
      null,
      2
    )
  )

  console.log(
    `MinimalForwarder: ${forwarder_instance.address}\n Horae: ${horae_instance.address}`
  )
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});