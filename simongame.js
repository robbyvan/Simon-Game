//监听事件
/*
按钮1: 电源打开? 随时, 只要关闭, disable所有监听, 静态
按钮2: Start, 在开关打开的前提下监听, 按下开始游戏function game(), 只要关闭 diable bars
按钮3: Strict, 在前开关打开的前提下监听, 如果打开, LED亮(开), 判断结果错误时进入另一个函数
4个bar: 在开关和start的前提下, 且在用户输入阶段监听
*/
/*button enable variable*/
var strict = false;
var power = false;

/*game parameters*/
var gameStart = false;
var stage = 0;
var sequence = [];

$(document).ready(function(){
  $('.switch').on('click', function(){
    power = !power;
    //在html和css中默认处于关闭, 若开启电源, 添加开启class
    if (power) {
      //电源槽滑动
      $('switch-btn').addClass('switchOn');
      //计数灯亮
      $('.point h1').addClass('pointOn');
      //开灯
      $('.start-btn').addClass('pinkOn');
      // $('.strict-btn').addClass('orangeOn');
      //允许点击start和strict按钮, 即, 允许监听事件
      //可能要改鼠标效果
      $('.start-btn').on('click', startAllow);
      $('.strict-btn').on('click', strictAllow);
    }else {
      //电源槽归位
      $('switch-btn').removeClass('switchOn');
      //计数灯灭
      $('.point h1').removeClass('pointOn');
      //关灯
      $('.start-btn').removeClass('pinkOn');
      $('.strict-btn').removeClass('orangeOn');
      //解除start和strict的事件监听
      //可能要改鼠标效果
      $('.start-btn').off('click', startAllow);
      $('.strict-btn').off('click', strictAllow);
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
  strict = !strict;
  if (strict) {
    $('.strict-btn').addClass('orangeOn');
  }else{
    $('.strict-btn').removeClass('orangeOn');
  }
}
function gameInit(){
  gameStart = true;//game starts
  sequence.length = 0; //reset the squence
  stage = 1;
}
function gameRun(){
  var player = [];
  
  //generate a new color
  var currentColor = Math.floor(4 * Math.random());
  
  //save current color into sequence
  sequence.push(currentColor);
  
  //show current color to the player


}