# MaintenanceRecord
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/e15bbe0d1fdd5fff5e703ccf81701718bb0d8fbd/contracts/interfaces/IHoraeMPT.sol)

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

