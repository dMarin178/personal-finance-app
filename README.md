# Personal Finance App

A modern web application to manage credit cards and track expenses.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Credit Card Management**: Create and manage multiple credit cards
- **Expense Tracking**: Add and track expenses for each credit card
- **Balance Calculation**: Automatic calculation of credit card balance and available credit
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Language**: TypeScript

### Backend
- **API Routes**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Password Hashing**: bcryptjs

### DevOps
- **Containerization**: Docker & Docker Compose
- **Development**: Hot-reload with Docker volumes
- **Database**: SQLite (file-based, persisted in Docker volume)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   └── register/         # Register page
├── domain/               # Business logic entities
│   ├── entities/        # User, CreditCard, Expense
│   └── repositories/    # Repository interfaces
├── application/          # Use cases (business operations)
│   └── use-cases/       # RegisterUser, Login, CreateCard, etc.
├── infrastructure/       # External integrations
│   ├── auth/           # JWT utilities
│   └── database/       # Database implementations
└── presentation/         # UI components and hooks
    ├── components/     # React components
    └── hooks/         # Custom hooks (Zustand stores)
```

## Database Architecture

The application uses a **solid, flexible architecture** that makes switching databases easy:

### Design Approach
- **Repository Pattern**: All data access is abstracted behind repository interfaces
- **Prisma ORM**: Database agnostic layer provides type safety & migrations
- **SQLite Default**: Lightweight file-based database for development
- **Easy Migration**: To switch databases:
  1. Update `prisma/schema.prisma` datasource provider (PostgreSQL, MySQL, etc.)
  2. Run `npx prisma migrate dev`
  3. No changes needed in application code - repositories handle it

### Files Structure
```
prisma/
├── schema.prisma          # Database schema (easy to modify)
├── dev.db                 # Development SQLite file
└── seed.ts               # Sample data seeding

src/domain/repositories/   # Repository interfaces (database-agnostic)
src/infrastructure/database/repositories/
├── prisma-*.ts           # Prisma implementations of repositories
└── in-memory-*.ts        # Alternative in-memory implementations
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development without Docker)

### Installation & Running

#### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd personal-finance-app

# Create .env file from example
cp .env.example .env

# Start the application
docker-compose up -d

# The app will automatically run migrations and start
# Watch logs (optional)
docker-compose logs -f web
```

The application will be available at:
- **Web App**: http://localhost:3000
- **API**: http://localhost:3000/api

#### Option 2: Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Credit Cards
- `GET /api/credit-cards` - Get user's credit cards (requires auth)
- `POST /api/credit-cards/create` - Create new credit card (requires auth)

### Expenses
- `POST /api/expenses` - Add expense to credit card (requires auth)

## Testing

### Unit Tests
```bash
npm run test
npm run test:ui
npm run test:coverage
```

### E2E Tests
```bash
npm run e2e
npm run e2e:ui
npm run e2e:debug
```

## Environment Variables

See `.env.example` for all required environment variables:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

For SQLite, Prisma resolves `file:./dev.db` relative to [prisma/schema.prisma](/home/dmarin/Documents/projects/finance-app/personal-finance-app/prisma/schema.prisma), so the actual database file on disk is [prisma/dev.db](/home/dmarin/Documents/projects/finance-app/personal-finance-app/prisma/dev.db).

## Database Commands

```bash
# Generate Prisma client (auto-runs on start)
npx prisma generate

# Run migrations
npx prisma migrate dev

# Push schema to database (for SQLite)
npx prisma db push

# Seed initial data
npx prisma db seed

# Open Prisma Studio (GUI for database)
npx prisma studio

# Query SQLite from the terminal
npm run db:query -- tables
npm run db:query -- users
npm run db:query -- query "SELECT * FROM CreditCard LIMIT 5;"

# Reset database (careful!)
npx prisma migrate reset
```

## Switching Databases

To switch from SQLite to PostgreSQL or MySQL:

1. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"  // or "mysql"
     url      = env("DATABASE_URL")
   }
   ```
 **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

That's it! No code changes needed - repositories handle the abstraction.

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes** - Code follows clean architecture patterns

3. **Write tests**
   ```bash
   npm run test
   ```

4. **Run E2E tests**
   ```bash
   npm run e2e
   ```

5. **Commit and push**

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f web

# Access database shell
docker-compose exec postgres psql -U user -d personal_finance_db

# Rebuild images
docker-compose up -d --build
```

## CI/CD with GitHub Actions

This repository includes two workflows:

- `CI`: runs lint, unit tests, build, and E2E tests on pull requests and pushes to `main`
- `CD`: deploys to production after CI succeeds on `main` (or manually via workflow dispatch)

### Workflow files

- `.github/workflows/ci.yml`
- `.github/workflows/cd.yml`

### Required GitHub Secrets (CD)

Configure these in your repository settings (`Settings` -> `Secrets and variables` -> `Actions`):

- `PROD_SSH_HOST`: production server host/IP
- `PROD_SSH_USER`: SSH user
- `PROD_SSH_KEY`: private SSH key (PEM format)
- `PROD_SSH_PORT`: SSH port (usually `22`)
- `PROD_APP_PATH`: absolute path on server where this repo exists

### Production server prerequisites

- Docker and Docker Compose plugin installed (`docker compose` command available)
- Repository already cloned on server in `PROD_APP_PATH`
- A valid `.env` file in the project root with production values used by `docker-compose.prod.yml`

### Deployment behavior

The CD workflow performs:

1. SSH into your server
2. `git fetch` + `git pull` on `main`
3. `docker compose -f docker-compose.prod.yml up -d --build`
4. `docker image prune -f`

If you want safer zero-downtime or rollback support, add a reverse proxy + blue/green strategy in a follow-up iteration.

## Database

The application uses PostgreSQL. Database credentials and configuration are in `.env` and `docker-compose.yml`.

To access the database through pgAdmin:
1. Go to http://localhost:5050
2. Login with `admin@example.com` / `admin`
3. Create a new server pointing to `postgres:5432`

## Next Steps

After initial setup, the following features can be added:

- [ ] Complete database integration (replace in-memory repositories with Prisma/TypeORM)
- [ ] Add expense detail pages and filtering
- [ ] Monthly statement generation
- [ ] Add expense detail pages and filtering
- [ ] Monthly statement generation
- [ ] Credit card payment tracking
- [ ] User profile settings
- [ ] Transaction history export (CSV/PDF)
- [ ] Email notifications
- [ ] Dark mode support
- [ ] Advanced analytics and charts
- [ ] Multi-currency support
- [ ] API documentation (Swagger)
1. Follow the existing code structure
2. Write tests for new features
3. Keep commits atomic and meaningful
4. Update documentation as needed

## License

MIT
