# 🤝 GUÍA DE CONTRIBUCIÓN - ABACO Platform

## Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Empezar](#empezar)
3. [Proceso de Contribución](#proceso-de-contribución)
4. [Estándares de Código](#estándares-de-código)
5. [Testing](#testing)
6. [Commits y PRs](#commits-y-prs)
7. [Deployment](#deployment)

---

## Código de Conducta

Esperamos que todos los contribuidores:
- Respeten a otros miembros del equipo
- Escriban código legible y mantenible
- Sigan mejores prácticas de seguridad
- Documenten cambios significativos
- Realicen tests antes de pushear

---

## Empezar

### 1. Fork y Clone
```bash
git clone https://github.com/your-org/nextjs-with-supabase.git
cd nextjs-with-supabase
npm install
```

### 2. Crear rama de feature
```bash
git checkout -b feature/your-feature-name
# O para bugfixes
git checkout -b fix/bug-description
```

### 3. Setup de ambiente
```bash
# Copiar template
cp .env.example.secure .env.local

# Llenar con credenciales locales
# NUNCA commitear este archivo
```

### 4. Instalar pre-commit hook
```bash
chmod +x scripts/setup-pre-commit-hook.sh
./scripts/setup-pre-commit-hook.sh
```

---

## Proceso de Contribución

### Step 1: Crear Feature Branch
```bash
# Actualizar main
git fetch origin
git checkout main
git pull origin main

# Crear feature branch
git checkout -b feature/my-feature

# O para diferentes tipos:
# - feature/new-functionality
# - fix/bug-name
# - docs/documentation-update
# - perf/performance-improvement
# - refactor/code-cleanup
```

### Step 2: Desarrollar

**Escribir código siguiendo:**
- Estándares del proyecto (ver abajo)
- ESLint + Prettier (ejecutados automáticamente)
- TypeScript strict mode
- React best practices

**Ejemplo de cambio**
```typescript
// ❌ MALO
const LoginForm = () => {
  let email = ""
  const handleLogin = (e) => {
    // ...
  }
  return <form onSubmit={handleLogin}>...</form>
}

// ✅ BUENO
interface LoginFormProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [email, setEmail] = useState("")
  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    try {
      // ...
      onSuccess?.()
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }
  return <form onSubmit={handleLogin}>...</form>
}
```

### Step 3: Tests

```bash
# Correr tests locales
npm test

# Con coverage
npm test -- --coverage

# Tests específicos
npm test -- __tests__/components/login-form.test.tsx
```

**Requisitos de testing:**
- Mínimo 80% coverage para componentes nuevos
- Todos los happy paths testados
- Casos de error cubiertos
- No romper tests existentes

### Step 4: Commit

```bash
# Ver cambios
git status
git diff

# Stage cambios (pre-commit hook verificará)
git add .

# Commit con mensaje descriptivo
git commit -m "feat(auth): add two-factor authentication

- Add TOTP support for enhanced security
- Add backup codes for account recovery
- Add QR code generation for setup
- Update tests for new flows"
```

**Commit message format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

Tipos válidos:
- `feat`: Nueva feature
- `fix`: Bugfix
- `docs`: Documentación
- `style`: Cambios de formato (no logic)
- `refactor`: Refactoring (no behavior change)
- `perf`: Performance improvement
- `test`: Agregar/actualizar tests
- `chore`: Build, deps, config

### Step 5: Push y Pull Request

```bash
# Push a tu fork
git push origin feature/my-feature

# Crear PR en GitHub
```

**PR Template:**
```markdown
## Descripción
Descripción clara de los cambios.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Cambio de documentación

## Cambios Relacionados
- Closes #123
- Related to #456

## Testing
- [ ] Testeé localmente
- [ ] Coverage >= 80%
- [ ] Tests nuevos agregados
- [ ] Tests existentes pasan

## Checklist Seguridad
- [ ] No incluí credenciales/secretos
- [ ] No expuse información sensible
- [ ] Seguí política de seguridad

## Screenshots (si aplica)
Adjuntar screenshots de cambios visuales
```

### Step 6: Code Review

- Responder comentarios de reviewers
- Hacer cambios solicitados
- Pushear cambios (no squash, mantener commits pequeños)
- Re-request review cuando listo

### Step 7: Merge

Una vez aprobado:
- [ ] Todos los tests pasan
- [ ] PR aprobada por mínimo 1 reviewer
- [ ] Sin conflictos con main
- [ ] Pre-deployment checks pasados

---

## Estándares de Código

### TypeScript

```typescript
// ✅ BUENO
interface UserProfile {
  id: string
  email: string
  name?: string
}

const getUserProfile = async (id: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ❌ MALO
const getProfile = async (id) => {
  const result = await supabase.from('profiles').select('*').eq('id', id).single()
  return result.data
}
```

### React Components

```typescript
// ✅ BUENO - Functional component with hooks
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded font-medium',
          variant === 'primary' && 'bg-blue-600 text-white',
          variant === 'secondary' && 'bg-gray-200 text-gray-900',
        )}
        disabled={loading}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    )
  },
)
Button.displayName = 'Button'

// ❌ MALO - No forwarded ref, no props interface
const Button = ({ variant, children, ...props }) => (
  <button className={`btn btn-${variant}`} {...props}>
    {children}
  </button>
)
```

### Naming Conventions

```typescript
// Components (PascalCase)
export const UserProfile = () => {}
export const LoginForm = () => {}

// Functions (camelCase)
export const getUserData = () => {}
export const formatCurrency = (amount: number) => {}

// Constants (UPPER_SNAKE_CASE)
export const API_BASE_URL = 'https://api.example.com'
export const MAX_RETRIES = 3

// Interfaces/Types (PascalCase with I prefix optional)
interface UserData {}
type Theme = 'light' | 'dark'
```

### File Organization

```
components/
├── auth/
│   ├── LoginForm.tsx
│   ├── SignUpForm.tsx
│   └── LoginForm.test.tsx
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ...
└── index.ts (barrel exports)

lib/
├── supabase/
│   ├── client.ts
│   └── server.ts
├── utils.ts
└── types.ts

__tests__/
├── components/
├── lib/
└── app/
```

### Error Handling

```typescript
// ✅ BUENO
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error(
    error instanceof Error
      ? error.message
      : 'An unknown error occurred'
  )
}

// ❌ MALO
try {
  return await riskyOperation()
} catch {
  // Silently fail or generic error
}
```

---

## Testing

### Unit Tests

```typescript
// ✅ BUENO - Clear test structure
describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders login form with email and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  test('submits form with correct credentials', async () => {
    const user = userEvent.setup({ delay: null })
    const mockOnSuccess = jest.fn()

    render(<LoginForm onSuccess={mockOnSuccess} />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(mockOnSuccess).toHaveBeenCalled()
  })
})
```

### Running Tests

```bash
# Todos los tests
npm test

# Con watch mode
npm test -- --watch

# Con coverage
npm test -- --coverage

# Tests específicos
npm test -- __tests__/components/login-form.test.tsx
```

---

## Commits y PRs

### Commit Messages

Usar formato convencional:
```
feat(scope): subject - máx 50 caracteres
     ↑         ↑       ↑
     |         |       └─ Sin punto al final
     |         └─ Que componente afecta
     └─ Tipo de cambio
```

**Ejemplos:**
```
feat(auth): add two-factor authentication
fix(api): handle null response in getUserData
docs(readme): update installation instructions
perf(search): optimize database queries
refactor(components): extract Button to separate file
test(auth): add login form tests
```

### Pull Requests

- **Título:** Describe el cambio en pocas palabras
- **Descripción:** Explica qué, por qué, y cómo
- **Linked Issues:** Referencia al issue (#123)
- **Testing:** Describe tests agregados/modificados
- **Screenshots:** Para cambios visuales

---

## Deployment

### Pre-deployment Checklist

- [ ] `npm run type-check` passa sin errores
- [ ] `npm run lint` passa
- [ ] `npm test` passa con coverage >= 80%
- [ ] `npm run build` succeeds
- [ ] No hay credenciales en código
- [ ] Documentación actualizada
- [ ] `.env` variables documentadas

### Deployment Process

```bash
# 1. Merge a main
git checkout main
git pull origin main

# 2. Update version
npm version patch  # o minor, major

# 3. Build
npm run build

# 4. Deploy (via Vercel/Google Cloud UI o CLI)
vercel deploy --prod
# o
gcloud run deploy abaco-platform --source .

# 5. Verify
# - Check health endpoint
# - Monitor error logs
# - Verify functionality
```

---

## Preguntas Frecuentes

**P: ¿Qué hago si accidentalmente commitee un secreto?**
A: Ver SECURITY.md → Incident Response

**P: ¿Cómo sé si mi PR está listo?**
A: Cuando todos los requerimientos de arriba estén checked.

**P: ¿Puedo hacer squash de commits?**
A: No, mantener commits pequeños y descriptivos para historial claro.

---

## Recursos

- [Guía de Git](https://git-scm.com/book/en/v2)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Testing Library](https://testing-library.com/docs/)

---

**¡Gracias por contribuir a ABACO Platform! 🎉**