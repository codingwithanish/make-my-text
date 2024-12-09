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
// Selectors for key elements
const geminiApiKeyInput = document.getElementById('gemini-api-key');
const textSummaryKeyInput = document.getElementById('text-summary-key');
const togglePromptSectionBtn = document.getElementById('toggle-prompt-section');
const promptConfigContent = document.getElementById('prompt-config-content');
const addWidgetBtn = document.getElementById('add-widget-btn');
const widgetContainer = document.getElementById('widget-container');
const updateBtn = document.getElementById('update-btn');
const setDefaultBtn = document.getElementById('set-default-btn');
const clearBtn = document.getElementById('clear-btn');
// Load stored settings on page load
document.addEventListener('DOMContentLoaded', ()=>{
    chrome.storage.sync.get([
        'geminiApiKey',
        'textSummaryKey',
        'widgets'
    ], (data)=>{
        geminiApiKeyInput.value = data.geminiApiKey || '';
        textSummaryKeyInput.value = data.textSummaryKey || '';
        const widgets = data.widgets || [];
        widgets.forEach(addWidgetToUI);
    });
});
// Save settings when inputs change
geminiApiKeyInput.addEventListener('input', ()=>{
    chrome.storage.sync.set({
        geminiApiKey: geminiApiKeyInput.value
    });
});
textSummaryKeyInput.addEventListener('input', ()=>{
    chrome.storage.sync.set({
        textSummaryKey: textSummaryKeyInput.value
    });
});
// Toggle prompt configuration visibility
togglePromptSectionBtn.addEventListener('click', ()=>{
    promptConfigContent.classList.toggle('hidden');
});
// Add a new widget
addWidgetBtn.addEventListener('click', ()=>{
    const widgetData = {
        name: '',
        prompt: ''
    };
    addWidgetToUI(widgetData, true);
});
// Button Actions
updateBtn.addEventListener('click', ()=>{
    chrome.storage.sync.get([
        'geminiApiKey',
        'textSummaryKey',
        'widgets'
    ], (data)=>{
        console.log('Current Settings:', data);
        alert('Settings have been updated!');
    });
});
setDefaultBtn.addEventListener('click', ()=>{
    const defaultSettings = {
        geminiApiKey: '',
        textSummaryKey: '',
        widgets: []
    };
    chrome.storage.sync.set(defaultSettings, ()=>{
        geminiApiKeyInput.value = '';
        textSummaryKeyInput.value = '';
        widgetContainer.innerHTML = '';
        alert('Default settings applied!');
    });
});
clearBtn.addEventListener('click', ()=>{
    chrome.storage.sync.clear(()=>{
        geminiApiKeyInput.value = '';
        textSummaryKeyInput.value = '';
        widgetContainer.innerHTML = '';
        alert('All settings cleared!');
    });
});
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
    nameInput.value = widgetData.name;
    nameInput.className = 'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
    nameInput.addEventListener('input', ()=>saveWidgets());
    // Prompt field
    const promptLabel = document.createElement('label');
    promptLabel.textContent = 'Prompt';
    promptLabel.className = 'block text-gray-600 mt-4';
    const promptDescription = document.createElement('p');
    promptDescription.textContent = 'You can include {userinput}, {sitedata}, {systemdata}, {chatdata} annotations to your prompt template';
    promptDescription.className = 'text-gray-500 text-sm';
    const promptTextarea = document.createElement('textarea');
    promptTextarea.value = widgetData.prompt;
    promptTextarea.className = 'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
    promptTextarea.addEventListener('input', ()=>saveWidgets());
    // Append all elements to the widget div
    widgetDiv.appendChild(nameLabel);
    widgetDiv.appendChild(nameInput);
    widgetDiv.appendChild(promptLabel);
    widgetDiv.appendChild(promptDescription);
    widgetDiv.appendChild(promptTextarea);
    // Add widget to container
    widgetContainer.appendChild(widgetDiv);
    // Save widgets if it’s a new one
    if (isNew) saveWidgets();
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

},{}]},["1nxGf"], "1nxGf", "parcelRequire94c2")

//# sourceMappingURL=options.js.map
