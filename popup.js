document.addEventListener("DOMContentLoaded", () => {
  const showSelect = document.getElementById("show");
  const seasonInput = document.getElementById("season");
  const episodeInput = document.getElementById("episode");

  // Fetch shows from TVmaze API and populate the dropdown
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

  // Form submission for adding a blocked show
  document.getElementById("spoilerForm").addEventListener("submit", (e) => {
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

      // Check if the show is already blocked
      if (
        blocked.some(
          (entry) =>
            entry.show === show &&
            entry.season === season &&
            entry.episode === episode
        )
      ) {
        alert("This show/season/episode is already blocked!");
        return;
      }

      blocked.push(newEntry);
      chrome.storage.sync.set({ blocked }, () => {
        displayBlockedShows();
      });
    });

    document.getElementById("spoilerForm").reset();
    episodeInput.disabled = true;
  });

  // Display the currently blocked shows
  displayBlockedShows();
});

// Initialize the searchable dropdown for selecting shows
function initializeSearchableDropdown() {
  $("#show").select2({
    placeholder: "Search for a show",
    allowClear: true,
  });
}

// Display blocked shows in the popup
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

// Remove a blocked show from the list
function removeBlocked(index) {
  chrome.storage.sync.get("blocked", (data) => {
    const blocked = data.blocked || [];
    blocked.splice(index, 1);
    chrome.storage.sync.set({ blocked }, () => {
      displayBlockedShows();
    });
  });
}
