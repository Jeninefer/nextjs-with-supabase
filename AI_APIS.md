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

1. Go to [xAI](https://x.ai/)
2. Sign up for API access
3. Navigate to API settings
4. Generate an API key
5. Copy the key (starts with `xai-`)

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
```
https://www.figma.com/file/nuVKwuPuLS7VmLFvqzOX1G/Create-Dark-Editable-Slides
```

The file key is: `nuVKwuPuLS7VmLFvqzOX1G` (already configured as default)

## OpenAI API

### Features

- GPT-4 Turbo and GPT-3.5 Turbo
- Chat completions
- Function calling
- JSON mode
- Vision (image analysis)

### Usage

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

### Models Available

- `gpt-4-turbo-preview` - Latest GPT-4 Turbo
- `gpt-4` - GPT-4
- `gpt-3.5-turbo` - Fast and cost-effective

### Pricing (as of 2025)

| Model | Input | Output |
|-------|-------|--------|
| GPT-4 Turbo | $0.01/1K tokens | $0.03/1K tokens |
| GPT-3.5 Turbo | $0.0005/1K tokens | $0.0015/1K tokens |

## xAI (Grok) API

### Features

- Grok-beta model
- Real-time knowledge
- Conversational AI
- Creative writing
- Code generation

### Usage

```javascript
import { xai } from './api/xai';

// Simple completion
const response = await xai.complete('What is happening in tech today?');

// Real-time analysis
const analysis = await xai.analyzeWithRealTime('Latest developments in AI');

// Creative writing
const content = await xai.creativeWrite('Future of Work', 'professional');

// Test connection
const test = await xai.test();
console.log(test.response); // "Hi! Hello world!"
```

### Models Available

- `grok-beta` - Latest Grok model with real-time data access

## Figma API

### Features

- Read file data
- Get specific nodes
- Export images
- Comments
- Team/project management

### Usage

```javascript
import { figma } from './api/figma';

// Get entire file
const file = await figma.getFile('nuVKwuPuLS7VmLFvqzOX1G');

// Get specific frame
const frame = await figma.getFrame('nuVKwuPuLS7VmLFvqzOX1G', 'Deck 2');

// Extract all text
const textNodes = await figma.extractText('nuVKwuPuLS7VmLFvqzOX1G');

// Get images
const images = await figma.getImages('file-key', ['node-id-1', 'node-id-2'], {
  format: 'png',
  scale: 2
});

// Post comment
await figma.postComment('file-key', 'Great design!', { x: 100, y: 200 });
```

### File Structure

```javascript
{
  "document": {
    "id": "0:0",
    "name": "Document",
    "type": "DOCUMENT",
    "children": [
      {
        "id": "0:1",
        "name": "Page 1",
        "type": "CANVAS",
        "children": [
          {
            "id": "1:2",
            "name": "Frame 1",
            "type": "FRAME",
            "children": [...]
          }
        ]
      }
    ]
  }
}
```

## Usage Examples

### Example 1: AI-Powered Design Analysis

```javascript
import { figma } from './api/figma';
import { openai } from './api/openai';

async function analyzeDesign() {
  // Get Figma file
  const file = await figma.getFile('nuVKwuPuLS7VmLFvqzOX1G');
  
  // Analyze with AI
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

async function generatePresentation(topic) {
  const slides = [];
  
  for (let i = 1; i <= 10; i++) {
    // Use OpenAI for structured content
    const content = await openai.generateSlideContent(topic, i, 10);
    
    // Use Grok for creative elements
    const creative = await xai.creativeWrite(content.title, 'engaging');
    
    slides.push({ ...content, creative });
  }
  
  return slides;
}
```

### Example 3: Figma to PowerPoint

```javascript
import { figma } from './api/figma';
import Office from 'office';

async function importFigmaSlides() {
  // Get Figma file
  const file = await figma.getFile('nuVKwuPuLS7VmLFvqzOX1G');
  
  // Find all frames (slides)
  const frames = file.document.children[0].children.filter(
    node => node.type === 'FRAME'
  );
  
  // Export as images
  const nodeIds = frames.map(f => f.id);
  const images = await figma.getImages(file.key, nodeIds, {
    format: 'png',
    scale: 2
  });
  
  // Insert into PowerPoint
  await Office.context.document.slides.add();
  // ... insert images
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
  // Show user-friendly message
  showError('Failed to generate content. Please try again.');
}
```

### 3. Rate Limiting

```javascript
// Implement retry with exponential backoff
async function callWithRetry(apiFunction, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFunction();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### 4. Cost Management

```javascript
// Track token usage
let totalTokens = 0;

async function completionWithTracking(prompt) {
  const response = await openai.chatCompletion([
    { role: 'user', content: prompt }
  ]);
  
  totalTokens += response.usage.total_tokens;
  console.log(`Total tokens used: ${totalTokens}`);
  
  return response.choices[0].message.content;
}
```

### 5. Caching

```javascript
const cache = new Map();

async function getFigmaFile(fileKey) {
  if (cache.has(fileKey)) {
    return cache.get(fileKey);
  }
  
  const file = await figma.getFile(fileKey);
  cache.set(fileKey, file);
  
  return file;
}
```

## API Reference

### OpenAI

- `chatCompletion(messages, options)` - Chat completion
- `complete(prompt, systemPrompt, options)` - Simple completion
- `analyzeFigmaDesign(designData, question)` - AI design analysis
- `generateSlideContent(topic, slideNumber, totalSlides)` - Generate slides

### xAI (Grok)

- `chatCompletion(messages, options)` - Chat with Grok
- `complete(prompt, systemPrompt, options)` - Simple completion
- `analyzeWithRealTime(query)` - Real-time analysis
- `creativeWrite(topic, style)` - Creative writing
- `test()` - Test connection

### Figma

- `getFile(fileKey)` - Get entire file
- `getFileNodes(fileKey, nodeIds)` - Get specific nodes
- `getImages(fileKey, nodeIds, options)` - Export images
- `getComments(fileKey)` - Get comments
- `postComment(fileKey, message, position)` - Post comment
- `getFrame(fileKey, frameName)` - Get specific frame
- `extractText(fileKey)` - Extract all text nodes

## Troubleshooting

### OpenAI API Errors

| Error | Solution |
|-------|----------|
| Invalid API key | Regenerate key in OpenAI dashboard |
| Rate limit exceeded | Wait and retry with backoff |
| Insufficient quota | Add payment method or upgrade plan |
| Model not found | Check model name spelling |

### xAI API Errors

| Error | Solution |
|-------|----------|
| Authentication failed | Verify API key |
| Model unavailable | Use `grok-beta` |
| Request timeout | Increase timeout in options |

### Figma API Errors

| Error | Solution |
|-------|----------|
| 403 Forbidden | Check token permissions |
| 404 Not found | Verify file key is correct |
| Rate limit | Wait before next request |
| File too large | Use node filtering |

## Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [xAI Documentation](https://docs.x.ai/)
- [Figma API Docs](https://www.figma.com/developers/api)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

For API-specific issues:

- OpenAI: [support@openai.com](mailto:support@openai.com)
- xAI: [xAI Support](https://x.ai/support)
- Figma: [Figma Help Center](https://help.figma.com/)
