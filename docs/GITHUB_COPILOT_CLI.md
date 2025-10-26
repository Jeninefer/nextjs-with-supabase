# GitHub Copilot CLI (Public Preview)

## 🚀 Overview
GitHub Copilot CLI brings the GitHub Copilot coding agent directly into your terminal, so you can build, debug, and understand code without leaving the command line. It combines terminal-native workflows with deep GitHub integration and agentic capabilities that can plan and execute complex development tasks.

### Key Capabilities
- **Terminal-native development**: Collaborate with the Copilot coding agent entirely within your shell.
- **Built-in GitHub integration**: Access repositories, issues, and pull requests using natural language, authenticated with your GitHub account.
- **Agentic workflow support**: Ask the agent to build, edit, refactor, or debug code while previewing every action before it runs.
- **MCP-powered extensibility**: Extend Copilot with additional Model Context Protocol (MCP) servers, including the default GitHub MCP server.
- **Full execution control**: Review and approve every command before it executes locally.

## 🧰 Supported Platforms & Prerequisites
GitHub Copilot CLI is available on Linux, macOS, and Windows. Before installing, ensure you have:

| Requirement | Minimum Version | Notes |
|-------------|-----------------|-------|
| Node.js     | 22              | Required runtime |
| npm         | 10              | Required package manager |
| PowerShell  | 6               | Windows only |
| GitHub Copilot subscription | — | Organizational policies may restrict access |

> **Tip:** If your Copilot access is managed by an organization or enterprise, confirm that GitHub Copilot CLI is enabled in the organization settings before proceeding.

## 📦 Installation
Install the CLI globally using npm:

```bash
npm install -g @github/copilot
```

## 🚪 Launching the CLI
Start GitHub Copilot CLI from the terminal in the folder that contains the code you want to work with:

```bash
copilot
```

The first launch displays an animated welcome banner. To view it again later, re-run Copilot with the `--banner` flag:

```bash
copilot --banner
```

## 🔐 Authentication
If you are not logged in, Copilot prompts you to authenticate using the `/login` slash command. Follow the on-screen steps to authorize your GitHub account.

### Authenticating with a Personal Access Token (PAT)
You can authenticate using a fine-grained PAT that has the **Copilot Requests** permission:

1. Visit <https://github.com/settings/personal-access-tokens/new>.
2. Under **Permissions**, select **Copilot Requests**.
3. Generate the token.
4. Export it as an environment variable:
   - `GH_TOKEN` (preferred)
   - `GITHUB_TOKEN` (fallback)

## 🧠 Choosing Models
Copilot CLI defaults to **Claude Sonnet 4.5**. Run the `/model` slash command to explore other available models, such as Claude Sonnet 4 or GPT-5, and select the one that best fits your task.

## 💡 Usage Tips
- Launch Copilot in the repository or project directory you want to work with so the agent can leverage local context.
- Interact through natural language prompts and slash commands.
- Preview and approve every action suggested by the agent to maintain full control over your environment.

> **Note on Quotas:** Each prompt consumes one premium request from your monthly Copilot allocation. Refer to GitHub's documentation on premium requests if you need more details about consumption and limits.

## 📣 Feedback & Updates
GitHub Copilot CLI is in public preview and updated frequently. Keep your installation current to benefit from the latest fixes and features. Share feedback by:

- Opening issues or joining discussions in the official repository.
- Running the `/feedback` command inside the CLI to submit a confidential survey.

Your insights help improve the Copilot CLI experience for everyone.
