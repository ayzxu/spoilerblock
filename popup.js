document.addEventListener("DOMContentLoaded", () => {
  const showSelect = document.getElementById("show");
  const seasonInput = document.getElementById("season");
  const episodeInput = document.getElementById("episode");

  // Fetch shows from TVmaze API
  fetch("https://api.tvmaze.com/shows")
    .then((response) => response.json())
    .then((shows) => {
      shows.forEach((show) => {
        const option = document.createElement("option");
        option.value = show.name;
        option.textContent = show.name;
        showSelect.appendChild(option);
      });

      initializeSearchableDropdown();
    })
    .catch((error) => console.error("Error fetching shows:", error));

  // Disable episode input if season is empty
  seasonInput.addEventListener("input", () => {
    episodeInput.disabled = seasonInput.value === "";
  });

  // Ensure proper validation
  document.getElementById("spoilerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const show = showSelect.value.trim();
    const season = seasonInput.value ? parseInt(seasonInput.value) : null;
    const episode = episodeInput.value ? parseInt(episodeInput.value) : null;

    if (!show) {
      alert("Please select a show!");
      return;
    }

    if (!season && episode) {
      alert("You cannot specify an episode without a season.");
      return;
    }

    const newEntry = { show, season, episode };

    chrome.storage.sync.get("blocked", (data) => {
      const blocked = data.blocked || [];
      blocked.push(newEntry);
      chrome.storage.sync.set({ blocked }, () => {
        displayBlockedShows();
      });
    });

    document.getElementById("spoilerForm").reset();
    episodeInput.disabled = true;
  });

  displayBlockedShows();
});

function initializeSearchableDropdown() {
  $("#show").select2({
    placeholder: "Search for a show",
    allowClear: true,
  });
}

function displayBlockedShows() {
  chrome.storage.sync.get("blocked", (data) => {
    const blocked = data.blocked || [];
    const list = document.getElementById("blockedShows");
    list.innerHTML = "";

    blocked.forEach((entry, index) => {
      const seasonText = entry.season ? `Season ${entry.season}` : "All Seasons";
      const episodeText = entry.episode
        ? `, Episode ${entry.episode}`
        : ", All Episodes";
      const item = document.createElement("li");
      item.textContent = `${entry.show} - ${seasonText}${episodeText}`;
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
