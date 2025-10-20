# MCP Server Configuration Guide for ABACO Financial Intelligence Platform

## Overview

This guide explains how to configure Model Context Protocol (MCP) servers for the ABACO Financial Intelligence Platform. MCP servers provide enhanced capabilities for financial data analysis, market research, and AI-powered insights.

## Required API Keys

### 1. Perplexity API Key
- **Purpose**: Financial market research and analysis
- **Sign up**: https://www.perplexity.ai/
- **Key format**: `pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Brave Search API Key
- **Purpose**: Web search for financial news and data
- **Sign up**: https://api.search.brave.com/
- **Key format**: `BSAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. GitHub Personal Access Token
- **Purpose**: Repository management and code analysis
- **Create**: GitHub Settings > Developer settings > Personal access tokens
- **Scopes**: `repo`, `read:org`

### 4. Google Search API Key
- **Purpose**: Enhanced web search capabilities
- **Setup**: Google Cloud Console > APIs & Services > Credentials
- **Also need**: Custom Search Engine ID

## Quick Setup

### 1. Install Dependencies

```bash
npm install @modelcontextprotocol/sdk
```

### 2. Configure Environment Variables

Create or update `.env.local`:

```bash
# MCP Server API Keys
PERPLEXITY_API_KEY=pplx-your-api-key-here
BRAVE_API_KEY=your-brave-api-key-here
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token-here
GOOGLE_SEARCH_API_KEY=your-google-api-key-here
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id-here

# xAI Grok API (for AI insights)
NEXT_PUBLIC_GROK_API_KEY=your-grok-api-key-here
```

### 3. Test MCP Configuration

```bash
# Test if MCP servers can be reached
npx -y server-perplexity-ask --help
npx -y @modelcontextprotocol/server-fetch --help
```

### 4. Initialize in Your Application

```typescript
import { useMCPIntegration } from '@/app/dashboard/financial/hooks/useMCPIntegration';

function FinancialDashboard() {
  const { isInitialized, searchFinancialInsights } = useMCPIntegration();
  
  // Use MCP capabilities in your components
}
```

## Available MCP Servers

### Core Servers

1. **Perplexity Ask** - AI-powered financial research
2. **Fetch** - Web data retrieval
3. **Memory** - Persistent data storage
4. **Filesystem** - Local file operations
5. **Postgres** - Database operations

### Optional Servers

1. **Brave Search** - Enhanced web search
2. **GitHub** - Repository management
3. **Web Search** - Google search integration
4. **Puppeteer** - Web scraping
5. **SQLite** - Local database operations

## ABACO-Specific Usage

### Financial Market Research

```typescript
const insights = await searchFinancialInsights(
  "Current trends in lending market and default rates"
);
```

### Market Data Fetching

```typescript
const marketData = await fetchMarketData(
  "https://api.example.com/financial-data"
);
```

### Analysis Storage

```typescript
await storeAnalysisResult("portfolio_2024_q4", {
  metrics: financialMetrics,
  risks: riskAnalysis,
  projections: growthProjections
});
```

## Troubleshooting

### Common Issues

1. **Server Not Found**: Ensure NPX can access the MCP server packages
2. **API Key Errors**: Verify environment variables are set correctly
3. **Connection Timeouts**: Check network connectivity and API quotas
4. **Permission Errors**: Ensure proper API key permissions

### Debug Commands

```bash
# Check environment variables
env | grep API_KEY

# Test network connectivity
curl -I https://api.perplexity.ai/

# Verify NPX package access
npx -y server-perplexity-ask --version
```

### Fallback Mode

If MCP servers fail to initialize, the ABACO platform will automatically fall back to:
- Rule-based analysis instead of AI insights
- Direct HTTP requests instead of MCP fetch
- Local storage instead of MCP memory

## Best Practices

### Security

- Store API keys in environment variables only
- Never commit API keys to version control
- Use different keys for development and production
- Regularly rotate API keys

### Performance

- Initialize MCP servers once per session
- Cache frequently accessed data using memory server
- Use batch operations when possible
- Monitor API quotas and rate limits

### Error Handling

- Always check MCP response success status
- Implement fallback mechanisms
- Log errors for debugging
- Provide user-friendly error messages

## Production Deployment

### Vercel Configuration

Add environment variables in Vercel dashboard:

```
PERPLEXITY_API_KEY=@perplexity_api_key
BRAVE_API_KEY=@brave_api_key
GITHUB_PERSONAL_ACCESS_TOKEN=@github_token
```

### Docker Environment

```dockerfile
ENV PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
ENV BRAVE_API_KEY=${BRAVE_API_KEY}
ENV GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_PERSONAL_ACCESS_TOKEN}
```

## Support

For MCP-related issues:
1. Check MCP server documentation
2. Verify API key validity
3. Test with minimal configuration
4. Review ABACO platform logs

## Version Compatibility

- MCP SDK: ^0.5.0
- Node.js: 18+
- Next.js: 14+
- TypeScript: 5+

---

*This guide is part of the ABACO Financial Intelligence Platform documentation.*
