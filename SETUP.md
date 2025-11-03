# Pint Setup Guide

Complete guide to setting up the Pint monorepo from scratch.

## System Requirements

- **OS**: macOS, Linux, or WSL2 on Windows
- **Node.js**: 20.x or higher
- **pnpm**: 9.x or higher
- **Docker**: Latest version
- **Git**: Latest version

## Step-by-Step Setup

### 1. Install Prerequisites

#### Node.js via nvm (recommended)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 20
nvm install 20
nvm use 20
```

#### pnpm

```bash
npm install -g pnpm@9
```

#### Docker Desktop

Download and install from [docker.com](https://www.docker.com/products/docker-desktop/).

### 2. Clone Repository

```bash
git clone <your-repo-url> pint
cd pint
```

### 3. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

This will install dependencies for:
- Root workspace
- Next.js app
- All shared packages

### 4. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your editor:

```bash
# Required for local development
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/pint

# Supabase - Local (will be set after starting Supabase)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<see below>
SUPABASE_SERVICE_ROLE_KEY=<see below>
```

### 5. Start Database Services

```bash
# Start PostgreSQL and Adminer
pnpm docker:up

# Verify services are running
docker ps
```

You should see:
- `pint-postgres` on port 54322
- `pint-adminer` on port 8080

### 6. Supabase Setup

#### Option A: Minimal Setup (Faster, Good for Development)

Use the simple PostgreSQL from Docker + manual RLS policies:

```bash
# Run the initial migration to create tables
pnpm migrate:dev

# Apply RLS policies manually
docker exec -i pint-postgres psql -U postgres -d pint < infra/supabase/migrations/0001_init.sql
docker exec -i pint-postgres psql -U postgres -d pint < infra/supabase/policies/posts.sql
```

For auth, you'll need to use Supabase Cloud (free tier) or run Supabase locally (Option B).

#### Option B: Full Local Supabase Stack

```bash
# Install Supabase CLI
npm install -g supabase

# Start Supabase services (this includes PostgreSQL, Auth, Storage, etc.)
npx supabase start

# Get your credentials
npx supabase status
```

Copy the following from `supabase status` output to your `.env`:
- API URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key → `SUPABASE_SERVICE_ROLE_KEY`

#### Option C: Supabase Cloud

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy credentials from Project Settings > API
4. Paste into `.env`
5. Apply migrations via Supabase dashboard or CLI

### 7. Database Migrations

```bash
# Run Drizzle migrations
pnpm migrate:dev
```

This creates:
- `user_profiles` table
- `posts` table
- `post_revisions` table
- `audit_log` table
- Indexes for performance
- RLS policies

### 8. Verify Database Setup

Access Adminer at http://localhost:8080:

- **Server**: `db`
- **Username**: `postgres`
- **Password**: `postgres`
- **Database**: `pint`

You should see all tables created.

### 9. Start Development Server

```bash
# Start Next.js dev server
pnpm dev
```

Open http://localhost:3000 in your browser.

### 10. Create Your First Account

1. Navigate to http://localhost:3000
2. You'll be redirected to the login page
3. Click "Sign up"
4. Enter:
   - Full Name: Your Name
   - Email: test@example.com
   - Password: test123 (minimum 6 characters)
5. Click "Create account"
6. Sign in with your credentials

### 11. Create Your First Post

1. After signing in, you'll see the Posts page
2. Click "New Post"
3. Enter a title and content
4. Click "Create Post"
5. Your post is created as a draft
6. Click "Publish" to make it public

## Verification Checklist

Run through this checklist to ensure everything is working:

- [ ] `pnpm install` completed without errors
- [ ] Docker services are running (`docker ps` shows 2 containers)
- [ ] Adminer is accessible at http://localhost:8080
- [ ] Database tables exist in PostgreSQL
- [ ] Next.js dev server starts (`pnpm dev`)
- [ ] Can access http://localhost:3000
- [ ] Can sign up for a new account
- [ ] Can sign in with credentials
- [ ] Can create a new post
- [ ] Can edit your post
- [ ] Can publish a post
- [ ] Can delete a post
- [ ] Published posts are visible to all users
- [ ] Draft posts are only visible to author

## Common Issues

### Port Already in Use

If port 3000, 8080, or 54322 is already in use:

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change the port in the command
cd app && PORT=3001 pnpm dev
```

### Docker Services Won't Start

```bash
# Stop all Docker containers
docker stop $(docker ps -a -q)

# Remove volumes and restart
docker compose -f infra/docker/compose.dev.yml down -v
pnpm docker:up
```

### Supabase Auth Not Working

1. Verify `.env` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Restart dev server after changing `.env`
3. Check browser console for errors
4. Verify Supabase project is running (cloud or local)

### Database Migration Errors

```bash
# Reset database and re-run migrations
docker compose -f infra/docker/compose.dev.yml down -v
pnpm docker:up
pnpm migrate:dev
```

### Build Errors

```bash
# Clean everything and reinstall
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

## Next Steps

After setup is complete, you can:

1. **Explore the codebase**: Read through the code structure
2. **Customize styling**: Edit Tailwind config and add custom styles
3. **Add features**: Implement new functionality
4. **Set up CI/CD**: Configure GitHub Actions secrets
5. **Deploy**: Follow deployment guide in README.md

## Getting Help

If you encounter issues not covered here:

1. Check the main [README.md](./README.md)
2. Review the [troubleshooting section](./README.md#troubleshooting)
3. Check package-specific documentation
4. Open an issue on GitHub

---

**Setup complete! You're ready to start developing on Pint.** 🎉
