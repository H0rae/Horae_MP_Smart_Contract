require('@nomicfoundation/hardhat-toolbox');
require('solidity-coverage');
require('hardhat-contract-sizer');
require('@openzeppelin/hardhat-upgrades'); 
require('@nomicfoundation/hardhat-verify');
require('dotenv').config();

const { API_URL_DEV, PRIVATE_KEY_DEV, API_URL_PROD, PRIVATE_KEY_PROD } =
  process.env;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'localhost',
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY
    },
  },
  networks: {
    hardhat: {
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true, // This allows deploying larger contracts
    },
    polygonAmoy: {
      url: process.env.API_URL_DEV,
      accounts: [process.env.PRIVATE_KEY_DEV],
      chainId: 80002
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    dev: {
      url: API_URL_DEV,
      accounts: [PRIVATE_KEY_DEV],
    },
    prod: {
      url: API_URL_PROD,
      accounts: [PRIVATE_KEY_PROD],
    },
  },
  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10, // Seems to be the perfect value
      },
    },
  },
};
