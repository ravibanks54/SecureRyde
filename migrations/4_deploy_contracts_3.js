var CarRegistry = artifacts.require("./CarRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(CarRegistry);
};
