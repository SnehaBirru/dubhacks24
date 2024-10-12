chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const tabUrl = new URL(currentTab.url);
  
      chrome.cookies.getAll({ url: tabUrl.origin }, (cookies) => {
        let cookieKeys = cookies.map(cookie => cookie.name);  // Extract cookie keys
        let cookieJson = JSON.stringify({ cookies: cookieKeys });  // Format as JSON
  
        // Parse the JSON string back into an object
        let cookieObject = JSON.parse(cookieJson);
        
        // Access the cookies array
        let cookiesArray = cookieObject.cookies;
  
        let body = JSON.stringify({
          "model": "llama-3.1-sonar-small-128k-online",
          "messages": [
            {"role": "system", "content": "Be precise and concise."},
            {"role": "system", "content": "In your response start by saying \"The following cookies could be storing dangerous information:\" then list the dangerous cookies with a 1 sentence explanation of why it could be dangerous. If a cookie is not explicitly mentioned as vulnerable don't include it in the list. If there's no cookies that are vulnerable then say \"No dangerous cookies!\" instead"},
            {"role": "user", "content": "Are any of these cookies potentially having dangerous information: " + cookiesArray.join(", ")}
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
        
        fetch('https://api.perplexity.ai/chat/completions', options)
          .then(response => response.json())
          .then(response => console.log(response))
          .then(chrome.storage.local.set({ popupDisplay: response.body.choices[0].message.content }, () => {
            console.log('Popup display stored:', response.body.choices[0].message.content);
          }))
          .catch(err => console.error(err));
        
        // Log the cookie keys to the console
        console.log(cookieKeys);
      });
    });
  });
