# VS Code Integrated Terminal Guide

## Overview

The Visual Studio Code integrated terminal provides a powerful command-line interface directly within your editor, allowing you to run commands, scripts, and tools without leaving your development environment.

## Table of Contents

- [Terminal Basics](#terminal-basics)
- [Opening and Managing Terminals](#opening-and-managing-terminals)
- [Shell Integration](#shell-integration)
- [Terminal Features](#terminal-features)
- [Terminal Automation](#terminal-automation)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Terminal Basics

The integrated terminal runs commands such as `mkdir`, `git`, `npm`, and any other command-line tool just like a standalone terminal. Key advantages include:

- Direct access to your project's file system
- Automatic working directory set to your workspace root
- Multiple terminal instances support
- Split terminal views
- Terminal profiles for different shells

### Key Concepts

- **Terminal Instance**: Each terminal tab is an independent shell session
- **Shell**: The command-line interpreter (bash, zsh, PowerShell, cmd, etc.)
- **Working Directory**: The current folder context for commands
- **Profile**: Pre-configured shell settings and environment

## Opening and Managing Terminals

### Opening a Terminal

**Methods to open a new terminal:**

1. **Menu**: `Terminal` → `New Terminal`
2. **Keyboard Shortcut**: 
   - Windows/Linux: `Ctrl + ` ` (backtick)
   - macOS: `Cmd + ` ` (backtick)
3. **Command Palette**: `Ctrl+Shift+P` → Type "Terminal: Create New Terminal"
4. **Plus Icon**: Click the `+` icon in the terminal panel

### Managing Multiple Terminals

**Create multiple terminal instances:**

```bash
# Terminal 1: Development server
npm run dev

# Terminal 2: Type checking
npm run type-check

# Terminal 3: Git operations
git status
```

**Switch between terminals:**

- Use the dropdown in the terminal panel
- Keyboard: `Ctrl+PageUp` / `Ctrl+PageDown`
- Click terminal tabs directly

**Split terminals:**

- Click the split icon (⊞) in terminal panel
- Keyboard: `Ctrl+Shift+5`
- Command: `Terminal: Split Terminal`

**Close terminals:**

- Click the trash icon (🗑️)
- Keyboard: `Ctrl+D` (send EOF) or type `exit`
- Command: `Terminal: Kill Terminal`

### Terminal Navigation

**Focus terminal:**

- Keyboard: `Ctrl + ` `
- Click in terminal area
- Command: `Terminal: Focus Terminal`

**Navigate between split terminals:**

- Keyboard: `Alt+Left` / `Alt+Right`
- Command: `Terminal: Focus Next Terminal Group`

**Scroll through terminal:**

- Mouse wheel
- Keyboard: `Ctrl+Up` / `Ctrl+Down`
- Page Up / Page Down

**Search in terminal:**

- Keyboard: `Ctrl+F`
- Command: `Terminal: Find`

## Shell Integration

Shell integration enhances terminal functionality by understanding command execution context.

### Features with Shell Integration

**Command Detection:**
- Decorators show command success/failure status
- Navigate between commands with `Ctrl+Up` / `Ctrl+Down`
- Quick access to command output

**Command Links:**
- File paths become clickable
- Line numbers in error messages are clickable
- URLs open in browser

**Working Directory Awareness:**
- Terminal title shows current directory
- Proper handling of `cd` commands
- Quick navigation in breadcrumbs

### Supported Shells

- **bash**: Most common on Linux/macOS
- **zsh**: Default on modern macOS
- **fish**: Feature-rich interactive shell
- **PowerShell**: Default on Windows, cross-platform
- **cmd**: Windows Command Prompt
- **Git Bash**: Bash emulation on Windows

### Configuring Default Shell

**Windows:**
```json
{
  "terminal.integrated.defaultProfile.windows": "PowerShell"
}
```

**macOS:**
```json
{
  "terminal.integrated.defaultProfile.osx": "zsh"
}
```

**Linux:**
```json
{
  "terminal.integrated.defaultProfile.linux": "bash"
}
```

## Terminal Features

### Link Detection

The terminal automatically detects and makes clickable:

**File Paths:**
```bash
# Opens file in editor
src/components/Header.tsx:42

# Opens directory in explorer
./app/dashboard/
```

**URLs:**
```bash
# Opens in default browser
http://localhost:3000
https://github.com/user/repo
```

**Error Messages:**
```bash
# TypeScript errors with file:line:column
src/app/page.tsx:15:8 - error TS2304
```

**To follow a link:**
- Click with mouse
- `Ctrl+Click` for split editor
- Command: `Terminal: Follow Link`

### Terminal Tabs and Titles

**Customize terminal title:**
```json
{
  "terminal.integrated.tabs.title": "${process}"
}
```

**Title variables:**
- `${process}`: Running process name
- `${cwd}`: Current working directory
- `${workspaceFolder}`: Workspace folder name
- `${sequence}`: Terminal sequence number

### Terminal Appearance

**Font customization:**
```json
{
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.fontFamily": "monospace",
  "terminal.integrated.fontWeight": "normal",
  "terminal.integrated.lineHeight": 1.2
}
```

**Color theme:**
```json
{
  "workbench.colorCustomizations": {
    "terminal.background": "#1E1E1E",
    "terminal.foreground": "#CCCCCC"
  }
}
```

### Copy and Paste

**Copy:**
- Select text with mouse
- Keyboard: `Ctrl+Shift+C` or `Ctrl+C` (with selection)
- Right-click → Copy

**Paste:**
- Keyboard: `Ctrl+Shift+V` or `Ctrl+V`
- Right-click → Paste

**Copy on selection:**
```json
{
  "terminal.integrated.copyOnSelection": true
}
```

### Clear Terminal

**Clear the terminal display:**
- Command: `clear` (Linux/macOS) or `cls` (Windows)
- Keyboard: `Ctrl+K`
- Command: `Terminal: Clear`

## Terminal Automation

Automate common terminal tasks using VS Code tasks.

### Task Configuration

Tasks are defined in `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Install Dependencies",
      "type": "shell",
      "command": "npm",
      "args": ["install"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Development Server",
      "type": "shell",
      "command": "npm",
      "args": ["run", "dev"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "dedicated"
      },
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": ".",
          "file": 1,
          "location": 2,
          "message": 3
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "compiling",
          "endsPattern": "compiled successfully"
        }
      }
    },
    {
      "label": "Build Production",
      "type": "shell",
      "command": "npm",
      "args": ["run", "build"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "shared"
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "Type Check",
      "type": "shell",
      "command": "npm",
      "args": ["run", "type-check"],
      "group": "test",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": ["$tsc"]
    }
  ]
}
```

### Running Tasks

**Run a task:**
1. Command Palette: `Ctrl+Shift+P` → `Tasks: Run Task`
2. Select task from list
3. Keyboard: `Ctrl+Shift+B` (default build task)

**Task groups:**
- `build`: Build-related tasks (default: `Ctrl+Shift+B`)
- `test`: Test-related tasks
- `none`: No specific group

### Task Presentation Options

```json
{
  "presentation": {
    "echo": true,          // Show executed command
    "reveal": "always",    // "always", "never", "silent"
    "focus": false,        // Focus terminal when task runs
    "panel": "shared",     // "shared", "dedicated", "new"
    "showReuseMessage": true,
    "clear": false         // Clear terminal before running
  }
}
```

### Problem Matchers

Problem matchers parse terminal output to create problems in Problems panel:

**Built-in matchers:**
- `$tsc`: TypeScript compiler
- `$eslint-stylish`: ESLint
- `$eslint-compact`: ESLint compact
- `$msCompile`: C# compiler
- `$go`: Go compiler

**Custom problem matcher:**
```json
{
  "problemMatcher": {
    "owner": "custom",
    "fileLocation": ["relative", "${workspaceFolder}"],
    "pattern": {
      "regexp": "^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$",
      "file": 1,
      "line": 2,
      "column": 3,
      "severity": 4,
      "message": 5
    }
  }
}
```

### Task Dependencies

Run tasks in sequence:

```json
{
  "label": "Build and Test",
  "dependsOn": ["Clean", "Build", "Test"],
  "dependsOrder": "sequence"
}
```

### Task Input Variables

Use input variables in tasks:

```json
{
  "command": "npm",
  "args": ["run", "${input:scriptName}"]
}
```

Define inputs:
```json
{
  "inputs": [
    {
      "id": "scriptName",
      "type": "pickString",
      "description": "Select npm script",
      "options": ["dev", "build", "start", "test"],
      "default": "dev"
    }
  ]
}
```

## Keyboard Shortcuts

### Essential Shortcuts

| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| Toggle Terminal | `Ctrl + ` ` | `Cmd + ` ` |
| Create New Terminal | `Ctrl+Shift+ ` ` | `Cmd+Shift+ ` ` |
| Split Terminal | `Ctrl+Shift+5` | `Cmd+Shift+5` |
| Kill Terminal | - | - |
| Focus Next Terminal | `Ctrl+PageDown` | `Cmd+PageDown` |
| Focus Previous Terminal | `Ctrl+PageUp` | `Cmd+PageUp` |
| Clear Terminal | `Ctrl+K` | `Cmd+K` |
| Scroll Up | `Ctrl+Up` | `Cmd+Up` |
| Scroll Down | `Ctrl+Down` | `Cmd+Down` |
| Scroll to Top | `Ctrl+Home` | `Cmd+Home` |
| Scroll to Bottom | `Ctrl+End` | `Cmd+End` |
| Find in Terminal | `Ctrl+F` | `Cmd+F` |
| Copy Selection | `Ctrl+C` | `Cmd+C` |
| Paste | `Ctrl+V` | `Cmd+V` |

### Customizing Shortcuts

**Edit keyboard shortcuts:**
1. `File` → `Preferences` → `Keyboard Shortcuts`
2. Search for "terminal"
3. Click pencil icon to edit
4. Press new key combination

**Example keybindings.json:**
```json
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.terminal.new"
  },
  {
    "key": "ctrl+shift+w",
    "command": "workbench.action.terminal.kill"
  }
]
```

## Configuration

### Terminal Settings

Complete terminal configuration in `settings.json`:

```json
{
  // Shell configuration
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.defaultProfile.linux": "bash",
  
  // Appearance
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.fontFamily": "monospace",
  "terminal.integrated.lineHeight": 1.2,
  "terminal.integrated.cursorStyle": "block",
  "terminal.integrated.cursorBlinking": true,
  
  // Behavior
  "terminal.integrated.copyOnSelection": true,
  "terminal.integrated.scrollback": 10000,
  "terminal.integrated.enableBell": false,
  "terminal.integrated.confirmOnExit": "hasChildProcesses",
  "terminal.integrated.confirmOnKill": "editor",
  
  // Shell integration
  "terminal.integrated.shellIntegration.enabled": true,
  "terminal.integrated.shellIntegration.decorationsEnabled": "both",
  "terminal.integrated.shellIntegration.history": 100,
  
  // Tabs
  "terminal.integrated.tabs.enabled": true,
  "terminal.integrated.tabs.hideCondition": "never",
  "terminal.integrated.tabs.location": "left",
  "terminal.integrated.tabs.title": "${process}",
  
  // Working directory
  "terminal.integrated.cwd": "${workspaceFolder}",
  "terminal.integrated.splitCwd": "workspaceRoot",
  
  // Environment
  "terminal.integrated.env.windows": {},
  "terminal.integrated.env.osx": {},
  "terminal.integrated.env.linux": {},
  
  // Performance
  "terminal.integrated.gpuAcceleration": "auto",
  "terminal.integrated.smoothScrolling": true
}
```

### Custom Shell Profiles

Define custom terminal profiles:

```json
{
  "terminal.integrated.profiles.windows": {
    "PowerShell": {
      "source": "PowerShell",
      "icon": "terminal-powershell"
    },
    "Git Bash": {
      "path": "C:\\Program Files\\Git\\bin\\bash.exe",
      "icon": "terminal-bash"
    },
    "Command Prompt": {
      "path": "C:\\Windows\\System32\\cmd.exe",
      "icon": "terminal-cmd"
    },
    "WSL": {
      "path": "C:\\Windows\\System32\\wsl.exe",
      "icon": "terminal-linux"
    },
    "Custom Node": {
      "path": "C:\\Program Files\\nodejs\\node.exe",
      "args": [],
      "env": {
        "NODE_ENV": "development"
      },
      "icon": "symbol-misc"
    }
  },
  "terminal.integrated.profiles.osx": {
    "zsh": {
      "path": "/bin/zsh",
      "icon": "terminal"
    },
    "bash": {
      "path": "/bin/bash",
      "icon": "terminal-bash"
    },
    "fish": {
      "path": "/usr/local/bin/fish",
      "icon": "terminal-linux"
    }
  },
  "terminal.integrated.profiles.linux": {
    "bash": {
      "path": "/bin/bash",
      "icon": "terminal-bash"
    },
    "zsh": {
      "path": "/bin/zsh",
      "icon": "terminal"
    }
  }
}
```

### Environment Variables

Set environment variables for terminal:

```json
{
  "terminal.integrated.env.windows": {
    "NODE_ENV": "development",
    "API_KEY": "your-api-key"
  },
  "terminal.integrated.env.osx": {
    "NODE_ENV": "development",
    "PATH": "/usr/local/bin:${env:PATH}"
  },
  "terminal.integrated.env.linux": {
    "NODE_ENV": "development"
  }
}
```

## Troubleshooting

### Common Issues

#### Build Failed: Command 'npm install' exited with error

**Problem:** Package installation fails or exits with error code 1.

**Solutions:**

1. **Ensure lockfile exists:**
   ```bash
   # Check for lockfile
   ls -la | grep -E "(package-lock|yarn.lock|pnpm-lock)"
   
   # If missing, generate one
   npm install
   ```

2. **Clear cache and reinstall:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and lockfile
   rm -rf node_modules package-lock.json
   
   # Reinstall
   npm install
   ```

