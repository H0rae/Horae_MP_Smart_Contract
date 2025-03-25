/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

///////////////////////////// ERROR CODES  /////////////////////////////
/// @dev Error codes for the HoraeMPT contract
///  E01 : Invalid URI
///  E02 : Invalid manufacturer
/// E03 : Invalid category
///  E04 : Invalid model
///  E05 : Invalid production date
///  E06 : Invalid product reference
///  E07 : Invalid address, address can't be the null address
///  E08 : Invalid level
///  E09 : Product ID already declared
///  E10 : Manufacturer already declared
///  E11 : Manufacturer is not declared
///  E12 : Product is stolen
/// E13 : Token does not exist
/// E14 : Not in vault
///  E15 : Time expired
///  E16 : Manufacturer has not authorized delegated transfer
/// @title ErrorsLib
/// @author : Horae
/// @notice : Library exposing errors for the HoraeMPT contract.
library ErrorsLib {
    /// @notice Thrown when the URI has a length of 0.
    string internal constant INVALID_URI = "E01";
    /// @notice Thrown when the manufacturer has a length of 0.
    string internal constant INVALID_MANUFACTURER = "E02";
    /// @notice Thrown when the category has a length of 0.
    string internal constant INVALID_CATEGORY = "E03";
    /// @notice Thrown when the model has a length of 0.
    string internal constant INVALID_MODEL = "E04";
    /// @notice Thrown when the production date has a length of 0.
    string internal constant INVALID_PRODUCTION_DATE = "E05";
    /// @notice Thrown when the reference has a length of 0.
    string internal constant INVALID_REFERENCE = "E06";
    /// @notice Thrown when the address is invalid.
    string internal constant INVALID_ADDRESS = "E07";
    /// @notice Thrown when the admin level is invalid.
    string internal constant INVALID_LEVEL = "E08";
    /// @notice Thrown when the product ID has already been declared.
    string internal constant PRODUCT_ID_ALREADY_DECLARED = "E09";
    /// @notice Thrown when the manufacturer has already been declared.
    string internal constant MANUFACTURER_ALREADY_DECLARED = "E10";
    /// @notice Thrown when the manufacturer has not been declared.
    string internal constant MANUFACTURER_NOT_DECLARED = "E11";
    /// @notice Thrown when the product is stolen.
    string internal constant PRODUCT_STOLEN = "E12";
    /// @notice Thrown when the token does not exist.
    string internal constant TOKEN_NOT_EXISTS = "E13";
    /// @notice Thrown when a product is not in the manufacturer vault.
    string internal constant NOT_IN_VAULT = "E14";
    /// @notice Thrown when the operation is attempted after the allowed time period has expired.
    string internal constant TIME_EXPIRED = "E15";
    /// @notice Thrown when the manufacturer has not authorized delegated transfer.
    string internal constant UNAUTH_DT = "E16";
    /// @notice Thrown when the manufacturer has not authorized delegated transfer.
    string internal constant INVALID_COLLECTION = "E17";
}
