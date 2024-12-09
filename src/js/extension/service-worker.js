chrome.sidePanel
          .setPanelBehavior({ openPanelOnActionClick: true })
          .catch((error) => console.error(error));
// to find the windowId of the active tab
let windowId;
chrome.tabs.onActivated.addListener(function (activeInfo) {
  windowId = activeInfo.windowId;
});

// to receive messages from popup script
chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.action === 'open_side_panel') {
      chrome.sidePanel.open({ windowId: windowId });
    }
  })();
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'copyToMakeMyText',
      title: 'Copy To Make My Text',
      contexts: ['page', 'selection', 'editable'] // Restrict to relevant contexts
    });
    // Option for the plugin (extension icon)
  chrome.contextMenus.create({
    id: "clearMemory",
    title: "Clear Memory",
    contexts: ["action"], // Appears only on the plugin icon
  });
  // Option for the plugin (extension icon)
  chrome.contextMenus.create({
    id: "options",
    title: "Options",
    contexts: ["action"], // Appears only on the plugin icon
  });
  });
  
  // Listen for context menu click
 // Listen for context menu click
 chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "copyToMakeMyText" && info.selectionText) {
      const siteUrl = tab.url; // Full site URL
      const siteName = new URL(siteUrl).hostname; // Extract domain name
      userSelection = {
        "content":info.selectionText,
        "siteUrl": siteUrl,
        "siteName": siteName
      }

     chrome.storage.local.set({ userSelection: userSelection }, () => {
        console.log("Selected text stored:", info.selectionText);
      });
        // Send a message to the UI script
        chrome.runtime.sendMessage({ action: "updateUserSelection", userSelection });
    } else if (info.menuItemId === "clearMemory") {
      console.log("Clear Memory clicked");
      // Handle the clear memory logic here
      chrome.storage.local.clear(() => {
        console.log("Memory cleared successfully!");
      });
    } else if (info.menuItemId === "options") {
      console.log("Options clicked");
      chrome.runtime.openOptionsPage(() => {
        if (chrome.runtime.lastError) {
          console.error("Failed to open options page:", chrome.runtime.lastError.message);
        } else {
          console.log("Options page opened successfully!");
        }
      });
    }
  });

  