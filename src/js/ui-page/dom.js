import { logError, logInfo } from "./utils";

// DOM: Create a new warning message div
export function createWarningMessageDiv(content) {
  const warningMessageDiv = document.createElement("div");
  warningMessageDiv.className = "p-4 bg-yellow-200 rounded-lg relative";

  // Add close button for the warning message
  const closeButton = document.createElement("button");
  closeButton.className =
    "absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-sm";
  closeButton.textContent = "✖";
  closeButton.addEventListener("click", () => {
    warningMessageDiv.remove();
  });
  warningMessageDiv.appendChild(closeButton);

  // Add the main content of the warning message
  const messageTextDiv = document.createElement("div");
  messageTextDiv.className = "text-gray-800 mb-2 text-base text-content-div";
  if (content) {
    content = content.replace(/\n/g, "<br/>").trim();
  }
  messageTextDiv.innerHTML = content;
  warningMessageDiv.appendChild(messageTextDiv);

  // Append the warning message div to the body or a specific container
  document.body.appendChild(warningMessageDiv);
}

// DOM: Create a new message div
export function createNewMessageDiv(content, siteName, link) {
    const newMessageDiv = document.createElement("div");
    newMessageDiv.className = "p-4 bg-gray-200 rounded-lg relative";
  
    // Add close button for the parent message
    const closeButton = document.createElement("button");
    closeButton.className =
      "absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-sm";
    closeButton.textContent = "✖";
    closeButton.addEventListener("click", () => {
      newMessageDiv.remove();
    });
    newMessageDiv.appendChild(closeButton);
  
    // Add the main content of the message
    const messageTextDiv = document.createElement("div");
    messageTextDiv.className = "text-gray-800 mb-2 text-base text-content-div";
    if (content){
      content =  content.replace(/\n/g, "<br/>").trim()
    }
    messageTextDiv.innerHTML = content;
    newMessageDiv.appendChild(messageTextDiv);
  
    // Add the resource section
    const resourceDiv = document.createElement("div");
    resourceDiv.className = "text-sm text-gray-600 flex items-center";
  
    const resourceLabel = document.createElement("span");
    resourceLabel.className = "font-semibold text-xs";
    resourceLabel.textContent = "Resource: ";
    resourceDiv.appendChild(resourceLabel);
  
    const resourceLink = document.createElement("a");
    resourceLink.href = link;
    resourceLink.className = "text-blue-500 hover:underline ml-2 text-xs";
    resourceLink.target = "_blank";
    resourceLink.textContent = siteName;
    resourceDiv.appendChild(resourceLink);
  
    // Add Translate and Rewrite buttons
    const buttonContainer = document.createElement("span");
    buttonContainer.className = "ml-auto flex items-center space-x-2";
    const rewriteButton = document.createElement("button");
    rewriteButton.className = "rewrite-btn text-gray-600 hover:text-blue-500";
    rewriteButton.innerHTML = "<span class='text-xl'><icon class='fas fa-retweet'></icon></span>";
    buttonContainer.appendChild(rewriteButton);
  
    resourceDiv.appendChild(buttonContainer);
    newMessageDiv.appendChild(resourceDiv);
  
    return newMessageDiv;
  }
  
  // DOM: Create a loading message div
export function createLoadingMessageDiv() {
  const loadingMessageDiv = document.createElement("div");
  loadingMessageDiv.className = "p-4 bg-gray-200 rounded-lg relative";
  loadingMessageDiv.textContent = "Working on it...";
  return loadingMessageDiv;
}

// DOM: Remove a loading message div
export function removeLoadingMessageDiv(loadingMessageDiv) {
  loadingMessageDiv.remove();
}
  // DOM: Populate chat section with messages
  export function populateChatSection(messages) {
    const chatSection = document.querySelector("#chat-section");
    if (!chatSection) {
      logError("Chat section not found!");
      return;
    }
  
    chatSection.innerHTML = ""; // Clear existing messages
    messages.forEach((message) => {
      const { content, siteName, siteUrl } = message;
      const newMessageDiv = createNewMessageDiv(content, siteName, siteUrl);
      chatSection.appendChild(newMessageDiv);
    });
  
    chatSection.scrollTop = chatSection.scrollHeight;
  }
  
  // DOM: Add event listener to a button
  export function attachButtonListener(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (!button) {
      logError(`Button with ID "${buttonId}" not found!`);
      return;
    }
  
    button.addEventListener("click", callback);
  }

  export function addToChat() {

  }
  