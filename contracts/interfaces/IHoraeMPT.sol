// SPDX-License-Identifier: UNLICENSED
// @author Original: Horae, Modified for Digital Passport
// @version : 1.0.0
// @notice : Interface for the Digital Passport contract
pragma solidity 0.8.26;

/**
 * @notice Represents a manufacturer/brand
 * @param fee associated to the manufacturer (royalties)
 * @param tokenMinted number of certificates minted
 * @param withdrawal_date time when manufacturer can withdraw minted certificate
 * @param vaultAddress address of the manufacturer's vault
 * @param delegatedTransfer if manufacturer can transfer on behalf of users
 */
struct Manufacturer {
    uint96 fee;
    uint256 tokenMinted;
    uint256 withdrawal_date;
    address vaultAddress;
    bool delegatedTransfer;
}

/**
 * @notice Represents a product
 * @param tokenId unique (on-chain) identifier of the product
 * @param hashID unique identifier
 * @param manufacturer name/identifier of the manufacturer
 * @param category product category (e.g., "watch", "jewelry", "art")
 * @param model product model identifier
 * @param collection product collection name
 * @param reference product reference number
 * @param productionDate date of manufacture
 * @param maintenanceCounter number of maintenance records
 * @param claimDate date when product was transferred to manufacturer vault
 * @param isStolen theft status
 */
struct Product {
    uint256 tokenId;
    bytes hashID;
    bytes manufacturer;
    bytes category;
    bytes model;
    bytes collection;
    bytes productReference;
    bytes productionDate;
    uint256 maintenanceCounter;
    uint256 claimDate;
    bool isStolen;
}

/**
 * @notice Represents a maintenance record
 * @param id maintenance record ID
 * @param date date of maintenance
 * @param linkToDetails IPFS link to maintenance details
 */
struct MaintenanceRecord {
    uint256 id;
    bytes date;
    bytes linkToDetails;
}

/**
 * @notice Represents product warranty
 * @param manufacturer issuer of the warranty
 * @param terms link to warranty terms
 * @param warrantyID unique warranty identifier
 */
struct Warranty {
    bytes manufacturer;
    bytes terms;
    bytes warrantyID;
}

/**
 * @notice Represents minting parameters
 * @param hashID unique product identifier
 * @param manufacturer product manufacturer
 * @param category product category
 * @param collection product collection
 * @param model product model
 * @param productReference
 * @param productionDate date of manufacture
 * @param maintenanceCounter initial maintenance counter
 * @param uri IPFS link to product passport
 */
struct MintParams {
    bytes hashID;
    bytes manufacturer;
    bytes category;
    bytes collection;
    bytes model;
    bytes productReference;
    bytes productionDate;
    uint maintenanceCounter;
    bytes uri;
}

interface IHoraeMPT {
    // View Functions
    function owner() external view returns (address);

    function baseURI() external view returns (string memory);

    function maintenanceCounter(uint256) external view returns (uint256);

    function listMaintenanceRecords(
        uint256
    ) external view returns (MaintenanceRecord[] memory);

    function productWarranty(uint256) external returns (Warranty memory);

    function manufacturerInfo(
        bytes memory
    ) external view returns (Manufacturer memory);

    function productInfo(uint256) external view returns (Product memory);

    function hashIDMinted(bytes memory) external view returns (bool);

    function systemAdmins(address) external view returns (bool);

    function manufacturerAdmins(
        bytes memory,
        address
    ) external view returns (uint8);

    // Administrative Functions
    function initialize(string memory baseURI_) external;

    function setPause() external;

    function setUnpause() external;

    function changeContractOwner(address newOwner) external;

    function setSystemAdmin(address _address, bool _status) external;

    function setManufacturerAdmin(
        address user,
        uint8 level,
        bytes memory manufacturer
    ) external;

    // Manufacturer Management
    function addManufacturer(
        bytes memory manufacturer,
        address adminAddress,
        address vault,
        uint96 fee,
        uint256 withdrawDate,
        bool delegatedTransfer
    ) external;

    function modifyManufacturer(
        bytes memory manufacturer,
        address vault,
        uint96 fee,
        uint256 withdrawDate,
        bool delegatedTransfer
    ) external;

    // URI Management
    function setBaseURI(string memory baseURI_) external;

    function setTokenURI(uint256 tokenId, string memory tokenUri) external;

    function batchSetTokenURI(
        uint256[] memory tokenIds,
        string[] memory tokenUris
    ) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);

    // Product Management
    function retractionTransferVault(uint256 tokenId) external;

    function manufacturerDelegatedTransfer(
        address from,
        uint256 tokenId
    ) external;

    function setStolenStatus(uint256 tokenId, bool isItStolen) external;

    function setMaintenanceRecord(
        uint256 tokenId,
        bytes memory date,
        bytes memory info
    ) external;

    function setProductWarranty(
        uint256 tokenId,
        bytes memory terms,
        bytes memory warrantyID
    ) external;

    function setManufacturerFee(bytes memory manufacturer, uint96 fee) external;

    // Minting and Burning
    function mint(MintParams memory args) external;

    function batchMint(
        MintParams[] memory _args,
        bytes calldata manufacturer
    ) external;

    function burn(uint256 tokenId) external;

    // Financial Functions
    function withdraw() external;

    function getBalance() external view returns (uint256);
}
