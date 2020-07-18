// var Election = artifacts.require("./Election.sol");
// var Project = artifacts.require("./Project.sol");
// var Transfer = artifacts.require("./Transfer.sol");
var Governor = artifacts.require("./Governor.sol");

module.exports = function(deployer) {
  // deployer.deploy(Project);
  // deployer.deploy(Transfer);
  deployer.deploy(Governor);
};
