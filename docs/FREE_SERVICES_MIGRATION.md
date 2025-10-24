# Migración a Servicios Gratuitos

## 🎯 Objetivo

Reemplazar todos los servicios pagos por alternativas gratuitas sin perder funcionalidad.

---

## 🔄 Servicios a Reemplazar

### 1. **Supabase** → **PocketBase** (100% Gratis, Self-Hosted)

#### ¿Por qué PocketBase?

- ✅ **Completamente gratis** y open-source
- ✅ Backend en Go (rápido y ligero)
- ✅ Base de datos SQLite integrada
- ✅ Autenticación built-in
- ✅ Realtime subscriptions
- ✅ File storage incluido
- ✅ Admin UI integrado
- ✅ API REST automática
- ✅ Migraciones fáciles

#### Instalación

```bash
# Descargar PocketBase
cd path/to/your/project/Figma
mkdir pocketbase && cd pocketbase

# Linux/macOS
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip
chmod +x pocketbase

# Iniciar PocketBase
./pocketbase serve
```

**Admin UI:** `http://127.0.0.1:8090/_/`

#### Configuración en .env

```env
# PocketBase
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@abaco.com
POCKETBASE_ADMIN_PASSWORD=your-secure-password
```

---

### 2. **Vercel** → **Netlify** o **GitHub Pages** (Gratis)

#### Opción A: Netlify (Recomendado)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Límites Gratis:**

- 100GB bandwidth/mes
- 300 build minutes/mes
- Serverless functions
- Forms gratis

#### Opción B: GitHub Pages + Cloudflare Pages

```yaml
# filepath: .github/workflows/deploy-github-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

### 3. **OpenAI API** → **Hugging Face Inference API** (Gratis)

#### Alternativas Gratuitas de IA

##### A. Hugging Face (Gratis para uso personal)

```javascript
// filepath: /home/codespace/OfficeAddinApps/Figma/src/api/huggingface.js

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY; // Gratis!

async function generateText(prompt) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  return await response.json();
}

// Modelos gratuitos disponibles:
// - Mistral-7B-Instruct (OpenAI GPT-3.5 equivalent)
// - Llama-2-70B (GPT-4 comparable)
// - Falcon-180B (GPT-4 comparable)
```

##### B. Ollama (100% Local, 100% Gratis)

```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Descargar modelos
ollama pull mistral       # 7B params
ollama pull llama2        # 13B params
ollama pull codellama     # Code generation

# Usar en tu código
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Explain factoraje in Mexico"
}'
```

```javascript
// filepath: /home/codespace/OfficeAddinApps/Figma/src/api/ollama.js

async function ollamaGenerate(prompt, model = 'mistral') {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false })
  });
  return await response.json();
}

export const ollama = {
  generate: ollamaGenerate,
  chat: async (messages, model = 'mistral') => {
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    return ollamaGenerate(prompt, model);
  }
};
```

---

### 4. **xAI (Grok)** → **Google Gemini** (Gratis)

```javascript
// filepath: /home/codespace/OfficeAddinApps/Figma/src/api/gemini.js

// Gemini es GRATIS con límites generosos
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function geminiGenerate(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  return await response.json();
}

// Límites gratuitos de Gemini:
// - 60 requests por minuto
// - 1500 requests por día
// - 100% GRATIS
```

**Obtener API Key:** <https://makersuite.google.com/app/apikey>

---

### 5. **Figma API** → **Figma Community** (Gratis)

Figma API sigue siendo gratis para:

- Personal accounts: 2 projects
- Professional: Unlimited (pero necesitas plan paid)

**Alternativa:** Usar **Penpot** (Open Source Figma alternative)

```bash
# Self-hosted Penpot
docker run -d \
  --name penpot \
  -p 9001:9001 \
  -e PENPOT_FLAGS=enable-registration \
  penpotapp/frontend:latest
```

---

## 🆓 Servicios Adicionales Gratuitos

### Email (SendGrid Free Tier)

```env
SENDGRID_API_KEY=your-key
# 100 emails/day GRATIS
```

### Storage (Cloudinary Free)

```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# 25GB storage + 25GB bandwidth GRATIS
```

### Database (Railway Free Tier)

```env
DATABASE_URL=postgresql://user:pass@railway.app:5432/db
# 500MB + 5GB transfer GRATIS
```

---

## 📦 Stack Completamente Gratuito

```bash
# Backend
- PocketBase (gratis, self-hosted)

