# Manufacturer
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/e15bbe0d1fdd5fff5e703ccf81701718bb0d8fbd/contracts/interfaces/IHoraeMPT.sol)

Represents a manufacturer/brand


```solidity
struct Manufacturer {
    uint96 fee;
    uint256 tokenMinted;
    uint256 withdrawal_date;
    address vaultAddress;
    bool delegatedTransfer;
}
```

**Properties**

|Name|Type|Description|
|----|----|-----------|
|`fee`|`uint96`|associated to the manufacturer (royalties)|
|`tokenMinted`|`uint256`|number of certificates minted|
|`withdrawal_date`|`uint256`|time when manufacturer can withdraw minted certificate|
|`vaultAddress`|`address`|address of the manufacturer's vault|
|`delegatedTransfer`|`bool`|if manufacturer can transfer on behalf of users|

