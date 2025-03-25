const ethers = require('ethers');

// Target contract with addManufacturer function
const TargetContractAbi = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'manufacturer',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: 'adminAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint96',
        name: 'fee',
        type: 'uint96',
      },
      {
        internalType: 'uint256',
        name: 'withdrawDate',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'delegatedTransfer',
        type: 'bool',
      },
    ],
    name: 'addManufacturer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
const TargetContractAddress = '0x5eA489EC301E2Ad31Da5eB024097C937d0b1395f';

// Forwarder config
const ForwarderAbi = [
  {
    inputs: [{ internalType: 'uint48', name: 'deadline', type: 'uint48' }],
    name: 'ERC2771ForwarderExpiredRequest',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'signer', type: 'address' },
      { internalType: 'address', name: 'from', type: 'address' },
    ],
    name: 'ERC2771ForwarderInvalidSigner',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'requestedValue', type: 'uint256' },
      { internalType: 'uint256', name: 'msgValue', type: 'uint256' },
    ],
    name: 'ERC2771ForwarderMismatchedValue',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'address', name: 'forwarder', type: 'address' },
    ],
    name: 'ERC2771UntrustfulTarget',
    type: 'error',
  },
  { inputs: [], name: 'FailedCall', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'balance', type: 'uint256' },
      { internalType: 'uint256', name: 'needed', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'currentNonce', type: 'uint256' },
    ],
    name: 'InvalidAccountNonce',
    type: 'error',
  },
  { inputs: [], name: 'InvalidInitialization', type: 'error' },
  { inputs: [], name: 'NotInitializing', type: 'error' },
  { anonymous: false, inputs: [], name: 'EIP712DomainChanged', type: 'event' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'signer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bool', name: 'success', type: 'bool' },
    ],
    name: 'ExecutedForwardRequest',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { internalType: 'bytes1', name: 'fields', type: 'bytes1' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'version', type: 'string' },
      { internalType: 'uint256', name: 'chainId', type: 'uint256' },
      { internalType: 'address', name: 'verifyingContract', type: 'address' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'uint256[]', name: 'extensions', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'uint256', name: 'gas', type: 'uint256' },
          { internalType: 'uint48', name: 'deadline', type: 'uint48' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct ERC2771ForwarderUpgradeable.ForwardRequestData',
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'uint256', name: 'gas', type: 'uint256' },
          { internalType: 'uint48', name: 'deadline', type: 'uint48' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct ERC2771ForwarderUpgradeable.ForwardRequestData[]',
        name: 'requests',
        type: 'tuple[]',
      },
      {
        internalType: 'address payable',
        name: 'refundReceiver',
        type: 'address',
      },
    ],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'name', type: 'string' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'nonces',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'uint256', name: 'gas', type: 'uint256' },
          { internalType: 'uint48', name: 'deadline', type: 'uint48' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct ERC2771ForwarderUpgradeable.ForwardRequestData',
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'verify',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
];
const ForwarderAddress = '0x2357D834F3934Ee34A0c40258a2E0bD5d20750e9';

// Defender API endpoint where your relay action is deployed
const DEFENDER_API_URL =
  'https://api.defender.openzeppelin.com/actions/5ec1e26b-4e88-4667-b4be-3caa53e24bf1/runs/webhook/2594f1f7-8547-4f02-b7ea-207bc884d38d/SWmdWuWhrJpxUtCvjhNc6m';

async function signMetaTxRequest(signer, forwarder, request) {
  const domain = await forwarder.eip712Domain();
  const chainId = domain[3];

  // Get the nonce for the sender
  const nonce = await forwarder.nonces(request.from);
  console.log(`Current nonce for ${request.from}: ${nonce}`);

  // Add nonce to the request object
  const requestWithNonce = {
    ...request,
    nonce: nonce.toString(),
  };

  // EIP-712 domain
  const domainData = {
    name: domain[1],
    version: domain[2],
    chainId: chainId,
    verifyingContract: ForwarderAddress,
  };

  // EIP-712 types - must match exactly what the forwarder expects
  const types = {
    ForwardRequest: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'gas', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint48' },
      { name: 'data', type: 'bytes' },
    ],
  };

  console.log('Domain data:', domainData);
  console.log('Types:', types);
  console.log('Request with nonce:', requestWithNonce);

  // Sign typed data
  const signature = await signer.signTypedData(
    domainData,
    types,
    requestWithNonce
  );
  console.log('Generated signature:', signature);

  return {
    signature,
    request: requestWithNonce,
  };
}

async function buildRequest(from, to, data) {
  // Create a request object to be signed by the client and sent to the Defender Action
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const gas = 10000000; // More reasonable gas limit

  const request = {
    from: from,
    to: to,
    value: 0,
    gas: gas,
    deadline: deadline,
    data: data,
    // Note: nonce will be added in signMetaTxRequest
  };

  return request;
}

async function sendMetaTx() {
  try {
    // Connect to provider
    const provider = new ethers.JsonRpcProvider(
      'https://rpc-amoy.polygon.technology'
    );

    // Create a signer using a private key (for testing only)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY_DEV, provider);
    const from = await signer.getAddress();
    console.log('Signer address:', from);

    // Initialize contracts
    const targetContract = new ethers.Contract(
      TargetContractAddress,
      TargetContractAbi,
      signer
    );
    const forwarder = new ethers.Contract(
      ForwarderAddress,
      ForwarderAbi,
      provider
    );

    // Prepare parameters for the target function
    const manufacturerName = 'TEST2';
    const manufacturer = ethers.encodeBytes32String(manufacturerName);
    const adminAddress = '0x7cE7615a84195caF6CC412f1555aF445d1175073';
    const vaultAddress = '0x7cE7615a84195caF6CC412f1555aF445d1175073';
    const feePercentage = 0;
    const delegatedTransfer = true;
    const fee = ethers.toBigInt(feePercentage);
    const withdrawalTime = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    // Encode the function call
    const data = targetContract.interface.encodeFunctionData(
      'addManufacturer',
      [
        manufacturer,
        adminAddress,
        vaultAddress,
        fee,
        withdrawalTime,
        delegatedTransfer,
      ]
    );
    console.log('Encoded function data:', data);

    // Build the request
    const request = await buildRequest(from, TargetContractAddress, data);
    console.log('Built request:', request);

    // Sign the request and get updated request with nonce
    const { signature, request: signedRequest } = await signMetaTxRequest(
      signer,
      forwarder,
      request
    );
    console.log('Request signed with signature:', signature);

    // Verify locally that the signature is valid before sending
    try {
      const isValid = await forwarder.verify({
        ...signedRequest,
        signature: signature,
      });
      console.log('Signature verification result:', isValid);
      if (!isValid) {
        console.warn('Warning: Signature verification failed locally');
      }
    } catch (verifyError) {
      console.warn(
        'Local verification failed, but continuing:',
        verifyError.message
      );
    }

    // Send the request to the Defender Relayer
    console.log('Sending to relayer:', {
      request: signedRequest,
      signature: signature,
    });

    const response = await fetch(DEFENDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request: signedRequest,
        signature: signature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Relay request failed with status ${response.status}: ${errorText}`
      );
    }

    const responseData = await response.json();
    console.log('Meta-transaction sent successfully!');
    console.log('Transaction hash:', responseData.txHash);
    console.log('Transaction status:', responseData.txStatus);

    return responseData;
  } catch (error) {
    console.error('Error sending meta-transaction:', error);
    throw error;
  }
}

// Execute the function
sendMetaTx()
  .then((result) => console.log('Complete:', result))
  .catch((error) => console.error('Failed:', error));
