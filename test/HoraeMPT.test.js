const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("HoraeMPT", function () {
  // Helper to convert string to hex bytes
  const toBytes = (str) => ethers.hexlify(Buffer.from(str));

  async function deployHoraeFixture() {
    const [
      owner,
      systemAdmin,
      manufacturerAdmin,
      manufacturerAdminLevel1,
      user1,
      user2,
      forwarder,
      vault,
      newOwner
    ] = await ethers.getSigners();

    const HoraeMPT = await ethers.getContractFactory("HoraeMPT");
    const baseURI = "https://api.horae.io/metadata/";
    
    // Deploy proxy
    const contract = await upgrades.deployProxy(
      HoraeMPT,
      [baseURI],
      {
        constructorArgs: [forwarder.address],
        initializer: "initialize"
      }
    );

    const brandName = "ROLEX";
    const brandBytes = toBytes(brandName);

    return {
      contract,
      owner,
      systemAdmin,
      manufacturerAdmin,
      manufacturerAdminLevel1,
      user1,
      user2,
      forwarder,
      vault,
      newOwner,
      baseURI,
      brandName,
      brandBytes
    };
  }

  describe("Deployment & Initialization", function () {
    it("Should set the correct initial variables", async function () {
      const { contract, owner, baseURI } = await loadFixture(deployHoraeFixture);

      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.baseURI()).to.equal(baseURI);
      expect(await contract.systemAdmins(owner.address)).to.be.true;
    });

    it("Should revert if initialize is called twice", async function () {
      const { contract } = await loadFixture(deployHoraeFixture);
      await expect(contract.initialize("https://anotherURI.io/"))
        .to.be.revertedWithCustomError(contract, "InvalidInitialization");
    });
  });

  describe("Roles & Administrative Functions", function () {
    it("Should allow owner to change owner", async function () {
      const { contract, owner, newOwner } = await loadFixture(deployHoraeFixture);

      await expect(contract.connect(owner).changeContractOwner(newOwner.address))
        .to.emit(contract, "OwnerChanged")
        .withArgs(newOwner.address);

      expect(await contract.owner()).to.equal(newOwner.address);
      // Previous owner's systemAdmin is disabled, new owner's is enabled
      expect(await contract.systemAdmins(owner.address)).to.be.false;
      expect(await contract.systemAdmins(newOwner.address)).to.be.true;
    });

    it("Should revert if changing owner to zero address", async function () {
      const { contract, owner } = await loadFixture(deployHoraeFixture);
      await expect(contract.connect(owner).changeContractOwner(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(contract, "InvalidAddress");
    });

    it("Should revert if non-owner attempts to change owner", async function () {
      const { contract, user1, newOwner } = await loadFixture(deployHoraeFixture);
      await expect(contract.connect(user1).changeContractOwner(newOwner.address))
        .to.be.revertedWithCustomError(contract, "InvalidLevel");
    });

    it("Should allow owner to add and remove system admins", async function () {
      const { contract, owner, systemAdmin } = await loadFixture(deployHoraeFixture);

      await expect(contract.connect(owner).setSystemAdmin(systemAdmin.address, true))
        .to.emit(contract, "SystemAdminStatus")
        .withArgs(systemAdmin.address, true);

      expect(await contract.systemAdmins(systemAdmin.address)).to.be.true;

      await expect(contract.connect(owner).setSystemAdmin(systemAdmin.address, false))
        .to.emit(contract, "SystemAdminStatus")
        .withArgs(systemAdmin.address, false);

      expect(await contract.systemAdmins(systemAdmin.address)).to.be.false;
    });

    it("Should revert if non-owner attempts to manage system admins", async function () {
      const { contract, systemAdmin, user1 } = await loadFixture(deployHoraeFixture);
      await expect(contract.connect(user1).setSystemAdmin(systemAdmin.address, true))
        .to.be.revertedWithCustomError(contract, "InvalidLevel");
    });
  });

  describe("Manufacturer Management", function () {
    it("Should allow system admins to add a manufacturer", async function () {
      const { contract, owner, brandBytes, manufacturerAdmin, vault } = await loadFixture(deployHoraeFixture);

      const fee = 500; // 5%
      const withdrawDate = 3600 * 24; // 1 day
      const delegatedTransfer = true;

      await expect(
        contract.connect(owner).addManufacturer(
          brandBytes,
          manufacturerAdmin.address,
          vault.address,
          fee,
          withdrawDate,
          delegatedTransfer
        )
      )
        .to.emit(contract, "ManufacturerAdded")
        .withArgs(brandBytes, vault.address, fee, withdrawDate, delegatedTransfer);

      const info = await contract.manufacturerInfo(brandBytes);
      expect(info.fee).to.equal(fee);
      expect(info.withdrawal_date).to.equal(withdrawDate);
      expect(info.vaultAddress).to.equal(vault.address);
      expect(info.delegatedTransfer).to.equal(delegatedTransfer);

      // Should automatically set level 2 admin
      expect(await contract.manufacturerAdmins(brandBytes, manufacturerAdmin.address)).to.equal(2);
    });

    it("Should revert if adding a manufacturer that already exists", async function () {
      const { contract, owner, brandBytes, manufacturerAdmin, vault } = await loadFixture(deployHoraeFixture);

      await contract.connect(owner).addManufacturer(
        brandBytes,
        manufacturerAdmin.address,
        vault.address,
        500,
        3600,
        true
      );

      await expect(
        contract.connect(owner).addManufacturer(
          brandBytes,
          manufacturerAdmin.address,
          vault.address,
          500,
          3600,
          true
        )
      ).to.be.revertedWithCustomError(contract, "ManufacturerAlreadyDeclared");
    });

    it("Should revert if adding manufacturer with zero vault address", async function () {
      const { contract, owner, brandBytes, manufacturerAdmin } = await loadFixture(deployHoraeFixture);

      await expect(
        contract.connect(owner).addManufacturer(
          brandBytes,
          manufacturerAdmin.address,
          ethers.ZeroAddress,
          500,
          3600,
          true
        )
      ).to.be.revertedWithCustomError(contract, "InvalidAddress");
    });

    it("Should allow system admins to modify manufacturer parameters", async function () {
      const { contract, owner, brandBytes, manufacturerAdmin, vault, user2 } = await loadFixture(deployHoraeFixture);

      await contract.connect(owner).addManufacturer(
        brandBytes,
        manufacturerAdmin.address,
        vault.address,
        500,
        3600,
        true
      );

      const newFee = 700;
      const newWithdrawDate = 7200;
      const newDelegatedTransfer = false;

      await expect(
        contract.connect(owner).modifyManufacturer(
          brandBytes,
          user2.address, // modify vault to user2
          newFee,
          newWithdrawDate,
          newDelegatedTransfer
        )
      )
        .to.emit(contract, "ManufacturerModified")
        .withArgs(brandBytes, user2.address, newFee, newWithdrawDate, newDelegatedTransfer);

      const info = await contract.manufacturerInfo(brandBytes);
      expect(info.fee).to.equal(newFee);
      expect(info.withdrawal_date).to.equal(newWithdrawDate);
      expect(info.vaultAddress).to.equal(user2.address);
      expect(info.delegatedTransfer).to.equal(newDelegatedTransfer);
    });

    it("Should revert if modifying a non-existent manufacturer", async function () {
      const { contract, owner, brandBytes, vault } = await loadFixture(deployHoraeFixture);

      await expect(
        contract.connect(owner).modifyManufacturer(
          brandBytes,
          vault.address,
          500,
          3600,
          true
        )
      ).to.be.revertedWithCustomError(contract, "ManufacturerNotDeclared");
    });

    it("Should allow system admins to set manufacturer admin status", async function () {
      const { contract, owner, brandBytes, manufacturerAdmin, vault, user2 } = await loadFixture(deployHoraeFixture);

      await contract.connect(owner).addManufacturer(
        brandBytes,
        manufacturerAdmin.address,
        vault.address,
        500,
        3600,
        true
      );

      // Level 1 admin setting
      await expect(contract.connect(owner).setManufacturerAdmin(user2.address, 1, brandBytes))
        .to.emit(contract, "ManufacturerAdministratorStatus")
        .withArgs(user2.address, 1, brandBytes);

      expect(await contract.manufacturerAdmins(brandBytes, user2.address)).to.equal(1);
    });

    it("Should revert if setting manufacturer admin level > 2", async function () {
      const { contract, owner, brandBytes, manufacturerAdmin, vault, user2 } = await loadFixture(deployHoraeFixture);

      await contract.connect(owner).addManufacturer(
        brandBytes,
        manufacturerAdmin.address,
        vault.address,
        500,
        3600,
        true
      );

      await expect(contract.connect(owner).setManufacturerAdmin(user2.address, 3, brandBytes))
        .to.be.revertedWithCustomError(contract, "InvalidLevel");
    });

    it("Should revert if setting manufacturer admin with empty manufacturer", async function () {
      const { contract, owner, user2 } = await loadFixture(deployHoraeFixture);

      await expect(contract.connect(owner).setManufacturerAdmin(user2.address, 1, "0x"))
        .to.be.revertedWithCustomError(contract, "InvalidManufacturer");
    });

    it("Should revert if setting manufacturer admin for zero address user", async function () {
      const { contract, owner, brandBytes, manufacturerAdmin, vault } = await loadFixture(deployHoraeFixture);

      await contract.connect(owner).addManufacturer(
        brandBytes,
        manufacturerAdmin.address,
        vault.address,
        500,
        3600,
        true
      );

      await expect(contract.connect(owner).setManufacturerAdmin(ethers.ZeroAddress, 1, brandBytes))
        .to.be.revertedWithCustomError(contract, "InvalidAddress");
    });

    it("Should revert if setting manufacturer admin for non-declared manufacturer", async function () {
      const { contract, owner, user2 } = await loadFixture(deployHoraeFixture);

      const unregisteredBrand = toBytes("NON_EXISTENT");
      await expect(contract.connect(owner).setManufacturerAdmin(user2.address, 1, unregisteredBrand))
        .to.be.revertedWithCustomError(contract, "InvalidManufacturer");
    });

    it("Should allow system admin to set manufacturer fee directly", async function () {
      const { contract, owner, brandBytes, manufacturerAdmin, vault } = await loadFixture(deployHoraeFixture);

      await contract.connect(owner).addManufacturer(
        brandBytes,
        manufacturerAdmin.address,
        vault.address,
        500,
        3600,
        true
      );

      await expect(contract.connect(owner).setManufacturerFee(brandBytes, 800))
        .to.emit(contract, "ManufacturerFeeUpdated")
        .withArgs(brandBytes, 800);

      const info = await contract.manufacturerInfo(brandBytes);
      expect(info.fee).to.equal(800);
    });
  });

  describe("Minting & Burning Operations", function () {
    let setup;
    beforeEach(async function () {
      setup = await loadFixture(deployHoraeFixture);
      // Register manufacturer
      await setup.contract.connect(setup.owner).addManufacturer(
        setup.brandBytes,
        setup.manufacturerAdmin.address,
        setup.vault.address,
        500,
        3600,
        true
      );
      // Register Level 1 admin
      await setup.contract.connect(setup.owner).setManufacturerAdmin(
        setup.manufacturerAdminLevel1.address,
        1,
        setup.brandBytes
      );
    });

    const getMintParams = (hashID, brandBytes, uri) => ({
      hashID: toBytes(hashID),
      manufacturer: brandBytes,
      category: toBytes("Watch"),
      collection: toBytes("Oyster Perpetual"),
      model: toBytes("Submariner"),
      productReference: toBytes("REF-123"),
      productionDate: toBytes("2026-06-09"),
      maintenanceCounter: 0,
      uri: toBytes(uri)
    });

    it("Should allow level 2 manufacturer admin to mint a token", async function () {
      const { contract, manufacturerAdmin, brandBytes, vault } = setup;
      const uri = "ipfs://QmProduct1";
      const params = getMintParams("SN-001", brandBytes, uri);

      await expect(contract.connect(manufacturerAdmin).mint(params))
        .to.emit(contract, "PassportMinted");

      // Check ownership
      // Ripemd160 hash of manufacturer "ROLEX" (with counter 0)
      const expectedTokenCount = 0;
      const expectedTempo = ethers.ripemd160(brandBytes);
      const expectedPrefix = BigInt(expectedTempo).toString();
      const expectedId = BigInt(expectedPrefix + expectedTokenCount.toString());

      expect(await contract.ownerOf(expectedId)).to.equal(vault.address);
      expect(await contract.tokenURI(expectedId)).to.equal(setup.baseURI + uri);

      const prod = await contract.productInfo(expectedId);
      expect(prod.tokenId).to.equal(expectedId);
      expect(prod.hashID).to.equal(params.hashID);
      expect(prod.isStolen).to.be.false;

      expect(await contract.hashIDMinted(params.hashID)).to.be.true;
    });

    it("Should revert if non-admin or level 1 admin attempts to mint", async function () {
      const { contract, manufacturerAdminLevel1, user1, brandBytes } = setup;
      const params = getMintParams("SN-002", brandBytes, "ipfs://QmProduct2");

      await expect(contract.connect(manufacturerAdminLevel1).mint(params))
        .to.be.revertedWithCustomError(contract, "InvalidLevel");

      await expect(contract.connect(user1).mint(params))
        .to.be.revertedWithCustomError(contract, "InvalidLevel");
    });

    it("Should revert on invalid/empty mint parameters", async function () {
      const { contract, owner, manufacturerAdmin, brandBytes } = setup;

      // Empty URI
      let p = getMintParams("SN-003", brandBytes, "");
      await expect(contract.connect(manufacturerAdmin).mint(p))
        .to.be.revertedWithCustomError(contract, "InvalidURI");

      // Empty manufacturer
      // We connect as owner (system admin) so we bypass the manufacturer admin level check
      p = getMintParams("SN-003", ethers.ZeroAddress, "ipfs://Qm");
      p.manufacturer = "0x";
      await expect(contract.connect(owner).mint(p))
        .to.be.revertedWithCustomError(contract, "InvalidManufacturer");

      // Empty Category
      p = getMintParams("SN-003", brandBytes, "ipfs://Qm");
      p.category = "0x";
      await expect(contract.connect(manufacturerAdmin).mint(p))
        .to.be.revertedWithCustomError(contract, "InvalidCategory");

      // Empty Collection
      p = getMintParams("SN-003", brandBytes, "ipfs://Qm");
      p.collection = "0x";
      await expect(contract.connect(manufacturerAdmin).mint(p))
        .to.be.revertedWithCustomError(contract, "InvalidCollection");

      // Empty Model
      p = getMintParams("SN-003", brandBytes, "ipfs://Qm");
      p.model = "0x";
      await expect(contract.connect(manufacturerAdmin).mint(p))
        .to.be.revertedWithCustomError(contract, "InvalidModel");

      // Empty ProductionDate
      p = getMintParams("SN-003", brandBytes, "ipfs://Qm");
      p.productionDate = "0x";
      await expect(contract.connect(manufacturerAdmin).mint(p))
        .to.be.revertedWithCustomError(contract, "InvalidProductionDate");

      // Empty Reference
      p = getMintParams("SN-003", brandBytes, "ipfs://Qm");
      p.productReference = "0x";
      await expect(contract.connect(manufacturerAdmin).mint(p))
        .to.be.revertedWithCustomError(contract, "InvalidReference");
    });

    it("Should revert if hashID is already minted", async function () {
      const { contract, manufacturerAdmin, brandBytes } = setup;
      const params = getMintParams("SN-DUPLICATE", brandBytes, "ipfs://QmProduct");

      await contract.connect(manufacturerAdmin).mint(params);

      // Attempt duplicate
      await expect(contract.connect(manufacturerAdmin).mint(params))
        .to.be.revertedWithCustomError(contract, "ProductIdAlreadyDeclared");
    });

    it("Should allow batch minting of up to 20 tokens", async function () {
      const { contract, manufacturerAdmin, brandBytes, vault } = setup;
      
      const args = [];
      for (let i = 0; i < 5; i++) {
        args.push(getMintParams(`SN-BATCH-${i}`, brandBytes, `ipfs://QmBatch${i}`));
      }

      await expect(contract.connect(manufacturerAdmin).batchMint(args))
        .to.not.be.reverted;

      // Verify all minted to vault
      // Ripemd160 hash prefix remains same
      const expectedTempo = ethers.ripemd160(brandBytes);
      const expectedPrefix = BigInt(expectedTempo).toString();

      for (let i = 0; i < 5; i++) {
        const expectedId = BigInt(expectedPrefix + i.toString());
        expect(await contract.ownerOf(expectedId)).to.equal(vault.address);
      }
    });

    it("Should revert batchMint if length exceeds 20", async function () {
      const { contract, manufacturerAdmin, brandBytes } = setup;
      const args = [];
      for (let i = 0; i < 21; i++) {
        args.push(getMintParams(`SN-BATCH-${i}`, brandBytes, `ipfs://QmBatch${i}`));
      }

      await expect(contract.connect(manufacturerAdmin).batchMint(args))
        .to.be.revertedWithCustomError(contract, "TooManyArguments");
    });

    it("Should collect indices of failed items in batchMint instead of reverting", async function () {
      const { contract, manufacturerAdmin, brandBytes } = setup;
      const params1 = getMintParams("SN-OK-1", brandBytes, "ipfs://Qm1");
      const params2 = getMintParams("SN-BAD-2", brandBytes, ""); // Empty URI fails validation
      const params3 = getMintParams("SN-OK-3", brandBytes, "ipfs://Qm3");

      // Retrieve return value of batchMint using staticCall before sending actual tx
      const failedIndices = await contract.connect(manufacturerAdmin).batchMint.staticCall([params1, params2, params3]);
      expect(failedIndices.length).to.equal(1);
      expect(failedIndices[0]).to.equal(1); // params2 at index 1 failed
    });

    it("Should allow burning of a token in vault", async function () {
      const { contract, manufacturerAdmin, brandBytes, vault } = setup;
      const params = getMintParams("SN-BURN-1", brandBytes, "ipfs://QmBurn");
      await contract.connect(manufacturerAdmin).mint(params);

      // Verify token exists
      const expectedTempo = ethers.ripemd160(brandBytes);
      const expectedPrefix = BigInt(expectedTempo).toString();
      const tokenId = BigInt(expectedPrefix + "0");

      expect(await contract.ownerOf(tokenId)).to.equal(vault.address);

      // Add a warranty & maintenance record to check if they are deleted on burn
      await contract.connect(manufacturerAdmin).setProductWarranty(tokenId, toBytes("1 year"), toBytes("W-1"));
      await contract.connect(manufacturerAdmin).setMaintenanceRecord(tokenId, toBytes("2026-06-09"), toBytes("Diag"));

      // Burn it
      await expect(contract.connect(manufacturerAdmin).burn(tokenId))
        .to.emit(contract, "PassportBurned")
        .withArgs(tokenId, brandBytes);

      // Check it is deleted
      await expect(contract.ownerOf(tokenId))
        .to.be.revertedWithCustomError(contract, "ERC721NonexistentToken");

      // Verify hashID is freed
      expect(await contract.hashIDMinted(params.hashID)).to.be.false;

      // Verify warranty is deleted
      const warranty = await contract.productWarranty(tokenId);
      expect(warranty.manufacturer).to.equal("0x");

      // Verify maintenance is deleted
      const maint = await contract.listMaintenanceRecords(tokenId);
      expect(maint.length).to.equal(0);
    });

    it("Should revert burn if token is not owned by the manufacturer's vault", async function () {
      const { contract, manufacturerAdmin, brandBytes, user1, vault } = setup;
      const params = getMintParams("SN-BURN-FAIL", brandBytes, "ipfs://QmBurnFail");
      await contract.connect(manufacturerAdmin).mint(params);

      const expectedTempo = ethers.ripemd160(brandBytes);
      const expectedPrefix = BigInt(expectedTempo).toString();
      const tokenId = BigInt(expectedPrefix + "0");

      // Transfer token to user1
      await contract.connect(vault).transferFrom(vault.address, user1.address, tokenId);

      // Attempt to burn
      await expect(contract.connect(manufacturerAdmin).burn(tokenId))
        .to.be.revertedWithCustomError(contract, "NotInVault");
    });
  });

  describe("Product Status, Maintenance & Warranties", function () {
    let setup;
    let tokenId;

    beforeEach(async function () {
      setup = await loadFixture(deployHoraeFixture);
      await setup.contract.connect(setup.owner).addManufacturer(
        setup.brandBytes,
        setup.manufacturerAdmin.address,
        setup.vault.address,
        500,
        3600,
        true
      );
      
      // Mint a token
      const params = {
        hashID: toBytes("SN-STATUS-1"),
        manufacturer: setup.brandBytes,
        category: toBytes("Watch"),
        collection: toBytes("Oyster"),
        model: toBytes("Sub"),
        productReference: toBytes("REF"),
        productionDate: toBytes("2026-06-09"),
        maintenanceCounter: 0,
        uri: toBytes("ipfs://Qm1")
      };
      await setup.contract.connect(setup.manufacturerAdmin).mint(params);

      const expectedTempo = ethers.ripemd160(setup.brandBytes);
      const expectedPrefix = BigInt(expectedTempo).toString();
      tokenId = BigInt(expectedPrefix + "0");
    });

    it("Should allow setting product stolen status", async function () {
      const { contract, vault, manufacturerAdmin } = setup;

      // Vault is the current owner
      await expect(contract.connect(vault).setStolenStatus(tokenId, true))
        .to.emit(contract, "StolenStatus")
        .withArgs(tokenId, true);

      let prod = await contract.productInfo(tokenId);
      expect(prod.isStolen).to.be.true;

      // Recover product
      await expect(contract.connect(manufacturerAdmin).setStolenStatus(tokenId, false))
        .to.emit(contract, "StolenStatus")
        .withArgs(tokenId, false);

      prod = await contract.productInfo(tokenId);
      expect(prod.isStolen).to.be.false;
    });

    it("Should block transfers if a product is marked as stolen", async function () {
      const { contract, vault, user1 } = setup;

      await contract.connect(vault).setStolenStatus(tokenId, true);

      await expect(contract.connect(vault).transferFrom(vault.address, user1.address, tokenId))
        .to.be.revertedWithCustomError(contract, "ProductStolen");
    });

    it("Should allow adding and deleting maintenance records", async function () {
      const { contract, manufacturerAdmin } = setup;

      const dateStr = toBytes("2026-06-09");
      const detailsStr = toBytes("Replaced bezel");

      await expect(contract.connect(manufacturerAdmin).setMaintenanceRecord(tokenId, dateStr, detailsStr))
        .to.emit(contract, "MaintenanceRecordInfo")
        .withArgs(tokenId, 0, detailsStr, dateStr);

      let records = await contract.listMaintenanceRecords(tokenId);
      expect(records.length).to.equal(1);
      expect(records[0].id).to.equal(0);
      expect(records[0].date).to.equal(dateStr);
      expect(records[0].linkToDetails).to.equal(detailsStr);

      // Add second record
      const details2 = toBytes("Polished case");
      await contract.connect(manufacturerAdmin).setMaintenanceRecord(tokenId, dateStr, details2);
      records = await contract.listMaintenanceRecords(tokenId);
      expect(records.length).to.equal(2);

      // Delete first record
      await expect(contract.connect(manufacturerAdmin).deleteMaintenanceRecord(tokenId, 0))
        .to.emit(contract, "MaintenanceRecordDeleted")
        .withArgs(tokenId, 0);

      records = await contract.listMaintenanceRecords(tokenId);
      expect(records.length).to.equal(1);
      // The slot is replaced with details2 (swap & pop mechanism)
      expect(records[0].id).to.equal(1);
      expect(records[0].linkToDetails).to.equal(details2);
    });

    it("Should revert maintenance changes if product is stolen", async function () {
      const { contract, vault, manufacturerAdmin } = setup;

      await contract.connect(vault).setStolenStatus(tokenId, true);

      await expect(contract.connect(manufacturerAdmin).setMaintenanceRecord(tokenId, toBytes("D"), toBytes("I")))
        .to.be.revertedWithCustomError(contract, "ProductStolen");

      await expect(contract.connect(manufacturerAdmin).deleteMaintenanceRecord(tokenId, 0))
        .to.be.revertedWithCustomError(contract, "ProductStolen");
    });

    it("Should revert deleteMaintenanceRecord if maintenance record does not exist", async function () {
      const { contract, manufacturerAdmin } = setup;

      await expect(contract.connect(manufacturerAdmin).deleteMaintenanceRecord(tokenId, 999))
        .to.be.revertedWithCustomError(contract, "MaintenanceNotFound");
    });

    it("Should allow setting product warranty", async function () {
      const { contract, manufacturerAdmin, brandBytes } = setup;

      const terms = toBytes("2 years international warranty");
      const wId = toBytes("WARRANTY-12345");

      await expect(contract.connect(manufacturerAdmin).setProductWarranty(tokenId, terms, wId))
        .to.emit(contract, "ProductWarrantyInfo")
        .withArgs(tokenId, brandBytes, terms, wId);

      const warranty = await contract.productWarranty(tokenId);
      expect(warranty.manufacturer).to.equal(brandBytes);
      expect(warranty.terms).to.equal(terms);
      expect(warranty.warrantyID).to.equal(wId);
    });

    it("Should revert warranty setting if product is stolen", async function () {
      const { contract, vault, manufacturerAdmin } = setup;

      await contract.connect(vault).setStolenStatus(tokenId, true);

      await expect(contract.connect(manufacturerAdmin).setProductWarranty(tokenId, toBytes("t"), toBytes("w")))
        .to.be.revertedWithCustomError(contract, "ProductStolen");
    });
  });

  describe("Transfer Mechanics & Claim Flows", function () {
    let setup;
    let tokenId;

    beforeEach(async function () {
      setup = await loadFixture(deployHoraeFixture);
      // Register ROLEX with 2 days withdrawal date limit
      await setup.contract.connect(setup.owner).addManufacturer(
        setup.brandBytes,
        setup.manufacturerAdmin.address,
        setup.vault.address,
        500,
        3600 * 24 * 2, // 2 days
        true // delegatedTransfer enabled
      );

      const params = {
        hashID: toBytes("SN-TRANSFER-1"),
        manufacturer: setup.brandBytes,
        category: toBytes("Watch"),
        collection: toBytes("Oyster"),
        model: toBytes("Sub"),
        productReference: toBytes("REF"),
        productionDate: toBytes("2026-06-09"),
        maintenanceCounter: 0,
        uri: toBytes("ipfs://Qm1")
      };
      await setup.contract.connect(setup.manufacturerAdmin).mint(params);

      const expectedTempo = ethers.ripemd160(setup.brandBytes);
      const expectedPrefix = BigInt(expectedTempo).toString();
      tokenId = BigInt(expectedPrefix + "0");
    });

    it("Should update claimDate to block.timestamp when transferring OUT of vault", async function () {
      const { contract, vault, user1 } = setup;

      let prod = await contract.productInfo(tokenId);
      expect(prod.claimDate).to.equal(0);

      const tx = await contract.connect(vault).transferFrom(vault.address, user1.address, tokenId);
      const receipt = await tx.wait();
      const txBlock = await ethers.provider.getBlock(receipt.blockNumber);

      prod = await contract.productInfo(tokenId);
      expect(prod.claimDate).to.equal(txBlock.timestamp);
    });

    it("Should reset claimDate to 0 when transferring BACK into vault", async function () {
      const { contract, vault, user1 } = setup;

      // Transfer out
      await contract.connect(vault).transferFrom(vault.address, user1.address, tokenId);
      
      // Transfer back
      await contract.connect(user1).transferFrom(user1.address, vault.address, tokenId);

      const prod = await contract.productInfo(tokenId);
      expect(prod.claimDate).to.equal(0);
    });

    it("Should allow retraction transfer within withdrawal date limit", async function () {
      const { contract, vault, user1, manufacturerAdmin } = setup;

      // Transfer out
      await contract.connect(vault).transferFrom(vault.address, user1.address, tokenId);

      // Retrieve via retractionTransferVault (only manufacturer level 2 admin can do this)
      await expect(contract.connect(manufacturerAdmin).retractionTransferVault(tokenId))
        .to.emit(contract, "RetractionTransfer")
        .withArgs(user1.address, tokenId, setup.brandBytes);

      expect(await contract.ownerOf(tokenId)).to.equal(vault.address);
    });

    it("Should revert retraction transfer after withdrawal date limit", async function () {
      const { contract, vault, user1, manufacturerAdmin } = setup;

      // Transfer out
      await contract.connect(vault).transferFrom(vault.address, user1.address, tokenId);

      // Increase EVM time by 3 days (withdrawal limit is 2 days)
      await time.increase(3600 * 24 * 3);

      await expect(contract.connect(manufacturerAdmin).retractionTransferVault(tokenId))
        .to.be.revertedWithCustomError(contract, "TimeExpired");
    });

    it("Should allow manufacturer delegated transfer to rescue token when user loses wallet access", async function () {
      const { contract, vault, user1, manufacturerAdmin } = setup;

      // Transfer to user1
      await contract.connect(vault).transferFrom(vault.address, user1.address, tokenId);

      // Execute delegated transfer back to vault
      await expect(contract.connect(manufacturerAdmin).manufacturerDelegatedTransfer(user1.address, tokenId))
        .to.emit(contract, "DelegatedTransfer")
        .withArgs(user1.address, tokenId, setup.brandBytes);

      expect(await contract.ownerOf(tokenId)).to.equal(vault.address);
    });

    it("Should revert manufacturer delegated transfer if disabled", async function () {
      const { contract, owner, vault, user1, manufacturerAdmin, brandBytes } = setup;

      // Disable delegated transfer
      await contract.connect(owner).modifyManufacturer(brandBytes, vault.address, 500, 3600, false);

      // Transfer to user1
      await contract.connect(vault).transferFrom(vault.address, user1.address, tokenId);

      // Attempt delegated transfer
      await expect(contract.connect(manufacturerAdmin).manufacturerDelegatedTransfer(user1.address, tokenId))
        .to.be.revertedWithCustomError(contract, "UnauthorizedDelegatedTransfer");
    });
  });

  describe("URI Management", function () {
    let setup;
    let tokenIds;

    beforeEach(async function () {
      setup = await loadFixture(deployHoraeFixture);
      await setup.contract.connect(setup.owner).addManufacturer(
        setup.brandBytes,
        setup.manufacturerAdmin.address,
        setup.vault.address,
        500,
        3600,
        true
      );

      // Mint 3 tokens
      tokenIds = [];
      const expectedTempo = ethers.ripemd160(setup.brandBytes);
      const expectedPrefix = BigInt(expectedTempo).toString();

      for (let i = 0; i < 3; i++) {
        const params = {
          hashID: toBytes(`SN-URI-${i}`),
          manufacturer: setup.brandBytes,
          category: toBytes("Watch"),
          collection: toBytes("Oyster"),
          model: toBytes("Sub"),
          productReference: toBytes("REF"),
          productionDate: toBytes("2026-06-09"),
          maintenanceCounter: 0,
          uri: toBytes(`QmVal${i}`)
        };
        await setup.contract.connect(setup.manufacturerAdmin).mint(params);
        tokenIds.push(BigInt(expectedPrefix + i.toString()));
      }
    });

    it("Should return baseURI concatenated with tokenURI", async function () {
      const { contract, baseURI } = setup;
      expect(await contract.tokenURI(tokenIds[0])).to.equal(baseURI + "QmVal0");
    });

    it("Should return only tokenURI if baseURI is set to empty", async function () {
      const { contract, owner } = setup;

      await contract.connect(owner).setBaseURI("");
      expect(await contract.tokenURI(tokenIds[0])).to.equal("QmVal0");
    });

    it("Should allow single setTokenURI", async function () {
      const { contract, manufacturerAdmin } = setup;

      const newUri = "ipfs://QmNewSingle";
      await expect(contract.connect(manufacturerAdmin).setTokenURI(tokenIds[0], newUri))
        .to.emit(contract, "TokenURI")
        .withArgs(tokenIds[0], newUri);

      expect(await contract.tokenURI(tokenIds[0])).to.equal(setup.baseURI + newUri);
    });

    it("Should allow batchSetTokenURI", async function () {
      const { contract, manufacturerAdmin } = setup;

      const newUris = ["ipfs://QmNew1", "ipfs://QmNew2"];
      await expect(contract.connect(manufacturerAdmin).batchSetTokenURI([tokenIds[0], tokenIds[1]], newUris))
        .to.not.be.reverted;

      expect(await contract.tokenURI(tokenIds[0])).to.equal(setup.baseURI + "ipfs://QmNew1");
      expect(await contract.tokenURI(tokenIds[1])).to.equal(setup.baseURI + "ipfs://QmNew2");
    });

    it("Should revert batchSetTokenURI on mismatched input lengths or > 20 inputs", async function () {
      const { contract, manufacturerAdmin } = setup;

      await expect(contract.connect(manufacturerAdmin).batchSetTokenURI([tokenIds[0]], ["a", "b"]))
        .to.be.revertedWithCustomError(contract, "MismatchedInputsLength");

      const giantIds = Array(21).fill(tokenIds[0]);
      const giantUris = Array(21).fill("a");
      await expect(contract.connect(manufacturerAdmin).batchSetTokenURI(giantIds, giantUris))
        .to.be.revertedWithCustomError(contract, "TooManyArguments");
    });

    it("Should return failed IDs in batchSetTokenURI if some tokens fail validation", async function () {
      const { contract, manufacturerAdmin } = setup;

      // tokenIds[0] belongs to ROLEX and caller is admin.
      // 99999 does not exist (so manufacturer length is 0), which will fail validation.
      const result = await contract.connect(manufacturerAdmin).batchSetTokenURI.staticCall(
        [tokenIds[0], 99999n],
        ["ipfs://QmNew1", "ipfs://QmNew2"]
      );

      expect(result.length).to.equal(1);
      expect(result[0]).to.equal(99999n);
    });

    it("Should fall back to ERC721 tokenURI concatenation if tokenURI is set to empty and baseURI is not empty", async function () {
      const { contract, manufacturerAdmin } = setup;

      await contract.connect(manufacturerAdmin).setTokenURI(tokenIds[0], "");
      expect(await contract.tokenURI(tokenIds[0])).to.equal(setup.baseURI + tokenIds[0].toString());
    });
  });

  describe("Pausable & Financial Features", function () {
    let setup;
    let tokenId;

    beforeEach(async function () {
      setup = await loadFixture(deployHoraeFixture);
      await setup.contract.connect(setup.owner).addManufacturer(
        setup.brandBytes,
        setup.manufacturerAdmin.address,
        setup.vault.address,
        500,
        3600,
        true
      );
      
      const params = {
        hashID: toBytes("SN-PAUSE-1"),
        manufacturer: setup.brandBytes,
        category: toBytes("Watch"),
        collection: toBytes("Oyster"),
        model: toBytes("Sub"),
        productReference: toBytes("REF"),
        productionDate: toBytes("2026-06-09"),
        maintenanceCounter: 0,
        uri: toBytes("ipfs://Qm1")
      };
      await setup.contract.connect(setup.manufacturerAdmin).mint(params);

      const expectedTempo = ethers.ripemd160(setup.brandBytes);
      const expectedPrefix = BigInt(expectedTempo).toString();
      tokenId = BigInt(expectedPrefix + "0");
    });

    it("Should allow system admin to pause and block pausable actions", async function () {
      const { contract, owner, manufacturerAdmin, brandBytes } = setup;

      await contract.connect(owner).setPause();

      // Mint should fail when paused
      const params = {
        hashID: toBytes("SN-PAUSE-2"),
        manufacturer: brandBytes,
        category: toBytes("Watch"),
        collection: toBytes("Oyster"),
        model: toBytes("Sub"),
        productReference: toBytes("REF"),
        productionDate: toBytes("2026-06-09"),
        maintenanceCounter: 0,
        uri: toBytes("ipfs://Qm2")
      };
      await expect(contract.connect(manufacturerAdmin).mint(params))
        .to.be.revertedWithCustomError(contract, "EnforcedPause");

      // Burn should fail when paused
      await expect(contract.connect(manufacturerAdmin).burn(tokenId))
        .to.be.revertedWithCustomError(contract, "EnforcedPause");

      // Unpause
      await contract.connect(owner).setUnpause();
      await expect(contract.connect(manufacturerAdmin).burn(tokenId)).to.not.be.reverted;
    });

    it("Should accept direct ETH payments and allow owner to withdraw", async function () {
      const { contract, owner, user1 } = setup;

      // Send 1 ETH directly
      const amount = ethers.parseEther("1.0");
      await user1.sendTransaction({
        to: contract.target,
        value: amount
      });

      expect(await contract.getBalance()).to.equal(amount);

      // Non-owner withdraw attempts revert
      await expect(contract.connect(user1).withdraw())
        .to.be.revertedWithCustomError(contract, "InvalidLevel");

      // Owner withdraws
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await contract.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.equal(initialBalance + amount - gasUsed);
      expect(await contract.getBalance()).to.equal(0);
    });
  });

  describe("Meta-Transactions (ERC2771)", function () {
    let setup;

    beforeEach(async function () {
      setup = await loadFixture(deployHoraeFixture);
      // Register manufacturer
      await setup.contract.connect(setup.owner).addManufacturer(
        setup.brandBytes,
        setup.manufacturerAdmin.address,
        setup.vault.address,
        500,
        3600,
        true
      );
    });

    it("Should correctly parse the _msgSender() when called through the trusted forwarder", async function () {
      const { contract, forwarder, manufacturerAdmin, brandBytes } = setup;

      const params = {
        hashID: toBytes("SN-METATX-1"),
        manufacturer: brandBytes,
        category: toBytes("Watch"),
        collection: toBytes("Oyster"),
        model: toBytes("Sub"),
        productReference: toBytes("REF"),
        productionDate: toBytes("2026-06-09"),
        maintenanceCounter: 0,
        uri: toBytes("ipfs://Qm1")
      };

      // Encode the mint function call
      const mintCalldata = contract.interface.encodeFunctionData("mint", [params]);

      // Append manufacturerAdmin's address to the calldata (ERC2771 layout: msg.data + 20-byte sender)
      const packedCalldata = ethers.solidityPacked(
        ["bytes", "address"],
        [mintCalldata, manufacturerAdmin.address]
      );

      // Execute via the forwarder
      // Expect it to succeed since manufacturerAdmin is level 2 admin and is verified as _msgSender()
      await expect(
        forwarder.sendTransaction({
          to: contract.target,
          data: packedCalldata
        })
      ).to.emit(contract, "PassportMinted");
    });

    it("Should revert if unauthorized user is forwarded as _msgSender()", async function () {
      const { contract, forwarder, user1, brandBytes } = setup;

      const params = {
        hashID: toBytes("SN-METATX-2"),
        manufacturer: brandBytes,
        category: toBytes("Watch"),
        collection: toBytes("Oyster"),
        model: toBytes("Sub"),
        productReference: toBytes("REF"),
        productionDate: toBytes("2026-06-09"),
        maintenanceCounter: 0,
        uri: toBytes("ipfs://Qm2")
      };

      const mintCalldata = contract.interface.encodeFunctionData("mint", [params]);
      const packedCalldata = ethers.solidityPacked(
        ["bytes", "address"],
        [mintCalldata, user1.address] // user1 is not an admin
      );

      // Expect to revert with InvalidLevel because user1 is not authorized
      await expect(
        forwarder.sendTransaction({
          to: contract.target,
          data: packedCalldata
        })
      ).to.be.revertedWithCustomError(contract, "InvalidLevel");
    });
  });
});
