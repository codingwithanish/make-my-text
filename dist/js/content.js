document.addEventListener('DOMContentLoaded', () => {
    alert("DOM is ready!");
  });
console.log("Content script is running!");
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "addText") {
//       const chatSection = document.querySelector('.bg-white.shadow.rounded-lg.flex-grow.p-4.mb-4.overflow-auto > .space-y-3');
//       if (chatSection) {
//         // Create a new message element
//         const newMessage = document.createElement('p');
//         newMessage.className = 'p-2 bg-blue-100 rounded-lg self-end'; // Styling for user message
//         newMessage.textContent = message.text;
  
//         // Append the new message to the chat section
//         chatSection.appendChild(newMessage);
  
//         // Scroll to the bottom of the chat section
//         chatSection.scrollTop = chatSection.scrollHeight;
//       }
//     }
//   });
  