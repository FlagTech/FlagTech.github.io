var accessToken = "從 LINE developers 網站取得的 Channel Access Token";

var url="https://flagtech.github.io/FM611A/gs-linebot.js";
var javascript = UrlFetchApp.fetch(url).getContentText();
eval(javascript);
