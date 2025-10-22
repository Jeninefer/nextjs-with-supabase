const https = require('https');
const http = require('http');

const urls = [
  { url: 'https://platform.openai.com/', expectRedirect: true },
  { url: 'https://platform.openai.com/docs/api-reference', expectRedirect: true },
  { url: 'https://console.x.ai/', expectRedirect: true },
  { url: 'https://www.figma.com/settings', expectRedirect: true },
  { url: 'https://api.x.ai/v1/chat/completions', isApi: true },
  { url: 'https://api.figma.com/v1/', isApi: true },
  { url: 'https://docs.x.ai/', expectRedirect: true },
  { url: 'https://www.figma.com/developers/api', expectRedirect: true },
  { url: 'https://help.openai.com/', expectRedirect: true },
  { url: 'https://help.figma.com/', expectRedirect: true }
];

async function testUrl(urlInfo) {
  return new Promise((resolve) => {
    const { url, expectRedirect, isApi } = urlInfo;
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      const status = res.statusCode;
      let ok = false;
      
      if (isApi) {
        // API endpoints: 401, 404, 405 are expected without auth
        ok = [401, 404, 405].includes(status);
      } else if (expectRedirect) {
        // Web pages: 200-399 are all acceptable
        ok = (status >= 200 && status < 400);
      } else {
        // Direct pages: 200-299 only
        ok = (status >= 200 && status < 300);
      }
      
      resolve({
        url,
        status,
        ok,
        type: isApi ? 'API' : (expectRedirect ? 'Web' : 'Doc')
      });
    });
    
    request.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        ok: false,
        error: err.message,
        type: 'Error'
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        ok: false,
        type: 'Timeout'
      });
    });
  });
}

async function testAllUrls() {
  console.log('🔗 Testing URLs...\n');
  
  const results = await Promise.all(urls.map(testUrl));
  
  let passCount = 0;
  let failCount = 0;
  
  results.forEach(result => {
    const icon = result.ok ? '✅' : '❌';
    console.log(`${icon} [${result.type}] ${result.url}`);
    console.log(`   Status: ${result.status}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    console.log('');
    
    if (result.ok) passCount++;
    else failCount++;
  });
  
  console.log('═══════════════════════════════════════');
  console.log(`Total: ${results.length} URLs`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('═══════════════════════════════════════');
  
  if (failCount === 0) {
    console.log('\n🎉 All URLs are working correctly!');
  } else {
    console.log(`\n⚠️  ${failCount} URL(s) may require authentication or have issues`);
  }
}

testAllUrls().catch(console.error);
