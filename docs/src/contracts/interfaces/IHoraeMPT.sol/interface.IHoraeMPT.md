# IHoraeMPT
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/9736ef106967a52e697e45ecf82f3a3756167223/contracts/interfaces/IHoraeMPT.sol)


## Functions
### owner


```solidity
function owner() external view returns (address);
```

### baseURI


```solidity
function baseURI() external view returns (string memory);
```

### listMaintenanceRecords


```solidity
function listMaintenanceRecords(uint256) external view returns (MaintenanceRecord[] memory);
```

### productWarranty


```solidity
function productWarranty(uint256) external returns (Warranty memory);
```

### manufacturerInfo


```solidity
function manufacturerInfo(bytes memory) external view returns (Manufacturer memory);
```

### productInfo


```solidity
function productInfo(uint256) external view returns (Product memory);
```

### hashIDMinted


```solidity
function hashIDMinted(bytes memory) external view returns (bool);
```

### systemAdmins


```solidity
function systemAdmins(address) external view returns (bool);
```

### manufacturerAdmins


```solidity
function manufacturerAdmins(bytes memory, address) external view returns (uint8);
```

### initialize


```solidity
function initialize(string memory baseURI_) external;
```

### setPause


```solidity
function setPause() external;
```

### setUnpause


```solidity
function setUnpause() external;
```

### changeContractOwner


```solidity
function changeContractOwner(address newOwner) external;
```

### setSystemAdmin


```solidity
function setSystemAdmin(address _address, bool _status) external;
```

### setManufacturerAdmin


```solidity
function setManufacturerAdmin(address user, uint8 level, bytes memory manufacturer) external;
```

### addManufacturer


```solidity
function addManufacturer(
    bytes memory manufacturer,
    address adminAddress,
    address vault,
    uint96 fee,
    uint256 withdrawDate,
    bool delegatedTransfer
) external;
```

### modifyManufacturer


```solidity
function modifyManufacturer(
    bytes memory manufacturer,
    address vault,
    uint96 fee,
    uint256 withdrawDate,
    bool delegatedTransfer
) external;
```

### setBaseURI


```solidity
function setBaseURI(string memory baseURI_) external;
```

### setTokenURI


```solidity
function setTokenURI(uint256 tokenId, string memory tokenUri) external;
```

### batchSetTokenURI


```solidity
function batchSetTokenURI(uint256[] memory tokenIds, string[] memory tokenUris) external returns (uint256[] memory);
```

### tokenURI


```solidity
function tokenURI(uint256 tokenId) external view returns (string memory);
```

### retractionTransferVault


```solidity
function retractionTransferVault(uint256 tokenId) external;
```

### manufacturerDelegatedTransfer


```solidity
function manufacturerDelegatedTransfer(address from, uint256 tokenId) external;
```

### setStolenStatus


```solidity
function setStolenStatus(uint256 tokenId, bool isItStolen) external;
```

### setMaintenanceRecord


```solidity
function setMaintenanceRecord(uint256 tokenId, bytes memory date, bytes memory info) external;
```

### setProductWarranty


```solidity
function setProductWarranty(uint256 tokenId, bytes memory terms, bytes memory warrantyID) external;
```

### setManufacturerFee


```solidity
function setManufacturerFee(bytes memory manufacturer, uint96 fee) external;
```

### mint


```solidity
function mint(MintParams memory args) external;
```

### batchMint


```solidity
function batchMint(MintParams[] memory _args, bytes calldata manufacturer) external returns (uint256[] memory);
```

### burn


```solidity
function burn(uint256 tokenId) external;
```

### withdraw


```solidity
function withdraw() external;
```

### getBalance


```solidity
function getBalance() external view returns (uint256);
```

