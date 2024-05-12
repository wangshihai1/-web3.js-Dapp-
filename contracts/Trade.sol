// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; //控制智能合约编译器的版本

contract Trade{
    int256 num=0;
    struct trading{//一个订单结构体
        uint256 index;//用于快速定位该订单在订单列表中的位置
        address company_address;
        string company_name;
        string eqm_name;
        string eqm_num;
        string period;
        string cycle;
        string rent;
        int256 used;//标记该订单是否被接单
    }    
    trading[100] public tradings;

    //新增一笔订单
    function addTrading(string memory company_name,string memory eqm_name,string memory eqm_num,
        string memory period,string memory cycle,string memory rent)public {       
        num=num+1;
        tradings[uint256(num)]=trading(uint256(num),msg.sender,company_name,eqm_name,eqm_num,period,cycle,rent,0);
    }

    //处理接单事件
    function accept(int256 index) public {
        tradings[uint256(index)].used=1;//将该位置的订单标记为无效
    }

    //获取订单列表中的订单数量
    function get()public view returns(int256){
        return num;
    }

    //按照索引获取一个订单的信息
    function get_trading(int256 index) public view returns(int256,string memory,string memory,string memory,string memory,string memory,address,int256){
        trading memory result=tradings[uint256(index)];
        return (int256(result.index),result.eqm_name,result.eqm_num,result.period,result.cycle,result.rent,result.company_address,result.used);
    }
}
