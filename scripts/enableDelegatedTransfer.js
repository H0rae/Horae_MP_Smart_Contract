/*
  Enable delegated transfer for HORAE manufacturer
  
  This script calls the modifyManufacturer function to enable delegatedTransfer for HORAE manufacturer.
  This allows using manufacturerDelegatedTransfer when retractionTransferVault fails due to time window expiration.
  
  Usage:
    node scripts/enableDelegatedTransfer.js
  
  Requirements:
    - OWNER_PK (or a system admin with owner rights) in env must sign this tx
    - ENV vars: RPC_URL, CONTRACT_ADDR (read from server/.env)
*/

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { ethers } = require('ethers');

// Load env from server/.env explicitly (fallback to process cwd)
const serverEnvPath = path.resolve(__dirname, '..', '..', 'monorepo_stack_V2', 'server', '.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config();
}

const RPC_URL = process.env.RPC_URL || process.env.NETWORK_RPC;
const CONTRACT = process.env.CONTRACT_ADDR;
const OWNER_PK = process.env.OWNER_PK || process.env.PK; // Prefer OWNER_PK if provided

if (!RPC_URL || !CONTRACT || !OWNER_PK) {
  console.error('❌ Missing required environment variables:');
  console.error('  RPC_URL:', RPC_URL ? '✅' : '❌');
  console.error('  CONTRACT_ADDR:', CONTRACT ? '✅' : '❌');
  console.error('  OWNER_PK:', OWNER_PK ? '✅' : '❌');
  process.exit(1);
}

async function main() {
  console.log('🔧 Enabling Delegated Transfer for HORAE Manufacturer...');
  console.log('============================================================');
  console.log('📡 RPC URL:', RPC_URL);
  console.log('📄 Contract:', CONTRACT);
  console.log('👤 Owner:', OWNER_PK.slice(0, 6) + '...' + OWNER_PK.slice(-4));
  console.log('');

  try {
    // Connect to network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PK, provider);
    
    console.log('🔗 Connected to network');
    console.log('💰 Wallet address:', wallet.address);
    console.log('💰 Wallet balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH');
    console.log('');

    // Contract ABI for modifyManufacturer function
    const contractABI = [
      {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "manufacturer",
            "type": "bytes"
          },
          {
            "internalType": "address",
            "name": "vault",
            "type": "address"
          },
          {
            "internalType": "uint96",
            "name": "fee",
            "type": "uint96"
          },
          {
            "internalType": "uint256",
            "name": "withdrawDate",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "delegatedTransfer",
            "type": "bool"
          }
        ],
        "name": "modifyManufacturer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "manufacturer",
            "type": "bytes"
          }
        ],
        "name": "manufacturerInfo",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint96",
                "name": "fee",
                "type": "uint96"
              },
              {
                "internalType": "uint96",
                "name": "tokenMinted",
                "type": "uint96"
              },
              {
                "internalType": "uint256",
                "name": "withdrawal_date",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "vaultAddress",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "delegatedTransfer",
                "type": "bool"
              }
            ],
            "internalType": "struct Manufacturer",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    const contract = new ethers.Contract(CONTRACT, contractABI, wallet);

    // Get current manufacturer info
    const manufacturerBytes = ethers.toUtf8Bytes('HORAE');
    console.log('📋 Getting current manufacturer info...');
    
    const currentInfo = await contract.manufacturerInfo(manufacturerBytes);
    console.log('Current manufacturer info:');
    console.log('  - Fee:', currentInfo.fee.toString());
    console.log('  - Token Minted:', currentInfo.tokenMinted.toString());
    console.log('  - Withdrawal Date:', currentInfo.withdrawal_date.toString());
    console.log('  - Vault Address:', currentInfo.vaultAddress);
    console.log('  - Delegated Transfer:', currentInfo.delegatedTransfer);
    console.log('');

    if (currentInfo.delegatedTransfer) {
      console.log('✅ Delegated transfer is already enabled for HORAE manufacturer');
      return;
    }

    // Enable delegated transfer
    console.log('🔧 Enabling delegated transfer...');
    
    const tx = await contract.modifyManufacturer(
      manufacturerBytes,           // manufacturer: "HORAE"
      currentInfo.vaultAddress,    // vault: keep current vault
      currentInfo.fee,             // fee: keep current fee
      currentInfo.withdrawal_date, // withdrawDate: keep current withdrawal date
      true                         // delegatedTransfer: enable (true)
    );

    console.log('📤 Transaction submitted:', tx.hash);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    console.log('📦 Block number:', receipt.blockNumber);
    console.log('⛽ Gas used:', receipt.gasUsed.toString());
    console.log('');

    // Verify the change
    console.log('🔍 Verifying the change...');
    const updatedInfo = await contract.manufacturerInfo(manufacturerBytes);
    console.log('Updated manufacturer info:');
    console.log('  - Fee:', updatedInfo.fee.toString());
    console.log('  - Token Minted:', updatedInfo.tokenMinted.toString());
    console.log('  - Withdrawal Date:', updatedInfo.withdrawal_date.toString());
    console.log('  - Vault Address:', updatedInfo.vaultAddress);
    console.log('  - Delegated Transfer:', updatedInfo.delegatedTransfer);
    console.log('');

    if (updatedInfo.delegatedTransfer) {
      console.log('🎉 SUCCESS! Delegated transfer is now enabled for HORAE manufacturer');
      console.log('📝 You can now use manufacturerDelegatedTransfer when retractionTransferVault fails');
    } else {
      console.log('❌ ERROR! Delegated transfer is still disabled');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) {
      console.error('📝 Reason:', error.reason);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});


