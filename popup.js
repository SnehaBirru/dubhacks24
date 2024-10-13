document.addEventListener('DOMContentLoaded', () => {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const cookieOutputElement = document.getElementById('cookieOutput');
  let cookieOutput = '';

  function updateDisplay() {
    chrome.storage.local.get(['analysisInProgress', 'popupDisplay'], (data) => {
      if (data.analysisInProgress) {
        loadingIndicator.style.display = 'block';
        cookieOutput = 'Analysis in progress...';
      } else {
        loadingIndicator.style.display = 'none';
        if (data.popupDisplay) {
          cookieOutput = data.popupDisplay;
        } else {
          cookieOutput = 'No cookie data found. Click the extension icon to analyze cookies.';
        }
      }
      cookieOutputElement.textContent = cookieOutput;
    });
  }

  // Update display when popup opens
  updateDisplay();

  // Set up an interval to check for updates
  setInterval(updateDisplay, 1000); // Check every second

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'dataReady') {
      updateDisplay();
    }
  });
});
