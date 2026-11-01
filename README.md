# 🧭 TabyJourney

Navigate your browser tab history like browser history with Backward/Forward buttons.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔙 **Backward/Forward Navigation**: Navigate through your tab history just like browser history
- ⌨️ **Customizable Keyboard Shortcuts**: Assign navigation keys in Chrome shortcut settings
- 🖱️ **Mouse Gesture Support**: Shift + Mouse Back/Forward buttons
- 📜 **History Popup**: Visual tab history with current position indicator
- ⚙️ **Settings Page**: Customize behavior, shortcuts, and preferences
- 🔒 **Privacy-First**: All data stored locally, no tracking or external servers

## Installation

### From Chrome Web Store (Recommended)

Coming soon...

### Manual Installation (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/TabyJourney.git
   cd TabyJourney
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

## Usage

### Keyboard Shortcuts

Configure all shortcuts at `chrome://extensions/shortcuts`:

1. Find TabyJourney.
2. Assign keys to **Navigate backward in tab history** and **Navigate forward in tab history**. Both start unassigned.
3. Use **Activate the extension** to change the popup shortcut. Its default is **Alt + L** (⌥L).

The extension Options page has an **Open Chrome shortcut settings** button for direct access. Saving or resetting extension options does not change Chrome shortcut assignments.

Navigation shortcuts run through the background worker. They do not need a page refresh or a content script on the active page. Use keys supported by Chrome, such as letters or arrows. Bracket keys [ ] are not supported. Chrome or operating system shortcuts can take priority.

The old page shortcuts from extension options are no longer used. Assign replacement shortcuts in Chrome.

### Mouse Gestures

- **Shift + Mouse Back Button**: Navigate backward
- **Shift + Mouse Forward Button**: Navigate forward

### Extension Icon

Click the TabyJourney icon in your toolbar to:
- View your complete tab history
- See your current position
- Click any tab to jump directly to it

### Settings

Right-click the extension icon and select "Options" to customize:

- **History size**: Maximum number of tabs to remember (default: 100)
- **Keyboard shortcuts**: Open Chrome shortcut settings to assign navigation keys
- **Mouse gestures**: Enable/disable mouse button navigation
- **Notifications**: Show alerts when reaching history limits
- **Auto-remove closed tabs**: Remove tabs from history when closed
- **Window separation**: Manage history per-window (experimental)

## How It Works

TabyJourney maintains a chronological list of your tab activations, similar to how browsers track page history:

1. When you activate a tab, it's added to your history
2. When you navigate backward/forward, you move through this history
3. When you manually switch to a new tab, forward history is cleared (just like browsers)
4. Duplicate consecutive activations are ignored

All data is stored locally using Chrome's storage API.

## Development

### Tech Stack

- **TypeScript**: Type-safe development
- **Vite**: Fast build tool with HMR
- **Vitest**: Unit testing (23 tests, 100% core logic coverage)
- **@crxjs/vite-plugin**: Chrome extension bundling
- **Just**: Task runner

### Commands

```bash
# Install dependencies
npm install

# Development mode with hot reload
just dev

# Run tests
just test

# Run tests in watch mode
just test-watch

# Build for production
just build

# Package for Chrome Web Store
just package

# Clean build artifacts
just clean
```

### Project Structure

```
TabyJourney/
├── src/
│   ├── core/              # Domain logic (TDD tested)
│   │   ├── history-manager.ts
│   │   ├── navigation.ts
│   │   └── storage.ts
│   ├── background/        # Service Worker
│   ├── popup/             # Popup UI
│   ├── content/           # Content Script (mouse gestures)
│   ├── options/           # Settings page
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utilities
├── test/                  # Unit tests
├── public/icons/          # Extension icons
└── dist/                  # Build output
```

### Testing

We follow TDD (Test-Driven Development) with 100% coverage of core logic:

```bash
npm test
```

Core modules (`history-manager`, `navigation`, `storage`) are fully unit tested.

## Privacy

TabyJourney is privacy-first:

- ✅ All data stored locally on your device
- ✅ No external servers or API calls
- ✅ No analytics or tracking
- ✅ No data collection or sharing
- ✅ Open source and auditable

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 🐛 [Report a bug](https://github.com/yourusername/TabyJourney/issues)
- 💡 [Request a feature](https://github.com/yourusername/TabyJourney/issues)
- 📖 [View documentation](https://github.com/yourusername/TabyJourney)

## Acknowledgments

Built with modern web technologies and Chrome Extension Manifest V3.

---

Made with ❤️ for productive browsing
