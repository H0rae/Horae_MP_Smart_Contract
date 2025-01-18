/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

///////////////////////////// ERROR CODES  /////////////////////////////
/// @dev Error codes for the Horae contract
/// @param E01 : Invalid URI
/// @param E02 : Invalid brand
/// @param E03 : Invalid collection
/// @param E04 : Invalid model
/// @param E05 : Invalid year
/// @param E06 : Invalid watch reference
/// @param E07 : Invalid address, address can't be the null address
/// @param E08 : Invalid level
/// @param E09 : Serial number already declared
/// @param E10 : Brand already declared
/// @param E11 : Brand is not declared
/// @param E12 : Watch is stolen
/// @param E13 : Token does not exist
/// @param E14 : Not in vault
/// @param E15 : Time expired
/// @param E16 : Brand has not authorized delegatedTransferForUser

/// @title ErrorsLib
/// @author : Horae
/// @notice : Library exposing errors.
library ErrorsLib {
    /// @notice Thrown when the URI has a length of 0.
    string internal constant INVALID_URI = "E01";

    /// @notice Thrown when the brand has a length of 0.
    string internal constant INVALID_BRAND = "E02";

    /// @notice Thrown when the collection has a length of 0.
    string internal constant INVALID_COLLECTION = "E03";

    /// @notice Thrown when the model has a length of 0.
    string internal constant INVALID_MODEL = "E04";

    /// @notice Thrown when the year has a length of 0.
    string internal constant INVALID_YEAR = "E05";

    /// @notice Thrown when the reference has a length of 0.
    string internal constant INVALID_REFERENCE = "E06";

    /// @notice Thrown when the address is invalid.
    string internal constant INVALID_ADDRESS = "E07";

    /// @notice Thrown when the admin level is invalid.
    string internal constant INVALID_LEVEL = "E08";

    /// @notice Thrown when the serial number has already been declared.
    string internal constant SERIAL_NUMBER_ALREADY_DECLARED = "E09";

    /// @notice Thrown when the brand has already been declared.
    string internal constant BRAND_ALREADY_DECLARED = "E10";

    /// @notice Thrown when the brand has not been declared.
    string internal constant BRAND_NOT_DECLARED = "E11";

    /// @notice Thrown when the watch is stolen.
    string internal constant WATCH_STOLEN = "E12";

    /// @notice Thrown when the token does not exist.
    string internal constant TOKEN_NOT_EXISTS = "E13";

    /// @notice Thrown when a watch is not in the brand vault.
    string internal constant NOT_IN_VAULT = "E14";

    /// @notice Thrown when the operation is attempted after the allowed time period has expired.
    string internal constant TIME_EXPIRED = "E15";

    /// @notice Thrown when the brand has not authorized delegated transfer for the user.
    string internal constant UNAUTH_DT = "E16";
}