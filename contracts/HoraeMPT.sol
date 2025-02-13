// SPDX-License-Identifier: UNLICENSED
// @author Horae
// @version : 1.0
// @notice : This contract is the HoraeMPT (Multi-Product Tracking) system. It manages digital product passports as NFTs.
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721RoyaltyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import {Manufacturer, Product, MaintenanceRecord, Warranty, MintParams, IHoraeMPT} from "./interfaces/IHoraeMPT.sol";
import {ErrorsLib} from "./libraries/ErrorsLib.sol";
import {EventsLib} from "./libraries/EventsLib.sol";

/**
 * @title HoraeMPT Smart Contract
 * @author Horae Tech team
 * @notice Manages the minting and attributes of NFTs representing digital product passports.
 */
contract HoraeMPT is
    IHoraeMPT,
    Initializable,
    UUPSUpgradeable,
    ERC2771ContextUpgradeable,
    ERC721RoyaltyUpgradeable,
    PausableUpgradeable
{
    ///////////////////////////// VARIABLES  /////////////////////////////
    /// @inheritdoc IHoraeMPT
    address public owner;

    /// @inheritdoc IHoraeMPT
    string public baseURI;

    mapping(uint256 => string) internal _tokenURIs;
    /// @inheritdoc IHoraeMPT
    mapping(uint256 => uint256) public maintenanceCounter;

    mapping(uint256 => MaintenanceRecord[]) internal _listMaintenanceRecords;

    mapping(uint256 => Warranty) private _productWarranty;

    mapping(bytes => Manufacturer) private _manufacturerInfo;

    mapping(uint256 => Product) private _productInfo;
    /// @inheritdoc IHoraeMPT
    mapping(bytes => bool) public productIDMinted;
    /// @inheritdoc IHoraeMPT
    mapping(address => bool) public systemAdmins;
    mapping(bytes => mapping(address => uint8)) public administrators;

    ///////////////////////////// CONSTRUCTOR  /////////////////////////////
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        address trustedForwarder
    ) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    function productWarranty(
        uint256 tokenId
    ) external view override returns (Warranty memory) {
        return _productWarranty[tokenId];
    }

    function manufacturerInfo(
        bytes memory name
    ) external view override returns (Manufacturer memory) {
        return _manufacturerInfo[name];
    }

    function productInfo(
        uint256 tokenId
    ) external view override returns (Product memory) {
        return _productInfo[tokenId];
    }

    function listMaintenanceRecords(
        uint256 tokenId
    ) external view override returns (MaintenanceRecord[] memory) {
        return _listMaintenanceRecords[tokenId];
    }

    /**
     * @notice Initializes the HoraeMPT contract with a base URI and sets the deployer as the initial administrator.
     */
    function initialize(string memory baseURI_) public initializer {
        __ERC721_init("HoraeMPT", "HMPT");
        __ERC721Royalty_init_unchained();
        __Pausable_init();
        __UUPSUpgradeable_init();

        baseURI = baseURI_;
        owner = _msgSender();
        systemAdmins[owner] = true;
        setBaseURI(baseURI_);
    }

    ///////////////////////////// MODIFIERS  /////////////////////////////
    function _onlySystem() private view {
        require(systemAdmins[_msgSender()], ErrorsLib.INVALID_LEVEL);
    }

    function _onlyManufacturer(bytes memory manufacturer) private view {
        require(
            administrators[manufacturer][_msgSender()] >= 1 ||
                systemAdmins[_msgSender()],
            ErrorsLib.INVALID_LEVEL
        );
    }

    function _onlyProductOwnerOrManufacturer(
        bytes memory manufacturer,
        uint256 tokenId
    ) private view {
        require(
            (administrators[manufacturer][_msgSender()] >= 1 ||
                systemAdmins[_msgSender()] ||
                _ownerOf(tokenId) == _msgSender()),
            ErrorsLib.INVALID_LEVEL
        );
    }

    function _onlyManufacturerAdmin(bytes memory manufacturer) private view {
        require(
            administrators[manufacturer][_msgSender()] == 2 ||
                systemAdmins[_msgSender()],
            ErrorsLib.INVALID_LEVEL
        );
    }

    function _onlyOwner() private view {
        require(owner == _msgSender(), ErrorsLib.INVALID_LEVEL);
    }

    function checkExistAndStolen(uint256 tokenId) private view {
        _requireOwned(tokenId);
        require(!_productInfo[tokenId].isStolen, ErrorsLib.PRODUCT_STOLEN);
    }

    function checkIfStolen(uint256 tokenId) private view {
        require(!_productInfo[tokenId].isStolen, ErrorsLib.PRODUCT_STOLEN);
    }

    ///////////////////////////// UTILS  /////////////////////////////
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721RoyaltyUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address) internal view override {
        _onlyOwner();
    }

    receive() external payable {
        emit EventsLib.Received(_msgSender(), msg.value);
    }

    fallback() external payable {
        emit EventsLib.Received(_msgSender(), msg.value);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public {
        _onlyOwner();
        payable(_msgSender()).transfer(address(this).balance);
    }

    function setPause() public {
        _onlySystem();
        PausableUpgradeable._pause();
    }

    function setUnpause() public {
        _onlySystem();
        PausableUpgradeable._unpause();
    }

    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }

    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721Upgradeable) returns (address) {
        address from = _ownerOf(tokenId);

        checkIfStolen(tokenId);
        if (
            from ==
            _manufacturerInfo[_productInfo[tokenId].manufacturer].vaultAddress
        ) {
            _productInfo[tokenId].claimDate = block.timestamp;
        }
        if (
            to ==
            _manufacturerInfo[_productInfo[tokenId].manufacturer]
                .vaultAddress &&
            _productInfo[tokenId].claimDate != 0
        ) {
            _productInfo[tokenId].claimDate = 0;
        }

        return super._update(to, tokenId, auth);
    }

    ///////////////////////////// MINT & BURN  /////////////////////////////
    function mint(MintParams memory args) public whenNotPaused {
        _onlyManufacturerAdmin(args.manufacturer);
        require(args.uri.length != 0, ErrorsLib.INVALID_URI);
        require(args.manufacturer.length != 0, ErrorsLib.INVALID_MANUFACTURER);
        require(args.category.length != 0, ErrorsLib.INVALID_CATEGORY);
        require(args.collection.length != 0, ErrorsLib.INVALID_COLLECTION);
        require(args.model.length != 0, ErrorsLib.INVALID_MODEL);
        require(
            args.productionDate.length != 0,
            ErrorsLib.INVALID_PRODUCTION_DATE
        );
        require(args.productReference.length != 0, ErrorsLib.INVALID_REFERENCE);
        require(
            !productIDMinted[args.productID],
            ErrorsLib.PRODUCT_ID_ALREADY_DECLARED
        );

        uint tokenId = createTokenId(args.manufacturer);
        _productInfo[tokenId] = Product(
            tokenId,
            args.productID,
            args.manufacturer,
            args.category,
            args.model,
            args.collection,
            args.productReference,
            args.productionDate,
            0,
            0,
            false
        );

        productIDMinted[args.productID] = true;
        _setTokenRoyalty(
            tokenId,
            _manufacturerInfo[args.manufacturer].vaultAddress,
            _manufacturerInfo[args.manufacturer].fee
        );
        _safeMint(_manufacturerInfo[args.manufacturer].vaultAddress, tokenId);
        setTokenURI(tokenId, string(args.uri));

        emit EventsLib.PassportMinted(
            _manufacturerInfo[args.manufacturer].vaultAddress,
            tokenId,
            args.manufacturer,
            args.category,
            args.productReference,
            args.collection,
            args.model,
            args.productionDate,
            string(args.uri)
        );
    }

    function batchMint(
        MintParams[] memory _args,
        bytes calldata manufacturer
    ) external whenNotPaused {
        _onlyManufacturerAdmin(manufacturer);
        for (uint i = 0; i < _args.length; i++) {
            mint(_args[i]);
        }
    }

    function burn(uint256 tokenId) external whenNotPaused {
        _onlyManufacturerAdmin(_productInfo[tokenId].manufacturer);
        require(
            ownerOf(tokenId) ==
                _manufacturerInfo[_productInfo[tokenId].manufacturer]
                    .vaultAddress,
            ErrorsLib.NOT_IN_VAULT
        );

        bytes memory manufacturer = _productInfo[tokenId].manufacturer;

        _deleteWarranty(tokenId);
        delete _listMaintenanceRecords[tokenId];
        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }
        delete productIDMinted[_productInfo[tokenId].productID];
        delete _productInfo[tokenId];

        _burn(tokenId);

        emit EventsLib.PassportBurned(tokenId, manufacturer);
    }

    ///////////////////////////// PRODUCT STATUS FUNCTIONS /////////////////////////////
    function setStolenStatus(
        uint256 tokenId,
        bool isItStolen
    ) external override {
        _onlyProductOwnerOrManufacturer(
            _productInfo[tokenId].manufacturer,
            tokenId
        );
        _requireOwned(tokenId);
        _productInfo[tokenId].isStolen = isItStolen;
        emit EventsLib.StolenStatus(tokenId, _productInfo[tokenId].isStolen);
    }

    function setMaintenanceRecord(
        uint256 tokenId,
        bytes memory date,
        bytes memory info
    ) external override {
        _onlyManufacturer(_productInfo[tokenId].manufacturer);
        checkExistAndStolen(tokenId);
        _listMaintenanceRecords[tokenId].push(
            MaintenanceRecord(
                _productInfo[tokenId].maintenanceCounter,
                date,
                info
            )
        );
        _productInfo[tokenId].maintenanceCounter++;
        emit EventsLib.MaintenanceRecordInfo(
            tokenId,
            _productInfo[tokenId].maintenanceCounter,
            info,
            date
        );
    }

    function setProductWarranty(
        uint256 tokenId,
        bytes memory terms,
        bytes memory warrantyID
    ) external override {
        _onlyManufacturerAdmin(_productInfo[tokenId].manufacturer);
        checkExistAndStolen(tokenId);
        _productWarranty[tokenId] = Warranty(
            _productInfo[tokenId].manufacturer,
            terms,
            warrantyID
        );
        emit EventsLib.ProductWarrantyInfo(
            tokenId,
            _productInfo[tokenId].manufacturer,
            terms,
            warrantyID
        );
    }

    ///////////////////////////// ROLES  /////////////////////////////
    function changeContractOwner(address newOwner) external {
        _onlyOwner();
        require(newOwner != address(0), ErrorsLib.INVALID_ADDRESS);
        systemAdmins[owner] = false;
        systemAdmins[newOwner] = true;
        owner = newOwner;
        emit EventsLib.OwnerChanged(owner);
    }

    function setSystemAdmin(address _address, bool _status) external {
        _onlyOwner();
        systemAdmins[_address] = _status;
        emit EventsLib.SystemAdminStatus(_address, _status);
    }

    function setManufacturerAdmin(
        address user,
        uint8 level,
        bytes memory manufacturer
    ) public {
        _onlySystem();
        require(level <= 2 && level >= 0, ErrorsLib.INVALID_LEVEL);
        require(manufacturer.length != 0, ErrorsLib.INVALID_MANUFACTURER);
        require(user != address(0), ErrorsLib.INVALID_ADDRESS);
        require(
            _manufacturerInfo[manufacturer].vaultAddress != address(0),
            ErrorsLib.INVALID_MANUFACTURER
        );
        administrators[manufacturer][user] = level;
        emit EventsLib.ManufacturerAdministratorStatus(
            user,
            level,
            manufacturer
        );
    }

    function addManufacturer(
        bytes memory manufacturer,
        address adminAddress,
        address vault,
        uint96 fee,
        uint256 withdrawDate,
        bool delegatedTransfer
    ) external {
        _onlySystem();
        require(
            _manufacturerInfo[manufacturer].vaultAddress == address(0),
            ErrorsLib.MANUFACTURER_ALREADY_DECLARED
        );
        require(vault != address(0), ErrorsLib.INVALID_ADDRESS);

        _manufacturerInfo[manufacturer] = Manufacturer(
            fee,
            0,
            withdrawDate,
            vault,
            delegatedTransfer
        );
        setManufacturerAdmin(adminAddress, 2, manufacturer);

        emit EventsLib.ManufacturerAdded(
            manufacturer,
            vault,
            fee,
            withdrawDate,
            delegatedTransfer
        );
    }

    function modifyManufacturer(
        bytes memory manufacturer,
        address vault,
        uint96 fee,
        uint256 withdrawDate,
        bool delegatedTransfer
    ) external {
        _onlySystem();
        require(
            _manufacturerInfo[manufacturer].vaultAddress != address(0),
            ErrorsLib.MANUFACTURER_NOT_DECLARED
        );

        if (fee != _manufacturerInfo[manufacturer].fee) {
            _manufacturerInfo[manufacturer].fee = fee;
        }
        if (withdrawDate != _manufacturerInfo[manufacturer].withdrawal_date) {
            _manufacturerInfo[manufacturer].withdrawal_date = withdrawDate;
        }
        if (vault != address(0)) {
            _manufacturerInfo[manufacturer].vaultAddress = vault;
        }
        if (
            delegatedTransfer !=
            _manufacturerInfo[manufacturer].delegatedTransfer
        ) {
            _manufacturerInfo[manufacturer]
                .delegatedTransfer = delegatedTransfer;
        }

        emit EventsLib.ManufacturerModified(
            manufacturer,
            vault,
            fee,
            withdrawDate,
            delegatedTransfer
        );
    }

    ///////////////////////////// MANUFACTURER ADMIN FUNCTIONS /////////////////////////////
    function manufacturerAdmins(
        bytes memory manufacturer,
        address user
    ) external view override returns (uint8) {
        return administrators[manufacturer][user];
    }

    function setManufacturerFee(
        bytes memory manufacturer,
        uint96 fee
    ) external override {
        _onlySystem();
        _manufacturerInfo[manufacturer].fee = fee;
        emit EventsLib.ManufacturerFeeUpdated(manufacturer, fee);
    }

    ///////////////////////////// TRANSFER FUNCTIONS /////////////////////////////
    function retractionTransferVault(uint256 tokenId) external override {
        address prevOwner = _ownerOf(tokenId);
        _onlyManufacturerAdmin(_productInfo[tokenId].manufacturer);
        _requireOwned(tokenId);
        require(
            block.timestamp <
                (_productInfo[tokenId].claimDate +
                    _manufacturerInfo[_productInfo[tokenId].manufacturer]
                        .withdrawal_date),
            ErrorsLib.TIME_EXPIRED
        );
        _transfer(
            _ownerOf(tokenId),
            _manufacturerInfo[_productInfo[tokenId].manufacturer].vaultAddress,
            tokenId
        );
        emit EventsLib.RetractionTransfer(
            prevOwner,
            tokenId,
            _productInfo[tokenId].manufacturer
        );
    }

    function manufacturerDelegatedTransfer(
        address from,
        uint256 tokenId
    ) external override {
        _onlyManufacturerAdmin(_productInfo[tokenId].manufacturer);
        require(
            _manufacturerInfo[_productInfo[tokenId].manufacturer]
                .delegatedTransfer,
            ErrorsLib.UNAUTH_DT
        );
        _transfer(
            from,
            _manufacturerInfo[_productInfo[tokenId].manufacturer].vaultAddress,
            tokenId
        );
        emit EventsLib.DelegatedTransfer(
            from,
            tokenId,
            _productInfo[tokenId].manufacturer
        );
    }

    ///////////////////////////// URI  /////////////////////////////
    function setBaseURI(string memory baseURI_) public {
        _onlySystem();
        baseURI = baseURI_;
        emit EventsLib.BaseURIChanged(baseURI_);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setTokenURI(uint256 tokenId, string memory tokenUri) public {
        _onlyManufacturer(_productInfo[tokenId].manufacturer);
        _requireOwned(tokenId);
        _tokenURIs[tokenId] = tokenUri;
        emit EventsLib.TokenURI(tokenId, tokenUri);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        virtual
        override(IHoraeMPT, ERC721Upgradeable)
        returns (string memory)
    {
        _requireOwned(tokenId);

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        return super.tokenURI(tokenId);
    }

    function _deleteWarranty(uint256 tokenId) internal {
        _requireOwned(tokenId);
        delete _productWarranty[tokenId];
        emit EventsLib.ProductWarrantyInfo(tokenId, "X", "X", "X");
    }

    function createTokenId(bytes memory manufacturer) internal returns (uint) {
        bytes20 tempo = ripemd160(manufacturer);
        uint256 tokenCount = _manufacturerInfo[manufacturer].tokenMinted;
        _manufacturerInfo[manufacturer].tokenMinted++;
        return
            _stringToUint(
                string.concat(
                    Strings.toString(_bytes20ToUint(tempo)),
                    Strings.toString(tokenCount)
                )
            );
    }

    function _bytes20ToUint(bytes20 b) internal pure returns (uint256) {
        uint256 number;
        for (uint i = 0; i < b.length; i++) {
            number =
                number +
                uint(uint8(b[i])) *
                (2 ** (8 * (b.length - (i + 1))));
        }
        return number;
    }

    function _stringToUint(string memory s) internal pure returns (uint) {
        bytes memory b = bytes(s);
        uint result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            uint256 c = uint256(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        return result;
    }

    function _contextSuffixLength()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }
}
