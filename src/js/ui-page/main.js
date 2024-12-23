import {
    fetchFromStorage,
    saveToStorage,
    filterMessages,
    concatenateMessages,
    addMessageToMemory,
    getApiKeys,
    checkAndAddDefaultPromptConfigurations,
    getPromptConfigurations,
    logInfo,
    logError
} from "./utils.js";
import { createNewMessageDiv, populateChatSection, createWarningMessageDiv,createLoadingMessageDiv,removeLoadingMessageDiv } from "./dom.js";
import { generateSummary, executePrompt } from "./ai.js";
// Helper function to sleep for a specified duration
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
document.addEventListener("DOMContentLoaded", async () => {
    const chatSection = document.querySelector("#chat-section");
    logInfo("Extension script going to execute")
    // Fetch and populate messages on load
    // Sleep for 5 seconds
    await sleep(5000);
    logInfo("Extension script after 5 minutes delay")
    let userMessages = await fetchFromStorage("userMessages");
    let validation_result = await validateConfiguration(); // Ensure configuration is validated
    if (!validation_result) return;
    await checkAndAddDefaultPromptConfigurations(); // Ensure default prompt configurations are added
    populateChatSection(userMessages);


    // Button: Clear Memory
    const clearMemoryBtn = document.getElementById("clearMemoryBtn");
    if (clearMemoryBtn) {
        clearMemoryBtn.addEventListener("click", async () => {
            chrome.storage.local.remove("userMessages", () => {
                logInfo("Memory cleared.");
                populateChatSection([]); // Clear UI
            });
        });
    }

    // Dynamically generate buttons based on prompt configurations
    const actionButtonPanel = document.getElementById("action-button-panel");
    const promptConfigs = await getPromptConfigurations();
    logInfo("Prompt Configurations Dynamically Generated:", promptConfigs);
     // Mapping of id to icon classes
     const iconClassMapping = {
      "write-email": "fas fa-envelope",
      "generate-replies": "fas fa-reply",
      "general-text-formatting": "fas fa-text-height"
  };

    promptConfigs.forEach(config => {
        const button = document.createElement("button");
        button.id = config.id;
        button.className = "w-full flex flex-col items-center text-white hover:text-white";

        const iconSpan = document.createElement("span");
        iconSpan.className = "text-2xl";
        const icon = document.createElement("i");
        icon.className = iconClassMapping[config.id] || "fas fa-circle-play"; // Default icon if id not found
        iconSpan.appendChild(icon);

        const textSpan = document.createElement("span");
        textSpan.className = "text-sm";
        textSpan.textContent = config.name;

        button.appendChild(iconSpan);
        button.appendChild(textSpan);

        button.addEventListener("click", () => handleButtonClick(config.id, userMessages));
        actionButtonPanel.appendChild(button);
    });
    // Listen for changes to Chrome storage
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes.userSelection) {
            //const chatSection = document.querySelector("#chat-section");
            if (chatSection) {
                // Create and append the new message
                const { content, siteName, siteUrl } = changes.userSelection.newValue;
                const newMessageDiv = createNewMessageDiv(content, siteName, siteUrl);
                chatSection.appendChild(newMessageDiv);

                // Save the new message to storage
                addMessageToMemory(content, siteName, siteUrl);

                // Scroll to the bottom of the chat section
                chatSection.scrollTop = chatSection.scrollHeight;
            }
        }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "updateUserSelection") {
          const { content, siteName, siteUrl } = message.userSelection;
  
          // Update the UI (example with a chat section)
          const chatSection = document.querySelector("#chat-section");
          if (chatSection) {
              const newMessageDiv = createNewMessageDiv(content, siteName, siteUrl);
              chatSection.appendChild(newMessageDiv);
  
              // Save the new message to memory (if needed)
              addMessageToMemory(content, siteName, siteUrl);
  
              // Scroll to the bottom of the chat section
              chatSection.scrollTop = chatSection.scrollHeight;
          }
  
          // Optionally, send a response back to the sender
          sendResponse({ success: true });
      }
  });
  const textInput = document.getElementById("textInput");
    // Add an event listener to capture the Enter key press
  textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Check if Enter is pressed without Shift
      event.preventDefault(); // Prevent default behavior (like adding a new line)
      //const chatSection = document.querySelector("#chat-section");
      const userMessage = textInput.value.trim();
      if (userMessage && chatSection) {
        // Create a new message element

        const newMessageDiv = createNewMessageDiv(userMessage, "User", "https://user.com");
        addMessageToMemory(userMessage, "User", "https://user.com")
        chatSection.appendChild(newMessageDiv);

        // Clear the input field
        textInput.value = '';

        // Scroll to the bottom of the chat section
        chatSection.scrollTop = chatSection.scrollHeight;
      }
    }
  });

  // Add event listeners for Translate and Rewrite buttons
  chatSection.addEventListener("click", async (event) => {
    const target = event.target;
  
    // Handle Translate button click
    if (target.closest(".translate-btn")) {
      const parentDiv = target.closest(".p-4");
      const translatedMsg = "Here is the translated text";
  
      // Create the translated message box
      const translatedBox = document.createElement("div");
      translatedBox.className =
        "p-4 bg-blue-100 rounded-lg ml-6 mt-2 relative shadow";
      translatedBox.innerHTML = `
        <div class="text-gray-800 mb-2">${translatedMsg}</div>
        <button class="close-btn absolute top-2 right-2 text-sm text-blue-500 hover:text-blue-700">✖</button>
      `;
  
      // Append the translated box below the parent div
      parentDiv.insertAdjacentElement("afterend", translatedBox);
  
      // Add functionality to close the translated box
      translatedBox.querySelector(".close-btn").addEventListener("click", () => {
        translatedBox.remove();
      });
    }
  
    // Handle Rewrite button click
    // Handle Rewrite button click
  if (target.closest(".rewrite-btn")) {
    const parentDiv = target.closest(".p-4");
    const inputMessage = parentDiv.querySelector(".text-content-div").textContent;
    const prompt_template = ` You are a rephrasing assistant. Your task is to rewrite the provided text while preserving its original meaning. Accept the user input and return only the rephrased version, with no additional commentary or explanations. 

        User Input: ${inputMessage}
    
    `
    const rewrittenMsg = await executePrompt(prompt_template);

    // Create the rewritten message box
    const rewrittenBox = document.createElement("div");
    rewrittenBox.className =
      "p-4 bg-yellow-100 rounded-lg ml-6 mt-2 relative shadow";
    rewrittenBox.innerHTML = `
      <div class="font-semibold text-gray-700 mb-2">Rephrase Result</div>
      <div class="text-gray-800 mb-2">${rewrittenMsg}</div>
      <div class="absolute top-2 right-2 flex space-x-2">
        <button class="copy-btn text-sm text-yellow-500 hover:text-yellow-700">📋 </button>
        <button class="close-btn text-sm text-yellow-500 hover:text-yellow-700">✖</button>
      </div>
    `;

    // Append the rewritten box below the parent div
    parentDiv.insertAdjacentElement("afterend", rewrittenBox);

    // Add functionality to close the rewritten box
    rewrittenBox.querySelector(".close-btn").addEventListener("click", () => {
      rewrittenBox.remove();
    });

    // Add functionality to copy rewrittenMsg to clipboard
    rewrittenBox.querySelector(".copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(rewrittenMsg).then(() => {
        logInfo("Rewritten message copied to clipboard!");
      }).catch((error) => {
        logError("Failed to copy text:", error);
      });
    });
  }
  });

  
});
async function validateConfiguration() {
  const config = await getApiKeys();
  const apiKeys = config.apikeys;

  if (!apiKeys || !apiKeys["gemini-api-key"] || !apiKeys["text-summary-key"]) {
      createWarningMessageDiv("Api Keys not configured");
      return false;
  }
  return true;
}

