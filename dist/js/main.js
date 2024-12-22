// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"fiMBX":[function(require,module,exports,__globalThis) {
var _utilsJs = require("./utils.js");
var _domJs = require("./dom.js");
var _aiJs = require("./ai.js");
// Helper function to sleep for a specified duration
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
document.addEventListener("DOMContentLoaded", async ()=>{
    const chatSection = document.querySelector("#chat-section");
    (0, _utilsJs.logInfo)("Extension script going to execute");
    // Fetch and populate messages on load
    // Sleep for 5 seconds
    await sleep(5000);
    (0, _utilsJs.logInfo)("Extension script after 5 minutes delay");
    let userMessages = await (0, _utilsJs.fetchFromStorage)("userMessages");
    let validation_result = await validateConfiguration(); // Ensure configuration is validated
    if (!validation_result) return;
    await (0, _utilsJs.checkAndAddDefaultPromptConfigurations)(); // Ensure default prompt configurations are added
    (0, _domJs.populateChatSection)(userMessages);
    // Button: Clear Memory
    const clearMemoryBtn = document.getElementById("clearMemoryBtn");
    if (clearMemoryBtn) clearMemoryBtn.addEventListener("click", async ()=>{
        chrome.storage.local.remove("userMessages", ()=>{
            (0, _utilsJs.logInfo)("Memory cleared.");
            (0, _domJs.populateChatSection)([]); // Clear UI
        });
    });
    // Dynamically generate buttons based on prompt configurations
    const actionButtonPanel = document.getElementById("action-button-panel");
    const promptConfigs = await (0, _utilsJs.getPromptConfigurations)();
    (0, _utilsJs.logInfo)("Prompt Configurations Dynamically Generated:", promptConfigs);
    promptConfigs.forEach((config)=>{
        const button = document.createElement("button");
        button.id = config.id;
        button.className = "w-full flex flex-col items-center text-gray-600 hover:text-blue-500";
        const iconSpan = document.createElement("span");
        iconSpan.className = "text-2xl";
        iconSpan.textContent = "\uD83D\uDCDD"; // You can customize the icon as needed
        const textSpan = document.createElement("span");
        textSpan.className = "text-sm";
        textSpan.textContent = config.name;
        button.appendChild(iconSpan);
        button.appendChild(textSpan);
        button.addEventListener("click", ()=>handleButtonClick(config.id, userMessages));
        actionButtonPanel.appendChild(button);
    });
    // Button: Summarize
    // const summarizeBtn = document.getElementById("summarizeBtn");
    // if (summarizeBtn) {
    //     summarizeBtn.addEventListener("click", async () => {
    //         userMessages = await fetchFromStorage("userMessages");
    //         const textSummary = concatenateMessages(userMessages);
    //         if (!textSummary) return;
    //         const heading = await generateSummary(textSummary,"headline", length="short");
    //         const keyPoints = await generateSummary(textSummary, "key-points");
    //         const tldr = await generateSummary(textSummary, "tl;dr");
    //         const complete_summary = `
    //         ${heading} \n\n
    //         Key Points: \n
    //         ${keyPoints}
    //         Summary: \n 
    //         ${tldr}
    //         `
    //         const newMessage = { content: complete_summary, siteName: "Make My Text" };
    //         userMessages.push(newMessage);
    //         await saveToStorage("userMessages", userMessages);
    //         populateChatSection(userMessages);
    //     });
    // }
    // Button: Write Email
    // const writeEmailBtn = document.getElementById("writeEmailBtn");
    // if (writeEmailBtn) {
    //     writeEmailBtn.addEventListener("click", async () => {
    //       try {
    //         const config = await getPromptConfiguration("write-email");
    //         const promptTemplate = config.prompt_template;
    //         // Use the promptTemplate in your logic
    //         const userContext = userMessages.map(item => item.content).join('\n');
    //         const siteContext = ["When attempting to execute the npm run build command, the build process fails due to a JavaScript parsing error. Additionally, the generated dist folder does not include the required node_modules, which is critical for the proper functioning of the application. As a workaround, the user is manually copying the node_modules directory to the dist folder to ensure the extension works as expected. This issue is causing disruptions in the build and deployment process, requiring immediate resolution.", "I tried upgrading the Parse JS version, but it didn’t work.", "Is it possible to include this in this week’s release?"];
    //         const prompt = promptTemplate
    //             .replace('${userContext}', userContext)
    //             .replace('${siteContext}', siteContext.join('\n'));
    //             const rewrittenMsg = await executePrompt(prompt);
    //             const newMessage = { content: rewrittenMsg, siteName: "Make My Text" };
    //             userMessages.push(newMessage);
    //             await saveToStorage("userMessages", userMessages);
    //             populateChatSection(userMessages);
    //         logInfo("Generated Email:", response);
    //     } catch (error) {
    //         logError("Error generating email:", error);
    //     }
    //     });
    // }
    // Button: Generate Replies
    // const generateRepliesBtn = document.getElementById("generateRepliesBtn");
    // if (generateRepliesBtn) {
    //     generateRepliesBtn.addEventListener("click", async () => {
    //       try {
    //         const config = await getPromptConfiguration("generate-replies");
    //         const promptTemplate = config.prompt_template;
    //         // Use the promptTemplate in your logic
    //         const userContext = userMessages.map(item => item.content).join('\n');
    //         const siteContext = ["When attempting to execute the npm run build command, the build process fails due to a JavaScript parsing error. Additionally, the generated dist folder does not include the required node_modules, which is critical for the proper functioning of the application. As a workaround, the user is manually copying the node_modules directory to the dist folder to ensure the extension works as expected. This issue is causing disruptions in the build and deployment process, requiring immediate resolution.", "I tried upgrading the Parse JS version, but it didn’t work.", "Is it possible to include this in this week’s release?"];
    //         const prompt = promptTemplate
    //             .replace('${userContext}', userContext)
    //             .replace('${siteContext}', siteContext.join('\n'));
    //             const rewrittenMsg = await executePrompt(prompt);
    //             const newMessage = { content: rewrittenMsg, siteName: "Make My Text" };
    //             userMessages.push(newMessage);
    //             await saveToStorage("userMessages", userMessages);
    //             populateChatSection(userMessages);
    //         logInfo("Generated Email:", response);
    //     } catch (error) {
    //         logError("Error generating email:", error);
    //     }
    //     });
    // }
    // Listen for changes to Chrome storage
    chrome.storage.onChanged.addListener((changes, namespace)=>{
        if (changes.userSelection) //const chatSection = document.querySelector("#chat-section");
        {
            if (chatSection) {
                // Create and append the new message
                const { content, siteName, siteUrl } = changes.userSelection.newValue;
                const newMessageDiv = (0, _domJs.createNewMessageDiv)(content, siteName, siteUrl);
                chatSection.appendChild(newMessageDiv);
                // Save the new message to storage
                (0, _utilsJs.addMessageToMemory)(content, siteName, siteUrl);
                // Scroll to the bottom of the chat section
                chatSection.scrollTop = chatSection.scrollHeight;
            }
        }
    });
    chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
        if (message.action === "updateUserSelection") {
            const { content, siteName, siteUrl } = message.userSelection;
            // Update the UI (example with a chat section)
            const chatSection = document.querySelector("#chat-section");
            if (chatSection) {
                const newMessageDiv = (0, _domJs.createNewMessageDiv)(content, siteName, siteUrl);
                chatSection.appendChild(newMessageDiv);
                // Save the new message to memory (if needed)
                (0, _utilsJs.addMessageToMemory)(content, siteName, siteUrl);
                // Scroll to the bottom of the chat section
                chatSection.scrollTop = chatSection.scrollHeight;
            }
            // Optionally, send a response back to the sender
            sendResponse({
                success: true
            });
        }
    });
    const textInput = document.getElementById("textInput");
    // Add an event listener to capture the Enter key press
    textInput.addEventListener('keydown', (event)=>{
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default behavior (like adding a new line)
            //const chatSection = document.querySelector("#chat-section");
            const userMessage = textInput.value.trim();
            if (userMessage && chatSection) {
                // Create a new message element
                const newMessageDiv = (0, _domJs.createNewMessageDiv)(userMessage, "User", "https://user.com");
                (0, _utilsJs.addMessageToMemory)(userMessage, "User", "https://user.com");
                chatSection.appendChild(newMessageDiv);
                // Clear the input field
                textInput.value = '';
                // Scroll to the bottom of the chat section
                chatSection.scrollTop = chatSection.scrollHeight;
            }
        }
    });
    // Add event listeners for Translate and Rewrite buttons
    chatSection.addEventListener("click", async (event)=>{
        const target = event.target;
        // Handle Translate button click
        if (target.closest(".translate-btn")) {
            const parentDiv = target.closest(".p-4");
            const translatedMsg = "Here is the translated text";
            // Create the translated message box
            const translatedBox = document.createElement("div");
            translatedBox.className = "p-4 bg-blue-100 rounded-lg ml-6 mt-2 relative shadow";
            translatedBox.innerHTML = `
        <div class="text-gray-800 mb-2">${translatedMsg}</div>
        <button class="close-btn absolute top-2 right-2 text-sm text-blue-500 hover:text-blue-700">\u{2716}</button>
      `;
            // Append the translated box below the parent div
            parentDiv.insertAdjacentElement("afterend", translatedBox);
            // Add functionality to close the translated box
            translatedBox.querySelector(".close-btn").addEventListener("click", ()=>{
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
    
    `;
            const rewrittenMsg = await (0, _aiJs.executePrompt)(prompt_template);
            // Create the rewritten message box
            const rewrittenBox = document.createElement("div");
            rewrittenBox.className = "p-4 bg-yellow-100 rounded-lg ml-6 mt-2 relative shadow";
            rewrittenBox.innerHTML = `
      <div class="font-semibold text-gray-700 mb-2">Rephrase Result</div>
      <div class="text-gray-800 mb-2">${rewrittenMsg}</div>
      <div class="absolute top-2 right-2 flex space-x-2">
        <button class="copy-btn text-sm text-yellow-500 hover:text-yellow-700">\u{1F4CB} </button>
        <button class="close-btn text-sm text-yellow-500 hover:text-yellow-700">\u{2716}</button>
      </div>
    `;
            // Append the rewritten box below the parent div
            parentDiv.insertAdjacentElement("afterend", rewrittenBox);
            // Add functionality to close the rewritten box
            rewrittenBox.querySelector(".close-btn").addEventListener("click", ()=>{
                rewrittenBox.remove();
            });
            // Add functionality to copy rewrittenMsg to clipboard
            rewrittenBox.querySelector(".copy-btn").addEventListener("click", ()=>{
                navigator.clipboard.writeText(rewrittenMsg).then(()=>{
                    (0, _utilsJs.logInfo)("Rewritten message copied to clipboard!");
                }).catch((error)=>{
                    (0, _utilsJs.logError)("Failed to copy text:", error);
                });
            });
        }
    });
});
async function validateConfiguration() {
    const config = await (0, _utilsJs.getApiKeys)();
    const apiKeys = config.apikeys;
    if (!apiKeys || !apiKeys["gemini-api-key"] || !apiKeys["text-summary-key"]) {
        (0, _domJs.createWarningMessageDiv)("Api Keys not configured");
        return false;
    }
    return true;
}
// Common function to handle button clicks
async function handleButtonClick(id, userMessages) {
    try {
        const promptConfigs = await (0, _utilsJs.getPromptConfigurations)();
        const config = promptConfigs.find((item)=>item.id === id);
        if (config) {
            (0, _utilsJs.logInfo)("Prompt Configuration:", config);
            const promptTemplate = config.prompt_template;
            const userContext = userMessages.map((item)=>item.content).join('\n');
            const siteContext = [
                "When attempting to execute the npm run build command, the build process fails due to a JavaScript parsing error. Additionally, the generated dist folder does not include the required node_modules, which is critical for the proper functioning of the application. As a workaround, the user is manually copying the node_modules directory to the dist folder to ensure the extension works as expected. This issue is causing disruptions in the build and deployment process, requiring immediate resolution.",
                "I tried upgrading the Parse JS version, but it didn\u2019t work.",
                "Is it possible to include this in this week\u2019s release?"
            ];
            const prompt = promptTemplate.replace('${userContext}', userContext).replace('${siteContext}', siteContext.join('\n'));
            (0, _utilsJs.logInfo)("Generated Prompt Message:", prompt);
            const rewrittenMsg = await (0, _aiJs.executePrompt)(prompt);
            const newMessage = {
                content: rewrittenMsg,
                siteName: "Make My Text"
            };
            userMessages.push(newMessage);
            await (0, _utilsJs.saveToStorage)("userMessages", userMessages);
            (0, _domJs.populateChatSection)(userMessages);
        } else (0, _utilsJs.logError)(`Prompt configuration with id ${id} not found`);
    } catch (error) {
        (0, _utilsJs.logError)("Error retrieving prompt configuration:", error);
    }
}

},{"./utils.js":"7ITpU","./dom.js":"cMwWB","./ai.js":"c5VPc"}],"7ITpU":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "setLogLevel", ()=>setLogLevel);
parcelHelpers.export(exports, "logInfo", ()=>logInfo);
parcelHelpers.export(exports, "logError", ()=>logError);
// Utility: Fetch data from Chrome storage
parcelHelpers.export(exports, "fetchFromStorage", ()=>fetchFromStorage);
// Utility: Add data to Chrome storage
parcelHelpers.export(exports, "saveToStorage", ()=>saveToStorage);
// Utility: Filter messages by siteName
parcelHelpers.export(exports, "filterMessages", ()=>filterMessages);
// Utility: Concatenate message content
parcelHelpers.export(exports, "concatenateMessages", ()=>concatenateMessages);
parcelHelpers.export(exports, "addMessageToMemory", ()=>addMessageToMemory);
parcelHelpers.export(exports, "getApiKeys", ()=>getApiKeys);
parcelHelpers.export(exports, "saveApiKey", ()=>saveApiKey);
parcelHelpers.export(exports, "getApiKey", ()=>getApiKey);
parcelHelpers.export(exports, "savePromptConfiguration", ()=>savePromptConfiguration);
parcelHelpers.export(exports, "getPromptConfigurations", ()=>getPromptConfigurations);
parcelHelpers.export(exports, "getPromptConfiguration", ()=>getPromptConfiguration);
parcelHelpers.export(exports, "deletePromptConfiguration", ()=>deletePromptConfiguration);
parcelHelpers.export(exports, "checkAndAddDefaultPromptConfigurations", ()=>checkAndAddDefaultPromptConfigurations);
var _loglevel = require("loglevel");
var _loglevelDefault = parcelHelpers.interopDefault(_loglevel);
(0, _loglevelDefault.default).setLevel('info'); // Set the default logging level
function setLogLevel(level) {
    (0, _loglevelDefault.default).setLevel(level);
}
function logInfo(message, ...optionalParams) {
    (0, _loglevelDefault.default).info(message, ...optionalParams);
}
function logError(message, ...optionalParams) {
    (0, _loglevelDefault.default).error(message, ...optionalParams);
}
function fetchFromStorage(key) {
    return new Promise((resolve, reject)=>{
        chrome.storage.local.get(key, (result)=>{
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(result[key] || []);
        });
    });
}
function saveToStorage(key, value) {
    return new Promise((resolve, reject)=>{
        chrome.storage.local.set({
            [key]: value
        }, ()=>{
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve();
        });
    });
}
function filterMessages(messages, siteName, exclude = false) {
    return messages.filter((message)=>exclude ? message.siteName !== siteName : message.siteName === siteName);
}
function concatenateMessages(messages) {
    return messages.map((message)=>message.content || "").join(" ").trim();
}
function addMessageToMemory(userMessageText, site, siteURL) {
    let newMessage = {
        content: userMessageText,
        siteName: site,
        siteUrl: siteURL
    };
    chrome.storage.local.get("userMessages", (result)=>{
        // Retrieve existing userMessages or initialize an empty array if it doesn't exist
        const userMessages = result.userMessages || [];
        // Append the new message to the array
        userMessages.push(newMessage);
        // Save the updated array back to Chrome storage
        chrome.storage.local.set({
            userMessages
        }, ()=>{
            logInfo("New message appended:", newMessage);
            logInfo("Updated userMessages:", userMessages);
        });
    });
}
function getApiKeys() {
    return new Promise((resolve, reject)=>{
        chrome.storage.sync.get("apikeys", (data)=>{
            resolve(data);
        });
    });
}
function saveApiKey(key) {
    return new Promise((resolve, reject)=>{
        chrome.storage.sync.get("apikeys", (data)=>{
            const apiKeys = data.apikeys || {};
            Object.assign(apiKeys, key);
            chrome.storage.sync.set({
                apikeys: apiKeys
            }, ()=>{
                logInfo("API key saved:", key);
                resolve();
            });
        });
    });
}
function getApiKey(key) {
    return new Promise((resolve, reject)=>{
        chrome.storage.sync.get("apikeys", (data)=>{
            const apiKeys = data.apikeys || {};
            if (apiKeys.hasOwnProperty(key)) resolve(apiKeys[key]);
            else resolve(null);
        });
    });
}
function savePromptConfiguration(config) {
    return new Promise((resolve, reject)=>{
        chrome.storage.sync.get("promptconfig", (data)=>{
            const promptConfigs = data.promptconfig || [];
            const existingIndex = promptConfigs.findIndex((item)=>item.id === config.id);
            if (existingIndex !== -1) // Update existing configuration
            promptConfigs[existingIndex] = config;
            else // Add new configuration
            promptConfigs.push(config);
            chrome.storage.sync.set({
                promptconfig: promptConfigs
            }, ()=>{
                logInfo("Prompt configuration saved:", config);
                resolve();
            });
        });
    });
}
function getPromptConfigurations() {
    return new Promise((resolve, reject)=>{
        chrome.storage.sync.get("promptconfig", (data)=>{
            const promptConfigs = data.promptconfig || [];
            logInfo("Prompt configurations retrieved:", promptConfigs);
            resolve(promptConfigs);
        });
    });
}
function getPromptConfiguration(id) {
    return new Promise((resolve, reject)=>{
        chrome.storage.sync.get("promptconfig", (data)=>{
            const promptConfigs = data.promptconfig || [];
            const config = promptConfigs.find((item)=>item.id === id);
            if (config) resolve(config);
            else reject(`Prompt configuration with id ${id} not found`);
        });
    });
}
function deletePromptConfiguration(id) {
    return new Promise((resolve, reject)=>{
        chrome.storage.sync.get("promptconfig", (data)=>{
            let promptConfigs = data.promptconfig || [];
            const newPromptConfigs = promptConfigs.filter((item)=>item.id !== id);
            if (newPromptConfigs.length === promptConfigs.length) {
                reject(`Prompt configuration with id ${id} not found`);
                return;
            }
            chrome.storage.sync.set({
                promptconfig: newPromptConfigs
            }, ()=>{
                logInfo(`Prompt configuration with id ${id} deleted`);
                resolve();
            });
        });
    });
}
async function checkAndAddDefaultPromptConfigurations() {
    const promptConfigs = await getPromptConfigurations();
    logInfo("checkAndAddDefaultPromptConfigurations # Prompt configurations", promptConfigs);
    if (!promptConfigs || promptConfigs.length === 0) {
        let config_write_email = {
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
        };
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
        };
        await chrome.storage.sync.remove("promptconfig");
        await savePromptConfiguration(config_write_email);
        await savePromptConfiguration(config_generate_replies);
        logInfo("Default prompt configurations added.");
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","loglevel":"7kRFs"}],"gkKU3":[function(require,module,exports,__globalThis) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"7kRFs":[function(require,module,exports,__globalThis) {
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/ (function(root, definition) {
    "use strict";
    if (typeof define === 'function' && define.amd) define(definition);
    else if (0, module.exports) module.exports = definition();
    else root.log = definition();
})(this, function() {
    "use strict";
    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";
    var isIE = typeof window !== undefinedType && typeof window.navigator !== undefinedType && /Trident\/|MSIE /.test(window.navigator.userAgent);
    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];
    var _loggersByName = {};
    var defaultLogger = null;
    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') return method.bind(obj);
        else try {
            return Function.prototype.bind.call(method, obj);
        } catch (e) {
            // Missing bind shim or IE8 + Modernizr, fallback to wrapping
            return function() {
                return Function.prototype.apply.apply(method, [
                    obj,
                    arguments
                ]);
            };
        }
    }
    // Trace() doesn't print the message in IE, so for that case we need to wrap it
    function traceForIE() {
        if (console.log) {
            if (console.log.apply) console.log.apply(console, arguments);
            else // In old IE, native console methods themselves don't have apply().
            Function.prototype.apply.apply(console.log, [
                console,
                arguments
            ]);
        }
        if (console.trace) console.trace();
    }
    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') methodName = 'log';
        if (typeof console === undefinedType) return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        else if (methodName === 'trace' && isIE) return traceForIE;
        else if (console[methodName] !== undefined) return bindMethod(console, methodName);
        else if (console.log !== undefined) return bindMethod(console, 'log');
        else return noop;
    }
    // These private functions always need `this` to be set properly
    function replaceLoggingMethods() {
        /*jshint validthis:true */ var level = this.getLevel();
        // Replace the actual methods.
        for(var i = 0; i < logMethods.length; i++){
            var methodName = logMethods[i];
            this[methodName] = i < level ? noop : this.methodFactory(methodName, level, this.name);
        }
        // Define log.log as an alias for log.debug
        this.log = this.debug;
        // Return any important warnings.
        if (typeof console === undefinedType && level < this.levels.SILENT) return "No console available for logging";
    }
    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName) {
        return function() {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this);
                this[methodName].apply(this, arguments);
            }
        };
    }
    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, _level, _loggerName) {
        /*jshint validthis:true */ return realMethod(methodName) || enableLoggingWhenConsoleArrives.apply(this, arguments);
    }
    function Logger(name, factory) {
        // Private instance variables.
        var self = this;
        /**
       * The level inherited from a parent logger (or a global default). We
       * cache this here rather than delegating to the parent so that it stays
       * in sync with the actual logging methods that we have installed (the
       * parent could change levels but we might not have rebuilt the loggers
       * in this child yet).
       * @type {number}
       */ var inheritedLevel;
        /**
       * The default level for this logger, if any. If set, this overrides
       * `inheritedLevel`.
       * @type {number|null}
       */ var defaultLevel;
        /**
       * A user-specific level for this logger. If set, this overrides
       * `defaultLevel`.
       * @type {number|null}
       */ var userLevel;
        var storageKey = "loglevel";
        if (typeof name === "string") storageKey += ":" + name;
        else if (typeof name === "symbol") storageKey = undefined;
        function persistLevelIfPossible(levelNum) {
            var levelName = (logMethods[levelNum] || 'silent').toUpperCase();
            if (typeof window === undefinedType || !storageKey) return;
            // Use localStorage if available
            try {
                window.localStorage[storageKey] = levelName;
                return;
            } catch (ignore) {}
            // Use session cookie as fallback
            try {
                window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
            } catch (ignore) {}
        }
        function getPersistedLevel() {
            var storedLevel;
            if (typeof window === undefinedType || !storageKey) return;
            try {
                storedLevel = window.localStorage[storageKey];
            } catch (ignore) {}
            // Fallback to cookies if local storage gives us nothing
            if (typeof storedLevel === undefinedType) try {
                var cookie = window.document.cookie;
                var cookieName = encodeURIComponent(storageKey);
                var location = cookie.indexOf(cookieName + "=");
                if (location !== -1) storedLevel = /^([^;]+)/.exec(cookie.slice(location + cookieName.length + 1))[1];
            } catch (ignore) {}
            // If the stored level is not valid, treat it as if nothing was stored.
            if (self.levels[storedLevel] === undefined) storedLevel = undefined;
            return storedLevel;
        }
        function clearPersistedLevel() {
            if (typeof window === undefinedType || !storageKey) return;
            // Use localStorage if available
            try {
                window.localStorage.removeItem(storageKey);
            } catch (ignore) {}
            // Use session cookie as fallback
            try {
                window.document.cookie = encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            } catch (ignore) {}
        }
        function normalizeLevel(input) {
            var level = input;
            if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) level = self.levels[level.toUpperCase()];
            if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) return level;
            else throw new TypeError("log.setLevel() called with invalid level: " + input);
        }
        /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */ self.name = name;
        self.levels = {
            "TRACE": 0,
            "DEBUG": 1,
            "INFO": 2,
            "WARN": 3,
            "ERROR": 4,
            "SILENT": 5
        };
        self.methodFactory = factory || defaultMethodFactory;
        self.getLevel = function() {
            if (userLevel != null) return userLevel;
            else if (defaultLevel != null) return defaultLevel;
            else return inheritedLevel;
        };
        self.setLevel = function(level, persist) {
            userLevel = normalizeLevel(level);
            if (persist !== false) persistLevelIfPossible(userLevel);
            // NOTE: in v2, this should call rebuild(), which updates children.
            return replaceLoggingMethods.call(self);
        };
        self.setDefaultLevel = function(level) {
            defaultLevel = normalizeLevel(level);
            if (!getPersistedLevel()) self.setLevel(level, false);
        };
        self.resetLevel = function() {
            userLevel = null;
            clearPersistedLevel();
            replaceLoggingMethods.call(self);
        };
        self.enableAll = function(persist) {
            self.setLevel(self.levels.TRACE, persist);
        };
        self.disableAll = function(persist) {
            self.setLevel(self.levels.SILENT, persist);
        };
        self.rebuild = function() {
            if (defaultLogger !== self) inheritedLevel = normalizeLevel(defaultLogger.getLevel());
            replaceLoggingMethods.call(self);
            if (defaultLogger === self) for(var childName in _loggersByName)_loggersByName[childName].rebuild();
        };
        // Initialize all the internal levels.
        inheritedLevel = normalizeLevel(defaultLogger ? defaultLogger.getLevel() : "WARN");
        var initialLevel = getPersistedLevel();
        if (initialLevel != null) userLevel = normalizeLevel(initialLevel);
        replaceLoggingMethods.call(self);
    }
    /*
     *
     * Top-level API
     *
     */ defaultLogger = new Logger();
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "symbol" && typeof name !== "string" || name === "") throw new TypeError("You must supply a name when creating a logger.");
        var logger = _loggersByName[name];
        if (!logger) logger = _loggersByName[name] = new Logger(name, defaultLogger.methodFactory);
        return logger;
    };
    // Grab the current global log variable in case of overwrite
    var _log = typeof window !== undefinedType ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType && window.log === defaultLogger) window.log = _log;
        return defaultLogger;
    };
    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };
    // ES6 default export, for compatibility
    defaultLogger['default'] = defaultLogger;
    return defaultLogger;
});

},{}],"cMwWB":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// DOM: Create a new warning message div
parcelHelpers.export(exports, "createWarningMessageDiv", ()=>createWarningMessageDiv);
// DOM: Create a new message div
parcelHelpers.export(exports, "createNewMessageDiv", ()=>createNewMessageDiv);
// DOM: Populate chat section with messages
parcelHelpers.export(exports, "populateChatSection", ()=>populateChatSection);
// DOM: Add event listener to a button
parcelHelpers.export(exports, "attachButtonListener", ()=>attachButtonListener);
parcelHelpers.export(exports, "addToChat", ()=>addToChat);
var _utils = require("./utils");
function createWarningMessageDiv(content) {
    const warningMessageDiv = document.createElement("div");
    warningMessageDiv.className = "p-4 bg-yellow-200 rounded-lg relative font-mono";
    // Add close button for the warning message
    const closeButton = document.createElement("button");
    closeButton.className = "absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-sm";
    closeButton.textContent = "\u2716";
    closeButton.addEventListener("click", ()=>{
        warningMessageDiv.remove();
    });
    warningMessageDiv.appendChild(closeButton);
    // Add the main content of the warning message
    const messageTextDiv = document.createElement("div");
    messageTextDiv.className = "text-gray-800 mb-2 text-base text-content-div";
    if (content) content = content.replace(/\n/g, "<br/>").trim();
    messageTextDiv.innerHTML = content;
    warningMessageDiv.appendChild(messageTextDiv);
    // Append the warning message div to the body or a specific container
    document.body.appendChild(warningMessageDiv);
}
function createNewMessageDiv(content, siteName, link) {
    const newMessageDiv = document.createElement("div");
    newMessageDiv.className = "p-4 bg-gray-200 rounded-lg relative font-mono";
    // Add close button for the parent message
    const closeButton = document.createElement("button");
    closeButton.className = "absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-sm";
    closeButton.textContent = "\u2716";
    closeButton.addEventListener("click", ()=>{
        newMessageDiv.remove();
    });
    newMessageDiv.appendChild(closeButton);
    // Add the main content of the message
    const messageTextDiv = document.createElement("div");
    messageTextDiv.className = "text-gray-800 mb-2 text-base text-content-div";
    // const cleanedContent = content.replace(/\t/g, " ").trim();
    // const parsedContent = marked.parse(cleanedContent);
    // // Sanitize the parsed content
    // const sanitizedContent = DOMPurify.sanitize(parsedContent);
    if (content) content = content.replace(/\n/g, "<br/>").trim();
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
    // const translateButton = document.createElement("button");
    // translateButton.className = "translate-btn text-gray-600 hover:text-blue-500";
    // translateButton.innerHTML = "<span class='text-xl'>🌐</span>";
    // buttonContainer.appendChild(translateButton);
    const rewriteButton = document.createElement("button");
    rewriteButton.className = "rewrite-btn text-gray-600 hover:text-blue-500";
    rewriteButton.innerHTML = "<span class='text-xl'>[Rewrite]</span>";
    buttonContainer.appendChild(rewriteButton);
    resourceDiv.appendChild(buttonContainer);
    newMessageDiv.appendChild(resourceDiv);
    return newMessageDiv;
}
function populateChatSection(messages) {
    const chatSection = document.querySelector("#chat-section");
    if (!chatSection) {
        (0, _utils.logError)("Chat section not found!");
        return;
    }
    chatSection.innerHTML = ""; // Clear existing messages
    messages.forEach((message)=>{
        const { content, siteName, siteUrl } = message;
        const newMessageDiv = createNewMessageDiv(content, siteName, siteUrl);
        chatSection.appendChild(newMessageDiv);
    });
    chatSection.scrollTop = chatSection.scrollHeight;
}
function attachButtonListener(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (!button) {
        (0, _utils.logError)(`Button with ID "${buttonId}" not found!`);
        return;
    }
    button.addEventListener("click", callback);
}
function addToChat() {}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./utils":"7ITpU"}],"c5VPc":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "initModel", ()=>initModel);
parcelHelpers.export(exports, "runPrompt", ()=>runPrompt);
parcelHelpers.export(exports, "executePrompt", ()=>executePrompt);
parcelHelpers.export(exports, "generateSummary", ()=>generateSummary);
var _generativeAi = require("@google/generative-ai");
var _utils = require("./utils");
const MAX_MODEL_CHARS = 4000;
/**
 * A variable to hold the instance of the AI generator.
 * @type {Object|null}
 */ let genAI = null;
let model = null;
async function initModel(generationConfig) {
    const apiKey = await (0, _utils.getApiKey)("gemini-api-key");
    const safetySettings = [
        {
            category: (0, _generativeAi.HarmCategory).HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: (0, _generativeAi.HarmBlockThreshold).BLOCK_NONE
        }
    ];
    genAI = new (0, _generativeAi.GoogleGenerativeAI)(apiKey);
    model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings,
        generationConfig
    });
}
async function runPrompt(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Prompt execution failed", error);
        throw error;
    }
}
async function executePrompt(prompt) {
    try {
        const generationConfig = {
            temperature: "1"
        };
        await initModel(generationConfig);
        const response = await runPrompt(prompt, generationConfig);
        return response;
    } catch (e) {
        console.log(e);
    }
}
async function generateSummary(text, type, length = "medium") {
    if (!window.ai || !window.ai.summarizer) throw new Error("AI Summarization is not supported in this browser.");
    if (text.length > MAX_MODEL_CHARS) throw new Error(`Text exceeds the maximum supported length of ${MAX_MODEL_CHARS} characters.`);
    const session = await window.ai.summarizer.create({
        type: type,
        format: "markdown",
        length: length
    });
    const summary = await session.summarize(text);
    session.destroy();
    return summary;
}

},{"@google/generative-ai":"gKJrW","./utils":"7ITpU","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gKJrW":[function(require,module,exports,__globalThis) {
/**
 * Contains the list of OpenAPI data types
 * as defined by https://swagger.io/docs/specification/data-models/data-types/
 * @public
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "BlockReason", ()=>BlockReason);
parcelHelpers.export(exports, "ChatSession", ()=>ChatSession);
parcelHelpers.export(exports, "ExecutableCodeLanguage", ()=>ExecutableCodeLanguage);
parcelHelpers.export(exports, "FinishReason", ()=>FinishReason);
parcelHelpers.export(exports, "FunctionCallingMode", ()=>FunctionCallingMode);
parcelHelpers.export(exports, "FunctionDeclarationSchemaType", ()=>FunctionDeclarationSchemaType);
parcelHelpers.export(exports, "GenerativeModel", ()=>GenerativeModel);
parcelHelpers.export(exports, "GoogleGenerativeAI", ()=>GoogleGenerativeAI);
parcelHelpers.export(exports, "GoogleGenerativeAIError", ()=>GoogleGenerativeAIError);
parcelHelpers.export(exports, "GoogleGenerativeAIFetchError", ()=>GoogleGenerativeAIFetchError);
parcelHelpers.export(exports, "GoogleGenerativeAIRequestInputError", ()=>GoogleGenerativeAIRequestInputError);
parcelHelpers.export(exports, "GoogleGenerativeAIResponseError", ()=>GoogleGenerativeAIResponseError);
parcelHelpers.export(exports, "HarmBlockThreshold", ()=>HarmBlockThreshold);
parcelHelpers.export(exports, "HarmCategory", ()=>HarmCategory);
parcelHelpers.export(exports, "HarmProbability", ()=>HarmProbability);
parcelHelpers.export(exports, "Outcome", ()=>Outcome);
parcelHelpers.export(exports, "POSSIBLE_ROLES", ()=>POSSIBLE_ROLES);
parcelHelpers.export(exports, "TaskType", ()=>TaskType);
var FunctionDeclarationSchemaType;
(function(FunctionDeclarationSchemaType) {
    /** String type. */ FunctionDeclarationSchemaType["STRING"] = "STRING";
    /** Number type. */ FunctionDeclarationSchemaType["NUMBER"] = "NUMBER";
    /** Integer type. */ FunctionDeclarationSchemaType["INTEGER"] = "INTEGER";
    /** Boolean type. */ FunctionDeclarationSchemaType["BOOLEAN"] = "BOOLEAN";
    /** Array type. */ FunctionDeclarationSchemaType["ARRAY"] = "ARRAY";
    /** Object type. */ FunctionDeclarationSchemaType["OBJECT"] = "OBJECT";
})(FunctionDeclarationSchemaType || (FunctionDeclarationSchemaType = {}));
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * @public
 */ var ExecutableCodeLanguage;
(function(ExecutableCodeLanguage) {
    ExecutableCodeLanguage["LANGUAGE_UNSPECIFIED"] = "language_unspecified";
    ExecutableCodeLanguage["PYTHON"] = "python";
})(ExecutableCodeLanguage || (ExecutableCodeLanguage = {}));
/**
 * Possible outcomes of code execution.
 * @public
 */ var Outcome;
(function(Outcome) {
    /**
     * Unspecified status. This value should not be used.
     */ Outcome["OUTCOME_UNSPECIFIED"] = "outcome_unspecified";
    /**
     * Code execution completed successfully.
     */ Outcome["OUTCOME_OK"] = "outcome_ok";
    /**
     * Code execution finished but with a failure. `stderr` should contain the
     * reason.
     */ Outcome["OUTCOME_FAILED"] = "outcome_failed";
    /**
     * Code execution ran for too long, and was cancelled. There may or may not
     * be a partial output present.
     */ Outcome["OUTCOME_DEADLINE_EXCEEDED"] = "outcome_deadline_exceeded";
})(Outcome || (Outcome = {}));
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Possible roles.
 * @public
 */ const POSSIBLE_ROLES = [
    "user",
    "model",
    "function",
    "system"
];
/**
 * Harm categories that would cause prompts or candidates to be blocked.
 * @public
 */ var HarmCategory;
(function(HarmCategory) {
    HarmCategory["HARM_CATEGORY_UNSPECIFIED"] = "HARM_CATEGORY_UNSPECIFIED";
    HarmCategory["HARM_CATEGORY_HATE_SPEECH"] = "HARM_CATEGORY_HATE_SPEECH";
    HarmCategory["HARM_CATEGORY_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_SEXUALLY_EXPLICIT";
    HarmCategory["HARM_CATEGORY_HARASSMENT"] = "HARM_CATEGORY_HARASSMENT";
    HarmCategory["HARM_CATEGORY_DANGEROUS_CONTENT"] = "HARM_CATEGORY_DANGEROUS_CONTENT";
})(HarmCategory || (HarmCategory = {}));
/**
 * Threshold above which a prompt or candidate will be blocked.
 * @public
 */ var HarmBlockThreshold;
(function(HarmBlockThreshold) {
    // Threshold is unspecified.
    HarmBlockThreshold["HARM_BLOCK_THRESHOLD_UNSPECIFIED"] = "HARM_BLOCK_THRESHOLD_UNSPECIFIED";
    // Content with NEGLIGIBLE will be allowed.
    HarmBlockThreshold["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
    // Content with NEGLIGIBLE and LOW will be allowed.
    HarmBlockThreshold["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
    // Content with NEGLIGIBLE, LOW, and MEDIUM will be allowed.
    HarmBlockThreshold["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
    // All content will be allowed.
    HarmBlockThreshold["BLOCK_NONE"] = "BLOCK_NONE";
})(HarmBlockThreshold || (HarmBlockThreshold = {}));
/**
 * Probability that a prompt or candidate matches a harm category.
 * @public
 */ var HarmProbability;
(function(HarmProbability) {
    // Probability is unspecified.
    HarmProbability["HARM_PROBABILITY_UNSPECIFIED"] = "HARM_PROBABILITY_UNSPECIFIED";
    // Content has a negligible chance of being unsafe.
    HarmProbability["NEGLIGIBLE"] = "NEGLIGIBLE";
    // Content has a low chance of being unsafe.
    HarmProbability["LOW"] = "LOW";
    // Content has a medium chance of being unsafe.
    HarmProbability["MEDIUM"] = "MEDIUM";
    // Content has a high chance of being unsafe.
    HarmProbability["HIGH"] = "HIGH";
})(HarmProbability || (HarmProbability = {}));
/**
 * Reason that a prompt was blocked.
 * @public
 */ var BlockReason;
(function(BlockReason) {
    // A blocked reason was not specified.
    BlockReason["BLOCKED_REASON_UNSPECIFIED"] = "BLOCKED_REASON_UNSPECIFIED";
    // Content was blocked by safety settings.
    BlockReason["SAFETY"] = "SAFETY";
    // Content was blocked, but the reason is uncategorized.
    BlockReason["OTHER"] = "OTHER";
})(BlockReason || (BlockReason = {}));
/**
 * Reason that a candidate finished.
 * @public
 */ var FinishReason;
(function(FinishReason) {
    // Default value. This value is unused.
    FinishReason["FINISH_REASON_UNSPECIFIED"] = "FINISH_REASON_UNSPECIFIED";
    // Natural stop point of the model or provided stop sequence.
    FinishReason["STOP"] = "STOP";
    // The maximum number of tokens as specified in the request was reached.
    FinishReason["MAX_TOKENS"] = "MAX_TOKENS";
    // The candidate content was flagged for safety reasons.
    FinishReason["SAFETY"] = "SAFETY";
    // The candidate content was flagged for recitation reasons.
    FinishReason["RECITATION"] = "RECITATION";
    // The candidate content was flagged for using an unsupported language.
    FinishReason["LANGUAGE"] = "LANGUAGE";
    // Unknown reason.
    FinishReason["OTHER"] = "OTHER";
})(FinishReason || (FinishReason = {}));
/**
 * Task type for embedding content.
 * @public
 */ var TaskType;
(function(TaskType) {
    TaskType["TASK_TYPE_UNSPECIFIED"] = "TASK_TYPE_UNSPECIFIED";
    TaskType["RETRIEVAL_QUERY"] = "RETRIEVAL_QUERY";
    TaskType["RETRIEVAL_DOCUMENT"] = "RETRIEVAL_DOCUMENT";
    TaskType["SEMANTIC_SIMILARITY"] = "SEMANTIC_SIMILARITY";
    TaskType["CLASSIFICATION"] = "CLASSIFICATION";
    TaskType["CLUSTERING"] = "CLUSTERING";
})(TaskType || (TaskType = {}));
/**
 * @public
 */ var FunctionCallingMode;
(function(FunctionCallingMode) {
    // Unspecified function calling mode. This value should not be used.
    FunctionCallingMode["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
    // Default model behavior, model decides to predict either a function call
    // or a natural language repspose.
    FunctionCallingMode["AUTO"] = "AUTO";
    // Model is constrained to always predicting a function call only.
    // If "allowed_function_names" are set, the predicted function call will be
    // limited to any one of "allowed_function_names", else the predicted
    // function call will be any one of the provided "function_declarations".
    FunctionCallingMode["ANY"] = "ANY";
    // Model will not predict any function call. Model behavior is same as when
    // not passing any function declarations.
    FunctionCallingMode["NONE"] = "NONE";
})(FunctionCallingMode || (FunctionCallingMode = {}));
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Basic error type for this SDK.
 * @public
 */ class GoogleGenerativeAIError extends Error {
    constructor(message){
        super(`[GoogleGenerativeAI Error]: ${message}`);
    }
}
/**
 * Errors in the contents of a response from the model. This includes parsing
 * errors, or responses including a safety block reason.
 * @public
 */ class GoogleGenerativeAIResponseError extends GoogleGenerativeAIError {
    constructor(message, response){
        super(message);
        this.response = response;
    }
}
/**
 * Error class covering HTTP errors when calling the server. Includes HTTP
 * status, statusText, and optional details, if provided in the server response.
 * @public
 */ class GoogleGenerativeAIFetchError extends GoogleGenerativeAIError {
    constructor(message, status, statusText, errorDetails){
        super(message);
        this.status = status;
        this.statusText = statusText;
        this.errorDetails = errorDetails;
    }
}
/**
 * Errors in the contents of a request originating from user input.
 * @public
 */ class GoogleGenerativeAIRequestInputError extends GoogleGenerativeAIError {
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";
const DEFAULT_API_VERSION = "v1beta";
/**
 * We can't `require` package.json if this runs on web. We will use rollup to
 * swap in the version number here at build time.
 */ const PACKAGE_VERSION = "0.15.0";
const PACKAGE_LOG_HEADER = "genai-js";
var Task;
(function(Task) {
    Task["GENERATE_CONTENT"] = "generateContent";
    Task["STREAM_GENERATE_CONTENT"] = "streamGenerateContent";
    Task["COUNT_TOKENS"] = "countTokens";
    Task["EMBED_CONTENT"] = "embedContent";
    Task["BATCH_EMBED_CONTENTS"] = "batchEmbedContents";
})(Task || (Task = {}));
class RequestUrl {
    constructor(model, task, apiKey, stream, requestOptions){
        this.model = model;
        this.task = task;
        this.apiKey = apiKey;
        this.stream = stream;
        this.requestOptions = requestOptions;
    }
    toString() {
        var _a, _b;
        const apiVersion = ((_a = this.requestOptions) === null || _a === void 0 ? void 0 : _a.apiVersion) || DEFAULT_API_VERSION;
        const baseUrl = ((_b = this.requestOptions) === null || _b === void 0 ? void 0 : _b.baseUrl) || DEFAULT_BASE_URL;
        let url = `${baseUrl}/${apiVersion}/${this.model}:${this.task}`;
        if (this.stream) url += "?alt=sse";
        return url;
    }
}
/**
 * Simple, but may become more complex if we add more versions to log.
 */ function getClientHeaders(requestOptions) {
    const clientHeaders = [];
    if (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.apiClient) clientHeaders.push(requestOptions.apiClient);
    clientHeaders.push(`${PACKAGE_LOG_HEADER}/${PACKAGE_VERSION}`);
    return clientHeaders.join(" ");
}
async function getHeaders(url) {
    var _a;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("x-goog-api-client", getClientHeaders(url.requestOptions));
    headers.append("x-goog-api-key", url.apiKey);
    let customHeaders = (_a = url.requestOptions) === null || _a === void 0 ? void 0 : _a.customHeaders;
    if (customHeaders) {
        if (!(customHeaders instanceof Headers)) try {
            customHeaders = new Headers(customHeaders);
        } catch (e) {
            throw new GoogleGenerativeAIRequestInputError(`unable to convert customHeaders value ${JSON.stringify(customHeaders)} to Headers: ${e.message}`);
        }
        for (const [headerName, headerValue] of customHeaders.entries()){
            if (headerName === "x-goog-api-key") throw new GoogleGenerativeAIRequestInputError(`Cannot set reserved header name ${headerName}`);
            else if (headerName === "x-goog-api-client") throw new GoogleGenerativeAIRequestInputError(`Header name ${headerName} can only be set using the apiClient field`);
            headers.append(headerName, headerValue);
        }
    }
    return headers;
}
async function constructModelRequest(model, task, apiKey, stream, body, requestOptions) {
    const url = new RequestUrl(model, task, apiKey, stream, requestOptions);
    return {
        url: url.toString(),
        fetchOptions: Object.assign(Object.assign({}, buildFetchOptions(requestOptions)), {
            method: "POST",
            headers: await getHeaders(url),
            body
        })
    };
}
async function makeModelRequest(model, task, apiKey, stream, body, requestOptions, // Allows this to be stubbed for tests
fetchFn = fetch) {
    const { url, fetchOptions } = await constructModelRequest(model, task, apiKey, stream, body, requestOptions);
    return makeRequest(url, fetchOptions, fetchFn);
}
async function makeRequest(url, fetchOptions, fetchFn = fetch) {
    let response;
    try {
        response = await fetchFn(url, fetchOptions);
    } catch (e) {
        handleResponseError(e, url);
    }
    if (!response.ok) await handleResponseNotOk(response, url);
    return response;
}
function handleResponseError(e, url) {
    let err = e;
    if (!(e instanceof GoogleGenerativeAIFetchError || e instanceof GoogleGenerativeAIRequestInputError)) {
        err = new GoogleGenerativeAIError(`Error fetching from ${url.toString()}: ${e.message}`);
        err.stack = e.stack;
    }
    throw err;
}
async function handleResponseNotOk(response, url) {
    let message = "";
    let errorDetails;
    try {
        const json = await response.json();
        message = json.error.message;
        if (json.error.details) {
            message += ` ${JSON.stringify(json.error.details)}`;
            errorDetails = json.error.details;
        }
    } catch (e) {
    // ignored
    }
    throw new GoogleGenerativeAIFetchError(`Error fetching from ${url.toString()}: [${response.status} ${response.statusText}] ${message}`, response.status, response.statusText, errorDetails);
}
/**
 * Generates the request options to be passed to the fetch API.
 * @param requestOptions - The user-defined request options.
 * @returns The generated request options.
 */ function buildFetchOptions(requestOptions) {
    const fetchOptions = {};
    if ((requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeout) >= 0) {
        const abortController = new AbortController();
        const signal = abortController.signal;
        setTimeout(()=>abortController.abort(), requestOptions.timeout);
        fetchOptions.signal = signal;
    }
    return fetchOptions;
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Adds convenience helper methods to a response object, including stream
 * chunks (as long as each chunk is a complete GenerateContentResponse JSON).
 */ function addHelpers(response) {
    response.text = ()=>{
        if (response.candidates && response.candidates.length > 0) {
            if (response.candidates.length > 1) console.warn(`This response had ${response.candidates.length} ` + `candidates. Returning text from the first candidate only. ` + `Access response.candidates directly to use the other candidates.`);
            if (hadBadFinishReason(response.candidates[0])) throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
            return getText(response);
        } else if (response.promptFeedback) throw new GoogleGenerativeAIResponseError(`Text not available. ${formatBlockErrorMessage(response)}`, response);
        return "";
    };
    /**
     * TODO: remove at next major version
     */ response.functionCall = ()=>{
        if (response.candidates && response.candidates.length > 0) {
            if (response.candidates.length > 1) console.warn(`This response had ${response.candidates.length} ` + `candidates. Returning function calls from the first candidate only. ` + `Access response.candidates directly to use the other candidates.`);
            if (hadBadFinishReason(response.candidates[0])) throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
            console.warn(`response.functionCall() is deprecated. ` + `Use response.functionCalls() instead.`);
            return getFunctionCalls(response)[0];
        } else if (response.promptFeedback) throw new GoogleGenerativeAIResponseError(`Function call not available. ${formatBlockErrorMessage(response)}`, response);
        return undefined;
    };
    response.functionCalls = ()=>{
        if (response.candidates && response.candidates.length > 0) {
            if (response.candidates.length > 1) console.warn(`This response had ${response.candidates.length} ` + `candidates. Returning function calls from the first candidate only. ` + `Access response.candidates directly to use the other candidates.`);
            if (hadBadFinishReason(response.candidates[0])) throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
            return getFunctionCalls(response);
        } else if (response.promptFeedback) throw new GoogleGenerativeAIResponseError(`Function call not available. ${formatBlockErrorMessage(response)}`, response);
        return undefined;
    };
    return response;
}
/**
 * Returns all text found in all parts of first candidate.
 */ function getText(response) {
    var _a, _b, _c, _d;
    const textStrings = [];
    if ((_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0].content) === null || _b === void 0 ? void 0 : _b.parts) for (const part of (_d = (_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0].content) === null || _d === void 0 ? void 0 : _d.parts){
        if (part.text) textStrings.push(part.text);
        if (part.executableCode) textStrings.push("\n```python\n" + part.executableCode.code + "\n```\n");
        if (part.codeExecutionResult) textStrings.push("\n```\n" + part.codeExecutionResult.output + "\n```\n");
    }
    if (textStrings.length > 0) return textStrings.join("");
    else return "";
}
/**
 * Returns functionCall of first candidate.
 */ function getFunctionCalls(response) {
    var _a, _b, _c, _d;
    const functionCalls = [];
    if ((_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0].content) === null || _b === void 0 ? void 0 : _b.parts) {
        for (const part of (_d = (_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0].content) === null || _d === void 0 ? void 0 : _d.parts)if (part.functionCall) functionCalls.push(part.functionCall);
    }
    if (functionCalls.length > 0) return functionCalls;
    else return undefined;
}
const badFinishReasons = [
    FinishReason.RECITATION,
    FinishReason.SAFETY,
    FinishReason.LANGUAGE
];
function hadBadFinishReason(candidate) {
    return !!candidate.finishReason && badFinishReasons.includes(candidate.finishReason);
}
function formatBlockErrorMessage(response) {
    var _a, _b, _c;
    let message = "";
    if ((!response.candidates || response.candidates.length === 0) && response.promptFeedback) {
        message += "Response was blocked";
        if ((_a = response.promptFeedback) === null || _a === void 0 ? void 0 : _a.blockReason) message += ` due to ${response.promptFeedback.blockReason}`;
        if ((_b = response.promptFeedback) === null || _b === void 0 ? void 0 : _b.blockReasonMessage) message += `: ${response.promptFeedback.blockReasonMessage}`;
    } else if ((_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0]) {
        const firstCandidate = response.candidates[0];
        if (hadBadFinishReason(firstCandidate)) {
            message += `Candidate was blocked due to ${firstCandidate.finishReason}`;
            if (firstCandidate.finishMessage) message += `: ${firstCandidate.finishMessage}`;
        }
    }
    return message;
}
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol */ function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    function verb(n) {
        if (g[n]) i[n] = function(v) {
            return new Promise(function(a, b) {
                q.push([
                    n,
                    v,
                    a,
                    b
                ]) > 1 || resume(n, v);
            });
        };
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
typeof SuppressedError === "function" && SuppressedError;
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const responseLineRE = /^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;
/**
 * Process a response.body stream from the backend and return an
 * iterator that provides one complete GenerateContentResponse at a time
 * and a promise that resolves with a single aggregated
 * GenerateContentResponse.
 *
 * @param response - Response from a fetch call
 */ function processStream(response) {
    const inputStream = response.body.pipeThrough(new TextDecoderStream("utf8", {
        fatal: true
    }));
    const responseStream = getResponseStream(inputStream);
    const [stream1, stream2] = responseStream.tee();
    return {
        stream: generateResponseSequence(stream1),
        response: getResponsePromise(stream2)
    };
}
async function getResponsePromise(stream) {
    const allResponses = [];
    const reader = stream.getReader();
    while(true){
        const { done, value } = await reader.read();
        if (done) return addHelpers(aggregateResponses(allResponses));
        allResponses.push(value);
    }
}
function generateResponseSequence(stream) {
    return __asyncGenerator(this, arguments, function* generateResponseSequence_1() {
        const reader = stream.getReader();
        while(true){
            const { value, done } = yield __await(reader.read());
            if (done) break;
            yield yield __await(addHelpers(value));
        }
    });
}
/**
 * Reads a raw stream from the fetch response and join incomplete
 * chunks, returning a new stream that provides a single complete
 * GenerateContentResponse in each iteration.
 */ function getResponseStream(inputStream) {
    const reader = inputStream.getReader();
    const stream = new ReadableStream({
        start (controller) {
            let currentText = "";
            return pump();
            function pump() {
                return reader.read().then(({ value, done })=>{
                    if (done) {
                        if (currentText.trim()) {
                            controller.error(new GoogleGenerativeAIError("Failed to parse stream"));
                            return;
                        }
                        controller.close();
                        return;
                    }
                    currentText += value;
                    let match = currentText.match(responseLineRE);
                    let parsedResponse;
                    while(match){
                        try {
                            parsedResponse = JSON.parse(match[1]);
                        } catch (e) {
                            controller.error(new GoogleGenerativeAIError(`Error parsing JSON response: "${match[1]}"`));
                            return;
                        }
                        controller.enqueue(parsedResponse);
                        currentText = currentText.substring(match[0].length);
                        match = currentText.match(responseLineRE);
                    }
                    return pump();
                });
            }
        }
    });
    return stream;
}
/**
 * Aggregates an array of `GenerateContentResponse`s into a single
 * GenerateContentResponse.
 */ function aggregateResponses(responses) {
    const lastResponse = responses[responses.length - 1];
    const aggregatedResponse = {
        promptFeedback: lastResponse === null || lastResponse === void 0 ? void 0 : lastResponse.promptFeedback
    };
    for (const response of responses){
        if (response.candidates) for (const candidate of response.candidates){
            const i = candidate.index;
            if (!aggregatedResponse.candidates) aggregatedResponse.candidates = [];
            if (!aggregatedResponse.candidates[i]) aggregatedResponse.candidates[i] = {
                index: candidate.index
            };
            // Keep overwriting, the last one will be final
            aggregatedResponse.candidates[i].citationMetadata = candidate.citationMetadata;
            aggregatedResponse.candidates[i].finishReason = candidate.finishReason;
            aggregatedResponse.candidates[i].finishMessage = candidate.finishMessage;
            aggregatedResponse.candidates[i].safetyRatings = candidate.safetyRatings;
            /**
                 * Candidates should always have content and parts, but this handles
                 * possible malformed responses.
                 */ if (candidate.content && candidate.content.parts) {
                if (!aggregatedResponse.candidates[i].content) aggregatedResponse.candidates[i].content = {
                    role: candidate.content.role || "user",
                    parts: []
                };
                const newPart = {};
                for (const part of candidate.content.parts){
                    if (part.text) newPart.text = part.text;
                    if (part.functionCall) newPart.functionCall = part.functionCall;
                    if (part.executableCode) newPart.executableCode = part.executableCode;
                    if (part.codeExecutionResult) newPart.codeExecutionResult = part.codeExecutionResult;
                    if (Object.keys(newPart).length === 0) newPart.text = "";
                    aggregatedResponse.candidates[i].content.parts.push(newPart);
                }
            }
        }
        if (response.usageMetadata) aggregatedResponse.usageMetadata = response.usageMetadata;
    }
    return aggregatedResponse;
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function generateContentStream(apiKey, model, params, requestOptions) {
    const response = await makeModelRequest(model, Task.STREAM_GENERATE_CONTENT, apiKey, /* stream */ true, JSON.stringify(params), requestOptions);
    return processStream(response);
}
async function generateContent(apiKey, model, params, requestOptions) {
    const response = await makeModelRequest(model, Task.GENERATE_CONTENT, apiKey, /* stream */ false, JSON.stringify(params), requestOptions);
    const responseJson = await response.json();
    const enhancedResponse = addHelpers(responseJson);
    return {
        response: enhancedResponse
    };
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function formatSystemInstruction(input) {
    // null or undefined
    if (input == null) return undefined;
    else if (typeof input === "string") return {
        role: "system",
        parts: [
            {
                text: input
            }
        ]
    };
    else if (input.text) return {
        role: "system",
        parts: [
            input
        ]
    };
    else if (input.parts) {
        if (!input.role) return {
            role: "system",
            parts: input.parts
        };
        else return input;
    }
}
function formatNewContent(request) {
    let newParts = [];
    if (typeof request === "string") newParts = [
        {
            text: request
        }
    ];
    else {
        for (const partOrString of request)if (typeof partOrString === "string") newParts.push({
            text: partOrString
        });
        else newParts.push(partOrString);
    }
    return assignRoleToPartsAndValidateSendMessageRequest(newParts);
}
/**
 * When multiple Part types (i.e. FunctionResponsePart and TextPart) are
 * passed in a single Part array, we may need to assign different roles to each
 * part. Currently only FunctionResponsePart requires a role other than 'user'.
 * @private
 * @param parts Array of parts to pass to the model
 * @returns Array of content items
 */ function assignRoleToPartsAndValidateSendMessageRequest(parts) {
    const userContent = {
        role: "user",
        parts: []
    };
    const functionContent = {
        role: "function",
        parts: []
    };
    let hasUserContent = false;
    let hasFunctionContent = false;
    for (const part of parts)if ("functionResponse" in part) {
        functionContent.parts.push(part);
        hasFunctionContent = true;
    } else {
        userContent.parts.push(part);
        hasUserContent = true;
    }
    if (hasUserContent && hasFunctionContent) throw new GoogleGenerativeAIError("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");
    if (!hasUserContent && !hasFunctionContent) throw new GoogleGenerativeAIError("No content is provided for sending chat message.");
    if (hasUserContent) return userContent;
    return functionContent;
}
function formatCountTokensInput(params, modelParams) {
    var _a;
    let formattedGenerateContentRequest = {
        model: modelParams === null || modelParams === void 0 ? void 0 : modelParams.model,
        generationConfig: modelParams === null || modelParams === void 0 ? void 0 : modelParams.generationConfig,
        safetySettings: modelParams === null || modelParams === void 0 ? void 0 : modelParams.safetySettings,
        tools: modelParams === null || modelParams === void 0 ? void 0 : modelParams.tools,
        toolConfig: modelParams === null || modelParams === void 0 ? void 0 : modelParams.toolConfig,
        systemInstruction: modelParams === null || modelParams === void 0 ? void 0 : modelParams.systemInstruction,
        cachedContent: (_a = modelParams === null || modelParams === void 0 ? void 0 : modelParams.cachedContent) === null || _a === void 0 ? void 0 : _a.name,
        contents: []
    };
    const containsGenerateContentRequest = params.generateContentRequest != null;
    if (params.contents) {
        if (containsGenerateContentRequest) throw new GoogleGenerativeAIRequestInputError("CountTokensRequest must have one of contents or generateContentRequest, not both.");
        formattedGenerateContentRequest.contents = params.contents;
    } else if (containsGenerateContentRequest) formattedGenerateContentRequest = Object.assign(Object.assign({}, formattedGenerateContentRequest), params.generateContentRequest);
    else {
        // Array or string
        const content = formatNewContent(params);
        formattedGenerateContentRequest.contents = [
            content
        ];
    }
    return {
        generateContentRequest: formattedGenerateContentRequest
    };
}
function formatGenerateContentInput(params) {
    let formattedRequest;
    if (params.contents) formattedRequest = params;
    else {
        // Array or string
        const content = formatNewContent(params);
        formattedRequest = {
            contents: [
                content
            ]
        };
    }
    if (params.systemInstruction) formattedRequest.systemInstruction = formatSystemInstruction(params.systemInstruction);
    return formattedRequest;
}
function formatEmbedContentInput(params) {
    if (typeof params === "string" || Array.isArray(params)) {
        const content = formatNewContent(params);
        return {
            content
        };
    }
    return params;
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ // https://ai.google.dev/api/rest/v1beta/Content#part
const VALID_PART_FIELDS = [
    "text",
    "inlineData",
    "functionCall",
    "functionResponse",
    "executableCode",
    "codeExecutionResult"
];
const VALID_PARTS_PER_ROLE = {
    user: [
        "text",
        "inlineData"
    ],
    function: [
        "functionResponse"
    ],
    model: [
        "text",
        "functionCall",
        "executableCode",
        "codeExecutionResult"
    ],
    // System instructions shouldn't be in history anyway.
    system: [
        "text"
    ]
};
function validateChatHistory(history) {
    let prevContent = false;
    for (const currContent of history){
        const { role, parts } = currContent;
        if (!prevContent && role !== "user") throw new GoogleGenerativeAIError(`First content should be with role 'user', got ${role}`);
        if (!POSSIBLE_ROLES.includes(role)) throw new GoogleGenerativeAIError(`Each item should include role field. Got ${role} but valid roles are: ${JSON.stringify(POSSIBLE_ROLES)}`);
        if (!Array.isArray(parts)) throw new GoogleGenerativeAIError("Content should have 'parts' property with an array of Parts");
        if (parts.length === 0) throw new GoogleGenerativeAIError("Each Content should have at least one part");
        const countFields = {
            text: 0,
            inlineData: 0,
            functionCall: 0,
            functionResponse: 0,
            fileData: 0,
            executableCode: 0,
            codeExecutionResult: 0
        };
        for (const part of parts){
            for (const key of VALID_PART_FIELDS)if (key in part) countFields[key] += 1;
        }
        const validParts = VALID_PARTS_PER_ROLE[role];
        for (const key of VALID_PART_FIELDS){
            if (!validParts.includes(key) && countFields[key] > 0) throw new GoogleGenerativeAIError(`Content with role '${role}' can't contain '${key}' part`);
        }
        prevContent = true;
    }
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Do not log a message for this error.
 */ const SILENT_ERROR = "SILENT_ERROR";
/**
 * ChatSession class that enables sending chat messages and stores
 * history of sent and received messages so far.
 *
 * @public
 */ class ChatSession {
    constructor(apiKey, model, params, requestOptions){
        this.model = model;
        this.params = params;
        this.requestOptions = requestOptions;
        this._history = [];
        this._sendPromise = Promise.resolve();
        this._apiKey = apiKey;
        if (params === null || params === void 0 ? void 0 : params.history) {
            validateChatHistory(params.history);
            this._history = params.history;
        }
    }
    /**
     * Gets the chat history so far. Blocked prompts are not added to history.
     * Blocked candidates are not added to history, nor are the prompts that
     * generated them.
     */ async getHistory() {
        await this._sendPromise;
        return this._history;
    }
    /**
     * Sends a chat message and receives a non-streaming
     * {@link GenerateContentResult}
     */ async sendMessage(request) {
        var _a, _b, _c, _d, _e, _f;
        await this._sendPromise;
        const newContent = formatNewContent(request);
        const generateContentRequest = {
            safetySettings: (_a = this.params) === null || _a === void 0 ? void 0 : _a.safetySettings,
            generationConfig: (_b = this.params) === null || _b === void 0 ? void 0 : _b.generationConfig,
            tools: (_c = this.params) === null || _c === void 0 ? void 0 : _c.tools,
            toolConfig: (_d = this.params) === null || _d === void 0 ? void 0 : _d.toolConfig,
            systemInstruction: (_e = this.params) === null || _e === void 0 ? void 0 : _e.systemInstruction,
            cachedContent: (_f = this.params) === null || _f === void 0 ? void 0 : _f.cachedContent,
            contents: [
                ...this._history,
                newContent
            ]
        };
        let finalResult;
        // Add onto the chain.
        this._sendPromise = this._sendPromise.then(()=>generateContent(this._apiKey, this.model, generateContentRequest, this.requestOptions)).then((result)=>{
            var _a;
            if (result.response.candidates && result.response.candidates.length > 0) {
                this._history.push(newContent);
                const responseContent = Object.assign({
                    parts: [],
                    // Response seems to come back without a role set.
                    role: "model"
                }, (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0].content);
                this._history.push(responseContent);
            } else {
                const blockErrorMessage = formatBlockErrorMessage(result.response);
                if (blockErrorMessage) console.warn(`sendMessage() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
            }
            finalResult = result;
        });
        await this._sendPromise;
        return finalResult;
    }
    /**
     * Sends a chat message and receives the response as a
     * {@link GenerateContentStreamResult} containing an iterable stream
     * and a response promise.
     */ async sendMessageStream(request) {
        var _a, _b, _c, _d, _e, _f;
        await this._sendPromise;
        const newContent = formatNewContent(request);
        const generateContentRequest = {
            safetySettings: (_a = this.params) === null || _a === void 0 ? void 0 : _a.safetySettings,
            generationConfig: (_b = this.params) === null || _b === void 0 ? void 0 : _b.generationConfig,
            tools: (_c = this.params) === null || _c === void 0 ? void 0 : _c.tools,
            toolConfig: (_d = this.params) === null || _d === void 0 ? void 0 : _d.toolConfig,
            systemInstruction: (_e = this.params) === null || _e === void 0 ? void 0 : _e.systemInstruction,
            cachedContent: (_f = this.params) === null || _f === void 0 ? void 0 : _f.cachedContent,
            contents: [
                ...this._history,
                newContent
            ]
        };
        const streamPromise = generateContentStream(this._apiKey, this.model, generateContentRequest, this.requestOptions);
        // Add onto the chain.
        this._sendPromise = this._sendPromise.then(()=>streamPromise)// This must be handled to avoid unhandled rejection, but jump
        // to the final catch block with a label to not log this error.
        .catch((_ignored)=>{
            throw new Error(SILENT_ERROR);
        }).then((streamResult)=>streamResult.response).then((response)=>{
            if (response.candidates && response.candidates.length > 0) {
                this._history.push(newContent);
                const responseContent = Object.assign({}, response.candidates[0].content);
                // Response seems to come back without a role set.
                if (!responseContent.role) responseContent.role = "model";
                this._history.push(responseContent);
            } else {
                const blockErrorMessage = formatBlockErrorMessage(response);
                if (blockErrorMessage) console.warn(`sendMessageStream() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
            }
        }).catch((e)=>{
            // Errors in streamPromise are already catchable by the user as
            // streamPromise is returned.
            // Avoid duplicating the error message in logs.
            if (e.message !== SILENT_ERROR) // Users do not have access to _sendPromise to catch errors
            // downstream from streamPromise, so they should not throw.
            console.error(e);
        });
        return streamPromise;
    }
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function countTokens(apiKey, model, params, requestOptions) {
    const response = await makeModelRequest(model, Task.COUNT_TOKENS, apiKey, false, JSON.stringify(params), requestOptions);
    return response.json();
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function embedContent(apiKey, model, params, requestOptions) {
    const response = await makeModelRequest(model, Task.EMBED_CONTENT, apiKey, false, JSON.stringify(params), requestOptions);
    return response.json();
}
async function batchEmbedContents(apiKey, model, params, requestOptions) {
    const requestsWithModel = params.requests.map((request)=>{
        return Object.assign(Object.assign({}, request), {
            model
        });
    });
    const response = await makeModelRequest(model, Task.BATCH_EMBED_CONTENTS, apiKey, false, JSON.stringify({
        requests: requestsWithModel
    }), requestOptions);
    return response.json();
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Class for generative model APIs.
 * @public
 */ class GenerativeModel {
    constructor(apiKey, modelParams, requestOptions){
        this.apiKey = apiKey;
        if (modelParams.model.includes("/")) // Models may be named "models/model-name" or "tunedModels/model-name"
        this.model = modelParams.model;
        else // If path is not included, assume it's a non-tuned model.
        this.model = `models/${modelParams.model}`;
        this.generationConfig = modelParams.generationConfig || {};
        this.safetySettings = modelParams.safetySettings || [];
        this.tools = modelParams.tools;
        this.toolConfig = modelParams.toolConfig;
        this.systemInstruction = formatSystemInstruction(modelParams.systemInstruction);
        this.cachedContent = modelParams.cachedContent;
        this.requestOptions = requestOptions || {};
    }
    /**
     * Makes a single non-streaming call to the model
     * and returns an object containing a single {@link GenerateContentResponse}.
     */ async generateContent(request) {
        var _a;
        const formattedParams = formatGenerateContentInput(request);
        return generateContent(this.apiKey, this.model, Object.assign({
            generationConfig: this.generationConfig,
            safetySettings: this.safetySettings,
            tools: this.tools,
            toolConfig: this.toolConfig,
            systemInstruction: this.systemInstruction,
            cachedContent: (_a = this.cachedContent) === null || _a === void 0 ? void 0 : _a.name
        }, formattedParams), this.requestOptions);
    }
    /**
     * Makes a single streaming call to the model
     * and returns an object containing an iterable stream that iterates
     * over all chunks in the streaming response as well as
     * a promise that returns the final aggregated response.
     */ async generateContentStream(request) {
        var _a;
        const formattedParams = formatGenerateContentInput(request);
        return generateContentStream(this.apiKey, this.model, Object.assign({
            generationConfig: this.generationConfig,
            safetySettings: this.safetySettings,
            tools: this.tools,
            toolConfig: this.toolConfig,
            systemInstruction: this.systemInstruction,
            cachedContent: (_a = this.cachedContent) === null || _a === void 0 ? void 0 : _a.name
        }, formattedParams), this.requestOptions);
    }
    /**
     * Gets a new {@link ChatSession} instance which can be used for
     * multi-turn chats.
     */ startChat(startChatParams) {
        var _a;
        return new ChatSession(this.apiKey, this.model, Object.assign({
            generationConfig: this.generationConfig,
            safetySettings: this.safetySettings,
            tools: this.tools,
            toolConfig: this.toolConfig,
            systemInstruction: this.systemInstruction,
            cachedContent: (_a = this.cachedContent) === null || _a === void 0 ? void 0 : _a.name
        }, startChatParams), this.requestOptions);
    }
    /**
     * Counts the tokens in the provided request.
     */ async countTokens(request) {
        const formattedParams = formatCountTokensInput(request, {
            model: this.model,
            generationConfig: this.generationConfig,
            safetySettings: this.safetySettings,
            tools: this.tools,
            toolConfig: this.toolConfig,
            systemInstruction: this.systemInstruction,
            cachedContent: this.cachedContent
        });
        return countTokens(this.apiKey, this.model, formattedParams, this.requestOptions);
    }
    /**
     * Embeds the provided content.
     */ async embedContent(request) {
        const formattedParams = formatEmbedContentInput(request);
        return embedContent(this.apiKey, this.model, formattedParams, this.requestOptions);
    }
    /**
     * Embeds an array of {@link EmbedContentRequest}s.
     */ async batchEmbedContents(batchEmbedContentRequest) {
        return batchEmbedContents(this.apiKey, this.model, batchEmbedContentRequest, this.requestOptions);
    }
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Top-level class for this SDK
 * @public
 */ class GoogleGenerativeAI {
    constructor(apiKey){
        this.apiKey = apiKey;
    }
    /**
     * Gets a {@link GenerativeModel} instance for the provided model name.
     */ getGenerativeModel(modelParams, requestOptions) {
        if (!modelParams.model) throw new GoogleGenerativeAIError(`Must provide a model name. ` + `Example: genai.getGenerativeModel({ model: 'my-model-name' })`);
        return new GenerativeModel(this.apiKey, modelParams, requestOptions);
    }
    /**
     * Creates a {@link GenerativeModel} instance from provided content cache.
     */ getGenerativeModelFromCachedContent(cachedContent, requestOptions) {
        if (!cachedContent.name) throw new GoogleGenerativeAIRequestInputError("Cached content must contain a `name` field.");
        if (!cachedContent.model) throw new GoogleGenerativeAIRequestInputError("Cached content must contain a `model` field.");
        const modelParamsFromCache = {
            model: cachedContent.model,
            tools: cachedContent.tools,
            toolConfig: cachedContent.toolConfig,
            systemInstruction: cachedContent.systemInstruction,
            cachedContent
        };
        return new GenerativeModel(this.apiKey, modelParamsFromCache, requestOptions);
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["fiMBX"], "fiMBX", "parcelRequire94c2")

//# sourceMappingURL=main.js.map
