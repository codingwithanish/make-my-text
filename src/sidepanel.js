const MAX_MODEL_CHARS = 4000;
let genAI = null;
let model = null;
const apiKey = 'AIzaSyCSS2sSqYfCIAK8sL9O5MXA6GI3eWf_D9o';

function initModel(generationConfig) {
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE
    }
  ];
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    safetySettings,
    generationConfig
  });
  return model;
}

async function runPrompt(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (e) {
    console.log('Prompt failed');
    console.error(e);
    console.log('Prompt:', prompt);
    throw e;
  }
}

// Summarization Logic
async function generateSummary(text) {
  try {
    const session = await createSummarizer(
      {
        type: 'key-points', // Replace with dynamic type if necessary
        format: 'plain-text',  // Replace with dynamic format if necessary
        length: 'medium', // Replace with dynamic length if necessary
      },
      (message, progress) => {
        console.log(`${message} (${progress.loaded}/${progress.total})`);
      }
    );

    const summary = await session.summarize(text);
    session.destroy();
    return summary;
  } catch (error) {
    throw new Error('Failed to generate summary: ' + error.message);
  }
}

// Create Summarizer Session
async function createSummarizer(config, downloadProgressCallback) {
  if (!window.ai || !window.ai.summarizer) {
    throw new Error('AI Summarization is not supported in this browser.');
  }

  const capabilities = await window.ai.summarizer.capabilities();
  if (capabilities.available === 'no') {
    throw new Error('AI Summarization is not supported.');
  }

  const summarizationSession = await window.ai.summarizer.create(
    config,
    downloadProgressCallback
  );

  if (capabilities.available === 'after-download') {
    summarizationSession.addEventListener(
      'downloadprogress',
      downloadProgressCallback
    );
    await summarizationSession.ready;
  }

  return summarizationSession;
}
let textSummary = ""
function fetchAndSetTextSummary() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("userMessages", (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const userMessages = result.userMessages || []; // Get userMessages or initialize an empty array
      textSummary = userMessages
        .map((message) => message.content || "")
        .join(" "); // Concatenate all message contents

      resolve(textSummary.trim());
    });
  });
}
let userContext = ""
function getUserContext() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("userMessages", (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const userMessages = result.userMessages || []; // Get userMessages or initialize an empty array
      
      // Filter messages where siteName is 'User'
      const filteredMessages = userMessages.filter((message) => message.siteName === "User");

      // Concatenate the content of filtered messages
      userContext = filteredMessages
        .map((message) => message.content || "")
        .join(" "); // Concatenate all message contents

      resolve(userContext.trim());
    });
  });
}
let siteContext = ""
function getSiteContext() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("userMessages", (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const userMessages = result.userMessages || []; // Get userMessages or initialize an empty array
      
      // Filter messages where siteName is not 'User' or 'Make My Text'
      const filteredMessages = userMessages.filter(
        (message) => message.siteName !== "User" && message.siteName !== "Make My Text"
      );

      // Concatenate the content of filtered messages
      siteContext = filteredMessages
        .map((message) => message.content || "")
        .join(" "); // Concatenate all message contents

      resolve(siteContext.trim());
    });
  });
}

