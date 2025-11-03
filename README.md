# Pint - Public Interface

**Pint** (Public Interface) is a public policies platform that serves as a UX-rich reference for up-to-date information about public administrations and policies, while also functioning as a collaboration platform for political projects.

## 🏗️ Architecture

This is a modern monorepo built with:

- **Frontend**: Next.js 15 (App Router, React Server Components, Server Actions)
- **Database**: PostgreSQL with Supabase (managed locally or cloud)
- **ORM**: Drizzle ORM with type-safe queries
- **Auth**: Supabase Authentication
- **UI**: Tailwind CSS + shadcn/ui + Radix UI + Framer Motion
- **Monorepo**: pnpm workspaces + Turborepo
- **Future**: FastAPI backend + LangGraph agents (placeholders included)

## 📁 Project Structure

```
pint/
├── app/                          # Next.js 15 application
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── posts/            # Posts CRUD pages
│   │   │   ├── login/            # Authentication
│   │   │   └── signup/
│   │   ├── components/           # React components
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   └── posts/            # Post-specific components
│   │   ├── lib/
│   │   │   ├── actions/          # Server Actions
│   │   │   ├── db/               # Drizzle schema & client
│   │   │   ├── supabase/         # Supabase clients
│   │   │   └── auth.ts           # Auth helpers
│   │   └── middleware.ts         # Route protection
│   └── drizzle.config.ts
│
├── packages/                     # Shared packages
│   ├── ui/                       # Shared UI components
│   ├── types/                    # Shared TypeScript types & Zod schemas
│   ├── tsconfig/                 # Shared TypeScript configs
│   └── eslint-config/            # Shared ESLint configs
│
├── infra/                        # Infrastructure
│   ├── docker/
│   │   ├── compose.dev.yml       # PostgreSQL + Adminer
│   │   └── compose.agents.yml    # Future agent services
│   └── supabase/
│       ├── migrations/           # SQL migrations
│       ├── policies/             # RLS policies
│       └── seed/                 # Seed data
│
├── services/
│   └── api/                      # Future FastAPI backend (placeholder)
│
├── workers/
│   └── agents/                   # Future LangGraph agents (placeholder)
│
├── tooling/
│   └── scripts/                  # Utility scripts
│
└── .github/workflows/            # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([install via nvm](https://github.com/nvm-sh/nvm))
- **pnpm** 9+ (`npm install -g pnpm`)
- **Docker** & Docker Compose ([install](https://docs.docker.com/get-docker/))
- **Git**

### 1. Clone and Install

```bash
git clone <your-repo-url> pint
cd pint

# Use correct Node version
nvm use

# Install dependencies
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```bash
# Local development uses Docker PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/pint

# Supabase (local or cloud)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Start Database

```bash
# Start PostgreSQL + Adminer
pnpm docker:up

# Check status
docker ps

# Access Adminer at http://localhost:8080
# Server: db
# Username: postgres
# Password: postgres
# Database: pint
```

### 4. Run Migrations

```bash
# Apply SQL migrations
pnpm migrate:dev
```

### 5. Start Development Server

```bash
# Start Next.js dev server
pnpm dev

# App will be available at http://localhost:3000
```

## 🔑 Authentication Setup

The app uses Supabase Authentication with full UI implementation (login/signup).

### Option A: Local Supabase (Recommended for Development)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (optional, if you want full local stack)
npx supabase init
npx supabase start

# Get your local credentials
npx supabase status
```

Update `.env` with the credentials from `supabase status`.

### Option B: Supabase Cloud

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the project URL and anon key to `.env`
3. Run migrations via Supabase Dashboard or CLI

### Creating Your First User

1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter email, password, and full name
4. Sign in with your credentials

## 📝 Features Implemented

### ✅ Authentication
- Full auth UI (login/signup pages)
- Supabase Auth integration
- Session management with middleware
- Route protection

### ✅ Posts CRUD
- **List posts**: View all published posts (or your drafts)
- **Create post**: Simple form with title + content
- **Edit post**: Update your posts with revision history
- **Delete post**: Remove your posts
- **Publish**: Change draft to published status
- **RLS enforcement**: Only authors can edit/delete their posts

