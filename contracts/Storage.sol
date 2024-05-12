// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; //控制智能合约编译器的版本

contract Storage {
    int256 num=0;
    struct equipment {
        string symbol;//设备标识码
        string is_leased;//设备是否被租赁
        string equipment_name;//设备名称
        string Model_number;//设备型号
        string status;//设备状态（运行、停机、维护或故障）
        string Production_parameter;//生产参数
        string Transportation_information;//运输信息，标识设备当前的位置，随着物流更新
        string date;//生产日期
    }

    mapping (string => equipment) public equipments; // 存储设备信息的数组

    // //添加设备信息
    function addMachine(string memory _symbol,string memory lease,string memory _equipment_name,string memory _Model_number,
    string memory _status,string memory _Production_parameter,string memory _Transportation_information, string memory _date) public returns(int256){
        equipment memory neweqp = equipment(_symbol,lease, _equipment_name, _Model_number, _status, _Production_parameter,_Transportation_information,  _date);
        equipments[_symbol]=neweqp;
        num+=1;
        return num;
    }

    //查询设备信息
    function get_equipment_message(string memory _symbol) public view returns (string memory ,string memory,string memory,string memory,
    string memory,string memory,string memory,string memory) {
        equipment memory result= equipments[_symbol];
        return (result.symbol,result.is_leased,result.equipment_name,result.Model_number,result.status,
        result.Production_parameter,result.Transportation_information,result.date);
    }


    // 获取已存储的人员信息数量
    function get_equipment_Count() public view returns (int256) {
        return num;
    }

}
