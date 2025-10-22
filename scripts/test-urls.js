const https = require('https');
const http = require('http');

const urls = [
  { url: 'https://platform.openai.com/', expectRedirect: true },
  { url: 'https://platform.openai.com/docs/api-reference', expectRedirect: false },
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
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLTester/1.0)'
      }
    }, (res) => {
      const status = res.statusCode;
      let ok = false;
      
      if (isApi) {
        // API endpoints should return 401 (unauthorized) or 405 (method not allowed)
        ok = status === 401 || status === 405 || status === 404;
      } else if (expectRedirect) {
        // Web pages often redirect
        ok = (status >= 200 && status < 400);
      } else {
        // Normal pages
        ok = status >= 200 && status < 300;
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
  
  results.forEach(result => {
    const icon = result.ok ? '✅' : '❌';
    console.log(`${icon} [${result.type}] ${result.url}`);
    console.log(`   Status: ${result.status}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    console.log('');
  });
  
  const failed = results.filter(r => !r.ok);
  if (failed.length === 0) {
    console.log('✅ All URLs are accessible!');
  } else {
    console.log(`⚠️  ${failed.length} URL(s) returned unexpected status (may require authentication)`);
  }
}

testAllUrls().catch(console.error);