### ✅ Database
- PostgreSQL with Drizzle ORM
- Type-safe queries
- Migrations system
- Row Level Security (RLS) policies
- Audit logging

### ✅ UI/UX
- Responsive design with Tailwind CSS
- shadcn/ui components
- Toast notifications
- Loading states
- Form validation with Zod + react-hook-form

## 🛠️ Development Commands

```bash
# Development
pnpm dev                # Start all apps in dev mode
pnpm build              # Build all apps for production
pnpm lint               # Lint all packages
pnpm typecheck          # Type check all packages
pnpm test               # Run tests (when implemented)

# Database
pnpm docker:up          # Start Docker services
pnpm docker:down        # Stop Docker services
pnpm docker:logs        # View Docker logs
pnpm migrate:dev        # Run Drizzle migrations
pnpm db:generate        # Generate migration from schema changes
pnpm db:push            # Push schema directly (dev only)
pnpm db:studio          # Open Drizzle Studio

# Formatting
pnpm format             # Format code with Prettier

# Clean
pnpm clean              # Remove node_modules and build artifacts
```

## 🧪 Testing (Infrastructure Only)

Testing infrastructure is set up but no tests are written yet:

```bash
# Run tests (when implemented)
cd app
pnpm test

# E2E tests with Playwright (when implemented)
pnpm test:e2e
```

## 🔒 Security Features

- **Row Level Security (RLS)**: PostgreSQL RLS policies ensure users can only modify their own data
- **Server Actions**: All mutations go through type-safe Server Actions
- **Input validation**: Zod schemas validate all inputs
- **Authentication**: Supabase Auth with secure session management
- **HTTPS required in production**

## 📦 Workspace Packages

### `@pint/app`
Main Next.js application with all pages and features.

### `@pint/ui`
Shared UI components (currently exports shadcn/ui components).

### `@pint/types`
Shared TypeScript types and Zod schemas for validation.

### `@pint/eslint-config`
Shared ESLint configuration for consistent linting.

### `@pint/tsconfig`
Shared TypeScript configurations (base, Next.js, library).

## 🚢 Deployment

### Vercel (Recommended for Next.js)

1. **Connect GitHub repository** to Vercel
2. **Set environment variables**:
   ```bash
   DATABASE_URL=<your-production-db-url>
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
   ```
3. **Deploy**: Vercel auto-deploys on push to main

### Database (Supabase Cloud)

1. Create a Supabase project
2. Run migrations from local:
   ```bash
   npx supabase db push
   ```
3. Or apply migrations manually via Supabase Dashboard

### Self-Hosted

Build and run with Docker:

```bash
# Build Next.js app
pnpm build

# Start with PM2 or similar
cd app
pnpm start
```

## 🔮 Future Enhancements

### FastAPI Backend (Placeholder Ready)
- RESTful API for complex backend logic
- Background task processing
- Machine learning model serving
- Location: `services/api/`

### LangGraph Agents (Placeholder Ready)
- AI-powered content analysis
- Automated summarization
- Policy recommendations
- Multi-agent workflows
- Location: `workers/agents/`

### Additional Features (Roadmap)
- [ ] Rich text editor (Tiptap or Lexical)
- [ ] Image uploads (Supabase Storage)
- [ ] Comments on posts
- [ ] Tags and categories
- [ ] Search functionality
- [ ] User profiles
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics
- [ ] API documentation (when FastAPI is added)

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Restart services
pnpm docker:down && pnpm docker:up

# Check logs
pnpm docker:logs
```

### Migration Errors

```bash
# Reset local database (WARNING: destroys data)
docker compose -f infra/docker/compose.dev.yml down -v
pnpm docker:up
pnpm migrate:dev
```

### Build Errors

```bash
# Clean and reinstall
pnpm clean
pnpm install
pnpm build
```

### Supabase Auth Issues

1. Verify `.env` has correct Supabase credentials
2. Check Supabase project is running (cloud or local)
3. Verify auth is enabled in Supabase dashboard
4. Check middleware configuration in `app/src/middleware.ts`

## 📚 Documentation Links

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[Add your license here]

## 👥 Authors

- Initial setup: [Your Name]

---

**Built with ❤️ for transparent governance and collaborative policy-making.**
