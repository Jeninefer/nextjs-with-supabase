# MCP (Model Context Protocol) Configuration Guide

## Overview

The ABACO platform uses MCP servers to integrate with various AI and data services. This guide explains how to configure and troubleshoot MCP integrations.

## Common Issues

### Cloud Dataproc API Error

**Error Message:**
```
Error listing clusters: Error: Cloud Dataproc API has not been used in project gen-lang-client-0516194156 
before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/dataproc.googleapis.com/overview?project=gen-lang-client-0516194156 
then retry. If you enabled this API recently, wait a few minutes for the action to propagate to our systems and retry.
```

**Cause:** This error occurs when an MCP server (typically Google-related services) tries to access Google Cloud APIs that are not enabled in the underlying Google Cloud project.

**Solution:** The ABACO platform has been updated to handle this gracefully. MCP servers that require Google Cloud APIs are now disabled by default. The application will continue to function without them.

**If you need Google Cloud features:**
1. Ensure you have a Google Cloud project set up
2. Enable the required APIs in your project
3. Set the appropriate environment variables (see Configuration section below)

## MCP Server Configuration

MCP servers are configured in `/lib/mcp-config.ts`. Each server can be enabled or disabled independently.

### Available Servers

| Server | Status | Requires Auth | Description |
|--------|--------|---------------|-------------|
| `fetch` | Enabled by default | No | HTTP fetch server for external data retrieval |
| `memory` | Enabled by default | No | In-memory storage for temporary data |
| `perplexity-ask` | Disabled by default | Yes | Perplexity AI search integration |
| `brave-search` | Disabled by default | Yes | Brave search integration |
| `web-search` | Disabled by default | Yes | Google Custom Search (requires Google Cloud API) |

### Environment Variables

To enable authenticated MCP servers, set the following environment variables:

#### Perplexity AI
```bash
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_api_key_here
```

#### Brave Search
```bash
NEXT_PUBLIC_BRAVE_API_KEY=your_api_key_here
```

#### Google Custom Search
```bash
NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
```

## Troubleshooting

### Application works with limited features

If you see messages like:
```
⚠️ No MCP servers could be initialized. The application will work with limited features.
```

This is normal and expected when API keys are not configured. The core ABACO functionality will still work.

### Checking which servers are initialized

Open your browser console when the application loads. You'll see messages like:
```
✅ Initialized MCP server: fetch
✅ Initialized MCP server: memory
✅ Successfully initialized 2 MCP server(s): fetch, memory
```

### Enabling/Disabling Servers

To enable or disable a server, edit `/lib/mcp-config.ts`:

```typescript
export const defaultMCPConfig: MCPConfiguration = {
  servers: {
    'your-server-name': {
      enabled: true, // Change to false to disable
      // ... rest of configuration
    }
  }
};
```

## Error Handling

The MCP integration now includes comprehensive error handling:

1. **Individual server failures don't affect other servers** - If one server fails to initialize, others will continue
2. **Graceful degradation** - The application continues to function even if all MCP servers fail
3. **Informative logging** - Check the browser console for detailed initialization status
4. **Google Cloud API detection** - Specific guidance is provided for Google Cloud-related errors

## Best Practices

1. **Start with defaults** - The default configuration enables only servers that don't require authentication
2. **Enable as needed** - Only enable and configure servers you actually need
3. **Check logs** - Always review browser console logs during development to understand which services are available
4. **Environment-specific config** - Use different API keys for development and production environments

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for detailed error messages
2. Verify your environment variables are correctly set
3. Ensure API keys are valid and have the necessary permissions
4. Review the server logs for any initialization errors

For Google Cloud-specific issues, refer to the [Google Cloud Documentation](https://cloud.google.com/docs).
