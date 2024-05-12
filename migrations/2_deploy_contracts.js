//创建自己的迁移文件-2_deploy_contracts.js var 

//需要部署新的合约就在此文件中添加相应的合约名字
var Adoption = artifacts.require("Adoption");

module.exports = function(deployer) {
  deployer.deploy(Adoption);

};
 //在端口7454上运行本地区块链 
//  truffle migrate
