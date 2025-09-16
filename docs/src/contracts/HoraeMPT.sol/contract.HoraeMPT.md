# HoraeMPT
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/9736ef106967a52e697e45ecf82f3a3756167223/contracts/HoraeMPT.sol)

**Inherits:**
[IHoraeMPT](/contracts/interfaces/IHoraeMPT.sol/interface.IHoraeMPT.md), Initializable, UUPSUpgradeable, ERC2771ContextUpgradeable, ERC721RoyaltyUpgradeable, PausableUpgradeable

**Author:**
Horae Tech team

Manages the minting and attributes of NFTs representing digital product passports.


## State Variables
### owner

```solidity
address public owner;
```


### baseURI

```solidity
string public baseURI;
```


### _tokenURIs

```solidity
mapping(uint256 => string) internal _tokenURIs;
```


### _maintenanceIds

```solidity
mapping(uint256 => uint256[]) internal _maintenanceIds;
```


### _maintenanceRecords

```solidity
mapping(uint256 => mapping(uint256 => MaintenanceRecord)) internal _maintenanceRecords;
```


### _productWarranty

```solidity
mapping(uint256 => Warranty) private _productWarranty;
```


### _manufacturerInfo

```solidity
mapping(bytes => Manufacturer) private _manufacturerInfo;
```


### _productInfo

```solidity
mapping(uint256 => Product) private _productInfo;
```


### hashIDMinted

```solidity
mapping(bytes => bool) public hashIDMinted;
```


### systemAdmins

```solidity
mapping(address => bool) public systemAdmins;
```


### administrators

```solidity
mapping(bytes => mapping(address => uint8)) public administrators;
```


### __gap
*This empty reserved space allows the add of new varianles in a future version
without shifting down storage.
Read more at: https://docs.openzeppelin.com/upgrades-plugins/writing-upgradeable#storage-gaps*


```solidity
uint256[49] __gap;
```


### DECIMAL_BASE

```solidity
uint256 private constant DECIMAL_BASE = 10;
```


### ASCII_ZERO

```solidity
uint256 private constant ASCII_ZERO = 48;
```


### ASCII_NINE

```solidity
uint256 private constant ASCII_NINE = 57;
```


## Functions
### constructor


```solidity
constructor(address trustedForwarderAddress) ERC2771ContextUpgradeable(trustedForwarderAddress);
```

### productWarranty

This is a view function and does not modify the state.

*Returns the warranty information for a given product token.*


