# MaintenanceRecord
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/9736ef106967a52e697e45ecf82f3a3756167223/contracts/interfaces/IHoraeMPT.sol)

Represents a maintenance record


```solidity
struct MaintenanceRecord {
    uint256 id;
    bytes date;
    bytes linkToDetails;
}
```

**Properties**

|Name|Type|Description|
|----|----|-----------|
|`id`|`uint256`|maintenance record ID|
|`date`|`bytes`|date of maintenance|
|`linkToDetails`|`bytes`|IPFS link to maintenance details|

