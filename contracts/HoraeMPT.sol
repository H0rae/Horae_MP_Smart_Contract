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
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ForwarderUpgradeable.sol";
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

    mapping(uint256 => uint256[]) internal _maintenanceIds;

    mapping(uint256 => mapping(uint256 => MaintenanceRecord))
        internal _maintenanceRecords;

    mapping(uint256 => Warranty) private _productWarranty;

    mapping(bytes => Manufacturer) private _manufacturerInfo;

    mapping(uint256 => Product) private _productInfo;
    /// @inheritdoc IHoraeMPT
    mapping(bytes => bool) public hashIDMinted;
    /// @inheritdoc IHoraeMPT
    mapping(address => bool) public systemAdmins;
    mapping(bytes => mapping(address => uint8)) public administrators;

    /**
     * @dev This empty reserved space allows the add of new varianles in a future version
     * without shifting down storage.
     * Read more at: https://docs.openzeppelin.com/upgrades-plugins/writing-upgradeable#storage-gaps
     */
    uint256[49] __gap;

    uint256 private constant DECIMAL_BASE = 10;
    uint256 private constant ASCII_ZERO = 48;
    uint256 private constant ASCII_NINE = 57;

    ///////////////////////////// CONSTRUCTOR  /////////////////////////////
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        address trustedForwarderAddress
    ) ERC2771ContextUpgradeable(trustedForwarderAddress) {
        _disableInitializers();
    }

    /**
     * @dev Returns the warranty information for a given product token.
     * @notice This is a view function and does not modify the state.
     *
     * @param tokenId The ID of the product token.
     * @return Warranty struct containing warranty details.
     */
    function productWarranty(
        uint256 tokenId
    ) external view override returns (Warranty memory) {
        return _productWarranty[tokenId];
    }

    /**
     * @dev Returns the manufacturer information for a given manufacturer name.
     * @notice This is a view function and does not modify the state.
     *
     * @param manufacturerName The bytes identifier of the manufacturer.
     * @return Manufacturer struct containing manufacturer details.
     */
    function manufacturerInfo(
        bytes memory manufacturerName
    ) external view override returns (Manufacturer memory) {
        return _manufacturerInfo[manufacturerName];
    }

    /**
     * @dev Returns the product information for a given token ID.
     * @notice This is a view function and does not modify the state.
     *
     * @param tokenId The ID of the product token.
     * @return Product struct containing product details.
     */
    function productInfo(
        uint256 tokenId
    ) external view override returns (Product memory) {
        return _productInfo[tokenId];
    }

    /**
     * @dev Returns the list of maintenance records for a given product token.
     * @notice This is a view function and does not modify the state.
     *
     * @param tokenId The ID of the product token.
     * @return MaintenanceRecord[] Array of maintenance records for the product.
     */
    function listMaintenanceRecords(
        uint256 tokenId
    ) external view override returns (MaintenanceRecord[] memory) {
        uint256[] storage ids = _maintenanceIds[tokenId];
        uint256 len = ids.length;
        MaintenanceRecord[] memory records = new MaintenanceRecord[](len);

        for (uint256 i = 0; i < len; i++) {
            records[i] = _maintenanceRecords[tokenId][ids[i]];
        }

        return records;
    }

    /**
     * @notice Initializes the HoraeMPT contract with a base URI and sets the deployer as the initial administrator.
     * @param baseURI_ The base URI to use for generating token URIs.
     */
    function initialize(string memory baseURI_) public initializer {
        __ERC721_init("HoraeMPT", "HMPT");
        __ERC721Royalty_init_unchained();
        __Pausable_init();
        __UUPSUpgradeable_init();

        owner = _msgSender();
        systemAdmins[owner] = true;
        setBaseURI(baseURI_);
    }

    ///////////////////////////// MODIFIERS  /////////////////////////////

    /**
     * @notice Modifier to allow only the contract owner to execute a function.
     * @dev The caller must be the contract owner.
     */
    function _onlySystem() private view {
        if (!systemAdmins[_msgSender()]) {
            revert ErrorsLib.InvalidLevel();
        }
    }

    /**
     * @notice Modifier to allow only the contract owner or the manufacturer to execute a function.
     */
    function _onlyManufacturer(bytes memory manufacturer) private view {
        if (
            administrators[manufacturer][_msgSender()] == 0 &&
            !systemAdmins[_msgSender()]
        ) {
            revert ErrorsLib.InvalidLevel();
        }
    }

    /**
     * @dev Checks if the caller is authorized as a manufacturer or system admin.
     * @notice This is an internal helper function.
     *
     * @param caller       Address of the caller to check.
     * @param manufacturer Manufacturer bytes identifier to check against.
     * @return bool True if the caller is a manufacturer or system admin, false otherwise.
     */
    function _isManufacturer(
        address caller,
        bytes memory manufacturer
    ) internal view returns (bool) {
        return
            administrators[manufacturer][caller] >= 1 ||
            systemAdmins[_msgSender()];
    }

    /**
     * @notice Modifier to allow only the product owner or the manufacturer or the contract owner to execute a function.
     * @param manufacturer The manufacturer of the product.
     * @param tokenId unique (on-chain) identifier of the product
     */
    function _onlyProductOwnerOrManufacturer(
        bytes memory manufacturer,
        uint256 tokenId
    ) private view {
        if (
            (administrators[manufacturer][_msgSender()] == 0 &&
                !systemAdmins[_msgSender()] &&
                _ownerOf(tokenId) != _msgSender())
        ) {
            revert ErrorsLib.InvalidLevel();
        }
    }

    /**
     * @notice Modifier to allow only the manufacturer admin to execute a function.
     * @param manufacturer The manufacturer of the product.
     */
    function _onlyManufacturerAdmin(bytes memory manufacturer) private view {
        if (
            administrators[manufacturer][_msgSender()] != 2 &&
            !systemAdmins[_msgSender()]
        ) {
            revert ErrorsLib.InvalidLevel();
        }
    }

    /**
     * @notice Checks if a product (NFT) has been minted and has an owner.
     * @dev Internal helper function that verifies if a token exists by checking if it has a non-zero owner address.
     *      Returns false for non-existent tokens (which return address(0) from _ownerOf).
     * @param tokenId The ID of the product token to check
     * @return bool True if the product is owned (token exists), false if not minted or burned
     */
    function _isProductOwned(uint256 tokenId) internal view returns (bool) {
        address tokenOwner = _ownerOf(tokenId);
        if (tokenOwner == address(0)) {
            return false;
        }
        return true;
    }

    /**
     * @notice Modifier to allow only the product owner to execute a function.
     */
    function _onlyOwner() private view {
        if (owner != _msgSender()) {
            revert ErrorsLib.InvalidLevel();
        }
    }

    /**
     *@notice Check if a token exists and is not marked as stolen.
     *@dev The specified token must exist.
     *@dev The specified token must not be marked as stolen.
     *@param tokenId unique (on-chain) identifier of the product
     */
    function checkExistAndStolen(uint256 tokenId) private view {
        _requireOwned(tokenId);
        if (_productInfo[tokenId].isStolen) {
            revert ErrorsLib.ProductStolen();
        }
    }

    /**
     * @notice Function to check if a token is not marked as stolen.
     * @param tokenId The ID of the token to check / unique (on-chain) identifier of the product.
     */
    function checkIfStolen(uint256 tokenId) private view {
        if (_productInfo[tokenId].isStolen) {
            revert ErrorsLib.ProductStolen();
        }
    }

    ///////////////////////////// UTILS  /////////////////////////////
    /**
     * @notice Overrides required by OpenZeppelin
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721RoyaltyUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice required by the OZ UUPS module
     **/
    function _authorizeUpgrade(address) internal view override {
        _onlyOwner();
    }

    /**
     * @notice A special function that is called when the contract receives ether without any specific function call.
     * @dev Emits a {Received} event to log the sender and the amount of ether received.
     */
    receive() external payable {
        emit EventsLib.Received(_msgSender(), msg.value);
    }

    /**
     * @notice Fallback function to receive Ether sent to the contract.
     * @dev Emits a {Received} event with the sender and value of the transaction.
     */
    fallback() external payable {
        emit EventsLib.Received(_msgSender(), msg.value);
    }

    /**
     * @notice Returns the current balance of the contract.
     * @return The current balance of the contract.
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Allows the contract owner to withdraw the contract's balance.
     */
    function withdraw() public {
        _onlyOwner();
        (bool success, ) = payable(_msgSender()).call{
            value: address(this).balance
        }("");
        if (!success) {
            revert ErrorsLib.TransferFailed();
        }
    }

    /**
     * @notice Pause the contract
     * @dev Only horae admin can call this function.
     */
    function setPause() public {
        _onlySystem();
        PausableUpgradeable._pause();
    }

    /**
     * @notice Unpause the contract
     * @dev Only horae admin can call this function.
     */
    function setUnpause() public {
        _onlySystem();
        PausableUpgradeable._unpause();
    }

    /**
     * @notice Override required by OpenZeppelin, returns ContextUpgradeable._msgData()
     */
    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }

    /**
     * @notice Override required by OpenZeppelin, returns ContextUpgradeable._msgSender()
     */
    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /**
     * @notice Override required by OpenZeppelin
     */
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
    /**
     * @notice Mints a new NFT representing a digital product passport.
     * @param args the minting struct
     * @dev The caller must be a manufacturer admin.
     * @dev The URI must not be empty.
     * @dev The manufacturer must not be empty.
     * @dev The category must not be empty.
     * @dev The model must not be empty.
     * @dev The collection must not be empty.
     * @dev The product reference must not be empty.
     * @dev The production date must not be empty.
     * @dev The product ID must not have been minted before.
     * @dev Emits a {PassportMinted} event.
     */
    function mint(MintParams memory args) public whenNotPaused {
        _onlyManufacturerAdmin(args.manufacturer);

        if (args.uri.length == 0) {
            revert ErrorsLib.InvalidURI();
        }

        if (args.manufacturer.length == 0) {
            revert ErrorsLib.InvalidManufacturer();
        }

        if (args.category.length == 0) {
            revert ErrorsLib.InvalidCategory();
        }

        if (args.collection.length == 0) {
            revert ErrorsLib.InvalidCollection();
        }

        if (args.model.length == 0) {
            revert ErrorsLib.InvalidModel();
        }

        if (args.productionDate.length == 0) {
            revert ErrorsLib.InvalidProductionDate();
        }

        if (args.productReference.length == 0) {
            revert ErrorsLib.InvalidReference();
        }

        if (hashIDMinted[args.hashID]) {
            revert ErrorsLib.ProductIdAlreadyDeclared();
        }

        uint256 tokenId = createTokenId(args.manufacturer);
        _productInfo[tokenId] = Product(
            tokenId,
            args.hashID,
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

        hashIDMinted[args.hashID] = true;
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

    /**
     * @notice Mint a batch of tokens
     * @param _args the minting struct
     * @param manufacturer the manufacturer of the product
     * @dev The caller must be a manufacturer admin.
     */
    function batchMint(
        MintParams[] memory _args,
        bytes calldata manufacturer
    ) external whenNotPaused returns (uint256[] memory failedIndices) {
        _onlyManufacturerAdmin(manufacturer);
        if (_args.length > 20) {
            revert ErrorsLib.TooManyArguments();
        }

        uint256[] memory tempFailed = new uint256[](_args.length);
        uint256 failedCount = 0;

        for (uint256 i = 0; i < _args.length; i++) {
            MintParams memory args = _args[i];

            if (
                args.uri.length == 0 ||
                args.manufacturer.length == 0 ||
                args.category.length == 0 ||
                args.collection.length == 0 ||
                args.model.length == 0 ||
                args.productionDate.length == 0 ||
                args.productReference.length == 0 ||
                hashIDMinted[args.hashID]
            ) {
                tempFailed[failedCount] = i;
                failedCount++;
                continue; // skip this one
            }

            // happy path = do the mint logic inline (avoid external call to mint)
            uint256 tokenId = createTokenId(args.manufacturer);
            _productInfo[tokenId] = Product(
                tokenId,
                args.hashID,
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

            hashIDMinted[args.hashID] = true;
            _setTokenRoyalty(
                tokenId,
                _manufacturerInfo[args.manufacturer].vaultAddress,
                _manufacturerInfo[args.manufacturer].fee
            );
            _safeMint(
                _manufacturerInfo[args.manufacturer].vaultAddress,
                tokenId
            );
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

        // shrink failed array
        failedIndices = new uint256[](failedCount);
        for (uint256 j = 0; j < failedCount; j++) {
            failedIndices[j] = tempFailed[j];
        }
    }

    /**
     * @notice Burns a specific token. The token must be inside the manufacturer vault.
     * @dev The token must have been minted.
     * @dev The caller must be a manufcaturer administrator level 2
     * @param tokenId uint256 ID of the token to burn / unique (on-chain) identifier of the product.
     */
    function burn(uint256 tokenId) external whenNotPaused {
        _onlyManufacturerAdmin(_productInfo[tokenId].manufacturer);
        if (
            ownerOf(tokenId) !=
            _manufacturerInfo[_productInfo[tokenId].manufacturer].vaultAddress
        ) {
            revert ErrorsLib.NotInVault();
        }

        bytes memory manufacturer = _productInfo[tokenId].manufacturer;

        _deleteWarranty(tokenId);

        uint256[] storage ids = _maintenanceIds[tokenId];
        for (uint256 i = 0; i < ids.length; i++) {
            delete _maintenanceRecords[tokenId][ids[i]];
        }
        delete _maintenanceIds[tokenId];

        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }
        delete hashIDMinted[_productInfo[tokenId].hashID];
        delete _productInfo[tokenId];

        _burn(tokenId);
        emit EventsLib.PassportBurned(tokenId, manufacturer);
    }

    ///////////////////////////// PRODUCT STATUS FUNCTIONS /////////////////////////////

    /**
     * @notice Set the stolen status of a product.
     * @param tokenId unique (on-chain) identifier of the product.
     * @param isItStolen The new stolen status of the product.
     */
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

    /**
     * @notice Set the maintenance record of a product.
     * @param tokenId unique (on-chain) identifier of the product.
     * @param date The date of the maintenance.
     * @param info The information about the maintenance.
     */
    function setMaintenanceRecord(
        uint256 tokenId,
        bytes memory date,
        bytes memory info
    ) external override {
        _onlyManufacturer(_productInfo[tokenId].manufacturer);
        checkExistAndStolen(tokenId);

        uint256 newId = _productInfo[tokenId].maintenanceCounter;

        _maintenanceRecords[tokenId][newId] = MaintenanceRecord(
            newId,
            date,
            info
        );

        _maintenanceIds[tokenId].push(newId);

        _productInfo[tokenId].maintenanceCounter++;

        emit EventsLib.MaintenanceRecordInfo(tokenId, newId, info, date);
    }

    /**
     * @notice Delete a  maintenance record of a product.
     * @param tokenId unique (on-chain) identifier of the product.
     * @param maintenanceId The ID of the maintenance.
     */
    function deleteMaintenanceRecord(
        uint256 tokenId,
        uint256 maintenanceId
    ) external {
        _onlyManufacturer(_productInfo[tokenId].manufacturer);
        checkExistAndStolen(tokenId);

        if (
            _maintenanceRecords[tokenId][maintenanceId].linkToDetails.length ==
            0
        ) {
            revert ErrorsLib.MaintenanceNotFound();
        }

        delete _maintenanceRecords[tokenId][maintenanceId];

        // Clean up maintenanceIds array (swap & pop)
        uint256[] storage ids = _maintenanceIds[tokenId];
        uint256 len = ids.length;

        for (uint256 i = 0; i < len; i++) {
            if (ids[i] == maintenanceId) {
                if (i != len - 1) {
                    ids[i] = ids[len - 1];
                }
                ids.pop();
                break;
            }
        }
        emit EventsLib.MaintenanceRecordDeleted(tokenId, maintenanceId);
    }

    /**
     * @notice Set the product warranty.
     * @param tokenId unique (on-chain) identifier of the product.
     * @param terms The terms of the warranty.
     * @param warrantyID The ID of the warranty.
     */
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

    /**
     * @notice Change the contract owner.
     * @param newOwner The address of the new owner.
     */
    function changeContractOwner(address newOwner) external {
        _onlyOwner();
        if (newOwner == address(0)) {
            revert ErrorsLib.InvalidAddress();
        }
        systemAdmins[owner] = false;
        systemAdmins[newOwner] = true;
        owner = newOwner;
        emit EventsLib.OwnerChanged(owner);
    }

    /**
     * @notice Set the system admin status of an address.
     * @param _address The address to set the status for.
     * @param _status The new status of the address.
     */
    function setSystemAdmin(address _address, bool _status) external {
        _onlyOwner();
        systemAdmins[_address] = _status;
        emit EventsLib.SystemAdminStatus(_address, _status);
    }

    /**
     * @notice Set the manufacturer admin status of an address.
     * @param user The address to set the status for.
     * @param level The new level of the address.
     * @param manufacturer The manufacturer of the product.
     */
    function setManufacturerAdmin(
        address user,
        uint8 level,
        bytes memory manufacturer
    ) public {
        _onlySystem();

        if (level > 2) {
            revert ErrorsLib.InvalidLevel();
        }

        if (manufacturer.length == 0) {
            revert ErrorsLib.InvalidManufacturer();
        }

        if (user == address(0)) {
            revert ErrorsLib.InvalidAddress();
        }

        if (_manufacturerInfo[manufacturer].vaultAddress == address(0)) {
            revert ErrorsLib.InvalidManufacturer();
        }

        administrators[manufacturer][user] = level;
        emit EventsLib.ManufacturerAdministratorStatus(
            user,
            level,
            manufacturer
        );
    }

    /**
     * @notice Add a manufacturer to the system.
     * @param manufacturer The name of the manufacturer.
     * @param adminAddress The address of the manufacturer admin.
     * @param vault The address of the manufacturer vault.
     * @param fee The fee of the manufacturer.
     * @param withdrawDate The withdrawal date of the manufacturer.
     * @param delegatedTransfer The delegated transfer status of the manufacturer.
     */
    function addManufacturer(
        bytes memory manufacturer,
        address adminAddress,
        address vault,
        uint96 fee,
        uint256 withdrawDate,
        bool delegatedTransfer
    ) external {
        _onlySystem();
        if (_manufacturerInfo[manufacturer].vaultAddress != address(0)) {
            revert ErrorsLib.ManufacturerAlreadyDeclared();
        }
        if (vault == address(0)) {
            revert ErrorsLib.InvalidAddress();
        }

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

    /**
     * @notice Modify a manufacturer in the system.
     * @param manufacturer The name of the manufacturer.
     * @param vault The address of the manufacturer vault.
     * @param fee The fee of the manufacturer.
     * @param withdrawDate The withdrawal date of the manufacturer.
     * @param delegatedTransfer The delegated transfer status of the manufacturer.
     */
    function modifyManufacturer(
        bytes memory manufacturer,
        address vault,
        uint96 fee,
        uint256 withdrawDate,
        bool delegatedTransfer
    ) external {
        _onlySystem();
        if (_manufacturerInfo[manufacturer].vaultAddress == address(0)) {
            revert ErrorsLib.ManufacturerNotDeclared();
        }

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

    /**
     * @notice Get the manufacturer admin level of a user.
     * @param manufacturer The manufacturer of the product.
     * @param user The address of the user.
     * @return The level of the user.
     */
    function manufacturerAdmins(
        bytes memory manufacturer,
        address user
    ) external view override returns (uint8) {
        return administrators[manufacturer][user];
    }

    /**
     * @notice Update the manufacturer fee.
     * @param manufacturer The manufacturer of the product.
     * @param fee The new fee of the manufacturer.
     */
    function setManufacturerFee(
        bytes memory manufacturer,
        uint96 fee
    ) external override {
        _onlySystem();
        _manufacturerInfo[manufacturer].fee = fee;
        emit EventsLib.ManufacturerFeeUpdated(manufacturer, fee);
    }

    ///////////////////////////// TRANSFER FUNCTIONS /////////////////////////////

    /**
     * @notice retrieve a passport from a user to the brand vault (use when the product is returned)
     * @dev The token must have been minted.
     * @dev The caller must be a manufacturer administrator level 2
     * @param tokenId uint256 ID of the token to retrieve.
     */
    function retractionTransferVault(uint256 tokenId) external override {
        address prevOwner = _ownerOf(tokenId);
        _onlyManufacturerAdmin(_productInfo[tokenId].manufacturer);
        _requireOwned(tokenId);

        if (
            block.timestamp >=
            _productInfo[tokenId].claimDate +
                _manufacturerInfo[_productInfo[tokenId].manufacturer]
                    .withdrawal_date
        ) {
            revert ErrorsLib.TimeExpired();
        }

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

    /**
     * @notice Transfer a product from a user to manufacturer's vault in case user has lost wallet access
     * @dev The token must have been minted.
     * @dev The caller must be a manufacturer administrator level 2
     * @dev Emits a {DelegatedTransfer} event.
     * @param from The address of the product owner.
     * @param tokenId unique (on-chain) identifier of the product being transferred.
     * require the brand has delegatedTransfer to true
     */
    function manufacturerDelegatedTransfer(
        address from,
        uint256 tokenId
    ) external override {
        _onlyManufacturerAdmin(_productInfo[tokenId].manufacturer);
        if (
            !_manufacturerInfo[_productInfo[tokenId].manufacturer]
                .delegatedTransfer
        ) {
            revert ErrorsLib.UnauthorizedDelegatedTransfer();
        }
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

    /**
     * @notice Set the base URI for the contract.
     * @param baseURI_ The new base URI.
     */
    function setBaseURI(string memory baseURI_) public {
        _onlySystem();
        baseURI = baseURI_;
        emit EventsLib.BaseURIChanged(baseURI_);
    }

    /**
     * @notice Get the base URI for the contract.
     * @return The base URI.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    /**
     * @notice Set the token URI for a specific token.
     * @param tokenId unique (on-chain) identifier of the product.
     * @param tokenUri The new token URI.
     */
    function setTokenURI(uint256 tokenId, string memory tokenUri) public {
        _onlyManufacturer(_productInfo[tokenId].manufacturer);
        _requireOwned(tokenId);
        _tokenURIs[tokenId] = tokenUri;
        emit EventsLib.TokenURI(tokenId, tokenUri);
    }

    /**
     * @dev Sets the tokenURI for multiple tokens in a single call.
     * @notice Emits a {TokenURI} event for each successfully updated token.
     *
     * @param tokenIds  Array of token IDs to update.
     * @param tokenUris Array of token URIs corresponding to each token ID.
     * @return failedIds Array of token IDs that failed to update due to validation errors.
     *
     * Requirements:
     * - `tokenIds` and `tokenUris` must be of the same length.
     * - The length of `tokenIds` must not exceed 20.
     * - Each token must exist (i.e., have a non-empty manufacturer).
     * - The caller must be the manufacturer of each token.
     * - The caller must own each token.
     *
     * Emits: {TokenURI} for each successful update.
     */
    function batchSetTokenURI(
        uint256[] memory tokenIds,
        string[] memory tokenUris
    ) external returns (uint256[] memory failedIds) {
        if (tokenIds.length != tokenUris.length) {
            revert ErrorsLib.MismatchedInputsLength();
        }
        if (tokenIds.length > 20) {
            revert ErrorsLib.TooManyArguments();
        }

        uint256 len = tokenIds.length;
        uint256[] memory tempFailed = new uint256[](len);
        uint256 failedCount = 0;

        for (uint256 i = 0; i < len; i++) {
            uint256 tokenId = tokenIds[i];
            string memory tokenUri = tokenUris[i];

            // Validate manufacturer & ownership safely
            if (
                _productInfo[tokenId].manufacturer.length == 0 || // token doesn't exist
                !_isManufacturer(
                    msg.sender,
                    _productInfo[tokenId].manufacturer
                ) ||
                !_isProductOwned(tokenId)
            ) {
                tempFailed[failedCount] = tokenId;
                failedCount++;
                continue;
            }

            _tokenURIs[tokenId] = tokenUri;
            emit EventsLib.TokenURI(tokenId, tokenUri);
        }

        failedIds = new uint256[](failedCount);
        for (uint256 j = 0; j < failedCount; j++) {
            failedIds[j] = tempFailed[j];
        }
    }

    /**
     * @notice Get the token URI for a specific token.
     * @param tokenId unique (on-chain) identifier of the product.
     * @return The token URI.
     */
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

    /**
     * @notice Delete the warranty of a product.
     * @param tokenId The ID of the product.
     * @dev Emits a {ProductWarrantyInfo} event.
     */
    function _deleteWarranty(uint256 tokenId) internal {
        _requireOwned(tokenId);
        delete _productWarranty[tokenId];
        emit EventsLib.ProductWarrantyInfo(tokenId, "X", "X", "X");
    }

    /**
     * @notice Returns the tokenID based on manufacturer's name and current token count.
     * @param manufacturer The brand name.
     * @return A uint256 representing the brand prefix.
     */
    function createTokenId(
        bytes memory manufacturer
    ) internal returns (uint256) {
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

    /**
     * @notice utils function to cast a bytes20 to a uint256
     * @param b the bytes20 to cast
     */
    function _bytes20ToUint(bytes20 b) internal pure returns (uint256) {
        uint256 number;
        for (uint256 i = 0; i < b.length; i++) {
            number =
                number +
                uint256(uint8(b[i])) *
                (2 ** (8 * (b.length - (i + 1))));
        }
        return number;
    }

    /**
     * @notice utils function to cast a string to a uint256
     * @param s the string to cast
     */
    function _stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            uint256 c = uint256(uint8(b[i]));
            if (c >= ASCII_ZERO && c <= ASCII_NINE) {
                result = result * DECIMAL_BASE + (c - ASCII_ZERO);
            }
        }
        return result;
    }

    /**
     * @notice Override required by OpenZeppelin
     */
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
