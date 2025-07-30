# MaintenanceRecord
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/691863dffd9dd7d49d8d5592d3a03db09bb19a29/contracts/interfaces/IHoraeMPT.sol)

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

