/*
按钮1: 电源? 只要关闭, disable所有监听, 静态
按钮2: Start, 在开关打开的前提下监听, 按下开始游戏function game(), 只要关闭 diable bars
按钮3: Strict, 在前开关打开的前提下监听, 如果打开, LED亮(开), 判断结果错误时进入另一个函数
4个bar: 在开关和start的前提下, 且在用户输入阶段监听
*/
/*button enable variable*/
var power = false;

/*game parameters*/
var gameStatus = {};
gameStatus.strict = false;
gameStatus.stage = 0;
gameStatus.sequence = [];
gameStatus.player = [];
gameStatus.events = [];

$(document).ready(function(){
  $('.switch').on('click', function(){
    power = !power;
    //在html和css中默认处于关闭, 若开启电源, 添加开启class
    if (power) {
      //电源槽滑动
      $('.switch-btn').addClass('light');
      //计数灯亮
      $('.point h1').addClass('light');
      //开灯
      $('.start-btn').addClass('light');
      //允许点击start和strict按钮, 即, 允许监听事件[可能要改鼠标效果]
      $('.start-btn').on('click', startAllow);
      $('.strict-btn').on('click', strictAllow);
    }else {
      //电源槽归位
      $('switch-btn').removeClass('light');
      //计数灯灭
      $('.point h1').removeClass('light');
      //关灯
      $('.start-btn').removeClass('light');
      $('.strict-btn').removeClass('light');
      //解除start和strict的事件监听[可能要改鼠标效果]
      $('.start-btn').off('click', startAllow);
      $('.strict-btn').off('click', strictAllow);
      $('.bar').off('click', judge);
    }
  });
});

function startAllow(){
  console.log("Allow click start.");
  gameInit();
  gameRun();
}

function strictAllow(){
  console.log("Allow click strict.");
  gameStatus.strict = !gameStatus.strict;
  if (gameStatus.strict) {
    $('.strict-btn').addClass('light');
  }else{
    $('.strict-btn').removeClass('light');
  }
}

function gameInit(){
  gameStatus.sequence.length = 0; //reset the squence
  gameStatus.events.length = 0;
  gameStatus.stage = 0;
}

function gameRun(){
  //按照顺序执行
  // gameStatus.stageSeq = setInterval(function(){
    //总循环, 每关步骤
    //更新stage面板
    gameStatus.stage += 1;
    $('.point h1').html(gameStatus.stage);

    //产生一个新颜色
    var newColor = Math.floor(4 * Math.random());
    gameStatus.sequence.push(newColor);

    //显示颜色顺序
    showColors();
    
    //玩家输入
    // playersTurn();

    //判断
    judge();

  // }, 3000);
}

function showColors(){
  var index = 0;
  if (index < gameStatus.sequence.length) {
    
    gameStatus.lightOn = setInterval(function(){
      //当前颜色
      var currColor = gameStatus.sequence[index];
      //每关步骤第一步, 遍历显示所有灯
      index++;//显示了一个灯,计数+1
      console.log("displaying " + index + "st light");
      $('#' + currColor).addClass('light');
      //等待一段时间,2s,关灯
      gameStatus.lightOff = setTimeout(function(){
        $('#' + currColor).removeClass('light');
        console.log("turning off the light");
      }, 500);
      if (index === gameStatus.sequence.length){
        //如果显示到最后一个灯, 结束循环
        clearInterval(gameStatus.lightOn);
        //打开点击权限
        $('.bar').on('click', judge);
      }
    }, 1000);
  }
}

