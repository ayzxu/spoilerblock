// Fetch keywords and block content
console.log("Content script loaded");

fetch(chrome.runtime.getURL("keywords.json"))
  .then((response) => response.json())
  .then((keywords) => {
    chrome.storage.sync.get("blocked", (data) => {
      const blockedShows = data.blocked || [];
      const blockedKeywords = [];

      console.log("Blocked shows from storage:", blockedShows);

      // Collect keywords for all blocked shows
      blockedShows.forEach(({ show }) => {
        if (keywords[show]) {
          blockedKeywords.push(...keywords[show]);
        }
      });

      console.log("Blocked keywords:", blockedKeywords);

      if (blockedKeywords.length > 0) {
        const keywordRegex = new RegExp(
          blockedKeywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
          "gi"
        );
        console.log("Keyword regex:", keywordRegex);

        blackOutKeywords(keywordRegex);
      } else {
        console.warn("No keywords found to block.");
      }
    });
  })
  .catch((error) => console.error("Error loading keywords:", error));

// Function to black out matching keywords
function blackOutKeywords(keywordRegex) {
  console.log("Starting to process content for keywords...");

  // Helper to process text nodes
  function processTextNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      console.log("Processing text node:", node.nodeValue);
      if (keywordRegex.test(node.nodeValue)) {
        console.log("Found match in text node:", node.nodeValue);
        const parent = node.parentNode;

        // Replace keyword matches with blacked-out spans
        const blackedOutHTML = node.nodeValue.replace(keywordRegex, (match) => {
          return `<span class="blacked-out" style="background-color: black; color: black;">${match}</span>`;
        });

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = blackedOutHTML;

        // Replace the original text node with the styled content
        while (tempDiv.firstChild) {
          parent.insertBefore(tempDiv.firstChild, node);
        }
        parent.removeChild(node);
      }
    }
  }

  // Process all text nodes in the document
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const textNodes = getTextNodes(node);
      textNodes.forEach(processTextNode);
    }
  }

  // Retrieve all text nodes
  function getTextNodes(node) {
    const textNodes = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      textNodes.push(currentNode);
    }

    return textNodes;
  }

  // Process existing content
  console.log("Processing existing text nodes...");
  getTextNodes(document.body).forEach(processTextNode);

  // Observe dynamic changes in the DOM
  const observer = new MutationObserver((mutations) => {
    console.log("MutationObserver triggered:", mutations);
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((addedNode) => {
        if (addedNode.nodeType === Node.TEXT_NODE) {
          processTextNode(addedNode);
        } else if (addedNode.nodeType === Node.ELEMENT_NODE) {
          const newTextNodes = getTextNodes(addedNode);
          newTextNodes.forEach(processTextNode);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log("MutationObserver is now active...");
}
