# Product
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/9736ef106967a52e697e45ecf82f3a3756167223/contracts/interfaces/IHoraeMPT.sol)

Represents a product


```solidity
struct Product {
    uint256 tokenId;
    bytes hashID;
    bytes manufacturer;
    bytes category;
    bytes model;
    bytes collection;
    bytes productReference;
    bytes productionDate;
    uint256 maintenanceCounter;
    uint256 claimDate;
    bool isStolen;
}
```

**Properties**

|Name|Type|Description|
|----|----|-----------|
|`tokenId`|`uint256`|unique (on-chain) identifier of the product|
|`hashID`|`bytes`|unique identifier|
|`manufacturer`|`bytes`|name/identifier of the manufacturer|
|`category`|`bytes`|product category (e.g., "watch", "jewelry", "art")|
|`model`|`bytes`|product model identifier|
|`collection`|`bytes`|product collection name|
|`productReference`|`bytes`||
|`productionDate`|`bytes`|date of manufacture|
|`maintenanceCounter`|`uint256`|number of maintenance records|
|`claimDate`|`uint256`|date when product was transferred to manufacturer vault|
|`isStolen`|`bool`|theft status|

