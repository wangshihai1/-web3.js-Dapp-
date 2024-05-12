var Storage = artifacts.require("Storage");
var Trade = artifacts.require("Trade");
var TimedTrans = artifacts.require("TimedTrans");


module.exports = function(deployer) {
    deployer.deploy(Storage);
    deployer.deploy(Trade);
    deployer.deploy(TimedTrans);
  
  };