# Frontend Hosting
- Netlify o GitHub Pages (gratis)

# IA
- Ollama (local, gratis) o
- Hugging Face (gratis) o
- Google Gemini (gratis)

# Base de Datos
- PocketBase SQLite (incluido) o
- Railway PostgreSQL (500MB gratis)

# Storage
- Cloudinary (25GB gratis) o
- PocketBase File Storage (incluido)

# Email
- SendGrid (100/día gratis) o
- Resend (100/día gratis)

# Analytics
- Plausible (self-hosted, gratis) o
- Umami (self-hosted, gratis)
```

---

## 🚀 Migración Paso a Paso

### Paso 1: Configurar PocketBase

```bash
cd /home/codespace/OfficeAddinApps/Figma

# Crear estructura
mkdir -p backend/pocketbase
cd backend/pocketbase

# Descargar PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip

# Crear archivo de configuración
cat > pb_hooks/main.pb.js << 'EOF'
// Auto-setup on first run
onAfterBootstrap((e) => {
  console.log("PocketBase started for Abaco Office Add-in");
});
EOF

# Iniciar
./pocketbase serve --http="0.0.0.0:8090"
```

### Paso 2: Migrar código de Supabase a PocketBase

```javascript
// filepath: /home/codespace/OfficeAddinApps/Figma/src/api/pocketbase.js

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const pocketbase = {
  // Auth
  async signUp(email, password) {
    return await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password
    });
  },

  async signIn(email, password) {
    return await pb.collection('users').authWithPassword(email, password);
  },

  // CRUD Operations
  async create(collection, data) {
    return await pb.collection(collection).create(data);
  },

  async read(collection, id) {
    return await pb.collection(collection).getOne(id);
  },

  async update(collection, id, data) {
    return await pb.collection(collection).update(id, data);
  },

  async delete(collection, id) {
    return await pb.collection(collection).delete(id);
  },

  // Realtime
  subscribe(collection, callback) {
    pb.collection(collection).subscribe('*', callback);
  }
};
```

### Paso 3: Actualizar .env

```env
# filepath: /home/codespace/OfficeAddinApps/Figma/.env.local

# PocketBase (GRATIS)
POCKETBASE_URL=http://127.0.0.1:8090

# Hugging Face (GRATIS)
HUGGINGFACE_API_KEY=hf_your_key_here

# Google Gemini (GRATIS)
GEMINI_API_KEY=your_gemini_key

# Cloudinary (GRATIS - 25GB)
CLOUDINARY_URL=cloudinary://key:secret@cloud

# Figma (GRATIS para personal)
FIGMA_ACCESS_TOKEN=figd_your_token
FIGMA_FILE_KEY=nuVKwuPuLS7VmLFvqzOX1G
```

### Paso 4: Actualizar package.json

```json
{
  "dependencies": {
    "pocketbase": "^0.21.0",
    "@google/generative-ai": "^0.1.3",
    "cloudinary": "^2.0.0"
  },
  "devDependencies": {
    "netlify-cli": "^17.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "netlify deploy --prod",
    "backend": "cd backend/pocketbase && ./pocketbase serve"
  }
}
```

---

## 💰 Comparación de Costos

| Servicio | Antes (Pago) | Después (Gratis) | Ahorro/mes |
|----------|--------------|------------------|------------|
| Supabase Pro | $25 | $0 (PocketBase) | $25 |
| Vercel Pro | $20 | $0 (Netlify) | $20 |
| OpenAI API | $50+ | $0 (Ollama/HF) | $50+ |
| xAI Grok | $20+ | $0 (Gemini) | $20+ |
| Storage | $10 | $0 (Cloudinary) | $10 |
| **TOTAL** | **$125+** | **$0** | **$125+** |

---

## 🎉 Resultado Final

**Stack 100% Gratuito:**

- ✅ Backend: PocketBase
- ✅ Hosting: Netlify/GitHub Pages
- ✅ IA: Ollama + Gemini
- ✅ Storage: Cloudinary Free
- ✅ Database: PocketBase SQLite
- ✅ Email: SendGrid Free

**Total: $0/mes** 🎊

---

**Abaco Capital - Free Services Migration Guide**
**Versión 1.0 - Enero 2025**
