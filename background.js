chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      console.error("No active tab found");
      return;
    }

    const currentTab = tabs[0];
    const tabUrl = new URL(currentTab.url);

    chrome.cookies.getAll({ url: tabUrl.origin }, (cookies) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting cookies:", chrome.runtime.lastError);
        return;
      }

      let cookieKeys = cookies.map(cookie => cookie.name);
      console.log("Cookie names:", cookieKeys);

      if (cookieKeys.length === 0) {
        console.log("No cookies found for this site.");
        return;
      }

      let body = JSON.stringify({
        "model": "llama-3.1-sonar-small-128k-online",
        "messages": [
          {"role": "system", "content": "Be precise and concise."},
          {"role": "system", "content": "In your response start by saying \"The following cookies could be storing dangerous information:\" then list the dangerous cookies with a 1 sentence explanation of why it could be dangerous. If a cookie is not explicitly mentioned as vulnerable don't include it in the list. If there's no cookies that are vulnerable then say \"No dangerous cookies!\" instead"},
          {"role": "user", "content": "Are any of these cookies potentially having dangerous information: " + cookieKeys.join(", ")}
        ]
      });

      const options = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: body
      };
      
      console.log("Sending request to API...");
      fetch('https://api.perplexity.ai/chat/completions', options)
        .then(response => {
          console.log("Received response from API");
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("Full API Response:", data);
          if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error("Unexpected API response structure");
          }
          let content = data.choices[0].message.content;
          console.log("Extracted content:", content);
          return new Promise((resolve) => {
            chrome.storage.local.set({ popupDisplay: content }, () => {
              if (chrome.runtime.lastError) {
                console.error("Error storing data:", chrome.runtime.lastError);
                resolve(null);
              } else {
                console.log('Popup display stored:', content);
                resolve(content);
              }
            });
          });
        })
        .then(content => {
          if (content) {
            console.log("Content stored and ready for use:", content);
          } else {
            console.log("Failed to store content");
          }
        })
        .catch(err => console.error("Error:", err));
        chrome.runtime.sendMessage({type: 'dataReady'});
    });
  });
});
