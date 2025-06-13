document.addEventListener('DOMContentLoaded', function () {
  const recordBtn = document.getElementById('recordBtn');
  const videoPlayer = document.getElementById('videoPlayer');
  const feedback = document.getElementById('feedback');
  const error = document.getElementById('error');

  recordBtn.addEventListener('click', function () {
    clearMessages();
    displayFeedback('Requesting video recording...');
    
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.recordVideo) {
      window.webkit.messageHandlers.recordVideo.postMessage({});
    } else {
      displayError('Native bridge not available. Please run this in the iOS app.');
    }
  });

  // Called by native code with base64 video data
  window.displayRecordedVideo = function (base64String) {
    console.log('Received video data, length:', base64String.length);
    clearMessages();
    
    try {
      const blob = base64ToBlob(base64String, 'video/mp4');
      const url = URL.createObjectURL(blob);
      videoPlayer.src = url;
      videoPlayer.style.display = 'block';
      videoPlayer.load();
      
      // Auto play the video
      videoPlayer.play().catch(e => {
        console.log('Auto-play failed:', e);
        displayFeedback('Video ready. Click play to watch.');
      });
      
      displayFeedback('Video loaded successfully!');
    } catch (e) {
      console.error('Error processing video:', e);
      displayError('Failed to process video data: ' + e.message);
    }
  };

  // Called by native code with error message
  window.displayError = function (message) {
    console.log('Error from native:', message);
    clearMessages();
    error.textContent = message;
    error.style.display = 'block';
    videoPlayer.style.display = 'none';
  };

  // Called by native code with feedback message
  window.displayFeedback = function (message) {
    console.log('Feedback from native:', message);
    error.style.display = 'none';
    feedback.textContent = message;
    feedback.style.display = message ? 'block' : 'none';
  };

  function clearMessages() {
    feedback.textContent = '';
    feedback.style.display = 'none';
    error.textContent = '';
    error.style.display = 'none';
  }

  function base64ToBlob(base64, mime) {
    try {
      const byteChars = atob(base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mime });
    } catch (e) {
      throw new Error('Invalid base64 data');
    }
  }
});
