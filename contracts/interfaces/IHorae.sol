// SPDX-License-Identifier: UNLICENSED
// @author : Horae
// @version : 4.0.0
// @notice : This contract is a test contract of the Horae project. It is used to mint NFTs and to manage the attributes of the NFTs.
pragma solidity 0.8.28;

/**
 * @notice Represents a brand
 * @param fee associated to the brand (royalties)
 * @param tokenMinted number of certificate that the brand has minted
 * @param withdrawal_date time when the brand can withdraw the minted certificate
 * @param brandVaultAddress address of the brand Vault
 * @param delegatedTransferForUser if the brand can transfer for the user
 */
struct Brand {
    uint96 fee;
    uint256 tokenMinted;
    uint256 withdrawal_date;
    address brandVaultAddress;
    bool delegatedTransferForUser;
}

/**
 * @notice Represents a watch
 * @param tokenId: id of the watch
 * @param brand: brand of the watch
 * @param model: model of the watch
 * @param collection: collection of the watch
 * @param watchReference: reference of the watch
 * @param year: year of the watch
 * @param watchRevisionCounter: number of revision for the watch
 * @param claimDate: date when the watch has been transferred to the brand vault
 * @param isStolen: if the watch is stolen
 */
struct Watch {
    uint256 tokenId;
    bytes watchID;
    bytes brand;
    bytes model;
    bytes collection;
    bytes watchReference;
    bytes year;
    uint256 watchRevisionCounter;
    uint256 claimDate;
    bool isStolen;
}

/**
 * @notice Represents a watch revision
 * @param id: id of the revision {0,1,...}
 * @param date: date of the revision
 * @param linkToDetails: IPFS link to the watch revision infos
 */
struct WatchRevision {
    uint256 id;
    bytes date;
    bytes linkToDetails;
}

/**
 * @notice Represents watch warranty
 * @param brand: brand (issuer) associated to the warranty
 * @param terms: link to warranty terms
 * @param warrantyID: id of the warranty.
 */
struct Warranty {
    bytes brand;
    bytes terms;
    bytes warrantyID;
}

/**
 * @notice Represents a minting struct
 * @param watchID: serial number of the watch
 * @param brand: brand of the watch
 * @param collection: collection of the watch
 * @param model: model of the watch
 * @param watchReference: reference of the watch
 * @param year: year of the watch
 * @param revisionCounter: number of revision for the watch
 * @param uri: IPFS link to the watch passport
 */
struct MintStruct {
    bytes watchID;
    bytes brand;
    bytes collection;
    bytes model;
    bytes watchReference;
    bytes year;
    uint revisionCounter;
    bytes uri;
}

interface IHorae {
    function owner() external view returns (address);

    function baseURI() external view returns (string memory);

    function watchRevisionCounter(uint256) external view returns (uint256);

    function listWatchRevision(
        uint256
    ) external view returns (WatchRevision[] memory);

    function watchWarranty(uint256) external returns (Warranty memory);

    function brandInfo(bytes memory) external view returns (Brand memory);

    function watchInfo(uint256) external view returns (Watch memory);

    function serialNumberMinted(bytes memory) external view returns (bool);

    function horaeAdmins(address) external view returns (bool);

    function administrators(
        bytes memory,
        address
    ) external view returns (uint8);

    // Functions
    function initialize(string memory baseURI_) external;

    function setPause() external;

    function setUnpause() external;

    function changeContractOwner(address newOwner) external;

    function setHoraeAdmin(address _address, bool _status) external;

    function setBrandAdministrator(
        address user,
        uint8 level,
        bytes memory brand
    ) external;

    function addBrand(
        bytes memory brand,
        address adminAddress,
        address brandVault,
        uint96 fee,
        uint256 withdrawDate,
        bool delegatedTransferForUser
    ) external;

    function modifyBrand(
        bytes memory brand,
        address brandVault,
        uint96 fee,
        uint256 withdrawDate,
        bool delegatedTransferForUser
    ) external;

    function setBaseURI(string memory baseURI_) external;

    function setTokenURI(uint256 tokenId, string memory tokenUri) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function retractionTransferVault(uint256 tokenId) external;

    function brandDelegatedTransferForUser(
        address from,
        uint256 tokenId
    ) external;

    function setStolenStatus(uint256 tokenId, bool isItStolen) external;

    function setWatchRevision(
        uint256 tokenId,
        bytes memory date,
        bytes memory info
    ) external;

    function setWatchWarranty(
        uint256 tokenId,
        bytes memory terms,
        bytes memory warrantyID
    ) external;

    function setBrandFee(bytes memory brand, uint96 fee) external;

    function mint(MintStruct memory args) external;

    function batchMint(
        MintStruct[] memory _args,
        bytes calldata brand
    ) external;

    function burn(uint256 tokenId) external;

    function withdraw() external;

    function getBalance() external view returns (uint256);
}