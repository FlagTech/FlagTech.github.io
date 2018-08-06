var textToSpeech = {
  lang: "zh-TW",
  volume: 0.7,  //0 (lowest) ~ 1 (highest)
  synth: window.speechSynthesis,
  speakTimeout: null,
  say: function (words) {
    if (this.synth.speaking) {
      this.synth.cancel()
      if (this.speakTimeout !== null) clearTimeout(this.speakTimeout);
      var _this = this;
      this.speakTimeout = setTimeout(function () { _this.say(words); }, 250);
      return;
    }

    if (words) {
      var utterThis = new SpeechSynthesisUtterance(words);
      utterThis.onend = function (event) {
        //console.log('SpeechSynthesisUtterance.onend');
      }
      utterThis.onerror = function (event) {
        //console.error('SpeechSynthesisUtterance.onerror');
      }
      utterThis.lang = this.lang;
      utterThis.volume = this.volume;
      utterThis.pitch = 1;
      utterThis.rate = 1;
      this.synth.speak(utterThis);
    }
  },
};
