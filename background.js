// Background script for npmx Redirect extension
// Uses browser.* API (polyfilled for Chrome compatibility)

importScripts("lib/browser-polyfill.min.js");

const RULESET_ID = "ruleset_1";

const ICONS = {
  16: "icons/favicon-16x16.png",
  32: "icons/favicon-32x32.png",
  64: "icons/favicon-64x64.png",
  128: "icons/favicon-128x128.png",
  256: "icons/favicon-256x256.png",
  512: "icons/favicon-512x512.png",
};

const ICONS_DISABLE = {
  16: "icons/favicon-disable-16x16.png",
  32: "icons/favicon-disable-32x32.png",
  64: "icons/favicon-disable-64x64.png",
  128: "icons/favicon-disable-128x128.png",
  256: "icons/favicon-disable-256x256.png",
  512: "icons/favicon-disable-512x512.png",
};

async function updateIcon(enabled) {
  const icons = enabled ? ICONS : ICONS_DISABLE;
  await browser.action.setIcon({ path: icons });
}

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
    await updateIcon(enabled);
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
    await updateIcon(enabled);
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
    await updateIcon(true);
    return;
  }
  await syncRulesetFromStorage();
});

// Ensure ruleset matches stored preference on startup
browser.runtime.onStartup?.addListener(() => {
  syncRulesetFromStorage();
});

// Initialize icon on load
getEnabled().then(updateIcon);
