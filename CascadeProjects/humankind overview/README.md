# Course Tracker

A collaborative training program management platform that enables seamless content creation, client engagement, and multi-language support.

## Features

- 📚 **Training Programme Management** - Create and manage comprehensive training programmes with courses, modules, and units
- 👥 **Client Collaboration** - Enable clients to review content, provide feedback, and participate in the authorship process  
- 🌐 **Multi-Language Support** - Automated translation workflows for Dutch, French, and Simplified Chinese
- 🔒 **Role-Based Access** - Secure authentication with role-based permissions for composers, principals, and clients
- 📱 **Responsive Design** - Works seamlessly across desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd course-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_SECRET=your_nextauth_secret_key
   ```

4. **Set up the database**
   ```bash
   # Run the database schema script in your Supabase SQL editor
   # or use the Supabase CLI
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run end-to-end tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with sample data

## Project Structure

```
course-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   ├── content/            # Content management components
│   │   ├── client/             # Client portal components
│   │   └── common/             # Shared components
│   ├── lib/                    # Utility libraries
│   ├── types/                  # TypeScript type definitions
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Business logic services
│   ├── middleware/             # API middleware
│   └── styles/                 # Global styles
├── __tests__/                  # Test files
├── e2e/                        # End-to-end tests
├── scripts/                    # Build and utility scripts
├── docs/                       # Documentation
└── public/                     # Static assets
```

## Development Workflow

### Creating New Components

1. Create component files in the appropriate directory under `src/components/`
2. Export from the component's index file
3. Add TypeScript interfaces in `src/types/`
4. Write tests in `__tests__/components/`

### API Development

1. Create API routes in `src/app/api/`
2. Use the error handler middleware for consistent error responses
3. Add types for request/response in `src/types/`
4. Write API tests in `__tests__/api/`

### Database Changes

1. Update the schema in `scripts/database-schema.sql`
2. Update TypeScript types in `src/lib/supabase.ts`
3. Run migrations using Supabase CLI or SQL editor

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test -- --coverage
```

## Deployment

The application is configured for deployment on Vercel with automatic deployments from the main branch.

### Environment Variables

Set the following environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `GOOGLE_TRANSLATE_API_KEY`

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Architecture

This application follows a clean architecture pattern with clear separation of concerns:

- **Presentation Layer**: React components and pages
- **Business Logic**: Services and custom hooks
- **Data Layer**: Supabase client and API routes
- **Infrastructure**: Middleware, utilities, and configuration

For detailed architecture information, see [docs/architecture.md](docs/architecture.md).

## License

This project is private and confidential.

