document.getElementById("spoilerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const show = document.getElementById("show").value.trim();
    const season = parseInt(document.getElementById("season").value);
    const episode = parseInt(document.getElementById("episode").value);
  
    const newEntry = { show, season, episode };
  
    chrome.storage.sync.get("blocked", (data) => {
      const blocked = data.blocked || [];
      blocked.push(newEntry);
      chrome.storage.sync.set({ blocked }, () => {
        displayBlockedShows();
      });
    });
  
    document.getElementById("spoilerForm").reset();
  });
  
  function displayBlockedShows() {
    chrome.storage.sync.get("blocked", (data) => {
      const blocked = data.blocked || [];
      const list = document.getElementById("blockedShows");
      list.innerHTML = "";
  
      blocked.forEach((entry, index) => {
        const item = document.createElement("li");
        item.textContent = `${entry.show} - Up to Season ${entry.season}, Episode ${entry.episode}`;
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.onclick = () => removeBlocked(index);
        item.appendChild(removeBtn);
        list.appendChild(item);
      });
    });
  }
  
  function removeBlocked(index) {
    chrome.storage.sync.get("blocked", (data) => {
      const blocked = data.blocked || [];
      blocked.splice(index, 1);
      chrome.storage.sync.set({ blocked }, () => {
        displayBlockedShows();
      });
    });
  }
  
  document.addEventListener("DOMContentLoaded", displayBlockedShows);