chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request:", request);
    if (request.action === "getSpecificElement") {
      chrome.tabs.sendMessage(request.tabId, { action: "getSpecificElement" }, (response) => {
        sendResponse(response);
        console.log(response);
      });
      return true; 
    } 
  });