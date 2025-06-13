document.addEventListener('DOMContentLoaded', function () {
  const recordBtn = document.getElementById('recordBtn');
  const videoPlayer = document.getElementById('videoPlayer');
  const feedback = document.getElementById('feedback');
  const error = document.getElementById('error');

  // Add click event to record button
  recordBtn.addEventListener('click', function () {
    console.log('Record button clicked');
    clearMessages();
    showFeedback('Requesting video recording...');
    
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.recordVideo) {
      console.log('Sending message to native');
      window.webkit.messageHandlers.recordVideo.postMessage({});
    } else {
      console.log('Native bridge not available');
      showError('Native bridge not available. Please run this in the iOS app.');
    }
  });

  // Called by native code with base64 video data
  window.displayRecordedVideo = function (base64String) {
    console.log('displayRecordedVideo called, data length:', base64String.length);
    clearMessages();
    
    try {
      const blob = base64ToBlob(base64String, 'video/mp4');
      const url = URL.createObjectURL(blob);
      
      videoPlayer.src = url;
      videoPlayer.style.display = 'block';
      videoPlayer.load();
      
      // Try to auto-play
      videoPlayer.play().catch(e => {
        console.log('Auto-play failed:', e);
        showFeedback('Video ready. Click play to watch.');
      });
      
      console.log('Video loaded successfully');
    } catch (e) {
      console.error('Error processing video:', e);
      showError('Failed to process video: ' + e.message);
    }
  };

  // Called by native code with error message
  window.displayError = function (message) {
    console.log('displayError called:', message);
    showError(message);
  };

  // Called by native code with feedback message
  window.displayFeedback = function (message) {
    console.log('displayFeedback called:', message);
    if (message && message.trim()) {
      showFeedback(message);
    } else {
      clearMessages();
    }
  };

  // Helper functions
  function showFeedback(message) {
    error.style.display = 'none';
    feedback.textContent = message;
    feedback.style.display = 'block';
  }

  function showError(message) {
    feedback.style.display = 'none';
    error.textContent = message;
    error.style.display = 'block';
    videoPlayer.style.display = 'none';
  }

  function clearMessages() {
    feedback.style.display = 'none';
    error.style.display = 'none';
    feedback.textContent = '';
    error.textContent = '';
  }

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
