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
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['geminiApiKey', 'textSummaryKey', 'widgets'], (data) => {
    geminiApiKeyInput.value = data.geminiApiKey || '';
    textSummaryKeyInput.value = data.textSummaryKey || '';
    const widgets = data.widgets || [];
    widgets.forEach(addWidgetToUI);
  });
});

// Save settings when inputs change
geminiApiKeyInput.addEventListener('input', () => {
  chrome.storage.sync.set({ geminiApiKey: geminiApiKeyInput.value });
});
textSummaryKeyInput.addEventListener('input', () => {
  chrome.storage.sync.set({ textSummaryKey: textSummaryKeyInput.value });
});

// Toggle prompt configuration visibility
togglePromptSectionBtn.addEventListener('click', () => {
  promptConfigContent.classList.toggle('hidden');
});

// Add a new widget
addWidgetBtn.addEventListener('click', () => {
  const widgetData = { name: '', prompt: '' };
  addWidgetToUI(widgetData, true);
});

// Button Actions
updateBtn.addEventListener('click', () => {
  chrome.storage.sync.get(['geminiApiKey', 'textSummaryKey', 'widgets'], (data) => {
    console.log('Current Settings:', data);
    alert('Settings have been updated!');
  });
});

setDefaultBtn.addEventListener('click', () => {
  const defaultSettings = {
    geminiApiKey: '',
    textSummaryKey: '',
    widgets: [],
  };
  chrome.storage.sync.set(defaultSettings, () => {
    geminiApiKeyInput.value = '';
    textSummaryKeyInput.value = '';
    widgetContainer.innerHTML = '';
    alert('Default settings applied!');
  });
});

clearBtn.addEventListener('click', () => {
  chrome.storage.sync.clear(() => {
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
  nameInput.className =
    'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  nameInput.addEventListener('input', () => saveWidgets());

  // Prompt field
  const promptLabel = document.createElement('label');
  promptLabel.textContent = 'Prompt';
  promptLabel.className = 'block text-gray-600 mt-4';
  const promptDescription = document.createElement('p');
  promptDescription.textContent =
    'You can include {userinput}, {sitedata}, {systemdata}, {chatdata} annotations to your prompt template';
  promptDescription.className = 'text-gray-500 text-sm';
  const promptTextarea = document.createElement('textarea');
  promptTextarea.value = widgetData.prompt;
  promptTextarea.className =
    'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  promptTextarea.addEventListener('input', () => saveWidgets());

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
  const widgets = Array.from(widgetContainer.children).map((widgetDiv) => {
    const name = widgetDiv.querySelector('input').value;
    const prompt = widgetDiv.querySelector('textarea').value;
    return { name, prompt };
  });
  chrome.storage.sync.set({ widgets });
}
