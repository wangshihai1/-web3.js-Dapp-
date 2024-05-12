# 海洋租赁-dapp

基于 Solidity、Web3 和Truffle框架的设备租赁平台

###安装Ganache
Ganache是一个运行在本地的个人区块链，通过Ganache官网可以下载，其前身是TestRPC可以用来开发以太坊的个人区块链。
本项目运行在Ganache在本地模拟的区块链网络上（HTTP://127.0.0.1:7545）。
Gnanche下载链接：https://trufflesuite.com/ganache/

安装完成后运行Ganache。

### 开始

安装依赖：

```
npm install
```
编译合约

```
truffle compile --reset --all
```

### 合约部署
```
truffle migrate --reset --all
```

###启动项目
```
npm run dev
```
会自动弹出前端界面


