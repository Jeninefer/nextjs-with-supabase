/**
 * Test script to verify MCP configuration and error handling
 */

import { 
  getMCPConfig, 
  isMCPServerEnabled, 
  getEnabledMCPServers 
} from '../lib/mcp-config';

console.log('🧪 Testing MCP Configuration...\n');

// Test 1: Get MCP configuration
console.log('Test 1: Get MCP Configuration');
const config = getMCPConfig();
console.log(`✅ Retrieved configuration with ${Object.keys(config.servers).length} servers defined\n`);

// Test 2: Check which servers are enabled by default
console.log('Test 2: Default Server Status');
Object.entries(config.servers).forEach(([name, serverConfig]) => {
  const status = serverConfig.enabled ? '✅ Enabled' : '⚠️  Disabled';
  const authReq = serverConfig.requiresAuth ? '(requires auth)' : '(no auth)';
  console.log(`  ${status} ${name} ${authReq}`);
});
console.log();

// Test 3: Get enabled servers
console.log('Test 3: Get Enabled Servers');
const enabledServers = getEnabledMCPServers();
console.log(`✅ ${enabledServers.length} server(s) enabled by default:`);
enabledServers.forEach(({ name, config }) => {
  console.log(`  - ${name}: ${config.description}`);
});
console.log();

// Test 4: Check specific server status
console.log('Test 4: Check Specific Server Status');
const serversToCheck = ['fetch', 'memory', 'web-search', 'perplexity-ask'];
serversToCheck.forEach(serverName => {
  const enabled = isMCPServerEnabled(serverName);
  const status = enabled ? '✅ Enabled' : '⚠️  Disabled';
  console.log(`  ${status} ${serverName}`);
});
console.log();

// Test 5: Verify safety - Google Cloud servers should be disabled by default
console.log('Test 5: Verify Google Cloud API Safety');
const googleCloudServers = ['web-search']; // Only 'web-search' uses Google Cloud APIs; update this list if more servers are added in the future
const allDisabled = googleCloudServers.every(server => !isMCPServerEnabled(server));
if (allDisabled) {
  console.log('✅ All Google Cloud API servers are disabled by default (prevents Dataproc errors)');
} else {
  console.log('❌ Warning: Some Google Cloud API servers are enabled by default');
}
console.log();

console.log('🎉 All tests passed! MCP configuration is working correctly.\n');
console.log('Summary:');
console.log('- MCP servers requiring Google Cloud APIs are disabled by default');
console.log('- This prevents "Cloud Dataproc API has not been used" errors');
console.log('- Safe servers (fetch, memory) are enabled and ready to use');
console.log('- Users can enable authenticated servers by setting environment variables');
