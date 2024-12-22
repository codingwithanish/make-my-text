import log from 'loglevel';

log.setLevel('info'); // Set the default logging level

export function setLogLevel(level) {
    log.setLevel(level);
}

export function logInfo(message, ...optionalParams) {
    log.info(message, ...optionalParams);
}

export function logError(message, ...optionalParams) {
    log.error(message, ...optionalParams);
}

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
        logInfo("New message appended:", newMessage);
        logInfo("Updated userMessages:", userMessages);
      });
    });

 

  }
  export function getApiKeys() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get("apikeys", (data) => {
        resolve(data);
      });
    });
  }

  export function saveApiKey(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("apikeys", (data) => {
            const apiKeys = data.apikeys || {};
            Object.assign(apiKeys, key);

            chrome.storage.sync.set({ apikeys: apiKeys }, () => {
                logInfo("API key saved:", key);
                resolve();
            });
        });
    });
}

export function getApiKey(key) {
  return new Promise((resolve, reject) => {
      chrome.storage.sync.get("apikeys", (data) => {
          const apiKeys = data.apikeys || {};
          if (apiKeys.hasOwnProperty(key)) {
              resolve(apiKeys[key]);
          } else {
            resolve(null); 
          }
      });
  });
}

export function savePromptConfiguration(config) {
  return new Promise((resolve, reject) => {
      chrome.storage.sync.get("promptconfig", (data) => {
          const promptConfigs = data.promptconfig || [];
          const existingIndex = promptConfigs.findIndex(item => item.id === config.id);

          if (existingIndex !== -1) {
              // Update existing configuration
              promptConfigs[existingIndex] = config;
          } else {
              // Add new configuration
              promptConfigs.push(config);
          }

          chrome.storage.sync.set({ promptconfig: promptConfigs }, () => {
              logInfo("Prompt configuration saved:", config);
              resolve();
          });
      });
  });
}

export function getPromptConfigurations() {
  return new Promise((resolve, reject) => {
      chrome.storage.sync.get("promptconfig", (data) => {
          const promptConfigs = data.promptconfig || [];
          logInfo("Prompt configurations retrieved:", promptConfigs);
          resolve(promptConfigs);
      });
  });
}

export function getPromptConfiguration(id) {
  return new Promise((resolve, reject) => {
      chrome.storage.sync.get("promptconfig", (data) => {
          const promptConfigs = data.promptconfig || [];
          const config = promptConfigs.find(item => item.id === id);

          if (config) {
              resolve(config);
          } else {
              reject(`Prompt configuration with id ${id} not found`);
          }
      });
  });
}

export function deletePromptConfiguration(id) {
  return new Promise((resolve, reject) => {
      chrome.storage.sync.get("promptconfig", (data) => {
          let promptConfigs = data.promptconfig || [];
          const newPromptConfigs = promptConfigs.filter(item => item.id !== id);

          if (newPromptConfigs.length === promptConfigs.length) {
              reject(`Prompt configuration with id ${id} not found`);
              return;
          }

          chrome.storage.sync.set({ promptconfig: newPromptConfigs }, () => {
              logInfo(`Prompt configuration with id ${id} deleted`);
              resolve();
          });
      });
  });
}


export async function checkAndAddDefaultPromptConfigurations() {
  const promptConfigs = await getPromptConfigurations();
  logInfo("checkAndAddDefaultPromptConfigurations # Prompt configurations",promptConfigs);

  if (!promptConfigs || promptConfigs.length === 0) {
     let config_write_email =  {
              name: "Write Email",
              id: "write-email",
              prompt_template: `
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

                  User Context: \${userContext}
                  Site Context: \${siteContext}
              `,
              canDelete: false
          }
         let config_generate_replies = {
              name: "Generate Replies",
              id: "generate-replies",
              prompt_template: `
                  You are tasked with writing a reply based on the provided context information. The context is divided into two types:

                  1. **User Context**: An array of strings that provides insights into the type of reply required. It includes the user message and offers guidance on what the reply should convey. Note that the reply will be made on behalf of the same user.
                  2. **Site Context**: An array of strings that provides comprehensive details about the topic.

                  Your task is create a reply which contains the user context information more elaborated way by including the site context information.

                  **Response Requirements**:
                  - Provide only the reply content in your response.
                  - Avoid including any additional commentary or explanations.

                  **Inputs**:
                  - User Context: \${userContext}
                  - Site Context: \${siteContext}
              `,
              canDelete: false
          }
          await chrome.storage.sync.remove("promptconfig");
          await savePromptConfiguration(config_write_email);
          await savePromptConfiguration(config_generate_replies);
          logInfo("Default prompt configurations added.");
    
  }
}