```solidity
function productWarranty(uint256 tokenId) external view override returns (Warranty memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the product token.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`Warranty`|Warranty struct containing warranty details.|


### manufacturerInfo

This is a view function and does not modify the state.

*Returns the manufacturer information for a given manufacturer name.*


```solidity
function manufacturerInfo(bytes memory manufacturerName) external view override returns (Manufacturer memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturerName`|`bytes`|The bytes identifier of the manufacturer.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`Manufacturer`|Manufacturer struct containing manufacturer details.|


### productInfo

This is a view function and does not modify the state.

*Returns the product information for a given token ID.*


```solidity
function productInfo(uint256 tokenId) external view override returns (Product memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the product token.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`Product`|Product struct containing product details.|


### listMaintenanceRecords

This is a view function and does not modify the state.

*Returns the list of maintenance records for a given product token.*


```solidity
function listMaintenanceRecords(uint256 tokenId) external view override returns (MaintenanceRecord[] memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the product token.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`MaintenanceRecord[]`|MaintenanceRecord[] Array of maintenance records for the product.|


### initialize

Initializes the HoraeMPT contract with a base URI and sets the deployer as the initial administrator.


```solidity
function initialize(string memory baseURI_) public initializer;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`baseURI_`|`string`|The base URI to use for generating token URIs.|


### _onlySystem

Modifier to allow only the contract owner to execute a function.

*The caller must be the contract owner.*


```solidity
function _onlySystem() private view;
```

### _onlyManufacturer

Modifier to allow only the contract owner or the manufacturer to execute a function.


```solidity
function _onlyManufacturer(bytes memory manufacturer) private view;
```

### _isManufacturer

This is an internal helper function.

*Checks if the caller is authorized as a manufacturer or system admin.*


```solidity
function _isManufacturer(address caller, bytes memory manufacturer) internal view returns (bool);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`caller`|`address`|      Address of the caller to check.|
|`manufacturer`|`bytes`|Manufacturer bytes identifier to check against.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bool`|bool True if the caller is a manufacturer or system admin, false otherwise.|


### _onlyProductOwnerOrManufacturer

Modifier to allow only the product owner or the manufacturer or the contract owner to execute a function.


```solidity
function _onlyProductOwnerOrManufacturer(bytes memory manufacturer, uint256 tokenId) private view;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The manufacturer of the product.|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product|


### _onlyManufacturerAdmin

Modifier to allow only the manufacturer admin to execute a function.


```solidity
function _onlyManufacturerAdmin(bytes memory manufacturer) private view;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The manufacturer of the product.|


### _isProductOwned

Checks if a product (NFT) has been minted and has an owner.

*Internal helper function that verifies if a token exists by checking if it has a non-zero owner address.
Returns false for non-existent tokens (which return address(0) from _ownerOf).*


```solidity
function _isProductOwned(uint256 tokenId) internal view returns (bool);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the product token to check|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bool`|bool True if the product is owned (token exists), false if not minted or burned|


### _onlyOwner

Modifier to allow only the product owner to execute a function.


```solidity
function _onlyOwner() private view;
```

### checkExistAndStolen

Check if a token exists and is not marked as stolen.

*The specified token must exist.*

*The specified token must not be marked as stolen.*


```solidity
function checkExistAndStolen(uint256 tokenId) private view;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product|


### checkIfStolen

Function to check if a token is not marked as stolen.


```solidity
function checkIfStolen(uint256 tokenId) private view;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the token to check / unique (on-chain) identifier of the product.|


### supportsInterface

Overrides required by OpenZeppelin


```solidity
function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721RoyaltyUpgradeable) returns (bool);
```

### _authorizeUpgrade

required by the OZ UUPS module


```solidity
function _authorizeUpgrade(address) internal view override;
```

### receive

A special function that is called when the contract receives ether without any specific function call.

*Emits a {Received} event to log the sender and the amount of ether received.*


```solidity
receive() external payable;
```

### fallback

Fallback function to receive Ether sent to the contract.

*Emits a {Received} event with the sender and value of the transaction.*


```solidity
fallback() external payable;
```

### getBalance

Returns the current balance of the contract.


```solidity
function getBalance() public view returns (uint256);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|The current balance of the contract.|


### withdraw

Allows the contract owner to withdraw the contract's balance.


```solidity
function withdraw() public;
```

### setPause

Pause the contract

*Only horae admin can call this function.*


```solidity
function setPause() public;
```

### setUnpause

Unpause the contract

*Only horae admin can call this function.*


```solidity
function setUnpause() public;
```

### _msgData

Override required by OpenZeppelin, returns ContextUpgradeable._msgData()


```solidity
function _msgData()
    internal
    view
    virtual
    override(ContextUpgradeable, ERC2771ContextUpgradeable)
    returns (bytes calldata);
```

### _msgSender

Override required by OpenZeppelin, returns ContextUpgradeable._msgSender()


```solidity
function _msgSender()
    internal
    view
    virtual
    override(ContextUpgradeable, ERC2771ContextUpgradeable)
    returns (address sender);
```

### _update

Override required by OpenZeppelin


```solidity
function _update(address to, uint256 tokenId, address auth)
    internal
    virtual
    override(ERC721Upgradeable)
    returns (address);
```

### mint

Mints a new NFT representing a digital product passport.

*The caller must be a manufacturer admin.*

*The URI must not be empty.*

*The manufacturer must not be empty.*

*The category must not be empty.*

*The model must not be empty.*

*The collection must not be empty.*

*The product reference must not be empty.*

*The production date must not be empty.*

*The product ID must not have been minted before.*

*Emits a {PassportMinted} event.*


```solidity
function mint(MintParams memory args) public whenNotPaused;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`args`|`MintParams`|the minting struct|


### batchMint

Mint a batch of tokens

*The caller must be a manufacturer admin.*


```solidity
function batchMint(MintParams[] memory _args, bytes calldata manufacturer)
    external
    whenNotPaused
    returns (uint256[] memory failedIndices);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_args`|`MintParams[]`|the minting struct|
|`manufacturer`|`bytes`|the manufacturer of the product|


### burn

Burns a specific token. The token must be inside the manufacturer vault.

*The token must have been minted.*

*The caller must be a manufcaturer administrator level 2*


```solidity
function burn(uint256 tokenId) external whenNotPaused;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|uint256 ID of the token to burn / unique (on-chain) identifier of the product.|


### setStolenStatus

Set the stolen status of a product.


```solidity
function setStolenStatus(uint256 tokenId, bool isItStolen) external override;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product.|
|`isItStolen`|`bool`|The new stolen status of the product.|


### setMaintenanceRecord

Set the maintenance record of a product.


```solidity
function setMaintenanceRecord(uint256 tokenId, bytes memory date, bytes memory info) external override;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product.|
|`date`|`bytes`|The date of the maintenance.|
|`info`|`bytes`|The information about the maintenance.|


### deleteMaintenanceRecord

Delete a  maintenance record of a product.


```solidity
function deleteMaintenanceRecord(uint256 tokenId, uint256 maintenanceId) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product.|
|`maintenanceId`|`uint256`|The ID of the maintenance.|


### setProductWarranty

Set the product warranty.


```solidity
function setProductWarranty(uint256 tokenId, bytes memory terms, bytes memory warrantyID) external override;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product.|
|`terms`|`bytes`|The terms of the warranty.|
|`warrantyID`|`bytes`|The ID of the warranty.|


### changeContractOwner

Change the contract owner.


```solidity
function changeContractOwner(address newOwner) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newOwner`|`address`|The address of the new owner.|


### setSystemAdmin

Set the system admin status of an address.


```solidity
function setSystemAdmin(address _address, bool _status) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_address`|`address`|The address to set the status for.|
|`_status`|`bool`|The new status of the address.|


### setManufacturerAdmin

Set the manufacturer admin status of an address.


```solidity
function setManufacturerAdmin(address user, uint8 level, bytes memory manufacturer) public;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`user`|`address`|The address to set the status for.|
|`level`|`uint8`|The new level of the address.|
|`manufacturer`|`bytes`|The manufacturer of the product.|


### addManufacturer

Add a manufacturer to the system.


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
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The name of the manufacturer.|
|`adminAddress`|`address`|The address of the manufacturer admin.|
|`vault`|`address`|The address of the manufacturer vault.|
|`fee`|`uint96`|The fee of the manufacturer.|
|`withdrawDate`|`uint256`|The withdrawal date of the manufacturer.|
|`delegatedTransfer`|`bool`|The delegated transfer status of the manufacturer.|


### modifyManufacturer

Modify a manufacturer in the system.


```solidity
function modifyManufacturer(
    bytes memory manufacturer,
    address vault,
    uint96 fee,
    uint256 withdrawDate,
    bool delegatedTransfer
) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The name of the manufacturer.|
|`vault`|`address`|The address of the manufacturer vault.|
|`fee`|`uint96`|The fee of the manufacturer.|
|`withdrawDate`|`uint256`|The withdrawal date of the manufacturer.|
|`delegatedTransfer`|`bool`|The delegated transfer status of the manufacturer.|


### manufacturerAdmins

Get the manufacturer admin level of a user.


```solidity
function manufacturerAdmins(bytes memory manufacturer, address user) external view override returns (uint8);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The manufacturer of the product.|
|`user`|`address`|The address of the user.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint8`|The level of the user.|


### setManufacturerFee

Update the manufacturer fee.


```solidity
function setManufacturerFee(bytes memory manufacturer, uint96 fee) external override;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The manufacturer of the product.|
|`fee`|`uint96`|The new fee of the manufacturer.|


### retractionTransferVault

retrieve a passport from a user to the brand vault (use when the product is returned)

*The token must have been minted.*

*The caller must be a manufacturer administrator level 2*


```solidity
function retractionTransferVault(uint256 tokenId) external override;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|uint256 ID of the token to retrieve.|


### manufacturerDelegatedTransfer

Transfer a product from a user to manufacturer's vault in case user has lost wallet access

*The token must have been minted.*

*The caller must be a manufacturer administrator level 2*

*Emits a {DelegatedTransfer} event.*


```solidity
function manufacturerDelegatedTransfer(address from, uint256 tokenId) external override;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`from`|`address`|The address of the product owner.|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product being transferred. require the brand has delegatedTransfer to true|


### setBaseURI

Set the base URI for the contract.


```solidity
function setBaseURI(string memory baseURI_) public;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`baseURI_`|`string`|The new base URI.|


### _baseURI

Get the base URI for the contract.


```solidity
function _baseURI() internal view virtual override returns (string memory);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`string`|The base URI.|


### setTokenURI

Set the token URI for a specific token.


```solidity
function setTokenURI(uint256 tokenId, string memory tokenUri) public;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product.|
|`tokenUri`|`string`|The new token URI.|


### batchSetTokenURI

Emits a {TokenURI} event for each successfully updated token.

*Sets the tokenURI for multiple tokens in a single call.*


```solidity
function batchSetTokenURI(uint256[] memory tokenIds, string[] memory tokenUris)
    external
    returns (uint256[] memory failedIds);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenIds`|`uint256[]`| Array of token IDs to update.|
|`tokenUris`|`string[]`|Array of token URIs corresponding to each token ID.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`failedIds`|`uint256[]`|Array of token IDs that failed to update due to validation errors. Requirements: - `tokenIds` and `tokenUris` must be of the same length. - The length of `tokenIds` must not exceed 20. - Each token must exist (i.e., have a non-empty manufacturer). - The caller must be the manufacturer of each token. - The caller must own each token. Emits: {TokenURI} for each successful update.|


### tokenURI

Get the token URI for a specific token.


```solidity
function tokenURI(uint256 tokenId) public view virtual override(IHoraeMPT, ERC721Upgradeable) returns (string memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`string`|The token URI.|


### _deleteWarranty

Delete the warranty of a product.

*Emits a {ProductWarrantyInfo} event.*


```solidity
function _deleteWarranty(uint256 tokenId) internal;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|The ID of the product.|


### createTokenId

Returns the tokenID based on manufacturer's name and current token count.


```solidity
function createTokenId(bytes memory manufacturer) internal returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|The brand name.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint256`|A uint256 representing the brand prefix.|


### _bytes20ToUint

utils function to cast a bytes20 to a uint256


```solidity
function _bytes20ToUint(bytes20 b) internal pure returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`b`|`bytes20`|the bytes20 to cast|


### _stringToUint

utils function to cast a string to a uint256


```solidity
function _stringToUint(string memory s) internal pure returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`s`|`string`|the string to cast|


### _contextSuffixLength

Override required by OpenZeppelin


```solidity
function _contextSuffixLength()
    internal
    view
    virtual
    override(ContextUpgradeable, ERC2771ContextUpgradeable)
    returns (uint256);
```

