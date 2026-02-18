# EcoChain Carbon Credit Trading (Hardhat)

This project contains Solidity smart contracts and Hardhat tooling for a carbon credit trading system deployable to Polygon Amoy testnet.

## Tech Stack
- Solidity `^0.8.20`
- Hardhat
- OpenZeppelin Contracts
- Polygon Amoy testnet deployment config

## Contracts
- `EcoChainCredit`: ERC20 carbon credit token with approved issuer minting and retirement tracking.
- `EcoChainMarketplace`: Marketplace for listing and buying carbon credits with native token payments.

## Setup
```bash
npm install
cp .env.example .env
```

Add your values to `.env`:
- `POLYGON_AMOY_RPC_URL`
- `PRIVATE_KEY`

## Compile
```bash
npx hardhat compile
```

## Test
```bash
npx hardhat test
```

## Deploy to Polygon Amoy
```bash
npx hardhat run scripts/deploy.js --network polygonAmoy
```
