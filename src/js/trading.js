trading={
    web3Provider: null,
    contracts: {},

    initWeb3: async function() {//初始化web3
        if (window.ethereum) {
            trading.web3Provider = window.ethereum;
          try {
            await window.ethereum.enable();
          } catch (error) {
            console.error("User denied account access")
          }
        }
        else if (window.web3) {
            trading.web3Provider = window.web3.currentProvider;
        }
        else {
            trading.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(trading.web3Provider);
        return  trading.initContract();
      },

    initContract: function() {//初始化智能合约
  
      $.getJSON('./Trade.json', function(data) {
        console.log("找到合约");
        var TradeArtifact = data;
        trading.contracts.Trade = TruffleContract(TradeArtifact);
        trading.contracts.Trade.setProvider(trading.web3Provider);
      });

      //此对象中有两个合约需要初始化
      $.getJSON('TimedTrans.json', function(data) {
        console.log("找到合约");
        var TimedTransArtifact = data;
        trading.contracts.TimedTrans = TruffleContract(TimedTransArtifact);
        trading.contracts.TimedTrans.setProvider(trading.web3Provider);
        return trading.init();
      });
     
    },

    init:function() {//初始化交易列表
      $.getJSON('../machine.json', function(data){
          var tradingTempalte=$("#tradingTemplate").clone();
          var scroll_content=$("#content");

          //加载本地的一些示例租赁订单
          for (i=0;i<data.length;i++){
              console.log(i);
              tradingTempalte.css("display","inline-block");
              tradingTempalte.find('img').attr("src",data[i].picture);
              tradingTempalte.find("#name").text(data[i].name);
              tradingTempalte.find("#num").text(data[i].num);
              tradingTempalte.find("#period").text(data[i].period);
              tradingTempalte.find("#cycle").text(data[i].cycle);
              tradingTempalte.find("#rent").text(data[i].rent);
              scroll_content.append(tradingTempalte.html());
          }

          //加载区块链上已经发布的智能合约订单
          trading.contracts.Trade.deployed().then(function(instance){
            console.log("合约部署成功");
            var TradeInstance=instance;
          

            web3.eth.getAccounts(function(error, accounts) {
              account=accounts[0]//获取当前用户的地址
              console.log(account);
              if(error){
                  console.log(error);
              }
            } )

            //订单添加到合约里之后，从合约的订单列表读取该订单，并且将该订单展示出来
            TradeInstance.get().then(function(num){//获取当前租赁列表的订单数量，同时也是当前订单在租赁列表中的位置索引
              console.log("订单数量",parseInt(num));
              num=parseInt(num.toString());//将js的bigint对象转成普通整数，只有这样才能在下面的智能合约函数调用中把num作为参数传入
              for(i =1;i<=num;i++){//遍历智能合约中的租赁订单列表
                
                TradeInstance.get_trading(i).then(function(result){
            
                  var tradingTempalte=$("#tradingTemplate").clone();
                  var scroll_content=$("#content");
                  tradingTempalte.css("display","inline-block");
                  var picture_path=trading.get_random_picture();

                  tradingTempalte.find('img').attr("src",picture_path);//图片应该要随机生成
                  tradingTempalte.find("#name").text(result[1]);
                  tradingTempalte.find("#num").text(result[2]);
                  tradingTempalte.find("#period").text(result[3]+"月");
                  tradingTempalte.find("#cycle").text("每"+result[4]+"月");
                  tradingTempalte.find("#rent").text(result[5]+"元");
                  tradingTempalte.find(".accept").attr('data-id', parseInt(result[0]));//将按钮的id设置成交易事件索引
                  // console.log("订单索引：",parseInt(result[0]));
                  // console.log("刷新后的标记结果",parseInt(result[7]));
                  if(parseInt(result[7])==1){//判断该订单是否被标记为已接单
                    tradingTempalte.find(".accept").text("已被接单").attr('disabled', true);
                  }
                  scroll_content.append(tradingTempalte.html());
                })
              }           
            })
          })
        console.log("ok");
        return trading.bindEvents();
      })

    },

    bindEvents:function(){
      $(document).on('click', '#submit', trading.handleMessage);
      $(document).on('click', '.accept', trading.handleAccept);//将所有属于“accept”类的按钮全部关联上一个点击事件
    },

    //新增一条租赁订单
    handleMessage:async function(){
      web3.eth.getAccounts(function(error, accounts) {

        if (error) {
          console.log(error);
        }

        //获取输入框信息
        var text1=$("#input1").val();//找到id为input1的元素
        var text2=$("#input2").val();
        var text3=$("#input3").val();
        var text4=$("#input4").val();
        var text5=$("#input5").val();
        var text6=$("#input6").val();


        account=accounts[0];
        trading.contracts.Trade.deployed().then(function(instance){
          console.log("合约部署成功");
          var TradeInstance=instance;
          TradeInstance.addTrading(text1,text2,text3,text4,text5,text6,{from:account}).then(function(){
           
            console.log("成功添加订单");
            console.log(account);
            //订单添加到合约里之后，从合约的订单列表读取该订单，并且将该订单展示出来
            TradeInstance.get().then(function(num){//获取当前租赁列表的订单数量，同时也是当前订单在租赁列表中的位置索引
     
              num=parseInt(num.toString());//将js的bigint对象转成普通整数，只有这样才能在下面的智能合约函数调用中把num作为参数传入
         
              TradeInstance.get_trading(num).then(function(result){
              
                    var tradingTempalte=$("#tradingTemplate").clone();
                    var scroll_content=$("#content");
                    tradingTempalte.css("display","inline-block");
                    var picture_path=trading.get_random_picture();

                    tradingTempalte.find('img').attr("src",picture_path);//图片应该要随机生成
                    tradingTempalte.find("#name").text(result[1]);
                    tradingTempalte.find("#num").text(result[2]);
                    tradingTempalte.find("#period").text(result[3]+"月");
                    tradingTempalte.find("#cycle").text("每"+result[4]+"月");
                    tradingTempalte.find("#rent").text(result[5]+"元");
                    tradingTempalte.find(".accept").attr('data-id', parseInt(result[0]));//将按钮的id设置成交易事件索引
                    scroll_content.append(tradingTempalte.html());
                    console.log("ok");
              })
            })
          })
        })
      })
    },

    //随机生成一个图片路径
    get_random_picture:function(){
      var max=2;
      var min=0;
      const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
      picture_list=["./images/9.jpeg","./images/10.jpeg","./images/11.jpeg"];
      // console.log(picture_list[randomInt]);
      return picture_list[randomInt];
    },

    //月数转秒
    monthsToSeconds:function(months) {
      const daysInMonth = 30; // 假设每个月有30天
      const secondsInDay = 86400; // 1天等于86400秒
  
      const seconds = months * daysInMonth * secondsInDay;
      return seconds;
    },
  
    //处理接单事件
    handleAccept:function(event){
      
      var tradingId = parseInt($(event.target).data('id'));//定位到点击事件的按钮，并且获取其租赁事件索引。从而能够在智能合约中去访问该租赁订单
      // console.log(tradingId);
      
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log("出错");
          console.log(error);
        }
        account=accounts[0];//接单者的地址

        trading.contracts.Trade.deployed().then(function(instance){//部署第一个合约

          var TradeInstance=instance;
          TradeInstance.accept(tradingId,{from:account}).then(function(){//将该索引对应的订单标记为已接单   
            TradeInstance.get_trading(tradingId).then(function(result){
              console.log("标记结果",parseInt(result[7]));
              console.log("已标记");
            })
            TradeInstance.get_trading(tradingId).then(function(result){//获取当前订单的信息
              var publisher=result[6];//获取订单发起方的地址
              console.log(publisher);//打印发布者地址
              console.log(account);//打印接单者地址
              trading.contracts.TimedTrans.deployed().then(function(instance){//部署第二个合约
                var TimedTransInstance=instance;
                //添加一条待支付订单
                TimedTransInstance.addTransfer(account,result[1],result[2],parseInt(result[5]),trading.monthsToSeconds(parseInt(result[4])),{from:publisher}).then(function(){
                  TimedTransInstance.get_length({from:publisher}).then(function(length){
                    console.log("待支付订单数量",parseInt(length));
                  })
                  console.log("接单成功");
                  $(event.target).text("已被接单").attr('disabled', true);
                })
              })
            }) 
          })   
        })
      })
    },

};


$(function() {
  $(window).load(function() {
    trading.initWeb3();
  });
});