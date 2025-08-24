// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

/// @title ErrorsLib
/// @notice Custom errors for the HoraeMPT contract
library ErrorsLib {
    error InvalidURI();
    error InvalidManufacturer();
    error InvalidCategory();
    error InvalidModel();
    error InvalidProductionDate();
    error InvalidReference();
    error InvalidAddress();
    error InvalidLevel();
    error ProductIdAlreadyDeclared();
    error MaintenanceNotFound();
    error ManufacturerAlreadyDeclared();
    error ManufacturerNotDeclared();
    error ProductStolen();
    error TokenDoesNotExist();
    error NotInVault();
    error TimeExpired();
    error UnauthorizedDelegatedTransfer();
    error InvalidCollection();
    error TooManyArguments();
    error TransferFailed();
    error MismatchedInputsLength();
}