function addMessageToMemory(userMessageText, site, siteURL) {
  newMessage = {
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
// Function to create a new message div
function createNewMessageDiv(content, siteName, link) {
  // Create the outer div
  const newMessageDiv = document.createElement('div');
  newMessageDiv.className = 'p-4 bg-gray-200 rounded-lg relative';

  // Add the top message section
  const messageTextDiv = document.createElement('div');
  messageTextDiv.className = 'text-gray-800 mb-2';
  messageTextDiv.textContent = content; // Set dynamic content
  newMessageDiv.appendChild(messageTextDiv);

  // Add the resource section
  const resourceDiv = document.createElement('div');
  resourceDiv.className = 'text-sm text-gray-600 flex items-center';

  const resourceLabel = document.createElement('span');
  resourceLabel.className = 'font-semibold';
  resourceLabel.textContent = 'Resource: ';
  resourceDiv.appendChild(resourceLabel);

  const resourceLink = document.createElement('a');
  resourceLink.href = link; // Set dynamic link
  resourceLink.className = 'text-blue-500 hover:underline ml-2';
  resourceLink.target = '_blank';
  resourceLink.textContent = siteName; // Display the link text
  resourceDiv.appendChild(resourceLink);

  // Add Translate and Rewrite buttons
  const buttonContainer = document.createElement('span');
  buttonContainer.className = 'ml-auto flex items-center space-x-2';

  const translateButton = document.createElement('button');
  translateButton.className = 'translate-btn text-gray-600 hover:text-blue-500';
  translateButton.innerHTML = '<span class="text-xl">🌐</span>';
  buttonContainer.appendChild(translateButton);

  const rewriteButton = document.createElement('button');
  rewriteButton.className = 'rewrite-btn text-gray-600 hover:text-blue-500';
  rewriteButton.innerHTML = '<span class="text-xl">✍️</span>';
  buttonContainer.appendChild(rewriteButton);

  resourceDiv.appendChild(buttonContainer);
  newMessageDiv.appendChild(resourceDiv);

  // Add hidden Translate Section
  const translateSection = document.createElement('div');
  translateSection.className = 'translate-section hidden bg-blue-50 p-4 mt-2 rounded-lg';

  const translateLabel = document.createElement('label');
  translateLabel.className = 'block mb-2 text-sm font-semibold';
  translateLabel.textContent = 'Translate To';
  translateSection.appendChild(translateLabel);

  const translateDropdown = document.createElement('select');
  translateDropdown.className = 'translate-select border border-gray-300 rounded p-2 w-full mb-4';
  ['French', 'Spanish', 'German'].forEach((language) => {
    const option = document.createElement('option');
    option.value = language.toLowerCase();
    option.textContent = language;
    translateDropdown.appendChild(option);
  });
  translateSection.appendChild(translateDropdown);

  const translateSubmitButton = document.createElement('button');
  translateSubmitButton.className = 'translate-submit bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600';
  translateSubmitButton.textContent = 'Translate';
  translateSection.appendChild(translateSubmitButton);

  newMessageDiv.appendChild(translateSection);

  // Add hidden Rewrite Section
  const rewriteSection = document.createElement('div');
  rewriteSection.className = 'rewrite-section hidden bg-yellow-50 p-4 mt-2 rounded-lg';
  const rewriteText = document.createElement('p');
  rewriteText.className = 'text-gray-700';
  rewriteText.textContent = 'Rewritten text will appear here.';
  rewriteSection.appendChild(rewriteText);

  newMessageDiv.appendChild(rewriteSection);

  return newMessageDiv;
}
function populateFromMemory() {
  chrome.storage.local.get("userMessages", (result) => {
    const userMessages = result.userMessages || []; // Get userMessages or initialize an empty array

    const chatSection = document.querySelector("#chat-section"); // Get the chat section container
    if (!chatSection) {
      console.error("Chat section not found!");
      return;
    }

    // Iterate over userMessages and populate the chat section
    userMessages.forEach((message) => {
      const { content, siteName, siteUrl } = message;
      const newMessageDiv = createNewMessageDiv(content, siteName, siteUrl); // Call the function
      chatSection.appendChild(newMessageDiv); // Append the new message div to the chat section
    });

    // Scroll to the bottom of the chat section
    chatSection.scrollTop = chatSection.scrollHeight;
    console.log("Chat section populated from memory.");
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateFromMemory();
  const textInput = document.getElementById('textInput'); // The bottom text input field
  const chatSection = document.querySelector('#chat-section'); // Chat section container
  const clearMemoryBtn = document.getElementById("clearMemoryBtn"); // Get the button element
  const summarizeBtn = document.getElementById("summarizeBtn");
  const writeEmailBtn = document.getElementById("writeEmailBtn");
  const generateRepliesBtn = document.getElementById("generateRepliesBtn");
  

  // Add an event listener to capture the Enter key press
  textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Check if Enter is pressed without Shift
      event.preventDefault(); // Prevent default behavior (like adding a new line)

      const userMessage = textInput.value.trim();
      if (userMessage) {
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

//Clear Memory action
    // Add click event listener
    clearMemoryBtn.addEventListener("click", () => {
      // Clear userMessages from Chrome storage
      chrome.storage.local.remove("userMessages", () => {
        console.log("Memory cleared: userMessages removed from storage");

        // Clear the chat section in the UI
        const chatSection = document.querySelector("#chat-section");
        if (chatSection) {
          chatSection.innerHTML = ""; // Clear all child elements
          console.log("Chat section cleared in the UI.");
        }
      });
    });

  // Event Listener for the Summarize Button
  summarizeBtn.addEventListener('click', async () => {
    await fetchAndSetTextSummary();
    if (textSummary.length > MAX_MODEL_CHARS) {
      console.error(
        `Text is too long for summarization with ${textSummary.length} characters (maximum supported content length is ~4000 characters).`
      );
      return;
    }
    // Generate the summary using the summarization function
    console.log("Summarizing text:", textSummary);
    const summary = await generateSummary(textSummary);
    textSummary = ""
    console.log("Summary is:", summary);
    const newMessageDiv = createNewMessageDiv(summary, "Make My Text", "http://makemytext.com");
    // Append the new message to the chat section
    chatSection.appendChild(newMessageDiv);
    addMessageToMemory(summary, "Make My Text", "http://makemytext.com")
    console.log('Summarizing text:', textToSummarize);
  });

  writeEmailBtn.addEventListener('click', async () => {
    await getUserContext();
    await getSiteContext();
    try {
      const generationConfig = {
        temperature: "80"
      };
      initModel(generationConfig);
      const response = await runPrompt(prompt, generationConfig);
      const newMessageDiv = createNewMessageDiv(response, "Make My Text", "http://makemytext.com");
      // Append the new message to the chat section
      chatSection.appendChild(newMessageDiv);
      addMessageToMemory(response, "Make My Text", "http://makemytext.com")
      
    } catch (e) {
      showError(e);
    }

  });

  writeEmailBtn.addEventListener('click', async () => {
    await getUserContext();
    await getSiteContext();
    try {
      const generationConfig = {
        temperature: "80"
      };
      initModel(generationConfig);
      const response = await runPrompt(prompt, generationConfig);
      const newMessageDiv = createNewMessageDiv(response, "Make My Text", "http://makemytext.com");
      // Append the new message to the chat section
      chatSection.appendChild(newMessageDiv);
      addMessageToMemory(response, "Make My Text", "http://makemytext.com")
      
    } catch (e) {
      showError(e);
    }

  });

  // Listen for changes to Chrome storage
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.userSelection) {
      // Create the new message div with dynamic content and link
      const chatSection = document.querySelector('#chat-section');
      if (chatSection) {
        const newMessageDiv = createNewMessageDiv(changes.userSelection.newValue.content, changes.userSelection.newValue.siteName, changes.userSelection.newValue.siteUrl);
        // Append the new message to the chat section
        chatSection.appendChild(newMessageDiv);
        addMessageToMemory(changes.userSelection.newValue.content, changes.userSelection.newValue.siteName, changes.userSelection.newValue.siteUrl)

        // Scroll to the bottom of the chat section
        chatSection.scrollTop = chatSection.scrollHeight;
      }
    }
  });



  // Add event listeners for Translate and Rewrite buttons
  chatSection.addEventListener("click", (event) => {
    const target = event.target;

    // Handle Translate button click
    if (target.closest(".translate-btn")) {
      const parentDiv = target.closest(".p-4");
      const translateSection = parentDiv.querySelector(".translate-section");

      if (translateSection) {
        translateSection.classList.remove("hidden"); // Show Translate section

        // Handle Translate button inside Translate section
        const translateSubmit = translateSection.querySelector(".translate-submit");
        translateSubmit.addEventListener("click", () => {
          // Get the content of the message
          const messageContent = parentDiv.querySelector(".text-gray-800").textContent;

          // Get the selected value from the dropdown
          const dropdown = translateSection.querySelector(".translate-select");
          const selectedLanguage = dropdown.value;

          console.log("Message Content:", messageContent);
          console.log("Selected Language:", selectedLanguage);
          const output = translateInput(messageContent)
          translateSection.innerHTML = "<p class='text-gray-700'>Translated text appears here.</p>";
        });
      }
    }

    // Handle Rewrite button click
    if (target.closest(".rewrite-btn")) {
      const parentDiv = target.closest(".p-4");
      const rewriteSection = parentDiv.querySelector(".rewrite-section");

      if (rewriteSection) {
        rewriteSection.classList.remove("hidden"); // Show Rewrite section
        rewriteSection.innerHTML = "<p class='text-gray-700'>This is the rewritten text.</p>";
      }
    }
  });

});