// Common function to handle button clicks
async function handleButtonClick(id, userMessages) {
  const chatSection = document.getElementById("chat-section");
  const loadingMessageDiv = createLoadingMessageDiv();
  chatSection.appendChild(loadingMessageDiv);
  try {
      const promptConfigs = await getPromptConfigurations();
      const config = promptConfigs.find(item => item.id === id);
      if (config) {
          logInfo("Prompt Configuration:", config);
          const promptTemplate = config.prompt_template;
          const userContext = userMessages.map(item => item.content).join('\n');
          const siteContext = ["When attempting to execute the npm run build command, the build process fails due to a JavaScript parsing error. Additionally, the generated dist folder does not include the required node_modules, which is critical for the proper functioning of the application. As a workaround, the user is manually copying the node_modules directory to the dist folder to ensure the extension works as expected. This issue is causing disruptions in the build and deployment process, requiring immediate resolution.", "I tried upgrading the Parse JS version, but it didn’t work.", "Is it possible to include this in this week’s release?"];
          const prompt = promptTemplate
                .replace('${userContext}', userContext)
                .replace('${siteContext}', siteContext.join('\n'));

                logInfo("Generated Prompt Message:", prompt);
                const rewrittenMsg = await executePrompt(prompt);
          
          const newMessage = { content: rewrittenMsg, siteName: "Make My Text" };
          userMessages.push(newMessage);
          await saveToStorage("userMessages", userMessages);
          populateChatSection(userMessages);
      } else {
          logError(`Prompt configuration with id ${id} not found`);
      }
  } catch (error) {
      logError("Error retrieving prompt configuration:", error);
  } finally {
    removeLoadingMessageDiv(loadingMessageDiv);
}
}
