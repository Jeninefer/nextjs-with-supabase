#!/bin/bash
# 🔒 Setup pre-commit hook for security

HOOK_FILE=".git/hooks/pre-commit"

echo "📋 Creando pre-commit hook..."

cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
# 🔒 Pre-commit hook para prevenir commit de credenciales

echo "🔍 Verificando archivos a commitear..."

# Archivos prohibidos
BLOCKED_FILES=(
    ".env"
    ".env.local"
    ".env.*.local"
    "*.key"
    "*.pem"
    "credentials.json"
)

# Patrones a buscar
BLOCKED_PATTERNS=(
    "sk-proj-"           # OpenAI keys
    "ghp_"               # GitHub tokens
    "xoxb-"              # Slack tokens
    "figd_"              # Figma tokens
    "postgresql://"      # DB connections con credentials
    "SUPABASE_SERVICE_ROLE_KEY="
    "POSTGRES_CONNECTION_STRING="
)

# Archivos a ser staged
STAGED_FILES=$(git diff --cached --name-only)

# Verificar archivos bloqueados
for file in $STAGED_FILES; do
    for blocked in "${BLOCKED_FILES[@]}"; do
        if [[ "$file" == "$blocked" ]]; then
            echo "❌ ERROR: No puedes commitear archivos secretos: $file"
            exit 1
        fi
    done
done

# Verificar patrones peligrosos
for file in $STAGED_FILES; do
    if [[ -f "$file" ]]; then
        for pattern in "${BLOCKED_PATTERNS[@]}"; do
            if grep -q "$pattern" "$file" 2>/dev/null; then
                echo "❌ ERROR: Archivo '$file' contiene patrón sensible: $pattern"
                exit 1
            fi
        done
    fi
done

echo "✅ Verificación pasada - procediendo con commit"
exit 0
EOF

chmod +x "$HOOK_FILE"
echo "✅ Pre-commit hook instalado en $HOOK_FILE"