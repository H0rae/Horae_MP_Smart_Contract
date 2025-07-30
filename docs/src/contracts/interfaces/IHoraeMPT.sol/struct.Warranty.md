# Warranty
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/691863dffd9dd7d49d8d5592d3a03db09bb19a29/contracts/interfaces/IHoraeMPT.sol)

Represents product warranty


```solidity
struct Warranty {
    bytes manufacturer;
    bytes terms;
    bytes warrantyID;
}
```

**Properties**

|Name|Type|Description|
|----|----|-----------|
|`manufacturer`|`bytes`|issuer of the warranty|
|`terms`|`bytes`|link to warranty terms|
|`warrantyID`|`bytes`|unique warranty identifier|

