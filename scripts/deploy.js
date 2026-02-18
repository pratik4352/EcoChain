const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const EcoChainCredit = await hre.ethers.getContractFactory('EcoChainCredit');
  const ecoChainCredit = await EcoChainCredit.deploy(deployer.address);
  await ecoChainCredit.waitForDeployment();

  const EcoChainMarketplace = await hre.ethers.getContractFactory('EcoChainMarketplace');
  const ecoChainMarketplace = await EcoChainMarketplace.deploy(await ecoChainCredit.getAddress());
  await ecoChainMarketplace.waitForDeployment();

  console.log('EcoChainCredit deployed to:', await ecoChainCredit.getAddress());
  console.log('EcoChainMarketplace deployed to:', await ecoChainMarketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
