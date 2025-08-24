# Warranty
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/e15bbe0d1fdd5fff5e703ccf81701718bb0d8fbd/contracts/interfaces/IHoraeMPT.sol)

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

