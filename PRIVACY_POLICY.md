# Privacy Policy for TabyJourney

**Last Updated: November 1, 2026**

## Overview

TabyJourney is a Chrome extension that helps you navigate your browser tab history with backward/forward functionality, similar to browser history navigation.

## Data Collection and Usage

### What Data We Collect

TabyJourney collects and stores the following information **locally on your device**:

1. **Tab History Information**:
   - Tab IDs (Chrome's internal identifiers)
   - Tab titles
   - Tab URLs
   - Timestamps of tab activation

2. **User Settings**:
   - Maximum history size preference
   - Mouse gesture preferences
   - Notification preferences
   - Window separation settings

### How We Use This Data

- **Tab Navigation**: To enable backward/forward navigation through your tab history
- **User Preferences**: To customize the extension behavior according to your settings

### Data Storage

- **All data is stored locally** using Chrome's `chrome.storage.local` and `chrome.storage.sync` APIs
- **No data is transmitted** to external servers or third parties
- **No analytics or tracking** is performed
- Settings may be synchronized across your Chrome browsers using Chrome Sync (if you have Chrome Sync enabled)

### Data Retention

- Tab history is automatically limited to your configured maximum (default: 100 entries)
- Older entries are automatically removed when the limit is reached
- All data can be cleared by:
  - Uninstalling the extension
  - Clearing Chrome's extension data
  - Using the extension's reset settings feature

## Permissions Explanation

TabyJourney requires the following permissions:

- **`tabs`**: To access tab information (title, URL, ID) for navigation functionality
- **`storage`**: To save your tab history and user preferences locally
- **`<all_urls>`**: To enable mouse gestures on supported web pages

Keyboard shortcut assignments are managed by Chrome. TabyJourney no longer reads or uses the old shortcut values saved in extension options.

## Third-Party Services

TabyJourney does **not** use any third-party services, analytics, or tracking tools.

## Data Sharing

We do **not**:
- Sell your data
- Share your data with third parties
- Transmit your data to external servers
- Use your data for advertising

## Children's Privacy

TabyJourney does not knowingly collect any information from children under 13 years of age.

## Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date.

## Contact

If you have questions about this Privacy Policy, please contact us through:
- GitHub Issues: [https://github.com/yourusername/TabyJourney/issues](https://github.com/yourusername/TabyJourney/issues)

## Your Rights

You have the right to:
- Access your stored data (visible in the extension popup)
- Delete your data (by resetting settings or uninstalling)
- Disable the extension at any time

---

**Summary**: TabyJourney stores all data locally on your device, does not transmit any data to external servers, and does not track or collect analytics.
