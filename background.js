// Background script for npmx Redirect extension
// Uses browser.* API (polyfilled for Chrome compatibility)

importScripts("lib/browser-polyfill.min.js");

const RULESET_ID = "ruleset_1";

async function updateRuleset(enabled) {
  if (enabled) {
    await browser.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: [RULESET_ID],
    });
  } else {
    await browser.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: [RULESET_ID],
    });
  }
}

// Toggle the redirect on/off
async function toggleRedirect(enabled) {
  try {
    await updateRuleset(enabled);
    await browser.storage.local.set({ enabled });
    return true;
  } catch (error) {
    console.error("Failed to toggle redirect:", error);
    return false;
  }
}

async function syncRulesetFromStorage() {
  try {
    const enabled = await getEnabled();
    await updateRuleset(enabled);
  } catch (error) {
    console.error("Failed to sync ruleset state:", error);
  }
}

// Get current enabled state
async function getEnabled() {
  try {
    const result = await browser.storage.local.get("enabled");
    // Default to enabled if not set
    return result.enabled !== false;
  } catch (error) {
    console.error("Failed to get enabled state:", error);
    return true;
  }
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggle") {
    toggleRedirect(message.enabled).then(sendResponse);
    return true; // Indicates async response
  }
  if (message.type === "getStatus") {
    getEnabled().then((enabled) => sendResponse({ enabled }));
    return true;
  }
});

// Initialize on install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details?.reason === "install") {
    await browser.storage.local.set({ enabled: true });
    await updateRuleset(true);
    return;
  }
  await syncRulesetFromStorage();
});

// Ensure ruleset matches stored preference on startup
browser.runtime.onStartup?.addListener(() => {
  syncRulesetFromStorage();
});