3. **Use correct package manager:**
   ```bash
   # If using npm
   npm install
   
   # If using yarn
   yarn install
   
   # If using pnpm
   pnpm install
   ```

4. **Check Node.js version:**
   ```bash
   # Check version
   node --version
   npm --version
   
   # Use nvm to switch if needed
   nvm use 18
   ```

#### Terminal Not Opening

**Solutions:**

1. Check default shell path is correct
2. Restart VS Code
3. Check for conflicting extensions
4. Reset terminal settings:
   ```json
   {
     "terminal.integrated.defaultProfile.windows": "PowerShell"
   }
   ```

#### Shell Integration Not Working

**Solutions:**

1. Enable shell integration:
   ```json
   {
     "terminal.integrated.shellIntegration.enabled": true
   }
   ```

2. Check shell support (bash, zsh, fish, PowerShell)

3. Update shell profile files:
   - bash: `~/.bashrc`
   - zsh: `~/.zshrc`
   - fish: `~/.config/fish/config.fish`

#### Terminal Slow Performance

**Solutions:**

1. Reduce scrollback buffer:
   ```json
   {
     "terminal.integrated.scrollback": 1000
   }
   ```

2. Disable GPU acceleration:
   ```json
   {
     "terminal.integrated.gpuAcceleration": "off"
   }
   ```

