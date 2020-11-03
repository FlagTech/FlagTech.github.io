var azureEmotion = {
  apiKey: '',
  apiLocation: '',
  detect: function (doneCallback) {
    var _this = this;
    if (typeof doneCallback !== 'function') {
      doneCallback = function() {};
    }
    var params = {
      "returnFaceId": "false",
      "returnFaceLandmarks": "false",
      "returnFaceAttributes": "age,gender,smile,emotion",
    };
    $.ajax({
      url: _this.apiLocation + "face/v1.0/detect?" + $.param(params),
      beforeSend: function(xhrObj){
        xhrObj.setRequestHeader("Content-Type","application/octet-stream");
        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", _this.apiKey);
      },
      type: "POST",
      processData: false,
      data: cameraPhoto.get(),
    })
    .done(function(data) {
      if (data.length == 0) {
        doneCallback(null);
      }
      else {
        console.log(data[0].faceAttributes.emotion);
        if (data[0].faceAttributes.emotion.neutral >= 0.9) {
          doneCallback("normal");
        }
        else if (data[0].faceAttributes.emotion.happiness >= 0.2) {
          doneCallback("happy");
        }
        else {
          doneCallback("unhappy");
        }
      }
    })
    .fail(function() {
      doneCallback(false);
    })
  },
}
