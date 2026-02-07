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
