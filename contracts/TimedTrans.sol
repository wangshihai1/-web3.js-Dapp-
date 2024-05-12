// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TimedTrans {
    int256 num=0;//用来记录转账关系的对数

    struct Trans{//一个账单结构体
        address payable recipient;//转账接收方
        string eq_name;
        string eq_num;
        int256 transferAmount;//转账数量
        int256 lastTransferTimestamp;//上一次转账时间
        int256 transferInterval;//每次转账间隔s
    }

    mapping (address => Trans[]) public Trans_list; // 存储设备信息的数组

    //存入一份待支付订单
    function addTransfer(address payable recipient,string memory eq_name,string memory eq_num,int256 transferAmount,int256 transferInterval) public returns(int256){
        Trans_list[msg.sender].push(Trans(recipient,eq_name,eq_num,transferAmount,int256(block.timestamp),transferInterval));
        return int256(Trans_list[msg.sender].length);
        //上次支付租金的时间lastTransferTimestamp就是当前调用这个函数的时间block.timestamp
    }



    // 获取用户待支付订单数量
    function get_length()public view returns(int256){       
        return int256(Trans_list[msg.sender].length);
    }

    //按照索引获取一个账单
    function get_transfer(int256 index)public view returns (address payable,string memory,string memory,int256,int256,int256){
        Trans memory T=Trans_list[msg.sender][uint256(index)];
        return (T.recipient,T.eq_name,T.eq_num,T.transferAmount,T.lastTransferTimestamp,T.transferInterval);
    }

    //按照期限支付账单
    function sendFunds(int256 index) public payable {

        int256 lastTransferTimestamp=Trans_list[msg.sender][uint256(index)].lastTransferTimestamp;
        int256 transferInterval=Trans_list[msg.sender][uint256(index)].transferInterval;
        Trans_list[msg.sender][uint256(index)].lastTransferTimestamp+=Trans_list[msg.sender][uint256(index)].transferInterval;
        //检查是否到了支付租金的
        require(block.timestamp >= uint256(lastTransferTimestamp + transferInterval), "Transfer interval not elapsed yet");

        address recipient=Trans_list[msg.sender][uint256(index)].recipient;
        // int256 transferAmount=Trans_list[msg.sender][uint256(index)].transferAmount;

        payable(recipient).transfer(msg.value);
        Trans_list[msg.sender][uint256(index)].lastTransferTimestamp=int256(block.timestamp);//更新上次支付租金的时间

    }
}

