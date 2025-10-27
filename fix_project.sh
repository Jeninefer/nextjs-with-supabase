cd /home/codespace/OfficeAddinApps/Figma

echo "🔧 REPARACIÓN COMPLETA DEL PROYECTO OFFICE ADD-IN"
echo "================================================="

# 1. Limpiar node_modules y package-lock
echo ""
echo "🗑️ Limpiando instalación anterior..."
rm -rf node_modules package-lock.json dist .next

# 2. Verificar si es Next.js o Vite
echo ""
echo "🔍 Detectando tipo de proyecto..."
if grep -q "\"next\"" package.json; then
    PROJECT_TYPE="nextjs"
    echo "  ✅ Detectado: Next.js"
else
    PROJECT_TYPE="vite"
    echo "  ✅ Detectado: Vite (Office Add-in)"
fi

# 3. Reinstalar dependencias correctamente
echo ""
echo "📦 Instalando dependencias..."
npm install

# 4. Crear archivos de configuración faltantes
echo ""
echo "📝 Creando configuraciones faltantes..."

# tsconfig.node.json (ya creado)
if [ ! -f "tsconfig.node.json" ]; then
    cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
EOF
    echo "  ✅ tsconfig.node.json creado"
fi

# 5. Agregar tsconfig.node.json a .gitignore si no está
if ! grep -q "tsconfig.node.json" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# TypeScript" >> .gitignore
    echo "tsconfig.node.json" >> .gitignore
fi

# 6. Limpiar archivos de build antiguos
echo ""
echo "🧹 Limpiando archivos temporales y builds antiguos..."
rm -rf dist/.next .turbo node_modules/.cache
find . -name "*.log" -not -path "*/node_modules/*" -delete
find . -name ".DS_Store" -delete

# 7. Ejecutar build según tipo de proyecto
echo ""
echo "🔨 Ejecutando build..."
if [ "$PROJECT_TYPE" = "vite" ]; then
    npm run build 2>&1 | tee build.log
    BUILD_STATUS=${PIPESTATUS[0]}
else
    npm run build 2>&1 | tee build.log
    BUILD_STATUS=${PIPESTATUS[0]}
fi

# 8. Verificación final
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        ✅ REPARACIÓN DE PROYECTO COMPLETADA               ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "📊 RESUMEN FINAL:"
echo "================"

# Verificar archivos críticos
echo "📄 Archivos de configuración:"
for file in package.json tsconfig.json tsconfig.node.json; do
    [ -f "$file" ] && echo "  ✅ $file" || echo "  ❌ $file"
done

# Verificar dependencias
echo ""
echo "📦 Dependencias instaladas:"
[ -d "node_modules" ] && echo "  ✅ node_modules ($(ls node_modules | wc -l) paquetes)"
[ -d "node_modules/react" ] && echo "  ✅ react"
[ -d "node_modules/tailwindcss" ] && echo "  ✅ tailwindcss"

# Estado del build
echo ""
echo "🔨 Estado del Build:"
if [ $BUILD_STATUS -eq 0 ]; then
    echo "  ✅ Build exitoso"
    if [ -d "dist" ]; then
        echo "  📦 Archivos: $(find dist -type f | wc -l)"
        echo "  📏 Tamaño: $(du -sh dist 2>/dev/null | cut -f1)"
    fi
else
    echo "  ❌ Build falló - Ver build.log para detalles"
    echo ""
    echo "⚠️ ERRORES ENCONTRADOS:"
    tail -20 build.log | grep -i "error" | head -5
fi

echo ""
echo "💡 PRÓXIMOS PASOS:"
if [ $BUILD_STATUS -eq 0 ]; then
    echo "  ✅ Proyecto reparado exitosamente"
    echo "  1. 🚀 Desarrollo: npm run dev"
    echo "  2. 💾 Commit: git add . && git commit -m 'fix: repair project configuration'"
    echo "  3. 📤 Push: git push origin main"
else
    echo "  ⚠️ Se necesita atención:"
    echo "  1. 📋 Revisar: cat build.log"
    echo "  2. 🔧 Verificar package.json tiene las dependencias correctas"
    echo "  3. 📝 Verificar que no haya archivos mezclados de Next.js y Vite"
fi

echo ""
echo "📝 Archivos generados:"
echo "  - tsconfig.node.json (configuración TypeScript para Vite)"
echo "  - build.log (log del build para debugging)"

exit $BUILD_STATUS
