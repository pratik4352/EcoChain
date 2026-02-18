// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {ERC20Burnable} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';

contract EcoChainCredit is ERC20, ERC20Burnable, AccessControl {
  bytes32 public constant ISSUER_ROLE = keccak256('ISSUER_ROLE');

  mapping(address => uint256) public retiredCredits;

  event IssuerAdded(address indexed issuer);
  event IssuerRemoved(address indexed issuer);
  event Retirement(address indexed account, uint256 amount);

  constructor(address initialAdmin) ERC20('EcoChain Credit', 'ECC') {
    _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
    _grantRole(ISSUER_ROLE, initialAdmin);
  }

  function addIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
    grantRole(ISSUER_ROLE, issuer);
    emit IssuerAdded(issuer);
  }

  function removeIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
    revokeRole(ISSUER_ROLE, issuer);
    emit IssuerRemoved(issuer);
  }

  function mint(address to, uint256 amount) external onlyRole(ISSUER_ROLE) {
    _mint(to, amount);
  }

  function retire(uint256 amount) external {
    _burn(msg.sender, amount);
    retiredCredits[msg.sender] += amount;
    emit Retirement(msg.sender, amount);
  }
}
