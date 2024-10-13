chrome.action.setIcon({
  path: {
    "16": "icon16.png",
    "32": "icon32.png",
    "48": "icon48.png",
    "128": "icon.png"
  }
});

let tabUrl = "";
let cookieJson = {};

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Display the cookie keys in the popup
    document.getElementById('cookieOutput').textContent = "Analyzing cookies...";
    const currentTab = tabs[0];
    tabUrl = new URL(currentTab.url);
  
    chrome.cookies.getAll({ url: tabUrl.origin }, (cookies) => {
      let cookieKeys = cookies.map(cookie => cookie.name);  // Extract cookie keys

      cookieJson = JSON.stringify({ cookies: cookieKeys }, null, 2);  // Format as JSON
      console.log(cookieJson)

      let body = JSON.stringify({
        "model": "llama-3.1-sonar-small-128k-online",
        "messages": [
          {"role": "system", "content": "Be precise and concise."},
          {"role": "system", "content": "In your response start by saying \"The following cookies could \
            be storing dangerous information:\" then list the dangerous cookies with a 1 sentence explanation \
            of why it could be dangerous, categorizing them as high risk, medium risk, and low risk. If a \
            cookie is not explicitly mentioned as vulnerable don't include \
            it in the list. Don't mention the vulnerable cookies. Sort the dangerous cookies into high risk, \
            medium risk, and low risk when \
            you list them out, it's okay if some categories don't have cookies in them. Do not respond with anything \
            other than the list. If there's no cookies \
            that are vulnerable then say \"No dangerous cookies!\" . Either list the risky cookies or \
            say no dangerous cookies, do not say both."},
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

  function removeAllCookies(jsonFile) {
    let parsedJson = JSON.parse(jsonFile);
    parsedJson.cookies.forEach((cookie) => {
      chrome.cookies.remove(
        {
          url: tabUrl.toString(),
          name: cookie,
        },
        (details) => {
          if (details === null) {
            console.error(`Error removing cookie "${cookie}": ${details.cause}`);
          } else {
            console.log(`Cookie "${cookie}" removed successfully.`);
          }
        }
      );
    });
  }

  window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('clearCookiesBtn').addEventListener('click', function() {
      removeAllCookies(cookieJson);
    });
  });