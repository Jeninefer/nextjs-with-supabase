# AI APIs Integration Guide

This project integrates multiple AI APIs: OpenAI (GPT), xAI (Grok), Figma API, Microsoft Learn MCP Server, and Claude Desktop MCP.

## Table of Contents

- [Setup](#setup)
- [OpenAI API](#openai-api)
- [xAI (Grok) API](#xai-grok-api)
- [Figma API](#figma-api)
- [Microsoft Learn MCP Server](#microsoft-learn-mcp-server)
- [Claude Desktop MCP Configuration](#claude-desktop-mcp-configuration)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Setup

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here

# xAI (Grok)
XAI_API_KEY=xai-your-key-here

# Figma
FIGMA_ACCESS_TOKEN=figd_your-token-here
FIGMA_FILE_KEY=nuVKwuPuLS7VmLFvqzOX1G
```

## Quick Start

```bash
# Install Supabase CLI (if not installed)
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/

# Initialize and start Supabase
supabase init
supabase start

# Start development
npm run dev
```

## OpenAI API

### Features

- GPT-4 and GPT-4 Turbo models
- Chat completions
- Function calling
- JSON mode
- Vision (image analysis)
- Streaming responses

### OpenAI Usage Examples

```javascript
import { openai } from './api/openai';

// Simple completion
const response = await openai.complete('Explain quantum computing');

// Chat completion
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' }
];
const result = await openai.chatCompletion(messages);

// Analyze Figma design
const analysis = await openai.analyzeFigmaDesign(designData, 'What can be improved?');

// Generate slide content
const slideContent = await openai.generateSlideContent('AI in Healthcare', 1, 10);
```

### Available Models

- `gpt-4-turbo` - Latest GPT-4 Turbo with 128K context
- `gpt-4` - GPT-4 with 8K context
- `gpt-3.5-turbo` - Fast and cost-effective with 16K context

### Pricing (January 2025)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| GPT-4 Turbo | $10.00 | $30.00 |
| GPT-4 | $30.00 | $60.00 |
| GPT-3.5 Turbo | $0.50 | $1.50 |

## xAI (Grok) API

### Features

- Grok-2 and Grok-beta models
- Real-time knowledge (up to current date)
- Conversational AI
- Code generation
- OpenAI-compatible API

### xAI Usage Examples

```javascript
import { xai } from './api/xai';

// Simple completion
const response = await xai.complete('What is happening in tech today?');

// Chat completion
const result = await xai.chatCompletion([
  { role: 'user', content: 'Explain AI trends in 2025' }
]);

// Test connection
const test = await xai.test();
console.log(test.response);
```

### Grok Models

- `grok-2-1212` - Latest Grok-2 model (recommended)
- `grok-2-vision-1212` - Grok-2 with vision capabilities
- `grok-beta` - Beta version

### xAI API Endpoint

```text
https://api.x.ai/v1/chat/completions
```

## Figma API

### Features

- Read file data
- Get specific nodes
- Export images (PNG, JPG, SVG, PDF)
- Comments management
- Version history

### Figma Usage

```javascript
import { figma } from './api/figma';

// Get entire file
const file = await figma.getFile('nuVKwuPuLS7VmLFvqzOX1G');

// Get specific frame
const frame = await figma.getFrame('nuVKwuPuLS7VmLFvqzOX1G', 'Deck 2');

// Extract all text
const textNodes = await figma.extractText('nuVKwuPuLS7VmLFvqzOX1G');

// Export images
const images = await figma.getImages('file-key', ['node-id-1', 'node-id-2'], {
  format: 'png',
  scale: 2
});

// Get comments
const comments = await figma.getComments('file-key');

// Post comment
await figma.postComment('file-key', 'Great design!', { x: 100, y: 200 });
```

### Figma API Endpoint

```text
https://api.figma.com/v1/
```

## Microsoft Learn MCP Server

### Features

- **Real-time Microsoft Documentation**: Access up-to-date Microsoft Learn content
- **Semantic Search**: Advanced vector search for contextually relevant docs
- **Code Sample Discovery**: Find official Microsoft/Azure code examples
- **Multi-language Support**: Filter code samples by programming language
- **Official Source of Truth**: Always get the latest official documentation

### MCP Server Endpoint

```text
https://learn.microsoft.com/api/mcp
```

### Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `microsoft_docs_search` | Semantic search against Microsoft documentation | `query` (string) |
| `microsoft_docs_fetch` | Fetch and convert docs page to markdown | `url` (string) |
| `microsoft_code_sample_search` | Search for code snippets | `query` (string), `language` (optional) |

### Setup in VS Code

1. **Automatic Setup** (Recommended):

   ```bash
   # Install in VS Code
   code --install-extension GitHub.copilot
   ```

2. **Manual Configuration**:
   Add to `.vscode/settings.json`:

   ```json
   {
     "mcp.servers": {
       "microsoft-docs": {
         "type": "http",
         "url": "https://learn.microsoft.com/api/mcp"
       }
     },
     "github.copilot.chat.mcp.enabled": true
   }
   ```

## Claude Desktop MCP Configuration

### Overview

Claude Desktop supports Model Context Protocol (MCP) for integrating custom data sources and tools directly into your conversations.

### Configuration File Location

- **Windows**: `%AppData%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux/Codespaces**: `~/.config/Claude/claude_desktop_config.json`

### Quick Setup (Automated)

Run the automated setup script:

```bash
cd /home/codespace/OfficeAddinApps/Figma
bash scripts/fix-claude-config.sh
```

### Manual Setup Instructions

1. **Open Configuration File**:

   **Linux/Codespaces**:

   ```bash
   mkdir -p ~/.config/Claude
   nano ~/.config/Claude/claude_desktop_config.json
   ```

   **macOS**:

   ```bash
   mkdir -p ~/Library/Application\ Support/Claude
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   **Windows**:

   ```powershell
   mkdir %AppData%\Claude
   notepad %AppData%\Claude\claude_desktop_config.json
   ```

2. **Add Configuration**:

   ```json
   {
     "mcpServers": {
       "microsoft-learn": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-microsoft-learn"]
       },
       "unity-mcp": {
         "command": "uv",
         "args": [
           "--directory",
           "/home/codespace/OfficeAddinApps/Figma/unity_mcp_server_src",
           "run",
           "server.py"
         ],
         "env": {
           "MCP_SERVER_PORT": "8080"
         }
       },
       "sonarqube-analysis": {
         "command": "npx",
         "args": ["sonarqube-scanner"],
         "env": {
           "SONAR_TOKEN": "your-token-here",
           "SONAR_HOST_URL": "http://localhost:9000"
         }
       }
     }
   }
   ```

3. **Save and Exit**:
   - **nano**: Ctrl+O → Enter → Ctrl+X
   - **notepad**: File → Save → Close

4. **Restart Claude Desktop**

### Troubleshooting Configuration

```bash
# Verificar ubicación correcta del archivo
ls -la ~/.config/Claude/claude_desktop_config.json  # Linux
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json  # macOS

# Validar JSON
cat ~/.config/Claude/claude_desktop_config.json | jq .

# Ver logs de Claude Desktop
tail -f ~/Library/Logs/Claude/main.log  # macOS
tail -f ~/.config/Claude/logs/main.log  # Linux

# Verificar permisos
chmod 644 ~/.config/Claude/claude_desktop_config.json
```

### Available MCP Servers

#### 1. Microsoft Learn MCP Server

**Purpose**: Access real-time Microsoft documentation and code samples

**Tools**:

- `microsoft_docs_search` - Search Microsoft Learn docs
- `microsoft_docs_fetch` - Fetch and convert docs to markdown
- `microsoft_code_sample_search` - Find code snippets

**Example Query**:

```text
"Can you search Microsoft Learn for Azure Functions best practices?"
```

#### 2. Clarity Analytics MCP Server

**Purpose**: Fetch website analytics data from Microsoft Clarity

**Tools**:

- `get-clarity-data` - Retrieve analytics data

**Required Parameters**:

- `numOfDays` (1-3): Number of days to retrieve
- `dimensions` (optional): Filter dimensions (e.g., Browser, Country, OS)
- `metrics` (optional): Metrics to retrieve (e.g., Sessions, PageViews, Traffic)

**Example Query**:

```text
"Can you fetch my Clarity data for the last day, filtered by Browser and showing Traffic metrics?"
```

**Response Format**:

```json
{
  "period": "2025-01-30",
  "dimensions": ["Browser"],
  "metrics": {
    "sessions": 1234,
    "pageViews": 5678,
    "avgSessionDuration": "00:03:45"
  },
  "breakdowns": {
    "Chrome": { "sessions": 800, "percentage": 64.8 },
    "Safari": { "sessions": 300, "percentage": 24.3 },
    "Firefox": { "sessions": 134, "percentage": 10.9 }
  }
}
```

#### 3. Unity MCP Server

**Purpose**: Execute Unity commands and get project status

**Tools**:

- `execute_unity_command` - Run Unity commands via MCP
- `get_unity_status` - Check Unity connection status

**Example Query**:

```text
"Can you create a cube object in Unity at position (0, 0, 0)?"
```

#### 4. SonarQube Analysis MCP Server

**Purpose**: Run code quality analysis and fetch metrics

**Tools**:

- `run_sonarqube_analysis` - Execute code analysis
- `get_quality_metrics` - Retrieve quality gate metrics

**Example Query**:

```text
"Can you run a SonarQube analysis on the current project?"
```

### Using MCP Servers in Claude Desktop

Once configured, you can interact with MCP servers naturally:

**Example Conversations**:

1. **Microsoft Documentation**:

   ```text
   You: "Search Microsoft Learn for Next.js deployment on Azure"

   Claude: [Uses microsoft_docs_search tool]
   "I found several resources about deploying Next.js to Azure..."
   ```

2. **Clarity Analytics**:

   ```text
   You: "Show me traffic metrics for the last 3 days grouped by country"

   Claude: [Prompts to run get-clarity-data with:
     numOfDays: 3
     dimensions: ["Country"]
     metrics: ["Sessions", "PageViews", "Traffic"]
   ]
   ```

3. **Unity Integration**:

   ```text
   You: "Create a red sphere in Unity at coordinates (5, 0, 5)"

   Claude: [Uses execute_unity_command tool with action: "create_object"]
   ```

4. **Code Quality**:

   ```text
   You: "Analyze code quality and show me bugs and vulnerabilities"
   
   Claude: [Uses run_sonarqube_analysis and get_quality_metrics]
   ```

### Environment Variables for MCP Servers

Add these to your MCP server configurations:

```json
{
  "mcpServers": {
    "clarity-analytics": {
      "env": {
        "CLARITY_API_KEY": "your-clarity-api-key",
        "CLARITY_PROJECT_ID": "your-project-id"
      }
    },
    "unity-mcp": {
      "env": {
        "MCP_SERVER_HOST": "0.0.0.0",
        "MCP_SERVER_PORT": "8080",
        "UNITY_PROJECT_PATH": "/path/to/unity/project"
      }
    },
    "sonarqube-analysis": {
      "env": {
        "SONAR_TOKEN": "your-sonar-token",
        "SONAR_HOST_URL": "http://localhost:9000",
        "SONAR_PROJECT_KEY": "abaco-office-addin"
      }
    }
  }
}
```

### Troubleshooting MCP Configuration

| Issue | Solution |
|-------|----------|
| MCP server not appearing | Restart Claude Desktop completely |
| Command not found error | Verify `command` path in config |
| Connection refused | Check server is running: `lsof -i :8080` |
| Permission denied | Make server script executable: `chmod +x server.py` |
| Environment variables not working | Check `.env` file exists and is loaded |

### Testing MCP Server Connection

```bash
# Test Unity MCP Server
curl http://localhost:8080/health

# Test SonarQube connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:9000/api/system/status

# Check Claude Desktop logs
# macOS: ~/Library/Logs/Claude/
# Windows: %AppData%\Claude\logs\
```

### Advanced Configuration

**Custom MCP Server with Multiple Tools**:

```json
{
  "mcpServers": {
    "abaco-custom": {
      "command": "node",
      "args": [
        "/home/codespace/OfficeAddinApps/Figma/custom-mcp-server.js"
      ],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}",
        "XAI_API_KEY": "${XAI_API_KEY}",
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}",
        "FIGMA_FILE_KEY": "${FIGMA_FILE_KEY}",
        "NEXT_PUBLIC_SUPABASE_URL": "${NEXT_PUBLIC_SUPABASE_URL}",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": "${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
      }
    }
  }
}
```

### MCP Server Development

To create your own MCP server:

1. **Install MCP SDK**:

   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. **Create Server**:

   ```typescript
   import { Server } from '@modelcontextprotocol/sdk/server/index.js';
   import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
   
   const server = new Server({
     name: 'abaco-mcp-server',
     version: '1.0.0',
   }, {
     capabilities: {
       tools: {},
     },
   });
   
   // Define tools
   server.setRequestHandler('tools/list', async () => ({
     tools: [
       {
         name: 'fetch_figma_data',
         description: 'Fetch data from Figma',
         inputSchema: {
           type: 'object',
           properties: {
             fileKey: { type: 'string' }
           }
         }
       }
     ]
   }));
   ```

3. **Add to Claude Config**:

   ```json
   {
     "mcpServers": {
       "abaco-custom": {
         "command": "node",
         "args": ["./custom-server.js"]
       }
     }
   }
   ```

### Security Best Practices for MCP

1. **Never commit API keys in config**:
   - Use environment variables
   - Store sensitive data in `.env` files
   - Reference with `${VARIABLE_NAME}` in config

2. **Validate inputs**:
   - Check parameters before execution
   - Sanitize user input
   - Implement rate limiting

3. **Use least privilege**:
   - Grant minimal required permissions
   - Separate read/write access
   - Use scoped tokens

4. **Monitor usage**:
   - Log MCP server requests
   - Track API usage
   - Set up alerts for anomalies

## Usage Examples

### Example 1: AI-Powered Design Analysis

```javascript
import { figma } from './api/figma';
import { openai } from './api/openai';

async function analyzeDesign() {
  const file = await figma.getFile('nuVKwuPuLS7VmLFvqzOX1G');
  const analysis = await openai.analyzeFigmaDesign(
    file.document,
    'Analyze the color scheme and suggest improvements'
  );
  console.log(analysis);
}
```

### Example 2: Generate Presentation Content

```javascript
import { openai } from './api/openai';
import { xai } from './api/xai';

async function generatePresentation(topic, slideCount = 10) {
  const slides = [];
  for (let i = 1; i <= slideCount; i++) {
    const content = await openai.generateSlideContent(topic, i, slideCount);
    slides.push(content);
  }
  return slides;
}
```

### Example 3: Figma to PowerPoint

```javascript
import { figma } from './api/figma';

async function exportFigmaSlides(fileKey) {
  const file = await figma.getFile(fileKey);
  const frames = file.document.children[0].children.filter(
    node => node.type === 'FRAME'
  );
  
  const nodeIds = frames.map(f => f.id);
  const images = await figma.getImages(fileKey, nodeIds, {
    format: 'png',
    scale: 2
  });
  
  return images;
}
```

## Best Practices

### 1. API Key Security

```javascript
// ✅ Good - Use environment variables
const apiKey = process.env.OPENAI_API_KEY;

// ❌ Bad - Hardcoded keys
const apiKey = 'sk-proj-abc123';
```

### 2. Error Handling

```javascript
try {
  const response = await openai.complete(prompt);
  console.log(response);
} catch (error) {
  console.error('API Error:', error.message);
  if (error.response?.status === 429) {
    console.log('Rate limit exceeded. Retrying...');
  }
}
```

### 3. Rate Limiting

```javascript
async function callWithRetry(apiFunction, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFunction();
    } catch (error) {
      if (error.response?.status !== 429 || i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### 4. Caching

```javascript
const cache = new Map();

async function getFigmaFile(fileKey, cacheDuration = 300000) {
  const cached = cache.get(fileKey);
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    return cached.data;
  }
  
  const file = await figma.getFile(fileKey);
  cache.set(fileKey, { data: file, timestamp: Date.now() });
  return file;
}
```

## API Reference

### OpenAI Methods

- `chatCompletion(messages, options)` - Chat completion
- `complete(prompt, systemPrompt, options)` - Simple completion
- `analyzeFigmaDesign(designData, question)` - AI design analysis
- `generateSlideContent(topic, slideNumber, totalSlides)` - Generate slides

### xAI Methods

- `chatCompletion(messages, options)` - Chat with Grok
- `complete(prompt, systemPrompt, options)` - Simple completion
- `test()` - Test connection

### Figma Methods

- `getFile(fileKey)` - Get entire file
- `getFileNodes(fileKey, nodeIds)` - Get specific nodes
- `getImages(fileKey, nodeIds, options)` - Export images
- `getComments(fileKey)` - Get comments
- `postComment(fileKey, message, position)` - Post comment
- `getFrame(fileKey, frameName)` - Get specific frame
- `extractText(fileKey)` - Extract all text nodes

## Troubleshooting

### Common API Issues

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Regenerate key and update .env |
| 403 Forbidden | Insufficient permissions | Check token scopes |
| 404 Not Found | Invalid file/resource ID | Verify IDs are correct |
| 429 Rate Limited | Too many requests | Implement retry with backoff |
| 500 Server Error | API service issue | Wait and retry |

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [xAI API Documentation](https://docs.x.ai/)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Office Add-ins Documentation](https://learn.microsoft.com/en-us/office/dev/add-ins/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Desktop MCP Documentation](https://docs.anthropic.com/claude/docs/model-context-protocol)
- [Microsoft Clarity API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api)

## Support

For API-specific issues:

- **OpenAI**: [help.openai.com](https://help.openai.com/)
- **xAI**: [x.ai/support](https://x.ai/support)
- **Figma**: [help.figma.com](https://help.figma.com/)
- **Claude Desktop**: [support.anthropic.com](https://support.anthropic.com/)
- **Microsoft Clarity**: [clarity.microsoft.com/support](https://clarity.microsoft.com/support)

---

**Last Updated:** January 2025
