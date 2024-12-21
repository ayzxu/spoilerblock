// Fetch keywords from the local JSON file
fetch(chrome.runtime.getURL("keywords.json"))
  .then((response) => response.json())
  .then((keywords) => {
    chrome.storage.sync.get("blocked", (data) => {
      const blockedShows = data.blocked || [];
      const blockedKeywords = [];

      // Collect keywords for blocked shows
      blockedShows.forEach(({ show }) => {
        if (keywords[show]) {
          blockedKeywords.push(...keywords[show]);
        }
      });

      if (blockedKeywords.length > 0) {
        sweepAndBlackOut(blockedKeywords);
      }
    });
  })
  .catch((error) => console.error("Error loading keywords:", error));

// Function to sweep the page and black out matching keywords
function sweepAndBlackOut(keywords) {
  const bodyTextNodes = getTextNodes(document.body);
  const keywordRegex = new RegExp(keywords.join("|"), "gi");

  bodyTextNodes.forEach((node) => {
    if (keywordRegex.test(node.nodeValue)) {
      const parent = node.parentNode;
      const blackedOutHTML = node.nodeValue.replace(keywordRegex, (match) => {
        return `<span style="background-color: black; color: black;">${match}</span>`;
      });

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = blackedOutHTML;

      // Replace text node with the newly styled content
      while (tempDiv.firstChild) {
        parent.insertBefore(tempDiv.firstChild, node);
      }
      parent.removeChild(node);
    }
  });
}

// Helper function to get all text nodes
function getTextNodes(node) {
  const textNodes = [];
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode);
  }

  return textNodes;
}