3. Limit number of open terminals

4. Clear terminal history regularly

#### Copy/Paste Not Working

**Solutions:**

1. Enable right-click behavior:
   ```json
   {
     "terminal.integrated.rightClickBehavior": "default"
   }
   ```

2. Try keyboard shortcuts:
   - Copy: `Ctrl+Shift+C`
   - Paste: `Ctrl+Shift+V`

3. Enable copy on selection:
   ```json
   {
     "terminal.integrated.copyOnSelection": true
   }
   ```

#### Tasks Not Running

**Solutions:**

1. Verify `.vscode/tasks.json` syntax
2. Check problem matcher configuration
3. Verify command paths are correct
4. Run task manually to see error output
5. Check task dependencies are satisfied

### Debug Terminal Issues

**Enable terminal process logging:**
```json
{
  "terminal.integrated.enablePersistentSessions": true,
  "terminal.integrated.enableLogging": true
}
```

**Check terminal process:**
```bash
# See running processes
ps aux | grep -i terminal

# Check node processes
ps aux | grep -i node
```

**Reset terminal:**
1. Close all terminals
2. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Open new terminal

## Best Practices

### Terminal Workflow

1. **Organize terminals by purpose:**
   - Terminal 1: Development server
   - Terminal 2: Git operations
   - Terminal 3: Build/test commands
   - Terminal 4: Database/services

