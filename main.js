document.addEventListener('DOMContentLoaded', function () {
  const recordBtn = document.getElementById('recordBtn');
  const videoPlayer = document.getElementById('videoPlayer');
  const feedback = document.getElementById('feedback');

  recordBtn.addEventListener('click', function () {
    feedback.textContent = 'Requesting video recording...';
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.recordVideo) {
      window.webkit.messageHandlers.recordVideo.postMessage({});
    } else {
      feedback.textContent = 'Native bridge not available.';
    }
  });

  // Called by native code with base64 video data
  window.displayRecordedVideo = function (base64String) {
    feedback.textContent = 'Video ready. Click play to watch.';
    const blob = base64ToBlob(base64String, 'video/mp4');
    const url = URL.createObjectURL(blob);
    videoPlayer.src = url;
    videoPlayer.style.display = 'block';
    videoPlayer.load();
  };

  // Called by native code with error message
  window.displayError = function (message) {
    feedback.textContent = message;
    videoPlayer.style.display = 'none';
    videoPlayer.src = '';
  };

  function base64ToBlob(base64, mime) {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }
});
