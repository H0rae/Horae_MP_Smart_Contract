# ErrorsLib
[Git Source](https://github.com/H0rae/Horae_MP_Smart_Contract/blob/691863dffd9dd7d49d8d5592d3a03db09bb19a29/contracts/libraries/ErrorsLib.sol)

**Author:**
: Horae

SPDX-License-Identifier: UNLICENSED

: Library exposing errors for the HoraeMPT contract.

*Error codes for the HoraeMPT contract
E01 : Invalid URI
E02 : Invalid manufacturer
E03 : Invalid category
E04 : Invalid model
E05 : Invalid production date
E06 : Invalid product reference
E07 : Invalid address, address can't be the null address
E08 : Invalid level
E09 : Product ID already declared
E10 : Manufacturer already declared
E11 : Manufacturer is not declared
E12 : Product is stolen
E13 : Token does not exist
E14 : Not in vault
E15 : Time expired
E16 : Manufacturer has not authorized delegated transfer*


## State Variables
### INVALID_URI
Thrown when the URI has a length of 0.


```solidity
string internal constant INVALID_URI = "E01";
```


### INVALID_MANUFACTURER
Thrown when the manufacturer has a length of 0.


```solidity
string internal constant INVALID_MANUFACTURER = "E02";
```


### INVALID_CATEGORY
Thrown when the category has a length of 0.


```solidity
string internal constant INVALID_CATEGORY = "E03";
```


### INVALID_MODEL
Thrown when the model has a length of 0.


```solidity
string internal constant INVALID_MODEL = "E04";
```


### INVALID_PRODUCTION_DATE
Thrown when the production date has a length of 0.


```solidity
string internal constant INVALID_PRODUCTION_DATE = "E05";
```


### INVALID_REFERENCE
Thrown when the reference has a length of 0.


```solidity
string internal constant INVALID_REFERENCE = "E06";
```


### INVALID_ADDRESS
Thrown when the address is invalid.


```solidity
string internal constant INVALID_ADDRESS = "E07";
```


### INVALID_LEVEL
Thrown when the admin level is invalid.


```solidity
string internal constant INVALID_LEVEL = "E08";
```


### PRODUCT_ID_ALREADY_DECLARED
Thrown when the product ID has already been declared.


```solidity
string internal constant PRODUCT_ID_ALREADY_DECLARED = "E09";
```


### MANUFACTURER_ALREADY_DECLARED
Thrown when the manufacturer has already been declared.


```solidity
string internal constant MANUFACTURER_ALREADY_DECLARED = "E10";
```


### MANUFACTURER_NOT_DECLARED
Thrown when the manufacturer has not been declared.


```solidity
string internal constant MANUFACTURER_NOT_DECLARED = "E11";
```


### PRODUCT_STOLEN
Thrown when the product is stolen.


```solidity
string internal constant PRODUCT_STOLEN = "E12";
```


### TOKEN_NOT_EXISTS
Thrown when the token does not exist.


```solidity
string internal constant TOKEN_NOT_EXISTS = "E13";
```


### NOT_IN_VAULT
Thrown when a product is not in the manufacturer vault.


```solidity
string internal constant NOT_IN_VAULT = "E14";
```


### TIME_EXPIRED
Thrown when the operation is attempted after the allowed time period has expired.


```solidity
string internal constant TIME_EXPIRED = "E15";
```


### UNAUTH_DT
Thrown when the manufacturer has not authorized delegated transfer.


```solidity
string internal constant UNAUTH_DT = "E16";
```


### INVALID_COLLECTION
Thrown when the manufacturer has not authorized delegated transfer.


```solidity
string internal constant INVALID_COLLECTION = "E17";
```


### TOO_MANY_ARGUMENTS
Thrown when the manufacturer has not authorized delegated transfer.


```solidity
string internal constant TOO_MANY_ARGUMENTS = "E18";
```


