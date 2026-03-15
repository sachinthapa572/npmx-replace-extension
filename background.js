// Background script for npmx Redirect extension
// Uses browser.* API (polyfilled for Chrome compatibility)

importScripts("lib/browser-polyfill.min.js");

const RULESET_NPMX = "ruleset_npmx";
const RULESET_HUB = "ruleset_hub";

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

async function updateIcon(npmxEnabled, hubEnabled) {
  const enabled = npmxEnabled || hubEnabled;
  const icons = enabled ? ICONS : ICONS_DISABLE;
  await browser.action.setIcon({ path: icons });
}

async function updateRuleset(npmxEnabled, hubEnabled) {
  if (npmxEnabled) {
    await browser.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: [RULESET_NPMX],
    });
  } else {
    await browser.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: [RULESET_NPMX],
    });
  }

  if (hubEnabled) {
    await browser.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: [RULESET_HUB],
    });
  } else {
    await browser.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: [RULESET_HUB],
    });
  }
}

async function toggleNpmx(enabled) {
  try {
    await browser.storage.local.set({ npmxEnabled: enabled });
    await updateRuleset(enabled, await getHubEnabled());
    await updateIcon(enabled, await getHubEnabled());
    return true;
  } catch (error) {
    console.error("Failed to toggle npmx redirect:", error);
    return false;
  }
}

async function toggleHub(enabled) {
  try {
    await browser.storage.local.set({ hubEnabled: enabled });
    await updateRuleset(await getNpmxEnabled(), enabled);
    await updateIcon(await getNpmxEnabled(), enabled);
    return true;
  } catch (error) {
    console.error("Failed to toggle hub redirect:", error);
    return false;
  }
}

async function syncRulesetFromStorage() {
  try {
    const npmxEnabled = await getNpmxEnabled();
    const hubEnabled = await getHubEnabled();
    await updateRuleset(npmxEnabled, hubEnabled);
    await updateIcon(npmxEnabled, hubEnabled);
  } catch (error) {
    console.error("Failed to sync ruleset state:", error);
  }
}

async function getNpmxEnabled() {
  try {
    const result = await browser.storage.local.get("npmxEnabled");
    return result.npmxEnabled !== false;
  } catch (error) {
    console.error("Failed to get npmx enabled state:", error);
    return true;
  }
}

async function getHubEnabled() {
  try {
    const result = await browser.storage.local.get("hubEnabled");
    return result.hubEnabled !== false;
  } catch (error) {
    console.error("Failed to get hub enabled state:", error);
    return true;
  }
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggleNpmx") {
    toggleNpmx(message.enabled).then(sendResponse);
    return true;
  }
  if (message.type === "toggleHub") {
    toggleHub(message.enabled).then(sendResponse);
    return true;
  }
  if (message.type === "getStatus") {
    Promise.all([getNpmxEnabled(), getHubEnabled()]).then(([npmxEnabled, hubEnabled]) => {
      sendResponse({ npmxEnabled, hubEnabled });
    });
    return true;
  }
});

// Initialize on install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details?.reason === "install") {
    await browser.storage.local.set({ npmxEnabled: true, hubEnabled: true });
    await updateRuleset(true, true);
    await updateIcon(true, true);
    return;
  }
  await syncRulesetFromStorage();
});

// Ensure ruleset matches stored preference on startup
browser.runtime.onStartup?.addListener(() => {
  syncRulesetFromStorage();
});

// Initialize icon on load
Promise.all([getNpmxEnabled(), getHubEnabled()]).then(([npmxEnabled, hubEnabled]) => {
  updateIcon(npmxEnabled, hubEnabled);
});
