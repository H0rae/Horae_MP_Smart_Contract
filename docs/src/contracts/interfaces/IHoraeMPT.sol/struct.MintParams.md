# MintParams
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/691863dffd9dd7d49d8d5592d3a03db09bb19a29/contracts/interfaces/IHoraeMPT.sol)

Represents minting parameters


```solidity
struct MintParams {
    bytes hashID;
    bytes manufacturer;
    bytes category;
    bytes collection;
    bytes model;
    bytes productReference;
    bytes productionDate;
    uint256 maintenanceCounter;
    bytes uri;
}
```

**Properties**

|Name|Type|Description|
|----|----|-----------|
|`hashID`|`bytes`|unique product identifier|
|`manufacturer`|`bytes`|product manufacturer|
|`category`|`bytes`|product category|
|`collection`|`bytes`|product collection|
|`model`|`bytes`|product model|
|`productReference`|`bytes`||
|`productionDate`|`bytes`|date of manufacture|
|`maintenanceCounter`|`uint256`|initial maintenance counter|
|`uri`|`bytes`|IPFS link to product passport|

