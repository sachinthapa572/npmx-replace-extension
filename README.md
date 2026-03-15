# npmx-redirect

A Chrome extension with multiple redirect features:

## Features

### 1. npmjs → npmx Redirect
Automatically redirects npmjs.com package pages to npmx.dev for a faster, cleaner browsing experience.

### 2. GitHub → Better Hub Redirect
Automatically redirects GitHub pages to your Better Hub instance (beta.better-hub.com).

- Repository pages
- PR pages
- Commit pages
- Actions/Runs pages
- Dashboard, Notifications, Trending, Issues, PRs pages
- Excludes settings, marketplace, explore, login, signup, pricing, and other non-repo pages

### 3. GitHub PR → Devin Review
Open GitHub PRs in Devin Review for AI-powered code reviews.

**Usage:**
1. Navigate to any GitHub PR URL (e.g., `https://github.com/owner/repo/pull/123`)
2. Click the extension icon
3. Click "Open in Devin Review"
4. The PR opens at `https://devinreview.com/owner/repo/pull/123` in a new tab

## Toggle Features

Each redirect feature can be enabled/disabled independently from the extension popup:
- **npmjs → npmx**: Toggle to enable/disable npm package redirects
- **GitHub → Better Hub**: Toggle to enable/disable GitHub redirects

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the extension directory
