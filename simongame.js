/*
按钮1: 电源? 只要关闭, disable所有监听, 静态
按钮2: Start, 在开关打开的前提下监听, 按下开始游戏function game(), 只要关闭 diable bars
按钮3: Strict, 在前开关打开的前提下监听, 如果打开, LED亮(开), 判断结果错误时进入另一个函数
4个bar: 在开关和start的前提下, 且在用户输入阶段监听
*/

/*game parameters*/
var gameStatus = {
  power: false,
  strict: false,
  lock: true,
  stage: 0,
  sequence: [],
  player: [],
  events: []
};

$(document).ready(function(){
  /*prepare for the audio*/
  context = new AudioContext();
  ramp = 0.1;
  volume = 0.5;
  var errfreq = 110;
  var frequencies = [400, 300, 250, 200];
  

  var errOsc = context.createOscillator();
  errOsc.type = 'triangle';
  errOsc.frequency.value = errfreq;
  errOsc.start(0.0);

  errNode = context.createGain();
  errOsc.connect(errNode);
  errNode.gain.value = 0;
  errNode.connect(context.destination);

  var goodOsc = frequencies.map(function(freq){
    var osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.start(0.0);
    return osc;
  });

  goodNodes = goodOsc.map(function(osc){
    var gNode = context.createGain();
    osc.connect(gNode);
    gNode.connect(context.destination);
    gNode.gain.value = 0;
    return gNode;
  });

  $('.switch').on('click', function(){
    gameStatus.power = !gameStatus.power;

    if (gameStatus.power) {
      powerOn();
    }else {
      powerOff();
    }
  });
  //监控bar点击事件
  $('.bar').mousedown(function(e){
    e.stopPropagation(e);
    if (!gameStatus.lock) {
      // pushColor($(this));
      turnOnSnL($(this).attr('id'));
    }
  });
  $('.bar').mouseup(function(e){
    e.stopPropagation(e);
    if (!gameStatus.lock) {
      // turnOffSnL();
      pushColor($(this));
      // $('.bar').removeClass('light');//replaced
    }
  });
  //点击样式
  $('.start-btn').mousedown(function(e){
    $(this).addClass('pushing');
  });
  $('.start-btn').mouseup(function(e){
    e.stopPropagation(e);
    $(this).removeClass('pushing');
  });
  //点击样式
  $('.strict-btn').mousedown(function(e){
    $(this).addClass('pushing');
  });
  $('.strict-btn').mouseup(function(e){
    e.stopPropagation(e);
    $(this).removeClass('pushing');
  });
});

function turnOnSnL(index){
  goodNodes[index].gain.linearRampToValueAtTime(volume, context.currentTime + ramp);
  gameStatus.pushed = $('#' + index);
  gameStatus.pushed.addClass('light');
}

function turnOffSnL(){
  // if (gameStatus.pushed) {
    // gameStatus.pushed.removeClass('light');
  // }
  $('.bar').removeClass('light');
  goodNodes.forEach(function(g){
    g.gain.linearRampToValueAtTime(0, context.currentTime + ramp);
  });
  gameStatus.pushed = undefined;
  // gameStatus.currOsc = undefined;//????
}

function playErrTone(){
  errNode.gain.linearRampToValueAtTime(volume, context.currentTime + ramp);
}

function stopErrTone(){
  errNode.gain.linearRampToValueAtTime(0, context.currentTime + ramp);
}

function gameInit(){
  resetTimers(); // reset all timers
  stopErrTone();
  turnOffSnL();
  gameStatus.sequence.length = 0; //reset the sequence
  gameStatus.player.length = 0; //reset the player's sequence
  gameStatus.stage = 0; //back to inital stage
  gameStatus.playerIndex = -1;
  $('.point h1').html('--');//back to inital stage
  gameStatus.lock = true; //don't allow click bars
  $('.bar').removeClass('clickable');//don't allow click bars
}

