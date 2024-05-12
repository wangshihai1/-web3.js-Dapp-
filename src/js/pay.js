pay={
    web3Provider: null,
    contracts: {},
    initWeb3: async function() {//初始化web3
        if (window.ethereum) {
            pay.web3Provider = window.ethereum;
          try {
            await window.ethereum.enable();
          } catch (error) {
            console.error("User denied account access")
          }
        }
        else if (window.web3) {
            pay.web3Provider = window.web3.currentProvider;
        }
        else {
            pay.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(pay.web3Provider);
        return  pay.initContract();
      },

    initContract: function() {//初始化智能合约
      $.getJSON('TimedTrans.json', function(data) {
          console.log("找到合约");
          console.log("我在这");
        var TimedTransArtifact = data;
        pay.contracts.TimedTrans = TruffleContract(TimedTransArtifact);
        pay.contracts.TimedTrans.setProvider(pay.web3Provider);
        return pay.init();
      });
    },

    init:function(){//初始化界面元素
        web3.eth.getAccounts(function(error, accounts) {
            account=accounts[0]//获取当前用户的地址
            console.log(account);
            if(error){
                console.log(error);
            }

            $("#success").css("display","none");//初始支付状态设置为不可见
            $("#fail").css("display","none");

            pay.contracts.TimedTrans.deployed().then(function(instance){//初始化一个合约对象
                var TimedTransInstance=instance;
                TimedTransInstance.get_length({from:account}).then(function(num){//获取当前用户待支付订单的数量
                    console.log("待支付订单数量",parseInt(num));
                    var id=0;
                    for(i=0;i<num;i++){
                        TimedTransInstance.get_transfer(i,{from:account}).then(function(result){//遍历待支付订单列表
                            console.log("获取订单信息成功");
                            var template=$("#template1").clone();//寻找订单模板元素
                            var template_list=$("#trading_box");//寻找订单列表元素
                            template.find("#1").text("租金："+result[3]+"元");//租金
                            template.find("#2").text("设备名称："+result[1]);//设备名称
                            template.find("#3").text("租赁数量："+result[2]);//租赁数量

                            date0=pay.convertTimestampToDateTime(parseInt(result[4]));//智能合约中以秒为单位的时间戳转年月日
                            date1=pay.convertTimestampToDateTime(parseInt(result[4])+parseInt(result[5]));//智能合约中以秒为单位的时间戳转年月日
                            template.find("#4").text("上次付息时间："+date0);//上次付息时间
                            template.find("#5").text("下次付息时间："+date1);//下次付息时间
                            template.css("display","inline-block");//设置为可见
                            template.find(".pay_button").attr('data-id', id);//标记这个支付订单的id
                            template_list.append(template);
                            id+=1;//用于在异步函数中同步i
                        })
                    }
                })
            })
        })
        return pay.bindevent();
    },
    bindevent:function(){
      $(document).on('click', '.pay_button', pay.handlePay);//将所有属于“accept”类的按钮全部关联上一个点击事件
    },

    handlePay:function(event){
      var payId = parseInt($(event.target).data('id'));//定位是哪个支付订单
      console.log(payId);
      pay.contracts.TimedTrans.deployed().then(function(instance){//初始化一个合约对象
        var TimedTransInstance=instance;
        TimedTransInstance.get_transfer(payId,{from:account}).then(function(result){
          var money=parseInt(result[3]);//获取租金数量（人民币）
          var wei=money*1e18/21090;
          console.log(wei);
          TimedTransInstance.sendFunds(payId,{from:account,value:1000}).then(function(){
            console.log("支付成功");
            $("#success").css("display","inline-block");
            $("#fail").css("display","none");
          })
          .catch(function(){
            console.log("支付失败");
            $("#fail").css("display","inline-block");
            $("#success").css("display","none");
          })
        })
      })
    },


    convertTimestampToDateTime:function(timestamp) {
      // 创建一个新日期对象
      const date = new Date(timestamp * 1000); // 乘以1000以将时间戳转换为毫秒
  
      // 获取年、月、日
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2); // 月份从0开始，需要加1
      const day = ('0' + date.getDate()).slice(-2);
  
      // 返回格式化的日期
      const formattedDate = `${year}-${month}-${day}`;
  
      return formattedDate;
    }
  
}
$(function() {
    $(window).load(function() {
      pay.initWeb3();
    });
  });