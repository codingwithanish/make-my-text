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
})({"1nxGf":[function(require,module,exports,__globalThis) {
var _utils = require("../ui-page/utils");
// Load stored settings on page load
document.addEventListener('DOMContentLoaded', async ()=>{
    // Selectors for key elements
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const textSummaryKeyInput = document.getElementById('text-summary-key');
    const togglePromptSectionBtn = document.getElementById('toggle-prompt-section');
    const promptConfigContent = document.getElementById('prompt-config-content');
    const addWidgetBtn = document.getElementById('add-widget-btn');
    const widgetContainer = document.getElementById('widget-container');
    const updateBtn = document.getElementById('update-btn');
    const setDefaultBtn = document.getElementById('set-config-default-btn');
    const saveConfigBtn = document.getElementById('save-config-btn');
    geminiApiKeyInput.value = await (0, _utils.getApiKey)("gemini-api-key");
    textSummaryKeyInput.value = await (0, _utils.getApiKey)("text-summary-key");
    // Toggle prompt configuration visibility
    togglePromptSectionBtn.addEventListener('click', async ()=>{
        promptConfigContent.classList.toggle('hidden');
        if (!promptConfigContent.classList.contains('hidden')) await refreshWidgets();
    });
    // Add a new widget
    addWidgetBtn.addEventListener('click', ()=>{
        const widgetData = {
            name: '',
            prompt_template: ''
        };
        addWidgetToUI(widgetData, true);
    });
    // Button Actions
    updateBtn.addEventListener('click', ()=>{
        const geminiAuthKey = document.getElementById('gemini-api-key').value;
        const textSummaryKey = document.getElementById('text-summary-key').value;
        if (geminiAuthKey && textSummaryKey) (0, _utils.saveApiKey)({
            "gemini-api-key": geminiAuthKey,
            "text-summary-key": textSummaryKey
        });
        else createWarningMessageDiv('Please enter both Gemini Auth Key and Text Summary Key.');
    });
    setDefaultBtn.addEventListener('click', async ()=>{
        await (0, _utils.checkAndAddDefaultPromptConfigurations)();
        await refreshWidgets();
    });
    saveConfigBtn.addEventListener('click', async ()=>{
        const widgets = getAllWidgetValues();
        for (const widget of widgets)await (0, _utils.savePromptConfiguration)(widget);
    });
    async function refreshWidgets() {
        const widgetContainer = document.getElementById('widget-container');
        if (!widgetContainer) {
            (0, _utils.logError)('Element with ID "widget-container" not found.');
            return;
        }
        // Clear all child elements inside the widget-container
        widgetContainer.innerHTML = '';
        const prompt_configs = await (0, _utils.getPromptConfigurations)();
        (0, _utils.logInfo)("Displaying prompt_config", prompt_configs);
        prompt_configs.forEach((config)=>{
            addWidgetToUI(config);
        });
    }
    function getAllWidgetValues() {
        const widgetContainer = document.getElementById('widget-container');
        if (!widgetContainer) {
            (0, _utils.logError)('Element with ID "widget-container" not found.');
            return [];
        }
        (0, _utils.logInfo)("widgetContainer", widgetContainer);
        const widgets = Array.from(widgetContainer.children).map((widgetDiv)=>{
            debugger;
            (0, _utils.logInfo)("widgetDiv", widgetDiv);
            const name = widgetDiv.querySelector('input[name="name"]').value;
            const id = name.replace(/\s+/g, '-').toLowerCase();
            const prompt_template = widgetDiv.querySelector('textarea[name="prompt_template"]').value;
            return {
                name,
                id,
                prompt_template,
                canDelete: true
            };
        });
        return widgets;
    }
    // Function to add a widget UI block
    function addWidgetToUI(widgetData, isNew = false) {
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'p-4 border border-gray-300 rounded-lg bg-gray-100';
        // Name field
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Name of the Widget';
        nameLabel.className = 'block text-gray-600 mb-2';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'name';
        nameInput.value = widgetData.name;
        nameInput.className = 'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
        nameInput.addEventListener('input', ()=>{
            const idValue = nameInput.value.replace(/\s+/g, '-').toLowerCase();
            idInput.value = idValue;
        });
        // Hidden ID field
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'id';
        idInput.value = widgetData.id;
        // Prompt field
        const promptLabel = document.createElement('label');
        promptLabel.textContent = 'Prompt';
        promptLabel.className = 'block text-gray-600 mt-4';
        const promptDescription = document.createElement('p');
        promptDescription.textContent = 'You can include {userinput}, {sitedata}, {systemdata}, {chatdata} annotations to your prompt template';
        promptDescription.className = 'text-gray-500 text-sm';
        const promptTextarea = document.createElement('textarea');
        promptTextarea.value = widgetData.prompt_template;
        promptTextarea.name = 'prompt_template';
        promptTextarea.className = 'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
        promptTextarea.style.height = '200px';
        //promptTextarea.addEventListener('input', () => saveWidgets());
        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'mt-4 text-gray-500 hover:text-gray-700 text-sm';
        closeButton.textContent = "\u2716";
        closeButton.addEventListener('click', ()=>{
            widgetDiv.remove();
            (0, _utils.deletePromptConfiguration)(idInput.value);
        });
        // Append all elements to the widget div
        widgetDiv.appendChild(nameLabel);
        widgetDiv.appendChild(nameInput);
        widgetDiv.appendChild(promptLabel);
        widgetDiv.appendChild(promptDescription);
        widgetDiv.appendChild(promptTextarea);
        // Append close button only if id is not "write-email" or "generate-replies"
        if (idInput.value !== 'write-email' && idInput.value !== 'generate-replies') widgetDiv.appendChild(closeButton);
        // Add widget to container
        widgetContainer.appendChild(widgetDiv);
    // Save widgets if it’s a new one
    // if (isNew) saveWidgets();
    }
    function getPromptConfig() {
        const widgetContainer = document.getElementById('widget-container'); // Assuming there's a container with this ID
        if (!widgetContainer) {
            (0, _utils.logError)('Element with ID "widget-container" not found.');
            return [];
        }
        const widgets = Array.from(widgetContainer.children).map((widgetDiv)=>{
            const name = widgetDiv.querySelector('input[name="name"]').value;
            const id = widgetDiv.querySelector('input[name="id"]').value;
            const prompt_template = widgetDiv.querySelector('textarea[name="prompt_template"]').value;
            return {
                name,
                id,
                prompt_template,
                canDelete: true
            };
        });
        return widgets;
    }
    // Save widgets to storage
    function saveWidgets() {
        const widgets = Array.from(widgetContainer.children).map((widgetDiv)=>{
            const name = widgetDiv.querySelector('input').value;
            const prompt = widgetDiv.querySelector('textarea').value;
            return {
                name,
                prompt
            };
        });
        chrome.storage.sync.set({
            widgets
        });
    }
});

},{"../ui-page/utils":"7ITpU"}],"7ITpU":[function(require,module,exports,__globalThis) {
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

},{}]},["1nxGf"], "1nxGf", "parcelRequire94c2")

//# sourceMappingURL=options.js.map
