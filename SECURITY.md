# 🔒 POLÍTICA DE SEGURIDAD - ABACO Platform

## 1. MANEJO DE CREDENCIALES Y SECRETOS

### ✅ LO QUE DEBES HACER

1. **Usa GitHub Secrets para CI/CD**
   - Ir a: Settings → Secrets and variables → Actions
   - Crear secreto por cada token/credential
   - Referenciar en workflows como: `${{ secrets.SUPABASE_URL }}`

2. **Usa Variables de Entorno Locales**
   ```bash
   # Copiar template
   cp .env.example.secure .env.local
   
   # Llenar con credenciales REALES
   # NUNCA commitear este archivo
   ```

3. **Usa Environment Variables en Vercel/Netlify**
   - Settings → Environment Variables
   - Marcar como "Sensitive"

### ❌ LO QUE NUNCA DEBES HACER

- ✗ Commitear `.env` files con credenciales reales
- ✗ Incluir tokens en código fuente
- ✗ Pushear credenciales en strings de configuración
- ✗ Incluir credenciales en documentación
- ✗ Usar credenciales hardcodeadas
- ✗ Compartir tokens por email o chat
- ✗ Mantener credenciales en repositorio histórico

---

## 2. TIPOS DE SECRETOS Y DÓNDE GUARDARLOS

| Secreto | Dónde Guardar | Acceso |
|---------|---------------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | GitHub Secrets + .env.local | Solo servidor |
| `OPENAI_API_KEY` | GitHub Secrets + .env.local | Servidor y frontend |
| `POSTGRES_CONNECTION_STRING` | GitHub Secrets solamente | Solo servidor |
| `GITHUB_TOKEN` | GitHub Secrets solamente | CI/CD |
| `SLACK_BOT_TOKEN` | GitHub Secrets solamente | Backend |
| Claves públicas (ANON_KEY) | `.env.local` / Frontend | Público |

---

## 3. FLUJO DE CREDENCIALES SEGURO

```
┌─────────────────────────────────────────────────────┐
│ 1. DESARROLLO LOCAL                                 │
├─────────────────────────────────────────────────────┤
│ .env.local (NO commitear)                           │
│ ↓                                                    │
│ npm run dev                                         │
│ ↓                                                    │
│ Código usa: process.env.VARIABLE_NAME               │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 2. VERIFICACIÓN PRE-COMMIT                          │
├─────────────────────────────────────────────────────┤
│ Pre-commit hook verifica:                           │
│ - No hay .env files                                 │
│ - No hay patrones de credenciales                   │
│ - No hay archivos .key, .pem                        │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 3. PUSH A GITHUB                                    │
├─────────────────────────────────────────────────────┤
│ Código + Tests (sin secretos)                       │
│ ↓                                                    │
│ CI/CD Pipeline activa                              │
│ ↓                                                    │
│ Lee secrets de GitHub Secrets                       │
│ ↓                                                    │
│ Inyecta en environment durante build/deploy        │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│ 4. PRODUCCIÓN                                       │
├─────────────────────────────────────────────────────┤
│ Vercel/Google Cloud Run                            │
│ ↓                                                    │
│ Lee Environment Variables                          │
│ ↓                                                    │
│ Código accede a: process.env.VARIABLE_NAME         │
│ (injected at runtime)                              │
└─────────────────────────────────────────────────────┘
```

---

## 4. CONFIGURACIÓN DE GITHUB SECRETS

### Para Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Para APIs
```
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIzaSy...
GEMINI_API_KEY=...
HUGGINGFACE_TOKEN=hf_...
XAI_API_KEY=xai-...
```

### Para Integraciones
```
GITHUB_TOKEN=ghp_...
SLACK_BOT_TOKEN=xoxb-...
HUBSPOT_TOKEN=pat-...
FIGMA_TOKEN=figd_...
```

---

## 5. ROTACIÓN DE CREDENCIALES

### Cuando Rotar
- [ ] Después de breach/exposición
- [ ] Cada 90 días (política recomendada)
- [ ] Cuando empleado sale de equipo
- [ ] Cambios de permisos

### Cómo Rotar
1. **Generar nuevas credenciales** en el servicio
2. **Actualizar GitHub Secrets**
3. **Actualizar `.env.local`** local
4. **Revocar credenciales antiguas** en el servicio
5. **Verificar** que todo funciona con nuevas creds
6. **Documentar** en registro de auditoría

---

## 6. INCIDENT RESPONSE

### Si se expone una credencial:

1. **INMEDIATAMENTE (primeros 5 minutos)**
   - [ ] Revocar la credencial en el servicio
   - [ ] Generar credencial nueva

2. **EN LA SIGUIENTE HORA**
   - [ ] Actualizar GitHub Secrets
   - [ ] Buscar en histórico de git si está expuesta
   - [ ] Si está: hacer `git filter-branch` para limpiar
   - [ ] Force-push a todos los branches

3. **SIGUIENTE DÍA**
   - [ ] Auditar logs de acceso a APIs
   - [ ] Documentar en incident report
   - [ ] Comunicar a stakeholders

4. **SEGUIMIENTO**
   - [ ] Post-mortem con equipo
   - [ ] Mejorar procesos para prevenirlo

---

## 7. CHECKLIST DE SEGURIDAD ANTES DE PUSH

- [ ] ¿Removí `.env` files antes de commit?
- [ ] ¿Executé `git diff --staged`** y verifiqué que no hay secretos?
- [ ] ¿Todos los secrets están en GitHub Secrets?
- [ ] ¿El pre-commit hook pasó sin errores?
- [ ] ¿Verifiqué `.gitignore` incluye `.env*`?
- [ ] ¿No incluyo secrets en comments del código?
- [ ] ¿No incluyo credenciales en tests?
- [ ] ¿No incluyo credenciales en documentación?

---

## 8. RECURSOS Y REFERENCIAS

- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub - Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase - Environment Variables](https://supabase.com/docs/guides/local-development)
- [Node.js Best Practices - Security](https://nodejs.org/en/docs/guides/security/)

---

## 9. REPORTAR VULNERABILIDADES DE SEGURIDAD

**NO** abrir issues públicas para vulnerabilidades.

Reportar a: `security@abaco.finance` con detalles:
- Descripción del issue
- Pasos para reproducir
- Impacto potencial
- Sugerencias de remediación (opcional)

---

**Última actualización:** 2024
**Próxima revisión:** Trimestral