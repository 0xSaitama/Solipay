// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;

interface IProxy {
  function totalVotingPower() external view returns(uint);
  function getAdrClients() external view returns(address[] memory);
  function getUserDeposits(address addr) external view returns(uint);
}
