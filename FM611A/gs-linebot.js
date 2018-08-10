var userProperties = PropertiesService.getUserProperties();

function doGet(e){
  var temperature = e.parameter.t;
  if (!temperature) {
    return;
  }
  
//   var scriptProperties = PropertiesService.getScriptProperties();
//   scriptProperties.setProperty('temperature', temperature);
  
  var datetime = new Date().toLocaleString();
  userProperties.setProperty('temperature', datetime  + " 的溫度是 " + temperature + "°C");
  
  var returnText = temperature + " OK";
  var textOutput = ContentService.createTextOutput(returnText)
  return textOutput;
}

function doPost(e) {
  var msg = JSON.parse(e.postData.contents);
  console.log(msg);
  

  // 取出 replayToken 和發送的訊息文字
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;

  if (typeof replyToken === 'undefined') {
    return;
  }
  
  var returnText;
  if (!userMessage || userMessage.indexOf("溫度") === -1) {
    returnText = getMisunderstandWords();
  }
  else {
//     var scriptProperties = PropertiesService.getScriptProperties();
//     var temperature = scriptProperties.getProperty('temperature');
    var temperature = userProperties.getProperty('temperature');
    if (temperature) {
      returnText =  temperature;
    }
    else {
      returnText = "抱歉我無法取得目前溫度";
    } 
  }
  
  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
      'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': returnText,
      }],
    }),
  });
}


function getMisunderstandWords() {
  var misunderstandWords = [
    "不好意思，我無法理解您的需求",
    "再說明白一點好嗎？我只是一個不太懂事的 baby 機器人",
    "我不懂您的意思，抱歉我會加強訓練的"
  ];
  
  return misunderstandWords[Math.floor(Math.random()*misunderstandWords.length)];
}
