const https = require('https');
const http = require('http');

const urls = [
  'https://platform.openai.com/',
  'https://platform.openai.com/api-keys',
  'https://console.x.ai/',
  'https://www.figma.com/settings',
  'https://api.x.ai/v1/chat/completions',
  'https://api.figma.com/v1/',
  'https://platform.openai.com/docs/api-reference',
  'https://docs.x.ai/',
  'https://www.figma.com/developers/api',
  'https://help.openai.com/',
  'https://help.figma.com/'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, { timeout: 5000 }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 400
      });
    });
    
    request.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        ok: false,
        error: err.message
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        ok: false
      });
    });
  });
}

async function testAllUrls() {
  console.log('🔗 Testing URLs...\n');
  
  const results = await Promise.all(urls.map(testUrl));
  
  results.forEach(result => {
    const icon = result.ok ? '✅' : '❌';
    console.log(`${icon} ${result.url}`);
    console.log(`   Status: ${result.status}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    console.log('');
  });
  
  const failed = results.filter(r => !r.ok);
  if (failed.length === 0) {
    console.log('✅ All URLs are working!');
  } else {
    console.log(`❌ ${failed.length} URL(s) failed`);
  }
}

testAllUrls().catch(console.error);
