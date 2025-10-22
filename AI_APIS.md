# AI APIs Integration Guide

This project integrates multiple AI APIs: OpenAI (GPT), xAI (Grok), and Figma API.

## Table of Contents

- [Setup](#setup)
- [OpenAI API](#openai-api)
- [xAI (Grok) API](#xai-grok-api)
- [Figma API](#figma-api)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Setup

### 1. Get API Keys

#### OpenAI

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

#### xAI (Grok)

1. Go to [xAI Console](https://console.x.ai/)
2. Sign up for API access
3. Navigate to API settings
4. Generate an API key
5. Copy the key

#### Figma

1. Go to [Figma Settings](https://www.figma.com/settings)
2. Scroll to "Personal Access Tokens"
3. Click "Create new token"
4. Name it and copy the token (starts with `figd_`)

### 2. Configure Environment Variables

Add to your `.env` file:

```env
OPENAI_API_KEY=sk-proj-your-key-here
XAI_API_KEY=xai-your-key-here
FIGMA_ACCESS_TOKEN=figd_your-token-here
FIGMA_FILE_KEY=your-figma-file-key
```

### 3. Extract Figma File Key

From your Figma URL:

```text
https://www.figma.com/design/nuVKwuPuLS7VmLFvqzOX1G/Create-Dark-Editable-Slides
```

The file key is: `nuVKwuPuLS7VmLFvqzOX1G`

## OpenAI API

### Features

- GPT-4 and GPT-4 Turbo models
- Chat completions
- Function calling
- JSON mode
- Vision (image analysis)
- Streaming responses

### OpenAI Usage

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

### xAI Usage

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

```
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

```
https://api.figma.com/v1/
```

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

## Support

For API-specific issues:

- **OpenAI**: [help.openai.com](https://help.openai.com/)
- **xAI**: [x.ai/support](https://x.ai/support)
- **Figma**: [help.figma.com](https://help.figma.com/)

---

*Last Updated: January 2025*
