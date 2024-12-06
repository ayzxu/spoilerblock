chrome.storage.sync.get("blocked", (data) => {
    const blocked = data.blocked || [];
    const bodyText = document.body.innerText.toLowerCase();
  
    blocked.forEach(({ show, season, episode }) => {
      const showRegex = new RegExp(show.toLowerCase(), "g");
      const spoilerRegex = new RegExp(
        `${show.toLowerCase()}.*?(season\\s*${season}|episode\\s*${episode})`,
        "g"
      );
  
      if (spoilerRegex.test(bodyText)) {
        document.body.innerHTML = `
          <div style="text-align: center; padding: 50px; font-size: 24px; color: red;">
            Spoiler Detected! Content Hidden.
          </div>`;
      }
    });
  });