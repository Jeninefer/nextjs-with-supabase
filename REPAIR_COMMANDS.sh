# Comandos recomendados para reparar tu entorno Next.js/Supabase

# Paso 0: Haz backup de package.json y package-lock.json
cp package.json package.json.bak
cp package-lock.json package-lock.json.bak

# Paso 1: Cierra procesos node/next en ejecución (ignora error si no hay procesos)
pkill -f node || true

# Paso 2: Instala tslib y tailwindcss-animate (como devDependency)
npm install tslib tailwindcss-animate --save-dev

# Paso 3: Alinea Next.js y React a versiones compatibles (ajusta la versión de next si tu proyecto requiere otra)
npm install next@14.2.0 react@18.2.0 react-dom@18.2.0 --save-exact

# Paso 4: Elimina node_modules y package-lock.json para una instalación limpia
rm -rf node_modules package-lock.json

# Paso 5: Instala dependencias limpias
npm install

# Paso 6: Ejecuta el servidor de desarrollo
npm run dev