function powerOn(){
  gameInit();
  $('.switch-btn').addClass('swtichOn');
  //计数灯亮
  $('.point h1').addClass('light');
  //按钮开灯
  $('.start-btn').addClass('light').addClass('clickable');
  $('.strict-btn').addClass('clickable');
  //允许点击start和strict按钮
  $('.start-btn').on('click', startAllow);
  $('.strict-btn').on('click', strictAllow);
}

function powerOff(){
  //清除所有定时器
  resetTimers();
  //电源槽归位
  $('.switch-btn').removeClass('swtichOn');
  //计数灯灭, 显示'--'
  $('.point h1').removeClass('light').html('--');
  //bar不可点击
  turnOffSnL();
  stopErrTone();
  gameStatus.lock = true;
  $('.bar').removeClass('clickable').removeClass('light');
  //关按钮灯, 解除鼠标clickable效果
  $('.start-btn').removeClass('light').removeClass('clickable');
  $('.strict-btn').removeClass('light').removeClass('clickable');
  //解除对start和strict的监听
  $('.start-btn').off('click', startAllow);
  $('.strict-btn').off('click', strictAllow);
}

function startAllow(){
  console.log("player clicked start.");
  gameInit();
  gameRun();
}

function strictAllow(){
  console.log("player clicked strict.");
  gameStatus.strict = !gameStatus.strict;
  if (gameStatus.strict) {
    $('.strict-btn').addClass('light');
  }else{
    $('.strict-btn').removeClass('light');
  }
}

function gameRun(){
  /*执行一关的流程: 关卡更新 -> 显示颜色序列 -> 等待输入*/

  /*按对了进来时有一个timeout gameStatus.evt*/

  //设定样式
    $('.bar').removeClass('clickable');//显示时不允许点击bar

  //关卡+1, 产生一个新颜色
    gameStatus.stage += 1;//关+1
    var newColor = Math.floor(4 * Math.random());
    gameStatus.sequence.push(newColor);

  //显示颜色并等待
    gameStatus.evt = setTimeout(showColors, 1000);//在开始后, 延迟1s开始显示颜色, userfriendly
}

function showColors(){
  resetTimers();//清除gameRun & restart的gameStatus.evt计时器
  /*计分板更新*/
  $('.point h1').addClass('light');//确保计分板灯亮, 后面错误闪烁可能意外关灯
  $('.point h1').html(gameStatus.stage);//计分板数字更新

  /*开始显示*/
  gameStatus.player.length = 0; //有可能是非strict重新挑战, 清零player
  var index = 0;//index表示当前显示颜色角标
  // if (index < gameStatus.sequence.length) { //应该可以去掉第一次判断, 因为来到这里一定至少有一个颜色
  
  /*循环显示颜色, 1000ms一次*/
  gameStatus.lightOn = setInterval(function(){
    gameStatus.lock = true;//显示时不允许点击bar
    var currColor = gameStatus.sequence[index];//当前颜色
    console.log("displaying " + index + "st light");

    /*light + sound, 亮灯操作, 目前缺少音效*/
    turnOnSnL(currColor);
    // $('#' + currColor).addClass('light');//replaced
    /*保持light+sound一段时间(500ms), 然后关灯关声音*/
    gameStatus.lightOff = setTimeout(function(){
      /*关灯关声音*/
      turnOffSnL();
      // $('#' + currColor).removeClass('light');//replaced
      console.log("turning off the light");
    }, 500);

    index++;//显示了一个灯,计数+1
    /*在每次显示一个灯后, 确认当前序列显示是否完成*/
    if (index >= gameStatus.sequence.length){
      /*结束循环, 关lightOn定时器*/
      clearInterval(gameStatus.lightOn);

      gameStatus.playerIndex = -1;//初始化playerIndex

      /*打开点击权限lock = false, bar监听中允许判断用户输入*/
      gameStatus.lock = false;
      $('.bar').addClass('clickable');

      /*显示完灯后开始计时, 如果t=5000ms秒内用户不按, 直接失败*/
      gameStatus.evt = setTimeout(errReport, 5000);
    }
  }, 1000);
  // }end if
}

