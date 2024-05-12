message={
  web3Provider: null,
  contracts: {},
  
  initWeb3: async function() {//初始化web3
    // Modern dapp browsers...
    if (window.ethereum) {
      message.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      message.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      message.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(message.web3Provider);

    return  message.initContract();
  },

  initContract: function() {//初始化智能合约
    
    $.getJSON('Storage.json', function(data) {
       console.log("找到合约");
      // 用Storage.json数据创建一个可交互的TruffleContract合约实例。
      var StorageArtifact = data;
      message.contracts.Storage = TruffleContract(StorageArtifact);

      // Set the provider for our contract
      message.contracts.Storage.setProvider(message.web3Provider);
    });

    return message.bindEvents();
  },
  
  bindEvents: function() {//关联事件
    $(document).on('click', '.btn', message.handleMessage);//用户输入信息的事件
    $(document).on('click', '.check_num', message.get_equipment_Count);
    $(document).on('click', '.check', message.handleCheck);
  },

  get_equipment_Count:function(){//查询设备数量
    var  s= $('#num');//找到id为num的元素
    message.contracts.Storage.deployed().then(function(instance) {//回调函数，在合约被成功部署之后执行
      console.log("合约已被调用")
      var StorageInstance = instance;
      console.log(StorageInstance.address);
      StorageInstance.get_equipment_Count().then(function(result){//调用智能合约的函数去获取设备数量
        s.text(result);//将查询的数量显示出来
        // console.log(result);
      });

    })
  },

  handleMessage: function(){//处理用户提交信息
   
    //获取当前合约调用者的地址
    web3.eth.getAccounts(function(error, accounts) {

      if (error) {
        console.log(error);
      }

      account=accounts[0];
      var text1=$("#input1").val();//找到id为input1的元素
      var text2=$("#input2").val();
      var text3=$("#input3").val();
      var text4=$("#input4").val();
      var text5=$("#input5").val();
      var text6=$("#input6").val();
      var text7=$("#input7").val();
      var text8=$("#input8").val();
   
  
      message.contracts.Storage.deployed().then(function(instance) {//回调函数，在合约被成功部署之后执行
        console.log("合约部署成功");  
        var StorageInstance = instance;//获取部署的合约实例
        StorageInstance.addMachine(text1,text2,text3,text4,text5,text6,text7,text8,{from: account}).then(function(num){
          console.log(num);
        });
      })
    })
  },

  handleCheck:function(){
    var text1=$("#input9").val();
    message.contracts.Storage.deployed().then(function(instance) {//回调函数，在合约被成功部署之后执行
      console.log("合约部署成功");
      var StorageInstance = instance;//获取部署的合约实例
      StorageInstance.get_equipment_message(text1).then(function(result){
        $("#out1").text(result[0]);
        $("#out2").text(result[1]);
        $("#out3").text(result[2]);
        $("#out4").text(result[3]);
        $("#out5").text(result[4]);
        $("#out6").text(result[5]);
        $("#out7").text(result[6]);
        $("#out8").text(result[7]);

      });
    })
  }
}

$(function() {
  $(window).load(function() {
    message.initWeb3();
  });
});
