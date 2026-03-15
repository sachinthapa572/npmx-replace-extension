// Popup script for npmx Redirect extension

const npmxToggle = document.getElementById("npmxEnabled");
const npmxStatusElement = document.getElementById("npmxStatus");
const npmxStatusRow = document.getElementById("npmxStatusRow");
const npmxStateBadge = document.getElementById("npmxStateBadge");

const hubToggle = document.getElementById("hubEnabled");
const hubStatusElement = document.getElementById("hubStatus");
const hubStatusRow = document.getElementById("hubStatusRow");
const hubStateBadge = document.getElementById("hubStateBadge");

function updateNpmxStatus(enabled) {
  if (enabled) {
    npmxStatusElement.textContent = "Redirects active";
    npmxStatusElement.classList.remove("disabled");
    npmxStatusRow.classList.remove("disabled");
    npmxStateBadge.textContent = "Active";
    npmxStateBadge.classList.remove("paused");
  } else {
    npmxStatusElement.textContent = "Redirects paused";
    npmxStatusElement.classList.add("disabled");
    npmxStatusRow.classList.add("disabled");
    npmxStateBadge.textContent = "Paused";
    npmxStateBadge.classList.add("paused");
  }
}

function updateHubStatus(enabled) {
  if (enabled) {
    hubStatusElement.textContent = "Redirects active";
    hubStatusElement.classList.remove("disabled");
    hubStatusRow.classList.remove("disabled");
    hubStateBadge.textContent = "Active";
    hubStateBadge.classList.remove("paused");
  } else {
    hubStatusElement.textContent = "Redirects paused";
    hubStatusElement.classList.add("disabled");
    hubStatusRow.classList.add("disabled");
    hubStateBadge.textContent = "Paused";
    hubStateBadge.classList.add("paused");
  }
}

// Get initial state
browser.runtime
  .sendMessage({ type: "getStatus" })
  .then((response) => {
    npmxToggle.checked = response.npmxEnabled;
    hubToggle.checked = response.hubEnabled;
    updateNpmxStatus(response.npmxEnabled);
    updateHubStatus(response.hubEnabled);
  })
  .catch((error) => {
    console.error("Failed to get status:", error);
    npmxToggle.checked = true;
    hubToggle.checked = true;
    updateNpmxStatus(true);
    updateHubStatus(true);
  });

// Handle npmx toggle changes
npmxToggle.addEventListener("change", async () => {
  const enabled = npmxToggle.checked;
  updateNpmxStatus(enabled);
  try {
    const ok = await browser.runtime.sendMessage({ type: "toggleNpmx", enabled });
    if (!ok) {
      npmxToggle.checked = !enabled;
      updateNpmxStatus(!enabled);
    }
  } catch (error) {
    console.error("Failed to toggle npmx redirect:", error);
    npmxToggle.checked = !enabled;
    updateNpmxStatus(!enabled);
  }
});

// Handle hub toggle changes
hubToggle.addEventListener("change", async () => {
  const enabled = hubToggle.checked;
  updateHubStatus(enabled);
  try {
    const ok = await browser.runtime.sendMessage({ type: "toggleHub", enabled });
    if (!ok) {
      hubToggle.checked = !enabled;
      updateHubStatus(!enabled);
    }
  } catch (error) {
    console.error("Failed to toggle hub redirect:", error);
    hubToggle.checked = !enabled;
    updateHubStatus(!enabled);
  }
});

// Devin Review button handler
const devinBtn = document.getElementById("openDevinReview");
const devinStatus = document.getElementById("devinStatus");

devinBtn.addEventListener("click", async () => {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      devinStatus.textContent = "No active tab found";
      return;
    }

    const currentUrl = tabs[0].url;

    // Check if it's a GitHub PR URL
    const isGithubPr = currentUrl.includes("github.com") && /\/pull\/\d+/.test(currentUrl);

    if (!isGithubPr) {
      devinStatus.textContent = "Open a GitHub PR first";
      return;
    }

    // Transform URL: replace github.com with devinreview.com
    const newUrl = currentUrl.replace("github.com", "devinreview.com");

    // Open in new tab
    await browser.tabs.create({ url: newUrl });
    devinStatus.textContent = "Opened in Devin Review";

    // Clear status after 2 seconds
    setTimeout(() => {
      devinStatus.textContent = "";
    }, 2000);
  } catch (error) {
    console.error("Failed to open Devin Review:", error);
    devinStatus.textContent = "Error opening URL";
  }
});
