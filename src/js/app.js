
App = {//定义一个app对象
  web3Provider: null,
  contracts: {},

  // 将本地的宠物信息加载，信息存储到data中，data是一个列表
  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');//这样赋值，petTemplate被修改后，会直接在原来的元素上修改

      // var petTemplate = $('#petTemplate').clone();//这样赋值是通过创建副本的方式

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);//修改元素的文本
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);//修改元素的属性

        petsRow.append(petTemplate.html());//把一个元素块加入进去
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
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
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    // 加载Adoption.json，保存了Adoption的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
    $.getJSON('Adoption.json', function(data) {
      // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function() {//关联事件
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },
//.on('click', '.btn-adopt', App.handleAdopt) 是用于设置事件监听器的 jQuery 方法。它表示在文档上设置一个点击事件监听器，
//当文档中的任何元素被点击时，检查该元素是否匹配选择器 .btn-adopt，如果匹配，就执行 App.handleAdopt 函数


  markAdopted: function(petId) {
    console.log(petId)
    $('.panel-pet').eq(petId).find('button').text('Success').attr('disabled', true);
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;
    
    // 获取用户账号
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Adoption.deployed().then(function(instance) {//回调函数，在合约被成功部署之后执行
        adoptionInstance = instance;
        console.log(adoptionInstance.address);
        // 发送交易领养宠物
        adoptionInstance.adopt(petId, {from: account});
        App.markAdopted(petId);
      });
    });
  }
};
$(function() {
  $(window).load(function() {
    App.init();
  });
});
