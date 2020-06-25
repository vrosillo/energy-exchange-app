let EnergyExchange = artifacts.require("./EnergyExchange.sol");

module.exports = function(deployer) {
  deployer.deploy(EnergyExchange);
};