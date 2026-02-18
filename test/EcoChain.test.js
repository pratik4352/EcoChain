const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('EcoChain system', function () {
  async function deployContracts() {
    const [admin, issuer, seller, buyer] = await ethers.getSigners();

    const Credit = await ethers.getContractFactory('EcoChainCredit');
    const credit = await Credit.deploy(admin.address);
    await credit.waitForDeployment();

    const Marketplace = await ethers.getContractFactory('EcoChainMarketplace');
    const marketplace = await Marketplace.deploy(await credit.getAddress());
    await marketplace.waitForDeployment();

    return { admin, issuer, seller, buyer, credit, marketplace };
  }

  it('allows approved issuers to mint carbon credits', async function () {
    const { admin, issuer, buyer, credit } = await deployContracts();

    await expect(credit.connect(issuer).mint(buyer.address, 100)).to.be.reverted;

    await credit.connect(admin).addIssuer(issuer.address);
    await credit.connect(issuer).mint(buyer.address, 100);

    expect(await credit.balanceOf(buyer.address)).to.equal(100);
  });

  it('transfers carbon credits between users', async function () {
    const { admin, seller, buyer, credit } = await deployContracts();

    await credit.connect(admin).mint(seller.address, 50);
    await credit.connect(seller).transfer(buyer.address, 20);

    expect(await credit.balanceOf(seller.address)).to.equal(30);
    expect(await credit.balanceOf(buyer.address)).to.equal(20);
  });

  it('lists credits on the marketplace', async function () {
    const { admin, seller, credit, marketplace } = await deployContracts();

    await credit.connect(admin).mint(seller.address, 100);
    const price = ethers.parseEther('0.5');

    await expect(marketplace.connect(seller).listCredits(40, price))
      .to.emit(marketplace, 'CreditListed')
      .withArgs(0, seller.address, 40, price);

    const listing = await marketplace.listings(0);
    expect(listing.seller).to.equal(seller.address);
    expect(listing.amount).to.equal(40);
    expect(listing.price).to.equal(price);
    expect(listing.active).to.equal(true);
  });

  it('buys listed credits with native token payment', async function () {
    const { admin, seller, buyer, credit, marketplace } = await deployContracts();

    await credit.connect(admin).mint(seller.address, 100);
    await credit.connect(seller).approve(await marketplace.getAddress(), 60);

    const price = ethers.parseEther('1');
    await marketplace.connect(seller).listCredits(60, price);

    await expect(marketplace.connect(buyer).buyCredits(0, { value: price }))
      .to.emit(marketplace, 'CreditBought')
      .withArgs(0, buyer.address, 60, price);

    expect(await credit.balanceOf(buyer.address)).to.equal(60);

    const listing = await marketplace.listings(0);
    expect(listing.active).to.equal(false);
  });

  it('burns credits for retirement and tracks retired totals', async function () {
    const { admin, buyer, credit } = await deployContracts();

    await credit.connect(admin).mint(buyer.address, 80);

    await expect(credit.connect(buyer).retire(30))
      .to.emit(credit, 'Retirement')
      .withArgs(buyer.address, 30);

    expect(await credit.balanceOf(buyer.address)).to.equal(50);
    expect(await credit.retiredCredits(buyer.address)).to.equal(30);
  });
});
