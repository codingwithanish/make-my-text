// Utility: Fetch data from Chrome storage
export function fetchFromStorage(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key] || []);
        }
      });
    });
  }
  
  // Utility: Add data to Chrome storage
  export function saveToStorage(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
  
  // Utility: Filter messages by siteName
  export function filterMessages(messages, siteName, exclude = false) {
    return messages.filter((message) =>
      exclude ? message.siteName !== siteName : message.siteName === siteName
    );
  }
  
  // Utility: Concatenate message content
  export function concatenateMessages(messages) {
    return messages.map((message) => message.content || "").join(" ").trim();
  }

  export function addMessageToMemory(userMessageText, site, siteURL) {
    let newMessage = {
      content: userMessageText,
      siteName: site,
      siteUrl: siteURL
    }
    chrome.storage.local.get("userMessages", (result) => {
      // Retrieve existing userMessages or initialize an empty array if it doesn't exist
      const userMessages = result.userMessages || [];
  
      // Append the new message to the array
      userMessages.push(newMessage);
  
      // Save the updated array back to Chrome storage
      chrome.storage.local.set({ userMessages }, () => {
        console.log("New message appended:", newMessage);
        console.log("Updated userMessages:", userMessages);
      });
    });
  }
  