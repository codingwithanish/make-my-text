document.addEventListener('DOMContentLoaded', () => {
  // Select all buttons
  const showWindowBtn = document.getElementById('showWindowBtn');
  const clearMemoryBtn = document.getElementById('clearMemoryBtn');
  const optionsBtn = document.getElementById('optionsBtn');
  const aboutUsBtn = document.getElementById('aboutUsBtn');

  // Event listener for "Show Window"
  showWindowBtn.addEventListener('click', () => {
    alert('Show Window clicked!');
    // Programmatically set the side panel options
    // chrome.sidePanel.setOptions({
    //   path: "sidepanel/index.html", // Path to the side panel HTML file
    //   enabled: true // Enable the side panel
    // }, () => {
    //   console.log("Side panel displayed!");
    // });
    chrome.runtime.sendMessage({action: 'open_side_panel'});
  });

  // Event listener for "Clear Memory"
  clearMemoryBtn.addEventListener('click', () => {
    alert('Clear Memory clicked!');
    // Here, you can add logic for clearing memory, for example:
    // localStorage.clear();
  });

  // Event listener for "Options"
  optionsBtn.addEventListener('click', () => {
    alert('Options clicked!');
    // Here, you can add functionality for opening the options page or opening settings
  });

  // Event listener for "About Us"
  aboutUsBtn.addEventListener('click', () => {
    alert('About Us clicked!');
    // Here, you can redirect to an About Us page or show relevant information
  });
});
