chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const tabUrl = new URL(currentTab.url);
  
    chrome.cookies.getAll({ url: tabUrl.origin }, (cookies) => {
      let cookieKeys = cookies.map(cookie => cookie.name);  // Extract cookie keys
      let cookieJson = JSON.stringify({ cookies: cookieKeys }, null, 2);  // Format as JSON
  
      // Display the cookie keys in the popup
      document.getElementById('cookieOutput').textContent = cookieJson;
    });
  });
  