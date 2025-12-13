# Permission Justification for Chrome Web Store

This document contains the justification text for each permission requested by TabyJourney.

---

## tabs が必要な理由

TabyJourney needs the "tabs" permission to implement its core functionality of navigating through tab history.

Specifically, this permission is used to:

1. **Track tab activation**: Monitor when users switch between tabs to build a chronological history (similar to browser's back/forward history)

2. **Read tab information**: Access tab title, URL, and favicon to display in the history list popup

3. **Activate tabs**: Switch to a specific tab when user navigates backward or forward through their tab history

4. **Verify tab existence**: Check if a tab still exists before attempting to navigate to it (tabs may be closed by the user)

All tab data is stored locally on the user's device and is never transmitted to external servers. The extension only accesses tabs within the current Chrome window and does not interact with tabs in other browsers or applications.

---

## storage が必要な理由

TabyJourney needs the "storage" permission to save user preferences and tab history locally.

Specifically, this permission is used to:

1. **Persist tab history**: Store the chronological list of tab activations (tab IDs, titles, URLs, timestamps) so users can navigate their history even after restarting Chrome

2. **Save user settings**: Store customizable preferences including:
   - Maximum history size (default: 100 entries)
   - Keyboard shortcut configurations (Alt+[ and Alt+])
   - Mouse gesture preferences
   - Auto-remove closed tabs setting
   - Notification preferences

All data is stored using Chrome's local storage API (chrome.storage.local and chrome.storage.sync). No data is uploaded to remote servers. Users can clear all stored data by uninstalling the extension or resetting settings through the options page.

---

## ホスト権限 が必要な理由

TabyJourney requires host permissions ("<all_urls>") to enable keyboard shortcuts on all web pages.

Specifically, this permission is used to:

1. **Enable keyboard shortcuts globally**: The extension provides customizable keyboard shortcuts (default: Alt+[ for backward, Alt+] for forward) that must work on all websites. Chrome's Commands API does not support these specific key combinations, so we implement them using Content Scripts.

2. **Capture keyboard events**: Listen for user-defined keyboard shortcuts on any web page to trigger tab history navigation

3. **Support mouse gestures**: Detect Shift + Mouse Back/Forward button combinations on all pages for alternative navigation method

**Important notes**:
- The Content Script only listens for specific keyboard/mouse events and does NOT:
  - Read or modify page content
  - Inject any visual elements
  - Access user input in forms
  - Track user behavior
  - Communicate with external servers

- Users can customize or disable keyboard shortcuts in the extension's settings page

- The extension works entirely offline and does not make any network requests

The host permission is solely used to ensure keyboard shortcuts work consistently across all websites, providing a seamless tab navigation experience similar to browser's built-in back/forward functionality.

---

## リモートコード を使用していますか？

**Answer: いいえ、リモートコード を使用していません**

TabyJourney does not use any remote code. All JavaScript and WebAssembly code is included in the extension package. The extension does not:

- Load external scripts via <script> tags
- Use eval() to execute strings as code
- Fetch or execute code from remote servers
- Import modules from external sources

All code is bundled during the build process and included in the submitted package.
