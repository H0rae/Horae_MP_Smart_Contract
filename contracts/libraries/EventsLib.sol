// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

/// @title EventsLib
/// @author : Horae
/// @notice : Library exposing events for the HoraeMPT contract.

library EventsLib {
    /**
     * @notice Emits when a token URI is added or changed.
     * @param tokenId The ID of the token.
     * @param tokenURI The URI of the token.
     */
    event TokenURI(uint256 indexed tokenId, string tokenURI);

    /**
     * @notice Emits when the base URI is changed.
     * @param baseURI The new base URI.
     */
    event BaseURIChanged(string baseURI);

    /**
     * @notice Emits when a manufacturer is added.
     * @param manufacturer The name of the manufacturer.
     * @param vaultAddress The address of the manufacturer vault.
     * @param fee The fee associated with the manufacturer.
     * @param withdrawtime The time when the manufacturer can withdraw the minted certificate, UNIX.
     * @param delegatedTransfer if the manufacturer can transfer for the user
     */
    event ManufacturerAdded(
        bytes manufacturer,
        address vaultAddress,
        uint96 fee,
        uint256 withdrawtime,
        bool delegatedTransfer
    );

    /**
     * @notice Emits when a manufacturer is modified.
     * @param manufacturer The name of the manufacturer.
     * @param vaultAddress The address of the manufacturer vault.
     * @param fee The fee associated with the manufacturer.
     * @param withdrawtime The time when the manufacturer can withdraw the minted certificate, UNIX.
     * @param delegatedTransfer if the manufacturer can transfer for the user
     */
    event ManufacturerModified(
        bytes manufacturer,
        address vaultAddress,
        uint96 fee,
        uint256 withdrawtime,
        bool delegatedTransfer
    );

    /**
     * @notice Emits when a product has been stolen or recovered.
     * @param tokenId The ID of the product.
     * @param state The state of the product.
     */
    event StolenStatus(uint256 indexed tokenId, bool state);

    /**
     * @notice Emits when a product warranty information is added.
     * @param tokenId The ID of the product.
     * @param manufacturer The manufacturer of the product.
     * @param terms The terms of the warranty.
     * @param warrantyID The ID of the warranty.
     */
    event ProductWarrantyInfo(
        uint256 indexed tokenId,
        bytes manufacturer,
        bytes terms,
        bytes warrantyID
    );

    /**
     * @notice Emits when a maintenance record is added.
     * @param tokenId The ID of the product.
     * @param maintenanceCount The number of maintenance records for the product.
     * @param info Information about the maintenance.
     * @param date The date of the maintenance.
     **/
    event MaintenanceRecordInfo(
        uint256 indexed tokenId,
        uint256 maintenanceCount,
        bytes info,
        bytes date
    );

    /**
     * @notice Emits when a maintenance record is deleted.
     * @param tokenId The ID of the product.
     * @param maintenanceId The id of the maintenance that has been deleted.
     **/
    event MaintenanceRecordDeleted(uint256 tokenId, uint256 maintenanceId);

    /**
     * @notice Emits when ETH are received.
     */
    event Received(address, uint256);

    /**
     * @notice Emits when the version changed.
     */
    event NewVersion(string indexed upgrade);

    /**
     * @notice Emits when a passport is minted.
     * @param to The address of the token owner.
     * @param tokenId The ID of the token.
     * @param manufacturer The manufacturer of the product.
     * @param category The category of the product.
     * @param productreference The reference of the product.
     * @param collection The collection of the product.
     * @param model The model of the product.
     * @param productionDate The production date of the product.
     * @param uri The URI of the token.
     */
    event PassportMinted(
        address to,
        uint256 tokenId,
        bytes manufacturer,
        bytes category,
        bytes productreference,
        bytes collection,
        bytes model,
        bytes productionDate,
        string uri
    );

    /**
     * @notice Emits when a passport is burned.
     * @param tokenId The ID of the token.
     * @param manufacturer The manufacturer of the product.
     */
    event PassportBurned(uint256 tokenId, bytes manufacturer);

    /**
     * @notice Emits when Smart Contract Owner is changed.
     * @param newOwner The address of the new owner.
     */
    event OwnerChanged(address newOwner);

    /**
     * @notice Emits when a system admin is added or removed.
     * @param adminAddress The address of the user.
     * @param status The status of the user.
     */
    event SystemAdminStatus(address adminAddress, bool status);

    /**
     * @notice Emits when a user is added or removed from a manufacturer.
     * @param user The address of the user.
     * @param level The level of the user.
     * @param manufacturer The manufacturer of the user.
     */
    event ManufacturerAdministratorStatus(
        address user,
        uint8 level,
        bytes manufacturer
    );

    /**
     * @notice emits when a product is transferred to the manufacturer vault due to a retraction
     * @param from the address of the product owner
     * @param tokenId the id of the product
     * @param manufacturer the manufacturer of the product
     */
    event RetractionTransfer(address from, uint256 tokenId, bytes manufacturer);

    /**
     * @notice Emits when a product is transferred to the manufacturer vault due to a delegated transfer
     * @param from the address of the product owner
     * @param tokenId the id of the product
     * @param manufacturer the manufacturer of the product
     */
    event DelegatedTransfer(address from, uint256 tokenId, bytes manufacturer);

    /**
     * @notice Emits when Manufacturer's fee is updated.
     * @param manufacturer The manufacturer for which the fee is being set.
     * @param fee The new fee value to set.
     */
    event ManufacturerFeeUpdated(bytes manufacturer, uint96 fee);
}
