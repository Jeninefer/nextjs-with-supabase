# VS Code Extensions Guide

This guide covers the recommended VS Code extensions for this project and how to use them effectively.

## Recommended Extensions

This project recommends the following VS Code extensions to enhance your development experience:

### 1. Edge DevTools for VS Code
**Extension ID:** `ms-edgedevtools.vscode-edge-devtools`

Provides browser debugging tools directly in VS Code for testing web applications.

### 2. ESLint
**Extension ID:** `dbaeumer.vscode-eslint`

Integrates ESLint JavaScript linting into VS Code. Helps maintain code quality and consistency.

### 3. Prettier - Code Formatter
**Extension ID:** `esbenp.prettier-vscode`

Automatic code formatting to ensure consistent code style across the project.

### 4. Microsoft Office Add-in Debugger
**Extension ID:** `msoffice.microsoft-office-add-in-debugger`

Essential for debugging Office Add-ins in PowerPoint, Word, and Excel.

### 5. SQL Server (mssql)
**Extension ID:** `ms-mssql.mssql`

Microsoft's official SQL Server extension for VS Code. Provides rich SQL editing, querying, and database management capabilities.

## How to View MSSQL Extension Release Notes

### Method 1: Through VS Code Extensions Panel

1. Open VS Code
2. Click on the **Extensions** icon in the Activity Bar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "**mssql**" or "**SQL Server**"
4. Click on the **SQL Server (mssql)** extension
5. In the extension details page, click on the **Changelog** tab
6. Scroll through to view release notes for all versions

### Method 2: Through the Command Palette

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type: `Extensions: Show Extension Changelog`
3. Select **SQL Server (mssql)** from the list
4. View the complete changelog

### Method 3: Online Release Notes

Visit the official GitHub repository:
- **GitHub Releases**: [https://github.com/microsoft/vscode-mssql/releases](https://github.com/microsoft/vscode-mssql/releases)
- **VS Code Marketplace**: [https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql](https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql)

### Method 4: Check Current Version

To check which version you have installed:

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type: `Extensions: Show Installed Extensions`
3. Find **SQL Server (mssql)**
4. The version number is displayed next to the extension name

## Installing Recommended Extensions

### Automatic Installation

When you open this project in VS Code, you should see a notification:

> "This workspace has extension recommendations."

Click **"Install All"** to install all recommended extensions at once.

### Manual Installation

If you don't see the notification:

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type: `Extensions: Show Recommended Extensions`
3. Install the extensions individually or click **"Install All Workspace Recommendations"**

### Via Command Line

You can also install extensions using the VS Code CLI:

```bash
# Install MSSQL extension
code --install-extension ms-mssql.mssql

# Install all recommended extensions
code --install-extension ms-edgedevtools.vscode-edge-devtools
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension msoffice.microsoft-office-add-in-debugger
code --install-extension ms-mssql.mssql
```

## MSSQL Extension Features

### Key Capabilities

- **IntelliSense**: Smart SQL code completion
- **Query Execution**: Run T-SQL queries and view results
- **Connection Management**: Connect to SQL Server, Azure SQL Database, and Azure SQL Data Warehouse
- **Object Explorer**: Browse database objects
- **Snippets**: Quick SQL code snippets
- **Export Results**: Export query results to JSON, CSV, or Excel
- **Integrated Terminal**: Execute queries in the integrated terminal

### Quick Start with MSSQL Extension

1. **Create a Connection**
   - Press `Ctrl+Shift+P` / `Cmd+Shift+P`
   - Type: `MS SQL: Connect`
   - Enter connection details

2. **Run a Query**
   - Create a new `.sql` file
   - Write your SQL query
   - Press `Ctrl+Shift+E` / `Cmd+Shift+E` to execute

3. **View Results**
   - Results appear in a new editor tab
   - Switch between Results and Messages tabs

## Compatibility Note

> **Note:** The MSSQL extension is **not required** for developing or running this project. This project uses **Supabase (PostgreSQL)** as its primary database. The MSSQL extension is included here for general developer convenience, in case you work with SQL Server in other projects, need to migrate data, or want to practice T-SQL.

The MSSQL extension can be useful for:
- Developers working with SQL Server in other projects
- Learning and practicing T-SQL
- Migrating data from SQL Server to PostgreSQL
- Enterprise environments that use both databases

For PostgreSQL-specific support in VS Code, you may also want to consider:
- **PostgreSQL** extension by Chris Kolkman (`ckolkman.vscode-postgres`)

## Troubleshooting

### Extension Not Working

1. **Reload VS Code**: Press `Ctrl+Shift+P` / `Cmd+Shift+P` → `Developer: Reload Window`
2. **Check Extension**: Ensure the extension is enabled in the Extensions panel
3. **Update Extension**: Right-click on the extension → "Update to ..."
4. **Check Logs**: View → Output → Select "SQL Server (mssql)" from dropdown

### Cannot Connect to Database

1. Verify your connection string
2. Check firewall settings
3. Ensure SQL Server is running
4. Verify authentication credentials

## Additional Resources

- **MSSQL Extension Documentation**: [https://github.com/microsoft/vscode-mssql](https://github.com/microsoft/vscode-mssql)
- **VS Code Extension Marketplace**: [https://marketplace.visualstudio.com/vscode](https://marketplace.visualstudio.com/vscode)
- **SQL Server Documentation**: [https://learn.microsoft.com/sql/](https://learn.microsoft.com/sql/)

## Updating Extensions

To keep your extensions up to date:

1. Open Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Click the **"..."** menu in the top right
3. Select **"Check for Extension Updates"**
4. Click **"Update All"** or update individually

Or enable auto-update:
- File → Preferences → Settings
- Search for "extensions auto update"
- Set to **"Extensions: Auto Update": "all"**

---

**Last Updated:** October 2025  
For project-specific documentation, see [README.md](README.md)