function pushColor(pushedBar){
  /*每当按了一个bar, 就清除timeout timer*/
  clearTimeout(gameStatus.evt);

  /*用户已按数目+1*/
  gameStatus.playerIndex += 1;
  // pushedBar.addClass('light');//??????只开灯, 因为不知flasherr最终状态, what?
  var pushedColor = parseInt(pushedBar.attr('id'));
  // turnOnSnL(pushedColor);
  turnOffSnL();

  /*保存用户输入? 貌似没必要存用户所有输入?*/
  gameStatus.player.push(pushedColor);
  // gameStatus.player.push(pushedBar.attr('id'));
  var currColor = gameStatus.player[gameStatus.playerIndex];//可以直接取点击bar的id

  if (currColor == gameStatus.sequence[gameStatus.playerIndex]) {
    //按对了
    if (gameStatus.playerIndex < (gameStatus.sequence.length-1) ) {
      //但还没按完, 要继续按, 只需重新建立timeout timer
        gameStatus.evt = setTimeout(errReport, 5000);//五秒不按, 失败
    }else{
      //按完了, 延时1s进入下一关, modified
      $('.bar').removeClass('clickable');
      gameStatus.lock = true;
      gameRun();//开始下一关
    }
    }else {
      //按错了
      gameStatus.lock = true;
      errReport(pushedBar);
    }
}
function errReport(pushedObj){
  flashErrMsg(2);
  gameStatus.lock = true;
  $('.bar').removeClass('clickable');
  
  var count = 0;
  gameStatus.lightOn = setInterval(function(){
    if (pushedObj) {
      pushedObj.addClass('light');
    }
    playErrTone();
    gameStatus.lightOff = setTimeout(function(){
      stopErrTone();
      if (pushedObj) {
        pushedObj.removeClass('light');
      }
    }, 250);
    if (count >= 2) {
        stopErrTone();
        clearTimeout(gameStatus.lightOff);
        clearInterval(gameStatus.lightOn);
    }
  }, 500);
  // if (pushedObj) {
    // pushedObj.addClass('light');
  // }
  // gameStatus.lightOff = setTimeout(function(){
  //   stopErrTone();
  //   if (pushedObj) {
  //     pushedObj.removeClass('light');
  //   }
  // }, 1000);
  /*提示错误flashErr: 2000ms*/
  gameStatus.evt = setTimeout(function(){
    if (gameStatus.strict) {
      console.log('you lose!');
      gameInit();
      gameStatus.evt = setTimeout(gameRun, 2000);
    }else{
      console.log('try again!');
      resetTimers();
      $('.bar').removeClass('light');
      stopErrTone();
      gameStatus.evt = setTimeout(showColors, 2000);
    }
  }, 2000);
}

function resetTimers(){
  clearTimeout(gameStatus.evt);
  clearTimeout(gameStatus.lightOff);
  clearTimeout(gameStatus.flashOff);
  clearInterval(gameStatus.lightOn);
  clearInterval(gameStatus.flashOn);
}

function flashErrMsg(times){
  //没按完进来时, 有: 5s的timeout timer .evt
  resetTimers();//已经错了, 清除time out计时, 有可能第一个按错, 当时还有一个关灯计时timeout

  /*感叹号表示错了*/
  //可以关一次灯?
  $('.point h1').removeClass('light');
  $('.point h1').html('!!');

  /*同颜色显示流程, count记录闪烁次数, 一共闪times次*/
  var count = 0;
  /*延时t1 = 800ms后开计数板灯*/
  gameStatus.flashOn = setInterval(function(){
    $('.point h1').addClass('light');
    //缺少声音
    /*保持灯亮t2 = 400ms后, 关灯*/
    gameStatus.flashOff = setTimeout(function(){
      $('.point h1').removeClass('light');
      count += 1;//关灯计数?? 开灯计数??
    }, 250);
    /*每次循环后, 查看是否闪烁够了次数*/
    if (count >= times) {
        clearTimeout(gameStatus.flashOff);
        clearInterval(gameStatus.flashOn);
      }
  }, 500);
}