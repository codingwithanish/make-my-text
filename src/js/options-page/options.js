import { saveApiKey, getApiKey, checkAndAddDefaultPromptConfigurations, deletePromptConfiguration, getPromptConfigurations, savePromptConfiguration, logError, logInfo } from "../ui-page/utils";



// Load stored settings on page load
document.addEventListener('DOMContentLoaded', async() => {
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

geminiApiKeyInput.value = await getApiKey("gemini-api-key");
textSummaryKeyInput.value = await getApiKey("text-summary-key");

// Toggle prompt configuration visibility
togglePromptSectionBtn.addEventListener('click', async () => {
  promptConfigContent.classList.toggle('hidden');
  if (!promptConfigContent.classList.contains('hidden')) {
      await refreshWidgets();
  }
});

// Add a new widget
addWidgetBtn.addEventListener('click', () => {
  const widgetData = { name: '', prompt_template: '' };
  addWidgetToUI(widgetData, true);
});

// Button Actions
updateBtn.addEventListener('click', () => {
  const geminiAuthKey = document.getElementById('gemini-api-key').value;
  const textSummaryKey = document.getElementById('text-summary-key').value;

  if (geminiAuthKey && textSummaryKey) {
    saveApiKey({ "gemini-api-key":geminiAuthKey, "text-summary-key":textSummaryKey });
  } else {
      createWarningMessageDiv('Please enter both Gemini Auth Key and Text Summary Key.');
  }
});

setDefaultBtn.addEventListener('click', async () => {
 await checkAndAddDefaultPromptConfigurations();
 await refreshWidgets();
});

saveConfigBtn.addEventListener('click', async () => {
  const widgets = getAllWidgetValues();
  for (const widget of widgets) {
    await savePromptConfiguration(widget);
  }
});

async function refreshWidgets() {
  const widgetContainer = document.getElementById('widget-container');
  if (!widgetContainer) {
      logError('Element with ID "widget-container" not found.');
      return;
  }
  // Clear all child elements inside the widget-container
  widgetContainer.innerHTML = '';
  const prompt_configs = await getPromptConfigurations();
  logInfo("Displaying prompt_config",prompt_configs);
      prompt_configs.forEach(config => {
        addWidgetToUI(config);
    });
}

function getAllWidgetValues() {
  const widgetContainer = document.getElementById('widget-container');
  if (!widgetContainer) {
      logError('Element with ID "widget-container" not found.');
      return [];
  }
  logInfo("widgetContainer", widgetContainer);
  const widgets = Array.from(widgetContainer.children).map((widgetDiv) => {
      debugger;
      logInfo("widgetDiv", widgetDiv);
      const name = widgetDiv.querySelector('input[name="name"]').value;
      const id = name.replace(/\s+/g, '-').toLowerCase();
      const prompt_template = widgetDiv.querySelector('textarea[name="prompt_template"]').value;
      return { name, id, prompt_template, canDelete: true };
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
  nameInput.className =
    'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  nameInput.addEventListener('input', () => {
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
  promptDescription.textContent =
    'You can include {userinput}, {sitedata}, {systemdata}, {chatdata} annotations to your prompt template';
  promptDescription.className = 'text-gray-500 text-sm';
  const promptTextarea = document.createElement('textarea');
  promptTextarea.value = widgetData.prompt_template;
  promptTextarea.name = 'prompt_template';
  promptTextarea.className =
    'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  promptTextarea.style.height = '200px';
  //promptTextarea.addEventListener('input', () => saveWidgets());

  // Close button
  const closeButton = document.createElement('button');
  closeButton.className = 'mt-4 text-gray-500 hover:text-gray-700 text-sm';
  closeButton.textContent = '✖';
  closeButton.addEventListener('click', () => {
      widgetDiv.remove();
      deletePromptConfiguration(idInput.value);
  });
  // Append all elements to the widget div
  widgetDiv.appendChild(nameLabel);
  widgetDiv.appendChild(nameInput);
  widgetDiv.appendChild(promptLabel);
  widgetDiv.appendChild(promptDescription);
  widgetDiv.appendChild(promptTextarea);
   // Append close button only if id is not "write-email" or "generate-replies"
   if (idInput.value !== 'write-email' && idInput.value !== 'generate-replies') {
    widgetDiv.appendChild(closeButton);
}

  

  // Add widget to container
  widgetContainer.appendChild(widgetDiv);

  // Save widgets if it’s a new one
  // if (isNew) saveWidgets();
}

function getPromptConfig() {
  const widgetContainer = document.getElementById('widget-container'); // Assuming there's a container with this ID
  if (!widgetContainer) {
    logError('Element with ID "widget-container" not found.');
    return [];
}
  const widgets = Array.from(widgetContainer.children).map((widgetDiv) => {
      const name = widgetDiv.querySelector('input[name="name"]').value;
      const id = widgetDiv.querySelector('input[name="id"]').value;
      const prompt_template = widgetDiv.querySelector('textarea[name="prompt_template"]').value;
      return { name, id, prompt_template, canDelete: true };
  });
  return widgets;
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

})