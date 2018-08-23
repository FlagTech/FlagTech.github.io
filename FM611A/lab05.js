var accessToken = "從 LINE developers 網站取得的 Channel Access Token";

var ngrokUrl = "ngrok 網址";

var url="https://flagtech.github.io/FM611A/gs-aibot.js";
var javascript = UrlFetchApp.fetch(url).getContentText();
eval(javascript);
