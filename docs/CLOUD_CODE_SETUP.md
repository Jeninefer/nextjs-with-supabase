# Cloud Code and Duet AI Setup Guide

## Overview

This project is configured to use Google Cloud Code with Duet AI for enhanced development productivity. Duet AI provides intelligent code assistance, fixes, explanations, and generation capabilities directly in VS Code.

## Installation

1. **Install the Cloud Code Extension**
   
   The extension is already listed in `.vscode/extensions.json` as a recommended extension. When you open this project in VS Code, you'll be prompted to install recommended extensions.
   
   Alternatively, you can install it manually:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "Cloud Code"
   - Click Install on "Cloud Code" by Google Cloud Tools

2. **Authenticate with Google Cloud**
   
   After installation, you'll need to authenticate:
   - Click on the Cloud Code status bar item (bottom of VS Code)
   - Select "Sign in to Google Cloud"
   - Follow the authentication flow in your browser
   - Grant the necessary permissions

## Using Duet AI Features

### Available Commands

Once Cloud Code is installed and you're authenticated, you can use these Duet AI commands:

1. **Fix Code Issues** - `cloudcode.duetAI.inEditor.fix`
   - Keyboard shortcut: `Ctrl+Shift+Alt+F` (Windows/Linux) or `Cmd+Shift+Alt+F` (Mac)
   - Select problematic code and run this command to get AI-powered fixes
   - Usage: Select code → Right-click → "Duet AI: Fix"

2. **Explain Code** - `cloudcode.duetAI.inEditor.explain`
   - Keyboard shortcut: `Ctrl+Shift+Alt+E` (Windows/Linux) or `Cmd+Shift+Alt+E` (Mac)
   - Get detailed explanations of selected code
   - Usage: Select code → Right-click → "Duet AI: Explain"

3. **Generate Code** - `cloudcode.duetAI.inEditor.generate`
   - Keyboard shortcut: `Ctrl+Shift+Alt+G` (Windows/Linux) or `Cmd+Shift+Alt+G` (Mac)
   - Generate code based on comments or descriptions
   - Usage: Write a comment describing what you need → Run command

### Inline Completions

Duet AI also provides inline code completions as you type. This is enabled by default in the project settings.

## Configuration

The project includes the following Cloud Code configurations in `.vscode/settings.json`:

```json
{
    "cloudcode.duetAI.enabled": true,
    "cloudcode.duetAI.inlineCompletions.enabled": true,
    "cloudcode.autoDependencies": "on"
}
```

## Troubleshooting

### Command Not Found Error

If you see an error like "Actual command not found, wanted to execute cloudcode.duetAI.inEditor.fix":

1. **Check Extension Installation**
   ```
   - Open Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "Cloud Code"
   - Ensure it's installed and enabled
   ```

2. **Reload VS Code**
   ```
   - Press Ctrl+Shift+P / Cmd+Shift+P
   - Type "Reload Window"
   - Press Enter
   ```

3. **Verify Authentication**
   ```
   - Click the Cloud Code status bar item
   - Check if you're signed in to Google Cloud
   - If not, sign in and try again
   ```

4. **Check Duet AI Availability**
   ```
   - Ensure you have access to Duet AI in your Google Cloud organization
   - Some features may require specific GCP permissions or project setup
   ```

### Installing Recommended Extensions

When you first open this project, VS Code should prompt you to install recommended extensions. If it doesn't:

1. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Extensions: Show Recommended Extensions"
3. Install "Cloud Code" from the list

## Additional Resources

- [Cloud Code Documentation](https://cloud.google.com/code/docs)
- [Duet AI for Developers](https://cloud.google.com/duet-ai/docs/developers)
- [VS Code Extension Guide](https://cloud.google.com/code/docs/vscode)

## Project-Specific Notes

This ABACO Financial Intelligence Platform uses Cloud Code for:
- Quick debugging of Next.js and TypeScript code
- AI-assisted code reviews and improvements
- Automated fix suggestions for build errors
- Enhanced productivity in financial analytics development

## Support

For issues related to Cloud Code or Duet AI:
- Check the [Cloud Code GitHub Issues](https://github.com/GoogleCloudPlatform/cloud-code-vscode/issues)
- Contact your Google Cloud administrator
- Refer to the main project README for general setup issues
