var cameraPhoto = {
  video: null,
  isBegin: false,
  hasGetUserMedia: function() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },
  begin: function(successCallback, errorCallback) {
    if (!this.video) return false;
    if (this.hasGetUserMedia()) {
      var _this = this;
      navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function (stream) {
          _this.video.srcObject = stream;
          _this.video.play();
          _this.isBegin = true;
          typeof successCallback === 'function' && successCallback();
        })
        .catch(function (err) {
          console.log("An error occured! " + err);
          typeof errorCallback === 'function' && errorCallback();
        });
    }
    else {
      typeof errorCallback === 'function' && errorCallback();
    }
  },
  get: function () {
    if (!this.isBegin) return false;
    var photo = $("#photo")[0];
    if (!photo) {
      photo = document.createElement('canvas');
      photo.id = 'photo';
      photo.style.cssText = 'display: none;';
      document.body.appendChild(photo); 
    }
    $(photo).attr('width', this.video.videoWidth).attr('height', this.video.videoHeight);
    var photoContext = photo.getContext('2d');
    photoContext.drawImage(this.video, 0, 0, photo.width, photo.height);
    var dataURL = photo.toDataURL("image/jpeg", 0.95);
    return this.makeblob(dataURL);
  },

  makeblob: function(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);
      return new Blob([raw], { type: contentType });
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  },
}
