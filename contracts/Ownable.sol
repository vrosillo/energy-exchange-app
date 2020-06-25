pragma solidity ^0.4.24;

contract Ownable{

address private owner;

  constructor() public {
    owner = msg.sender;
  }

  modifier isOwner() {
    if (msg.sender == owner)
      _;
  }
}