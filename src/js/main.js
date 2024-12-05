import {
    fetchFromStorage,
    saveToStorage,
    filterMessages,
    concatenateMessages,
    addMessageToMemory,
} from "./utils.js";
import { createNewMessageDiv, populateChatSection } from "./dom.js";
import { generateSummary, executePrompt } from "./ai.js";

document.addEventListener("DOMContentLoaded", async () => {
    const chatSection = document.querySelector("#chat-section");
    // Fetch and populate messages on load
    let userMessages = await fetchFromStorage("userMessages");
    populateChatSection(userMessages);

    // Button: Clear Memory
    const clearMemoryBtn = document.getElementById("clearMemoryBtn");
    if (clearMemoryBtn) {
        clearMemoryBtn.addEventListener("click", async () => {
            chrome.storage.local.remove("userMessages", () => {
                console.log("Memory cleared.");
                populateChatSection([]); // Clear UI
            });
        });
    }

    // Button: Summarize
    const summarizeBtn = document.getElementById("summarizeBtn");
    if (summarizeBtn) {
        summarizeBtn.addEventListener("click", async () => {
            userMessages = await fetchFromStorage("userMessages");
            const textSummary = concatenateMessages(userMessages);
            if (!textSummary) return;
            const heading = await generateSummary(textSummary,"headline", length="short");

            const keyPoints = await generateSummary(textSummary, "key-points");
            const tldr = await generateSummary(textSummary, "tl;dr");

            const complete_summary = `
            ${heading} \n\n
            Key Points: \n
            ${keyPoints}
            Summary: \n 
            ${tldr}
            `
            const newMessage = { content: complete_summary, siteName: "Make My Text" };

            userMessages.push(newMessage);
            await saveToStorage("userMessages", userMessages);
            populateChatSection(userMessages);
        });
    }

    // Button: Write Email
    const writeEmailBtn = document.getElementById("writeEmailBtn");
    if (writeEmailBtn) {
        writeEmailBtn.addEventListener("click", async () => {
            userMessages = await fetchFromStorage("userMessages");
            const userContext = filterMessages(userMessages, "User").map(item => item.content);
            const siteContext = filterMessages(userMessages, "Make My Text", true).map(item => item.content);
          const prompt_template = `
          You are a professional email creator. Based on the provided input information, your task is to craft a professional email. 

            There are two types of input information:
            1. **User Context**: Details about the user on whose behalf the email is being written.
            2. **Site Context**: Additional context about the purpose or subject of the email.

            Your response should include:
            - **Subject**: A concise and relevant subject line.
            - **Body**: A professionally written email body.

            **Response format**:
            - Subject: [Your Subject Line]
            - Body: [Your Email Content]

            Ensure the response contains only the subject and body, with no additional commentary or explanations.

            User Context: ${userContext}
            Site Context: ${siteContext}
            `
          const rewrittenMsg = await executePrompt(prompt_template);


            const newMessage = { content: rewrittenMsg, siteName: "Make My Text" };
            userMessages.push(newMessage);
            await saveToStorage("userMessages", userMessages);
            populateChatSection(userMessages);
        });
    }

    // Button: Generate Replies
    const generateRepliesBtn = document.getElementById("generateRepliesBtn");
    if (generateRepliesBtn) {
        generateRepliesBtn.addEventListener("click", async () => {
            userMessages = await fetchFromStorage("userMessages");
            const userContext = filterMessages(userMessages, "User").map(item => item.content);
            const siteContext = ["When attempting to execute the npm run build command, the build process fails due to a JavaScript parsing error. Additionally, the generated dist folder does not include the required node_modules, which is critical for the proper functioning of the application. As a workaround, the user is manually copying the node_modules directory to the dist folder to ensure the extension works as expected. This issue is causing disruptions in the build and deployment process, requiring immediate resolution.", "I tried upgrading the Parse JS version, but it didn’t work.", "Is it possible to include this in this week’s release?"];
            const prompt_template = `
            You are tasked with writing a reply based on the provided context information. The context is divided into two types:

1. **User Context**: An array of strings that provides insights into the type of reply required. It includes the user message and offers guidance on what the reply should convey. Note that the reply will be made on behalf of the same user.
2. **Site Context**: An array of strings that provides comprehensive details about the topic.

Your task is create a reply which contains the user context information more elaborated way by including the site context information.

**Response Requirements**:
- Provide only the reply content in your response.
- Avoid including any additional commentary or explanations.

**Inputs**:
- User Context: ${userContext}
- Site Context: ${siteContext}
            `
            const rewrittenMsg = await executePrompt(prompt_template);

            const newMessage = { content: rewrittenMsg, siteName: "Make My Text" };
            userMessages.push(newMessage);
            await saveToStorage("userMessages", userMessages);
            populateChatSection(userMessages);
        });
    }

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
        console.log("Rewritten message copied to clipboard!");
      }).catch((error) => {
        console.error("Failed to copy text:", error);
      });
    });
  }
  });
});
