# Warranty
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/9736ef106967a52e697e45ecf82f3a3756167223/contracts/interfaces/IHoraeMPT.sol)

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

