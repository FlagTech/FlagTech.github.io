var userProperties = PropertiesService.getUserProperties();

function doGet(e){
  return "我是 AI 聊天機器人程式";
}

function doPost(e) {
  var msg = JSON.parse(e.postData.contents);

  // 取出 replayToken 和使用者送出的訊息文字
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;

  if (typeof replyToken === 'undefined') {
    return;
  }

  var returnText = "";
  
  var talk_mode = userProperties.getProperty('talk_mode');

  if (userMessage.match(/[開|啟].*心情.*模式/)) {
    userProperties.setProperty('talk_mode', 'mood');
    returnText = '開啟心情陪伴模式了';
  }
  else if (userMessage.match(/關.*心情.*模式/)) {
    userProperties.setProperty('talk_mode', 'normal');
    returnText = '關閉心情陪伴模式了';
  }
  else if (userMessage.toLowerCase().match(/[開|啟].*ptt.*模式/)) {
    userProperties.setProperty('talk_mode', 'ptt');
    returnText = '開啟PTT鄉民模式了';
  }
  else if (userMessage.toLowerCase().match(/關.*ptt.*模式/)) {
    userProperties.setProperty('talk_mode', 'normal');
    returnText = '關閉PTT鄉民模式了';
  }
  else if (talk_mode == "mood" || talk_mode == "ptt") {
    returnText = getReplyFromAI(userMessage, talk_mode);
  }
  else if (userMessage.indexOf("學 ") === 0) {
    var userMessageArray = userMessage.split(" ");
    if (userMessageArray.length >= 3) {
      userProperties.setProperty(userMessageArray[1], userMessageArray.slice(2).join(' '));
      returnText = '好的好的, 學會了!';
    }
  }

  if (!returnText) returnText = userProperties.getProperty(userMessage);

  if (!returnText) returnText = getAnswer(userMessage);

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

function getReplyFromAI(msg, mode){
  var act = "talk";
  if (mode == 'mood') act == 'mood';
  
  var url = ngrokUrl + "/" + act + "/" + msg;
  var returnText = "";

  try{
    returnText = UrlFetchApp.fetch(url).getContentText();
    if (mode == 'mood') {
      var moodReply = [];
      returnText = parseInt(returnText);
      if (returnText > 0) {
        if (Array.isArray(happyReply)) moodReply = happyReply;
        else moodReply = ["開心"];
      }
      else if (returnText < 0) {
        if (Array.isArray(sadReply)) moodReply = sadReply;
        else moodReply = ["哭哭"];
      }
      else {
        if (Array.isArray(normalReply)) moodReply = normalReply;
        else moodReply = ["嗯嗯"];
      }
      returnText = "[心情陪伴模式] " + moodReply[Math.floor(Math.random()*moodReply.length)];
    }
  }
  catch(e){
    userProperties.setProperty('talk_mode', 'normal');
    returnText = "無法連線AI大腦程式, 關閉"
    if (mode == 'mood') returnText += '心情陪伴模式';
    else if (mode == 'ptt') returnText += 'PTT鄉民模式';
  }
  
  return returnText;
}

function getMisunderstandWords() {
  var _misunderstandWords = [
    '我了解',
    '我能理解',
    '還有問題嗎?',
    '請繼續說下去',
    '可以說的更詳細一點嗎?',
    '這樣喔! 我知道!',
    '然後呢? 發生甚麼事?',
    '再來呢? 可以多說一些嗎',
    '接下來呢? ',
    '可以多告訴我一些嗎?',
    '多談談有關你的事，好嗎?',
    '想多聊一聊嗎',
    '可否多告訴我一些呢?',
    '梅林的鬍子阿, 你用對命令沒? 用個 / 捲軸試試?',
    '我就當真你在跟我聊天了(灑花)',
    '你收到幾個錯誤訊息了？再試一個',
    '你怎麼不問問神奇的五樓呢？',
    '人生哪~要浪費在美好的事物上，我就當你在跟我聊天了（幸福）',
    '我想你應該不是在跟我講話，我都不知道要怎麼回你',
    '你想知道什麼？',
    '至少你是認真在跟我聊天, 不是在玩皮卡丘',
    '這附近鯉魚王跟可達鴉有點多阿...啥，你不是在跟我聊天嗎？'
  ];
  
  if (typeof misunderstandWords === 'undefined') {
    var misunderstandWords = _misunderstandWords;
  }
  else {
    misunderstandWords = misunderstandWords.concat(_misunderstandWords);
  }
  
  return misunderstandWords[Math.floor(Math.random()*misunderstandWords.length)];
}

/* 
  以下為本程式回答問題時使用的 Q&A 規則，例如對於以下 Q&A 規則物件
   { Q:"想 | 希望", A:"為何想*呢?|真的想*?|那就去做阿?為何不呢?"},
  代表的是，當您輸入的字串中有「想」或「希望」這樣的詞彙時，
  程式就會從 A: 欄位中的回答裏隨機選出一個來回答。
  回答語句中的 * 代表比對詞彙之後的字串，舉例而言、假如您說：
      我想去巴黎
  那麼我們的程式從這四個可能的規則中隨機挑出一個來產生答案，產生的答案可能是：
  為何想去巴黎呢?
  真的想去巴黎?
  那就去做阿?為何不呢?
*/
// Q&A 陣列宣告
var qaList = [
  { Q:"謝謝", A:"不客氣!"},
  { Q:"對不起|抱歉|不好意思", A:"別說抱歉 !|別客氣，儘管說 !"},
  { Q:"可否|可不可以", A:"你確定想*?"},
  { Q:"我想", A:"你為何想*?"},
  { Q:"我要", A:"你為何要*?"},
  { Q:"你是", A:"你認為我是*?"},
  { Q:"認為|以為", A:"為何說*?"},
  { Q:"感覺", A:"常有這種感覺嗎?"},
  { Q:"為何不", A:"你希望我*!"},
  { Q:"是否", A:"為何想知道是否*?"},
  { Q:"不能", A:"為何不能*?|你試過了嗎?|或許你現在能*了呢?"},
  { Q:"我是", A:"你好，久仰久仰!"},
  { Q:"甚麼|什麼|何時|誰|哪裡|如何|為何|因何", A:"為何這樣問?|為何你對這問題有興趣?|你認為答案是甚麼呢?|你認為如何呢?|你常問這類問題嗎?|這真的是你想知道的嗎?|為何不問問別人?|你曾有過類似的問題嗎?|你問這問題的原因是甚麼呢?"},
  { Q:"原因", A:"這是真正的原因嗎?|還有其他原因嗎?"}, 
  { Q:"理由", A:"這說明了甚麼呢?|還有其他理由嗎?"},
  { Q:"你好|嗨|您好", A:"你好，有甚麼問題嗎?"},
  { Q:"或許", A:"你好像不太確定?"},
  { Q:"不曉得|不知道", A:"為何不知道?|在想想看，有沒有甚麼可能性?"},
  { Q:"不想|不希望", A:"有沒有甚麼辦法呢?|為何不想*呢?|那你希望怎樣呢?"}, 
  { Q:"想|希望", A:"為何想*呢?|真的想*?|那就去做阿?為何不呢?"},
  { Q:"不", A:"為何不*?|所以你不*?"},
  { Q:"請", A:"我該如何*呢?|你想要我*嗎?"},
  { Q:"你", A:"你真的是在說我嗎?|別說我了，談談你吧!|為何這麼關心我*?|不要再說我了，談談你吧!|你自己*"},
  { Q:"總是|常常", A:"能不能具體說明呢?|何時?"},
  { Q:"像", A:"有多像?|哪裡像?"},
  { Q:"對", A:"你確定嗎?|我了解!"},
  { Q:"朋友", A:"多告訴我一些有關他的事吧!|你認識他多久了呢?"},
  { Q:"電腦", A:"你說的電腦是指我嗎?"}, 
  { Q:"難過", A:"別想它了|別難過|別想那麼多了|事情總是會解決的"},
  { Q:"高興", A:"不錯ㄚ|太棒了|這樣很好ㄚ"},
  { Q:"是阿|是的", A:"甚麼事呢?|我可以幫助你嗎?|我希望我能幫得上忙!"},
  { Q:"", A:"我了解|我能理解|還有問題嗎?|請繼續說下去|可以說的更詳細一點嗎?|這樣喔! 我知道!|然後呢? 發生甚麼事?|再來呢? 可以多說一些嗎|接下來呢? |可以多告訴我一些嗎?|多談談有關你的事，好嗎?|想多聊一聊嗎|可否多告訴我一些呢?"}
];  
  
function random(n) { // 從 0 到 n-1 中選一個亂數
  return Math.floor(Math.random()*n);
}
    
function getAnswer(say) {
  for (var i in qaList) { // 對於每一個 QA 
   try {
    var qa = qaList[i];
    var qList = qa.Q.split("|"); // 取出 Q 部分，分割成一個一個的問題字串 q
    var aList = qa.A.split("|"); // 取出回答 A 部分，分割成一個一個的回答字串 q
    for (var qi in qList) { // 對於每個問題字串 q
      var q = qList[qi];
      if (q=="") // 如果是最後一個「空字串」的話，那就不用比對，直接任選一個回答。
        //return aList[random(aList.length)]; // 那就從答案中任選一個回答
        return getMisunderstandWords();
      var r = new RegExp("(.*)"+q+"([^?.;]*)", "gi"); // 建立正規表達式 (.*) q ([^?.;]*)
      if (say.match(r)) { // 比對成功的話
        tail = RegExp.$2; // 就取出句尾
        // 將問句句尾的「我」改成「你」，「你」改成「我」。
        tail = tail.replace("我", "#").replace("你", "我").replace("#", "你");
        return aList[random(aList.length)].replace(/\*/, tail); // 然後將 * 改為句尾進行回答
      }
    }
   } catch (err) {}
  }
  return getMisunderstandWords(); // 如果發生任何錯誤，就回答「然後呢？」來混過去。
}   
