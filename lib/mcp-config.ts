/**
 * MCP (Model Context Protocol) Server Configuration
 * 
 * This configuration manages MCP server integrations for the ABACO platform.
 * Servers can be enabled/disabled based on available credentials and requirements.
 */

export interface MCPServerConfig {
  enabled: boolean;
  command: string;
  args: string[];
  env?: Record<string, string | undefined>;
  requiresAuth?: boolean;
  description?: string;
}

export interface MCPConfiguration {
  servers: Record<string, MCPServerConfig>;
}

/**
 * Default MCP configuration
 * Servers that require Google Cloud APIs or other external services are disabled by default
 * to prevent errors when those services are not configured.
 */
export const defaultMCPConfig: MCPConfiguration = {
  servers: {
    'perplexity-ask': {
      enabled: false, // Disabled by default - requires API key
      command: 'npx',
      args: ['-y', 'server-perplexity-ask'],
      env: { 
        PERPLEXITY_API_KEY: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY 
      },
      requiresAuth: true,
      description: 'Perplexity AI search integration'
    },
    'fetch': {
      enabled: true, // Safe to enable - no auth required
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch'],
      description: 'HTTP fetch server for external data retrieval'
    },
    'memory': {
      enabled: true, // Safe to enable - no auth required
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
      description: 'In-memory storage for temporary data'
    },
    'brave-search': {
      enabled: false, // Disabled by default - requires API key
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: {
        BRAVE_API_KEY: process.env.NEXT_PUBLIC_BRAVE_API_KEY
      },
      requiresAuth: true,
      description: 'Brave search integration'
    },
    'web-search': {
      enabled: false, // Disabled by default - may use Google Cloud APIs
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-web-search'],
      env: {
        GOOGLE_SEARCH_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY,
        GOOGLE_SEARCH_ENGINE_ID: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID
      },
      requiresAuth: true,
      description: 'Google Custom Search integration (requires Google Cloud API)'
    }
  }
};

/**
 * Get MCP configuration with runtime overrides
 */
export function getMCPConfig(): MCPConfiguration {
  // In the future, this could read from environment variables or a config file
  // to allow runtime configuration of which servers to enable
  // Deep copy servers and their configs to avoid mutating defaultMCPConfig
  const config: MCPConfiguration = {
    servers: Object.fromEntries(
      Object.entries(defaultMCPConfig.servers).map(([name, serverConfig]) => {
        // Determine if we should auto-enable this server
        let autoEnabled = serverConfig.enabled;
        if (serverConfig.env && serverConfig.requiresAuth) {
          const hasAllEnvVars = Object.values(serverConfig.env).every(
            value => value && value.length > 0
          );
          if (hasAllEnvVars && !serverConfig.enabled) {
            console.log(`Auto-enabling ${name} - credentials detected`);
            autoEnabled = true;
          }
        }
        return [
          name,
          {
            ...serverConfig,
            enabled: autoEnabled,
            env: serverConfig.env ? { ...serverConfig.env } : undefined
          }
        ];
      })
    )
  };
  
  return config;
}

/**
 * Check if a specific MCP server is enabled
 */
export function isMCPServerEnabled(serverName: string): boolean {
  const config = getMCPConfig();
  return config.servers[serverName]?.enabled ?? false;
}

/**
 * Get list of enabled MCP servers
 */
export function getEnabledMCPServers(): Array<{ name: string; config: MCPServerConfig }> {
  const config = getMCPConfig();
  return Object.entries(config.servers)
    .filter(([_, serverConfig]) => serverConfig.enabled)
    .map(([name, serverConfig]) => ({ name, config: serverConfig }));
}
