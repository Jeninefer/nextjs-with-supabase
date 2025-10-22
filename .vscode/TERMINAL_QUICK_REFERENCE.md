# VS Code Terminal Quick Reference

## Essential Commands

### Open/Close Terminal
- **Open Terminal**: `Ctrl + ` ` (backtick)
- **New Terminal**: `Ctrl+Shift+ ` `
- **Close Terminal**: `Ctrl+D` or type `exit`
- **Kill Terminal**: Click trash icon 🗑️

### Navigation
- **Toggle Terminal**: `Ctrl + ` `
- **Next Terminal**: `Ctrl+PageDown`
- **Previous Terminal**: `Ctrl+PageUp`
- **Split Terminal**: `Ctrl+Shift+5`
- **Focus Terminal**: `Ctrl + ` `

### Editing
- **Copy**: `Ctrl+C` (with selection) or `Ctrl+Shift+C`
- **Paste**: `Ctrl+V` or `Ctrl+Shift+V`
- **Find**: `Ctrl+F`
- **Clear**: `Ctrl+K`

## Common Terminal Tasks

### Package Management
```bash
# Install dependencies
npm install

# Install specific package
npm install <package-name>

# Install dev dependency
npm install -D <package-name>

# Update packages
npm update

# Remove package
npm uninstall <package-name>

# Clear cache
npm cache clean --force
```

### Development Workflow
```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start

# Clean build artifacts
npm run clean
```

### Git Operations
```bash
# Check status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout branch-name

# View branches
git branch -a
```

### File Operations
```bash
# List files
ls -la

# Change directory
cd directory-name

# Go up one level
cd ..

# Create directory
mkdir new-directory

# Create file
touch new-file.txt

# Remove file
rm file-name

# Remove directory
rm -rf directory-name

# Copy file
cp source.txt destination.txt

# Move/rename file
mv old-name.txt new-name.txt
```

### Process Management
```bash
# View running processes
ps aux

# Find process by port
lsof -i :3000

# Kill process by PID
kill -9 <PID>

# Kill process by name
pkill -f node
```

## Project-Specific Tasks

### Available NPM Scripts
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes
npm run clean        # Clean build artifacts
```

### VS Code Tasks (Ctrl+Shift+P → "Tasks: Run Task")
- ABACO: Install Dependencies
- ABACO: Development Server
- ABACO: Build Production
- ABACO: Type Check
- ABACO: Lint Code
- ABACO: Clean Build
- ABACO: Streamlit Server

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or kill all node processes
pkill -f node
```

### Installation Errors
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Git Issues
```bash
# Reset local changes
git reset --hard

# Clean untracked files
git clean -fd

# Sync with remote
git pull origin main
```

### Build Failures
```bash
# Clean and rebuild
npm run clean
rm -rf .next node_modules/.cache
npm install
npm run build
```

## Shell Integration Features

### Command Navigation
- `Ctrl+Up`: Previous command in history
- `Ctrl+Down`: Next command in history
- Click decoration icons to see command status

### Link Detection
- **File paths**: Click to open in editor
- **URLs**: Click to open in browser
- **Error locations**: Click to jump to file:line

### Terminal Decorations
- ✓ Success (green): Command completed successfully
- ✗ Error (red): Command failed
- ⚠ Warning (yellow): Command completed with warnings

## Keyboard Shortcuts Reference

| Action | Shortcut |
|--------|----------|
| Open Terminal | `Ctrl + ` ` |
| New Terminal | `Ctrl+Shift+ ` ` |
| Split Terminal | `Ctrl+Shift+5` |
| Next Terminal | `Ctrl+PageDown` |
| Previous Terminal | `Ctrl+PageUp` |
| Clear Terminal | `Ctrl+K` |
| Find in Terminal | `Ctrl+F` |
| Copy | `Ctrl+C` / `Ctrl+Shift+C` |
| Paste | `Ctrl+V` / `Ctrl+Shift+V` |
| Scroll Up | `Ctrl+Up` |
| Scroll Down | `Ctrl+Down` |
| Scroll to Top | `Ctrl+Home` |
| Scroll to Bottom | `Ctrl+End` |
| Run Build Task | `Ctrl+Shift+B` |
| Run Task | `Ctrl+Shift+P` → "Tasks: Run Task" |

## Environment Setup

### Node.js Version Check
```bash
node --version     # Should be v18.x or v20.x
npm --version      # Should be v9.x or v10.x
```

### Environment Variables
```bash
# Check if .env.local exists
ls -la .env.local

# Copy from example if needed
cp .env.example .env.local
```

### Verify Installation
```bash
# Check dependencies installed
ls -la node_modules

# Verify package.json scripts
npm run
```

## Tips & Best Practices

1. **Use multiple terminals**: Keep separate terminals for dev server, git, and commands
2. **Split terminals**: Use `Ctrl+Shift+5` for side-by-side terminals
3. **Use tasks**: Automate repetitive commands with VS Code tasks
4. **Shell integration**: Enable for better command navigation and error detection
5. **Clear regularly**: Use `Ctrl+K` to clear terminal and improve performance
6. **Copy on selection**: Enable in settings for faster copying

## Additional Resources

- Full documentation: [docs/VSCODE_TERMINAL_GUIDE.md](../docs/VSCODE_TERMINAL_GUIDE.md)
- VS Code Docs: https://code.visualstudio.com/docs/terminal/basics
- Project README: [README.md](../README.md)

---

**Quick Access**: Pin this file for easy reference during development!
