# 🧹 PLAN DE LIMPIEZA Y ORGANIZACIÓN

## Archivos a ELIMINAR (No son parte del proyecto real)

### Scripts de "Fix" Obsoletos
- `fix_project.sh` - Indica problemas históricos no resueltos
- `fix_all_build_issues.sh` - Indica problemas históricos no resueltos
- `fix_environment.sh` - Template de configuración
- `fix_abaco_environment.sh` - Template de configuración
- `emergency-fix.sh` - Parche de emergencia
- `cleanup_and_sync.sh` - Limpieza incompleta
- `complete-cleanup-and-commit.sh` - Limpieza incompleta
- `post-cleanup-verification.sh` - Verificación de limpieza
- `git-cleanup.sh` - Limpieza de git
- `sync_all_changes.sh` - Sincronización
- `sync_and_merge.sh` - Sincronización
- `sync_repository.sh` - Sincronización
- `REPAIR_COMMANDS.sh` - Comandos de reparación

### Reportes de Resolución Incompletos
Estos indican cambios no estables o recuperaciones de emergencia:
- `RESOLUTION_SUMMARY.md`
- `FINAL-RECOVERY.md`
- `PR_CONFLICT_ANALYSIS.md`
- `DEPLOYMENT_STATUS.md`
- `DEPLOYMENT-READY.md`

### Archivos de Configuración Duplicados
- `./nextjs-with-supabase/` (carpeta anidada - DUPLICADA)
  - Eliminar completamente: parece ser un merge fallido

### Archivos Temporales y Backups
- `FETCH_HEAD` - Archivo temporal de git
- `*.bak` - Backups
- `package-lock.json.bak`
- `package.json.bak`

### Directorios Innecesarios
- `./users/` - Parece ser estructura de Microsoft Graph
- `./models/oDataErrors/` - Parece ser código generado
- `./models/` - Código generado

### Archivos de Log/Temporales
- `build.log`
- `main` (archivo sin extensión)
- `The` (archivo extraño)
- Directorio con caracteres especiales: `"e project"`

## Archivos a MANTENER pero REVISAR

### Necesitan actualización/corrección:
1. `.env.example` - Contiene credenciales reales (CRÍTICO)
2. `package.json` - Revisar dependencias duplicadas
3. `README.md` - Actualizar con instrucciones correctas
4. `QUICK_START.md` - Verificar actualidad
5. `ABACO_IMPLEMENTATION_SUMMARY.md` - Verificar completitud

## Cambios Recomendados

### .gitignore
- [ ] Aplicar `.gitignore.secure`
- [ ] Verificar que `.env*` está incluido

### .env files
- [ ] Eliminar `.env` (con credenciales reales)
- [ ] Reemplazar `.env.example` con versión segura
- [ ] Mantener `.env.local` en .gitignore
- [ ] Usar GitHub Secrets para CI/CD

### Documentación
- [ ] Consolidar guías en `/docs`
- [ ] Eliminar reportes de resolución incompletos
- [ ] Crear CONTRIBUTING.md con mejores prácticas
- [ ] Crear SECURITY.md con políticas de secretos

## Estructura Limpia Recomendada

```
root/
├── app/                    # Next.js App Router
├── components/             # React Components
├── lib/                    # Utilities & Supabase client
├── notebooks/              # Python analysis
├── supabase/               # Supabase functions
├── __tests__/              # Test files
├── docs/                   # Documentation
├── scripts/                # Build/deployment scripts
├── .github/                # GitHub workflows
├── public/                 # Static files
│
├── .env.example.secure     # Template only
├── .gitignore.secure       # Comprehensive security
├── .github/workflows/      # CI/CD
│
├── package.json
├── tsconfig.json
├── next.config.ts
│
├── README.md
├── SECURITY.md             # NEW - Security policies
├── CONTRIBUTING.md         # NEW - Contribution guide
└── IT_AUDIT_REPORT.md      # NEW - This audit
```

## Próximos Pasos

1. **Immediate** (Hoy):
   - [ ] Revocar todas las credenciales
   - [ ] Validar que .env no está en historio público
   - [ ] Crear nuevas credenciales

2. **Today** (Hoy):
   - [ ] Eliminar scripts de fix
   - [ ] Eliminar reportes incompletos
   - [ ] Actualizar .gitignore

3. **This Week**:
   - [ ] Eliminar directorio duplicado `./nextjs-with-supabase/`
   - [ ] Limpiar directorios innecesarios (`users/`, `models/`)
   - [ ] Audit de dependencias
   - [ ] Consolidar documentación

4. **This Month**:
   - [ ] Implementar GitHub Secrets
   - [ ] Crear CI/CD pipeline seguro
   - [ ] Establecer políticas de código
   - [ ] Training del equipo

