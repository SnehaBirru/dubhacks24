document.addEventListener('DOMContentLoaded', () => {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const cookieOutput = document.getElementById('cookieOutput');

  function updateDisplay() {
    chrome.storage.local.get(['analysisInProgress', 'popupDisplay'], (data) => {
      if (data.analysisInProgress) {
        loadingIndicator.style.display = 'block';
        cookieOutput.textContent = 'Analysis in progress...';
      } else {
        loadingIndicator.style.display = 'none';
        if (data.popupDisplay) {
          cookieOutput.textContent = data.popupDisplay;
        } else {
          cookieOutput.textContent = 'No cookie data found. Click the extension icon to analyze cookies.';
        }
      }
    });
  }

  // Update display when popup opens
  updateDisplay();

  // Set up an interval to check for updates
  setInterval(updateDisplay, 1000); // Check every second
});