2. **Use tasks for repetitive commands:**
   - Create tasks for common workflows
   - Assign keyboard shortcuts to frequent tasks
   - Use task dependencies for complex workflows

3. **Leverage shell integration:**
   - Navigate command history
   - Click file paths to open
   - Review command output

4. **Configure appearance for readability:**
   - Set comfortable font size
   - Use high-contrast theme if needed
   - Enable smooth scrolling

### Performance Tips

1. Limit scrollback buffer to reasonable size (1000-10000 lines)
2. Close unused terminals
3. Use `clear` command regularly
4. Disable GPU acceleration if experiencing issues
5. Use terminal profiles for different contexts

### Security Considerations

1. **Don't commit secrets in terminal history**
2. **Be careful with environment variables**
3. **Use secure shells (ssh) when appropriate**
4. **Clear terminal before sharing screen**
5. **Review command output before executing**

## Additional Resources

### Official Documentation

- [VS Code Terminal Documentation](https://code.visualstudio.com/docs/terminal/basics)
- [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- [VS Code Keyboard Shortcuts](https://code.visualstudio.com/docs/getstarted/keybindings)

### Shell-Specific Resources

- **Bash**: [GNU Bash Manual](https://www.gnu.org/software/bash/manual/)
- **Zsh**: [Zsh Documentation](https://zsh.sourceforge.io/Doc/)
- **PowerShell**: [PowerShell Documentation](https://docs.microsoft.com/powershell/)
- **Fish**: [Fish Shell Documentation](https://fishshell.com/docs/current/)

### Related Tools

- **tmux**: Terminal multiplexer for advanced terminal management
- **screen**: Alternative terminal multiplexer
- **oh-my-zsh**: Zsh configuration framework
- **starship**: Cross-shell prompt

---

**Last Updated:** June 2024  
**Version:** 1.0  
**Maintained by:** ABACO Development Team
