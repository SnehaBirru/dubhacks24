document.addEventListener('DOMContentLoaded', () => {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const cookieOutput = document.getElementById('cookieOutput');

  function updateDisplay() {
    chrome.storage.local.get('popupDisplay', (data) => {
      loadingIndicator.style.display = 'none';
      if (data.popupDisplay) {
        cookieOutput.textContent = data.popupDisplay;
      } else {
        cookieOutput.textContent = 'No cookie data found. Click the extension icon to analyze cookies.';
      }
    });
  }

  // Update display when popup opens
  updateDisplay();

  // Listen for updates from background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'dataReady') {
      updateDisplay();
    }
  });

  // Show loading indicator when extension icon is clicked
  chrome.action.onClicked.addListener(() => {
    loadingIndicator.style.display = 'block';
    cookieOutput.textContent = '';
  });
});
