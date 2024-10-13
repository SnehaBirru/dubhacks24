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
      console.log(cookieKeys)

      const cookieList = document.getElementById('cookieNames');

      // Iterate over the array and create a list item for each element
      cookieKeys.forEach(function(item) {
        const li = document.createElement('li');
        li.textContent = item;  // Set the text content to the array item
        cookieList.appendChild(li);  // Append the li to the ul
      });

      // Set the cookie count
      const cookieCount = Math.min(cookieKeys.length, 50);
      const jarHeight = 200; // height of jar in pixels
      const jarWidth = 100; // width of jar in pixels
      const cookieSize = 20; // size of each cookie image
      const cookieContainer = document.getElementById("cookieContainer");

      // Clear previous cookies
      cookieContainer.innerHTML = '';

      // Calculate how many cookies can fit in one row
      const cookiesPerRow = Math.floor(jarWidth / cookieSize);
      const maxRows = Math.floor(jarHeight / cookieSize);
      const filledRows = Math.min(Math.ceil(cookieCount / cookiesPerRow), maxRows);

      // Create cookie elements
      let cookieIndex = 0;
      for (let row = 0; row < filledRows; row++) {
          for (let col = 0; col < cookiesPerRow; col++) {
              if (cookieIndex >= cookieCount) break; // Stop if we've placed all cookies

              const cookie = document.createElement("img");
              cookie.src = "cookie.png"; // replace with your cookie image path
              cookie.style.position = "absolute";
              cookie.style.width = `${cookieSize}px`;
              cookie.style.height = `${cookieSize}px`;

              // Set the position of each cookie
              const x = col * cookieSize + Math.random() * (cookieSize * 0.4) + 7; // Add a small random jitter
              const y = jarHeight - (row + 1) * (cookieSize * 0.75) - 50; // Fill from the bottom
              cookie.style.left = `${x}px`;
              cookie.style.top = `${y}px`;

              cookieContainer.appendChild(cookie);
              cookieIndex++;
          }
      }

      // Update cookie visual
      document.getElementById('cookieCount').textContent = `${cookieCount} / 50 cookies`;

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
