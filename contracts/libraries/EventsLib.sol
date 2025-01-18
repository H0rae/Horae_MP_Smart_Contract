/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

/// @title EventsLib
/// @author : Horae
/// @notice : Library exposing events.

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
     * @notice Emits when a brand is added.
     * @param brand The name of the brand.
     * @param vaultAddress The address of the brand vault.
     * @param fee The fee associated with the brand.
     * @param withdrawtime The time when the brand can withdraw the minted certificate, UNIX.
     * @param delegatedTransferForUser if the brand can transfer for the user
     */
    event BrandAdded(
        bytes brand,
        address vaultAddress,
        uint96 fee,
        uint256 withdrawtime,
        bool delegatedTransferForUser
    );

    /**
     * @notice Emits when a brand is modified.
     * @param brand The name of the brand.
     * @param vaultAddress The address of the brand vault.
     * @param fee The fee associated with the brand.
     * @param withdrawtime The time when the brand can withdraw the minted certificate, UNIX.
     * @param delegatedTransferForUser if the brand can transfer for the user
     */
    event BrandModified(
        bytes brand,
        address vaultAddress,
        uint96 fee,
        uint256 withdrawtime,
        bool delegatedTransferForUser
    );

    /**
     * @notice Emits when a watch has been stolen or recovered.
     * @param tokenId The ID of the watch.
     * @param state The state of the watch.
     */
    event StolenStatus(uint256 indexed tokenId, bool state);

    /**
     * @notice Emits when a watch warranty information is added.
     * @param tokenId The ID of the watch.
     * @param brand The brand of the watch.
     * @param terms The terms of the warranty.
     * @param warrantyID The ID of the warranty.
     */
    event WatchWarrantyInfo(
        uint256 indexed tokenId,
        bytes brand,
        bytes terms,
        bytes warrantyID
    );

    /**
     * @notice Emits when a watch revision is added.
     * @param tokenId The ID of the watch.
     * @param nbWatchRevision The number of revisions for the watch.
     * @param info Information about the revision.
     * @param date The date of the revision.
     **/
    event WatchRevisionInfo(
        uint256 indexed tokenId,
        uint256 nbWatchRevision,
        bytes info,
        bytes date
    );

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
     * @param brand The brand of the watch.
     * @param watchReference The reference of the watch.
     * @param collection The collection of the watch.
     * @param model The model of the watch.
     * @param year The year of the watch.
     * @param uri The URI of the token.
     */
    event PassportMinted(
        address to,
        uint256 tokenId,
        bytes brand,
        bytes watchReference,
        bytes collection,
        bytes model,
        bytes year,
        string uri
    );

    /**
     * @notice Emits when a passport is burned.
     * @param tokenId The ID of the token.
     * @param brand The brand of the watch.
     */
    event PassportBurned(uint256 tokenId, bytes brand);

    /**
     * @notice Emits when Smart Contract Owner is changed.
     * @param newOwner The address of the new owner.
     */
    event OwnerChanged(address newOwner);

    /**
     * @notice Emits when an Horae admin is added or removed.
     * @param adminAddress The address of the user.
     * @param status The status of the user.
     */
    event HoraeAdminStatus(address adminAddress, bool status);

    /**
     * @notice Emits when a user is added or removed from a brand.
     * @param user The address of the user.
     * @param level The level of the user.
     * @param brand The brand of the user.
     */
    event BrandAdministratorStatus(address user, uint8 level, bytes brand);

    /**
     * @notice emits when a watch is transferred to the brand vault due to a retraction
     * @param from the address of the watch owner
     * @param tokenId the id of the watch
     * @param brand the brand of the watch
     */
    event RetractionTransfer(address from, uint256 tokenId, bytes brand);

    /**
     * @notice Emits when a watch is transferred to the brand vault due to a delegated transfer
     * @param from the address of the watch owner
     * @param tokenId the id of the watch
     * @param brand the brand of the watch
     */
    event DelegatedTransfer(address from, uint256 tokenId, bytes brand);

    /**
     * @notice Emits when Brand's fee is updated.
     * @param brand The brand for which the fee is being set.
     * @param fee The new fee value to set.
     */
    event BrandFeeUpdated(bytes brand, uint96 fee);
}