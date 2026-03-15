// Popup script for npmx Redirect extension

const toggleSwitch = document.getElementById("enabled");
const statusElement = document.getElementById("status");
const statusRow = document.getElementById("statusRow");
const stateBadge = document.getElementById("stateBadge");

function updateStatus(enabled) {
  if (enabled) {
    statusElement.textContent = "Redirects active";
    statusElement.classList.remove("disabled");
    statusRow.classList.remove("disabled");
    stateBadge.textContent = "Active";
    stateBadge.classList.remove("paused");
  } else {
    statusElement.textContent = "Redirects paused";
    statusElement.classList.add("disabled");
    statusRow.classList.add("disabled");
    stateBadge.textContent = "Paused";
    stateBadge.classList.add("paused");
  }
}

// Get initial state
browser.runtime
  .sendMessage({ type: "getStatus" })
  .then((response) => {
    toggleSwitch.checked = response.enabled;
    updateStatus(response.enabled);
  })
  .catch((error) => {
    console.error("Failed to get status:", error);
    toggleSwitch.checked = true;
    updateStatus(true);
  });

// Handle toggle changes
toggleSwitch.addEventListener("change", async () => {
  const enabled = toggleSwitch.checked;
  updateStatus(enabled);
  try {
    const ok = await browser.runtime.sendMessage({ type: "toggle", enabled });
    if (!ok) {
      toggleSwitch.checked = !enabled;
      updateStatus(!enabled);
    }
  } catch (error) {
    console.error("Failed to toggle redirect:", error);
    toggleSwitch.checked = !enabled;
    updateStatus(!enabled);
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
