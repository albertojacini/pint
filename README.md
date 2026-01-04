# Pint - Public Interface

**Pint** (Public Interface) is a public policies platform that serves as a UX-rich reference for up-to-date information about public administrations and policies, while also functioning as a collaboration platform for political projects.

> **📖 Policy Framework**: See [docs/POLICY_FRAMEWORK.md](docs/POLICY_FRAMEWORK.md) for details on the data-driven policy analysis system: `idea → effect → measurable → contribution → goal`

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, Tailwind, shadcn/ui
- **Backend**: FastAPI + AI Agents (LangGraph, Claude SDK, DeepAgents)
- **Database**: PostgreSQL/Supabase + Drizzle ORM
- **Deployment**: Vercel + Render.com
- **Monorepo**: pnpm + Turborepo

## 📁 Project Structure

```
pint/
├── app/                    # Next.js frontend
├── backend/                # FastAPI + AI agents
├── packages/               # Shared code
├── supabase/migrations/    # Database migrations
└── tooling/scripts/        # Utility scripts
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

### (Optional) Backend Setup

Backend runs at https://pint-agents.onrender.com in production. For local development:

```bash
cd backend && source .venv/bin/activate && uv sync
uv run uvicorn api.main:app --reload
```

Requires Python 3.12+, uv, and API keys in backend/.env

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

### ✅ Backend & AI
- FastAPI backend with AI research agents (LangGraph, Claude SDK, DeepAgents)
- Provision ingestion with AI-assisted research
- Deployed to Render.com

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

# Backend
cd backend && source .venv/bin/activate && uv run uvicorn api.main:app --reload  # Start backend
```

## 🚢 Deployment

**Production**:
- Frontend: Vercel
- Backend: Render.com (https://pint-agents.onrender.com)
- Database: Supabase Cloud

Setup: Connect repo to Vercel and Render, configure environment variables (see `.env.example` and `render.yaml`), auto-deploys on push to main.

## 🔮 Future Enhancements

- [ ] Rich text editor (Tiptap or Lexical)
- [ ] Image uploads (Supabase Storage)
- [ ] Comments on posts
- [ ] Tags and categories
- [ ] Search functionality
- [ ] User profiles
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Advanced AI orchestration
- [ ] Policy recommendation engine

## 🐛 Troubleshooting

```bash
# Database issues
docker ps                           # Check if PostgreSQL is running
pnpm docker:down && pnpm docker:up  # Restart services

# Build issues
pnpm clean && pnpm install && pnpm build

# Backend issues
cd backend && source .venv/bin/activate  # Always activate environment first
curl http://localhost:8000/health        # Check backend health
```

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
