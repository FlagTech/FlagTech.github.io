var userProperties = PropertiesService.getUserProperties();

function doGet(e){
  var temperature = e.parameter.t;
  if (!temperature) {
    return;
  }

  var nowDatetime = new Date().toLocaleString();
  userProperties.setProperty('temperatureText', nowDatetime  + " 的溫度是 " + temperature + " 度");
  
  var returnText = temperature + " OK";
  var textOutput = ContentService.createTextOutput(returnText)
  return textOutput;
}

function doPost(e) {
  var msg = JSON.parse(e.postData.contents);

  // 取出 replayToken 和發送的訊息文字
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;

  if (typeof replyToken === 'undefined') {
    return;
  }
  
  var returnText;
  var hasKeyword = false;
  
  if (userMessage) {
    for (var i = 0; i < keyWords.length; i++) {
      if (userMessage.indexOf(keyWords[i]) !== -1) {
        hasKeyword = true;
        break;
      }
    }
  }
  
  if (hasKeyword) {
    var temperatureText = userProperties.getProperty('temperatureText');
    if (temperatureText) {
      returnText =  temperatureText;
    }
    else {
      returnText = "抱歉我無法取得溫度";
    }
  }
  else {
    returnText = getMisunderstandWords();
  }
  
  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
      'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + accessToken,
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
