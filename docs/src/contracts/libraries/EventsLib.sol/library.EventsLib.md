# EventsLib
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/e15bbe0d1fdd5fff5e703ccf81701718bb0d8fbd/contracts/libraries/EventsLib.sol)

**Author:**
: Horae

: Library exposing events for the HoraeMPT contract.


## Events
### TokenURI
Emits when a token URI is added or changed.


```solidity
event TokenURI(uint256 indexed tokenId, string tokenURI);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the token.|
|`tokenURI`|`string`|The URI of the token.|

### BaseURIChanged
Emits when the base URI is changed.


```solidity
event BaseURIChanged(string baseURI);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`baseURI`|`string`|The new base URI.|

### ManufacturerAdded
Emits when a manufacturer is added.


```solidity
event ManufacturerAdded(
    bytes manufacturer, address vaultAddress, uint96 fee, uint256 withdrawtime, bool delegatedTransfer
);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The name of the manufacturer.|
|`vaultAddress`|`address`|The address of the manufacturer vault.|
|`fee`|`uint96`|The fee associated with the manufacturer.|
|`withdrawtime`|`uint256`|The time when the manufacturer can withdraw the minted certificate, UNIX.|
|`delegatedTransfer`|`bool`|if the manufacturer can transfer for the user|

### ManufacturerModified
Emits when a manufacturer is modified.


```solidity
event ManufacturerModified(
    bytes manufacturer, address vaultAddress, uint96 fee, uint256 withdrawtime, bool delegatedTransfer
);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The name of the manufacturer.|
|`vaultAddress`|`address`|The address of the manufacturer vault.|
|`fee`|`uint96`|The fee associated with the manufacturer.|
|`withdrawtime`|`uint256`|The time when the manufacturer can withdraw the minted certificate, UNIX.|
|`delegatedTransfer`|`bool`|if the manufacturer can transfer for the user|

### StolenStatus
Emits when a product has been stolen or recovered.


```solidity
event StolenStatus(uint256 indexed tokenId, bool state);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the product.|
|`state`|`bool`|The state of the product.|

### ProductWarrantyInfo
Emits when a product warranty information is added.


```solidity
event ProductWarrantyInfo(uint256 indexed tokenId, bytes manufacturer, bytes terms, bytes warrantyID);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the product.|
|`manufacturer`|`bytes`|The manufacturer of the product.|
|`terms`|`bytes`|The terms of the warranty.|
|`warrantyID`|`bytes`|The ID of the warranty.|

### MaintenanceRecordInfo
Emits when a maintenance record is added.


```solidity
event MaintenanceRecordInfo(uint256 indexed tokenId, uint256 maintenanceCount, bytes info, bytes date);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the product.|
|`maintenanceCount`|`uint256`|The number of maintenance records for the product.|
|`info`|`bytes`|Information about the maintenance.|
|`date`|`bytes`|The date of the maintenance.|

### MaintenanceRecordDeleted
Emits when a maintenance record is deleted.


```solidity
event MaintenanceRecordDeleted(uint256 tokenId, uint256 maintenanceId);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the product.|
|`maintenanceId`|`uint256`|The id of the maintenance that has been deleted.|

### Received
Emits when ETH are received.


```solidity
event Received(address, uint256);
```

### NewVersion
Emits when the version changed.


```solidity
event NewVersion(string indexed upgrade);
```

### PassportMinted
Emits when a passport is minted.


```solidity
event PassportMinted(
    address to,
    uint256 tokenId,
    bytes manufacturer,
    bytes category,
    bytes productreference,
    bytes collection,
    bytes model,
    bytes productionDate,
    string uri
);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`to`|`address`|The address of the token owner.|
|`tokenId`|`uint256`|The ID of the token.|
|`manufacturer`|`bytes`|The manufacturer of the product.|
|`category`|`bytes`|The category of the product.|
|`productreference`|`bytes`|The reference of the product.|
|`collection`|`bytes`|The collection of the product.|
|`model`|`bytes`|The model of the product.|
|`productionDate`|`bytes`|The production date of the product.|
|`uri`|`string`|The URI of the token.|

### PassportBurned
Emits when a passport is burned.


```solidity
event PassportBurned(uint256 tokenId, bytes manufacturer);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the token.|
|`manufacturer`|`bytes`|The manufacturer of the product.|

### OwnerChanged
Emits when Smart Contract Owner is changed.


```solidity
event OwnerChanged(address newOwner);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newOwner`|`address`|The address of the new owner.|

### SystemAdminStatus
Emits when a system admin is added or removed.


```solidity
event SystemAdminStatus(address adminAddress, bool status);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`adminAddress`|`address`|The address of the user.|
|`status`|`bool`|The status of the user.|

### ManufacturerAdministratorStatus
Emits when a user is added or removed from a manufacturer.


```solidity
event ManufacturerAdministratorStatus(address user, uint8 level, bytes manufacturer);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`user`|`address`|The address of the user.|
|`level`|`uint8`|The level of the user.|
|`manufacturer`|`bytes`|The manufacturer of the user.|

### RetractionTransfer
emits when a product is transferred to the manufacturer vault due to a retraction


```solidity
event RetractionTransfer(address from, uint256 tokenId, bytes manufacturer);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|the address of the product owner|
|`tokenId`|`uint256`|the id of the product|
|`manufacturer`|`bytes`|the manufacturer of the product|

### DelegatedTransfer
Emits when a product is transferred to the manufacturer vault due to a delegated transfer


```solidity
event DelegatedTransfer(address from, uint256 tokenId, bytes manufacturer);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|the address of the product owner|
|`tokenId`|`uint256`|the id of the product|
|`manufacturer`|`bytes`|the manufacturer of the product|

### ManufacturerFeeUpdated
Emits when Manufacturer's fee is updated.


```solidity
event ManufacturerFeeUpdated(bytes manufacturer, uint96 fee);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The manufacturer for which the fee is being set.|
|`fee`|`uint96`|The new fee value to set.|

