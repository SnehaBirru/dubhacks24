chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Display the cookie keys in the popup
    document.getElementById('cookieOutput').textContent = "Analyzing cookies...";
    const currentTab = tabs[0];
    const tabUrl = new URL(currentTab.url);
  
    chrome.cookies.getAll({ url: tabUrl.origin }, (cookies) => {
      let cookieKeys = cookies.map(cookie => cookie.name);  // Extract cookie keys
      let cookieJson = JSON.stringify({ cookies: cookieKeys }, null, 2);  // Format as JSON
      console.log(cookieKeys)

      let body = JSON.stringify({
        "model": "llama-3.1-sonar-small-128k-online",
        "messages": [
          {"role": "system", "content": "Be precise and concise."},
          {"role": "system", "content": "In your response start by saying \"The following cookies could be storing dangerous information:\" then list the dangerous cookies with a 1 sentence explanation of why it could be dangerous. If a cookie is not explicitly mentioned as vulnerable don't include it in the list. Can you sort the dangerous cookies into high risk, medium risk, and low risk when you list them out, it's okay if some categories don't have cookies in them. If there's no cookies that are vulnerable then say \"No dangerous cookies!\" instead. Either list the risky cookies or say no dangerous cookies, don't say both in your response. Do not include anything other than the sorted list in your response if there are dangerous cookies."},
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

      fetch('https://api.perplexity.ai/chat/completions', options)
      .then(response => response.json())
      .then(response => {
        const content = response.choices[0].message.content;
        console.log(content); // This will still log to the console
        document.getElementById('cookieOutput').textContent = content; // This stores the content in the cookieOutput element
      })
      .catch(err => console.error(err));
    });
  });
