# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern Next.js 15+ full-stack application optimized for the Vercel ecosystem. TypeScript strict mode, arrow functions preferred, App Router architecture with Server Components, Server Actions, and Edge Runtime.

**Recommended Version:** Next.js 15.0.3+ (verify latest stable version at project start with `npm view next versions` to avoid known bugs)

## Architecture

### Next.js App Router Structure

```
project/
├── app/
│   ├── (auth)/                 # Route group (auth pages)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/            # Route group (protected routes)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── users/
│   │   └── settings/
│   ├── api/                    # API Routes
│   │   ├── auth/
│   │   └── users/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css
├── components/
│   ├── ui/                     # Shadcn components
│   ├── forms/
│   ├── layouts/
│   └── providers/
├── lib/
│   ├── actions/                # Server Actions
│   ├── db/                     # Prisma client
│   ├── auth/                   # NextAuth config
│   ├── utils/                  # Utilities
│   └── validations/            # Zod schemas
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
└── middleware.ts               # Edge middleware
```

### Rendering Strategy
- **Server Components (default):** Data fetching, database queries
- **Client Components (`'use client'`):** Interactivity, browser APIs, hooks
- **Server Actions:** Mutations, form submissions
- **Route Handlers (API Routes):** External API endpoints, webhooks
- **Edge Runtime:** Middleware, auth checks, geolocation

## Technology Stack

### Core
- Next.js 15+ (App Router)
- TypeScript 5+ (strict mode)
- React 19+ (Server Components)

### Styling
- Tailwind CSS
- Shadcn/UI (Radix UI + Tailwind)
- CSS Modules (when needed)

### Database & ORM
- Prisma ORM
- PostgreSQL (Vercel Postgres recommended)
- Alternative: MySQL, MongoDB

### Authentication
- NextAuth.js v5 (Auth.js)
- JWT sessions
- OAuth providers (Google, GitHub, etc.)

### State Management
- React Server Components (server state)
- Zustand (client state, minimal usage)
- URL state (searchParams)

### Forms & Validation
- React Hook Form
- Zod schemas
- Server-side validation

### Deployment
- Vercel (optimized)
- Edge Functions
- Incremental Static Regeneration (ISR)
- Image Optimization

## Development Commands

### Initial Setup
```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Generate PWA icons (if needed)
# Use tools like https://realfavicongenerator.net/
# Or create manually: 192x192, 512x512, apple-touch-icon (180x180)

# Generate VAPID keys for push notifications (if needed)
npx web-push generate-vapid-keys
```

### Development
```bash
# Start dev server
pnpm dev

# Start with turbopack
pnpm dev --turbo

# Open in browser
open http://localhost:3000
```

### Database Operations
```bash
# Generate Prisma client
pnpm db:generate

# Create migration
pnpm db:migrate:dev

# Run migrations in production
pnpm db:migrate:deploy

# Open Prisma Studio
pnpm db:studio

# Reset database (destructive!)
pnpm db:reset

# Seed database
pnpm db:seed
```

### Building & Testing
```bash
# Build for production
pnpm build

# Start production server locally
pnpm start

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# E2E tests (Playwright)
pnpm test:e2e

# Type check
pnpm type-check

# Lint
pnpm lint

# Format
pnpm format
```

### Deployment (Vercel)
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Environment variables
vercel env add
vercel env pull .env.local
```

## Code Style & Conventions

### TypeScript Strict Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Arrow Functions (Required)

**✅ Always use arrow functions:**

```typescript
// Server Components
const UsersPage = async () => {
  const users = await db.user.findMany();
  return <div>{users.map((user) => user.name)}</div>;
};

export default UsersPage;

// Client Components
'use client';

export const Counter: React.FC = () => {
  const [count, setCount] = useState(0);

  const increment = (): void => {
    setCount((prev) => prev + 1);
  };

  return <button onClick={increment}>{count}</button>;
};

// Server Actions
'use server';

export const createUser = async (formData: FormData): Promise<ActionResult> => {
  const data = Object.fromEntries(formData);
  const validated = await userSchema.parseAsync(data);

  const user = await db.user.create({ data: validated });
  revalidatePath('/users');

  return { success: true, user };
};

// API Route Handlers
export const GET = async (request: Request): Promise<Response> => {
  const users = await db.user.findMany();
  return Response.json(users);
};

export const POST = async (request: Request): Promise<Response> => {
  const body = await request.json();
  const validated = await userSchema.parseAsync(body);

  const user = await db.user.create({ data: validated });
  return Response.json(user, { status: 201 });
};

// Utilities
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Custom Hooks
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

**❌ Never use function declarations:**
```typescript
// Don't do this
function UsersPage() { }
function formatDate(date: Date): string { }
export function GET(request: Request) { }
```

### Naming Conventions
- **Files:** kebab-case (`user-profile.tsx`, `create-user.ts`)
- **Components:** PascalCase (`UserProfile`, `LoginForm`)
- **Server Actions:** camelCase (`createUser`, `updateProfile`)
- **Route Handlers:** Uppercase HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
- **Types:** PascalCase (`User`, `CreateUserInput`, `ActionResult`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_URL`)

## Async Request APIs (Next.js 15+)

### Breaking Change: Dynamic APIs are Now Async

In Next.js 15+, the following APIs are **asynchronous** and must be awaited:
- `cookies()`
- `headers()`
- `draftMode()`
- `params` (in layouts, pages, route handlers, generateMetadata)
- `searchParams` (in pages)

### Server Components with Async APIs

```typescript
// app/users/[id]/page.tsx
import { cookies, headers } from 'next/headers';
import { db } from '@/lib/db';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const UserPage = async ({ params, searchParams }: PageProps) => {
  // Await all dynamic APIs
  const cookieStore = await cookies();
  const headersList = await headers();
  const { id } = await params;
  const { tab } = await searchParams;

  const theme = cookieStore.get('theme');
  const userAgent = headersList.get('user-agent');

  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Active tab: {tab ?? 'profile'}</p>
    </div>
  );
};

export default UserPage;
```

### Server Actions with Async APIs

```typescript
// lib/actions/user-actions.ts
'use server';

import { cookies, headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export const createSession = async (userId: string): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set('session', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
  });

  revalidatePath('/dashboard');
};

export const getUserFromSession = async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.value },
  });
};
```

### Route Handlers with Async Params

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = async (
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> => {
  // Await params in Next.js 15+
  const { id } = await context.params;

  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
};

export const DELETE = async (
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> => {
  const { id } = await context.params;

  await db.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
};
```

### Metadata Generation with Async Params

```typescript
// app/users/[id]/page.tsx
import type { Metadata } from 'next';
import { db } from '@/lib/db';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id } = await params;

  const user = await db.user.findUnique({ where: { id } });

  return {
    title: user?.name ?? 'User',
    description: `Profile of ${user?.name}`,
  };
};

const UserPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });

  return <div>{user?.name}</div>;
};

export default UserPage;
```

## Fetch Caching (Next.js 15+)

### Breaking Change: No Default Caching

In Next.js 15+, `fetch` requests are **no longer cached by default**. You must explicitly opt into caching.

### Explicit Cache Configuration

```typescript
// Cached fetch (recommended for static data)
const users = await fetch('https://api.example.com/users', {
  cache: 'force-cache' // Required for caching
});

// Revalidate every hour
const posts = await fetch('https://api.example.com/posts', {
  next: { revalidate: 3600 }
});

// Never cache (default behavior)
const liveData = await fetch('https://api.example.com/live', {
  cache: 'no-store'
});

// Revalidate on demand
const products = await fetch('https://api.example.com/products', {
  next: { tags: ['products'] }
});
// Later: revalidateTag('products');
```

### Layout-wide Caching

```typescript
// app/blog/layout.tsx
export const fetchCache = 'default-cache';

const BlogLayout = async ({ children }: { children: React.ReactNode }) => {
  // All fetches in this layout tree will be cached by default
  const categories = await fetch('https://api.example.com/categories');

  return (
    <div>
      <nav>{/* categories */}</nav>
      {children}
    </div>
  );
};

export default BlogLayout;
```

### Route Segment Config

```typescript
// app/dashboard/page.tsx

// Force static rendering
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

const DashboardPage = async () => {
  const stats = await fetch('https://api.example.com/stats', {
    cache: 'force-cache'
  });

  return <div>{/* stats */}</div>;
};

export default DashboardPage;
```

## Server Components (Default)

### Data Fetching in Server Components

```typescript
// app/users/page.tsx
import { db } from '@/lib/db';
import { UserCard } from '@/components/user-card';

type PageProps = {
  searchParams: {
    page?: string;
    search?: string;
  };
};

const UsersPage = async ({ searchParams }: PageProps) => {
  const page = parseInt(searchParams.page ?? '1');
  const search = searchParams.search ?? '';

  // Direct database access in Server Components
  const users = await db.user.findMany({
    where: {
      name: { contains: search, mode: 'insensitive' },
    },
    take: 20,
    skip: (page - 1) * 20,
  });

  return (
    <div>
      <h1>Users</h1>
      <div className="grid gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
```

### Parallel Data Fetching

```typescript
// app/dashboard/page.tsx
const DashboardPage = async () => {
  // Parallel fetching
  const [stats, recentOrders, topProducts] = await Promise.all([
    db.order.aggregate({ _count: true, _sum: { total: true } }),
    db.order.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
    db.product.findMany({ take: 5, orderBy: { sales: 'desc' } }),
  ]);

  return (
    <div>
      <Stats data={stats} />
      <RecentOrders orders={recentOrders} />
      <TopProducts products={topProducts} />
    </div>
  );
};

export default DashboardPage;
```

### Loading & Error States

```typescript
// app/users/loading.tsx
const Loading = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
};

export default Loading;

// app/users/error.tsx
'use client';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Error: React.FC<ErrorProps> = ({ error, reset }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
      <p className="text-gray-600">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
        Try again
      </button>
    </div>
  );
};

export default Error;
```

## Client Components

### When to Use 'use client'

Use client components for:
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, window, etc.)
- Third-party libraries that use browser APIs

```typescript
// components/counter.tsx
'use client';

import { useState } from 'react';

type CounterProps = {
  initialCount?: number;
};

export const Counter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);

  const increment = (): void => {
    setCount((prev) => prev + 1);
  };

  const decrement = (): void => {
    setCount((prev) => prev - 1);
  };

  return (
    <div className="flex items-center gap-4">
      <button onClick={decrement} className="rounded bg-red-500 px-4 py-2 text-white">
        -
      </button>
      <span className="text-2xl font-bold">{count}</span>
      <button onClick={increment} className="rounded bg-green-500 px-4 py-2 text-white">
        +
      </button>
    </div>
  );
};
```

### Composing Server and Client Components

```typescript
// app/users/[id]/page.tsx (Server Component)
import { db } from '@/lib/db';
import { UserActions } from './user-actions'; // Client Component

type PageProps = {
  params: { id: string };
};

const UserPage = async ({ params }: PageProps) => {
  const user = await db.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {/* Pass data from Server to Client Component */}
      <UserActions userId={user.id} />
    </div>
  );
};

export default UserPage;

// app/users/[id]/user-actions.tsx (Client Component)
'use client';

import { deleteUser } from '@/lib/actions/user-actions';

type UserActionsProps = {
  userId: string;
};

export const UserActions: React.FC<UserActionsProps> = ({ userId }) => {
  const handleDelete = async (): Promise<void> => {
    if (confirm('Are you sure?')) {
      await deleteUser(userId);
    }
  };

  return (
    <button onClick={handleDelete} className="rounded bg-red-600 px-4 py-2 text-white">
      Delete User
    </button>
  );
};
```

## Server Actions

### Creating Server Actions

```typescript
// lib/actions/user-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';

// Type-safe result
type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

// Validation schema
const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const createUser = async (formData: FormData): Promise<ActionResult> => {
  try {
    // Validate input
    const rawData = Object.fromEntries(formData);
    const validatedData = await createUserSchema.parseAsync(rawData);

    // Create user
    const user = await db.user.create({
      data: validatedData,
    });

    // Revalidate cache
    revalidatePath('/users');

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message ?? 'Validation failed' };
    }
    return { success: false, error: 'Failed to create user' };
  }
};

export const deleteUser = async (userId: string): Promise<ActionResult> => {
  try {
    await db.user.delete({ where: { id: userId } });

    revalidatePath('/users');
    redirect('/users');
  } catch (error) {
    return { success: false, error: 'Failed to delete user' };
  }
};

export const updateUser = async (
  userId: string,
  formData: FormData
): Promise<ActionResult> => {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedData = await createUserSchema.partial().parseAsync(rawData);

    const user = await db.user.update({
      where: { id: userId },
      data: validatedData,
    });

    revalidatePath(`/users/${userId}`);

    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: 'Failed to update user' };
  }
};
```

### Using Server Actions in Forms

```typescript
// components/forms/create-user-form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createUser } from '@/lib/actions/user-actions';

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? 'Creating...' : 'Create User'}
    </button>
  );
};

export const CreateUserForm: React.FC = () => {
  const [state, formAction] = useFormState(createUser, { success: false });

  return (
    <form action={formAction} className="space-y-4">
      {!state.success && state.error && (
        <div className="rounded bg-red-50 p-4 text-red-600">{state.error}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={8}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <SubmitButton />
    </form>
  );
};
```

### Server Actions with useTransition

```typescript
'use client';

import { useTransition } from 'react';
import { deleteUser } from '@/lib/actions/user-actions';

type DeleteButtonProps = {
  userId: string;
};

export const DeleteButton: React.FC<DeleteButtonProps> = ({ userId }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (): void => {
    if (confirm('Are you sure?')) {
      startTransition(async () => {
        await deleteUser(userId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
};
```

## API Routes (Route Handlers)

### Creating API Routes

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');

    const users = await db.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const validatedData = await createUserSchema.parseAsync(body);

    const user = await db.user.create({
      data: validatedData,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
};

// app/api/users/[id]/route.ts
type RouteContext = {
  params: { id: string };
};

export const GET = async (
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> => {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> => {
  try {
    await db.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
};
```

## Database with Prisma

### Prisma Client Setup

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
```

### Prisma Schema Best Practices

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     Post[]

  @@index([email])
  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([authorId])
  @@index([published])
  @@map("posts")
}
```

## Authentication with NextAuth.js v5

### Auth Configuration

```typescript
// lib/auth/config.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { db } from '@/lib/db';
import { comparePassword } from '@/lib/auth/password';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const validated = await loginSchema.parseAsync(credentials);

        const user = await db.user.findUnique({
          where: { email: validated.email },
        });

        if (!user) return null;

        const isValid = await comparePassword(validated.password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

// app/api/auth/[...nextauth]/route.ts
export { handlers as GET, handlers as POST } from '@/lib/auth/config';
```

### Protecting Routes with Middleware

```typescript
// middleware.ts
import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login') ||
                      req.nextUrl.pathname.startsWith('/register');
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard');

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Using Auth in Server Components

```typescript
// app/dashboard/page.tsx
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name}</h1>
    </div>
  );
};

export default DashboardPage;
```

## Progressive Web App (PWA)

### PWA Overview

Transform your Next.js application into a Progressive Web App for offline support, installability, and native-like experience.

### Manifest Configuration

Create a dynamic manifest using the App Router:

```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Your Application Full Name',
    short_name: 'App',
    description: 'Complete description of your application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-US',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    categories: ['productivity', 'utilities'],
    screenshots: [
      {
        src: '/screenshot-mobile.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow'
      },
      {
        src: '/screenshot-desktop.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide'
      }
    ]
  };
}
```

**Required Assets:**
- `public/icon-192x192.png` - Minimum Android icon
- `public/icon-512x512.png` - High-res Android icon
- `public/apple-touch-icon.png` - iOS home screen icon
- `public/favicon.ico` - Browser favicon

### Service Worker Setup

**Option 1: Basic Service Worker (Manual)**

```javascript
// public/sw.js
const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
  '/',
  '/offline',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request).then((response) => {
        return response || caches.match('/offline');
      }))
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Notification', body: '' };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: { url: data.url },
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
```

**Register Service Worker:**

```typescript
// app/layout.tsx
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
};

export default RootLayout;
```

```typescript
// components/service-worker-registration.tsx
'use client';

import { useEffect } from 'react';

export const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
};
```

**Option 2: Serwist (Recommended for Advanced PWA)**

```bash
pnpm add @serwist/next
```

```typescript
// next.config.js
const withSerwist = require('@serwist/next').default({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
});

module.exports = withSerwist({
  // Your Next.js config
});
```

Refer to [Serwist documentation](https://serwist.pages.dev/docs/next) for complete configuration.

### Offline Support

Create an offline fallback page:

```typescript
// app/offline/page.tsx
const OfflinePage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold">You are offline</h1>
      <p className="mt-4 text-gray-600">
        Please check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 rounded bg-blue-600 px-6 py-3 text-white"
      >
        Retry
      </button>
    </div>
  );
};

export default OfflinePage;
```

### Push Notifications

**Setup Push Notifications:**

```bash
# Generate VAPID keys
pnpm add web-push
npx web-push generate-vapid-keys
```

**Environment Variables:**

```bash
# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"
```

**Server Actions for Push:**

```typescript
// lib/actions/push-notifications.ts
'use server';

import webpush from 'web-push';
import { db } from '@/lib/db';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type PushSubscriptionData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export const subscribeToPush = async (
  userId: string,
  subscription: PushSubscriptionData
): Promise<{ success: boolean }> => {
  try {
    await db.pushSubscription.upsert({
      where: { userId },
      create: {
        userId,
        subscription: JSON.stringify(subscription),
      },
      update: {
        subscription: JSON.stringify(subscription),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save subscription:', error);
    return { success: false };
  }
};

export const sendPushNotification = async (
  userId: string,
  payload: { title: string; body: string; url?: string }
): Promise<{ success: boolean }> => {
  try {
    const subscriptionData = await db.pushSubscription.findUnique({
      where: { userId },
    });

    if (!subscriptionData) {
      return { success: false };
    }

    const subscription = JSON.parse(subscriptionData.subscription);

    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return { success: false };
  }
};
```

**Client-Side Push Setup:**

```typescript
// components/push-notification-setup.tsx
'use client';

import { useEffect, useState } from 'react';
import { subscribeToPush } from '@/lib/actions/push-notifications';

type PushNotificationSetupProps = {
  userId: string;
};

export const PushNotificationSetup: React.FC<PushNotificationSetupProps> = ({ userId }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<void> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push notifications not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        });

        const subscriptionData = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))
            ),
            auth: btoa(
              String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))
            ),
          },
        };

        await subscribeToPush(userId, subscriptionData);
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  if (permission === 'granted') return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h3 className="font-semibold">Enable Notifications</h3>
      <p className="mt-2 text-sm text-gray-600">
        Get notified about important updates
      </p>
      <button
        onClick={requestPermission}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Enable Notifications
      </button>
    </div>
  );
};
```

### Installation Prompt

```typescript
// components/install-prompt.tsx
'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async (): Promise<void> => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = (): void => {
    setShowPrompt(false);
    // Optionally set a cookie to not show again for a while
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg md:left-auto md:w-96">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold">Install App</h3>
          <p className="mt-1 text-sm text-gray-600">
            Install our app for a better experience with offline support
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="rounded border px-4 py-2 hover:bg-gray-50"
        >
          Not now
        </button>
      </div>
    </div>
  );
};
```

### PWA Configuration in next.config.js

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### PWA Testing

```bash
# Development
pnpm dev

# Test PWA features
# 1. Open Chrome DevTools > Application > Manifest
# 2. Check Service Workers tab
# 3. Test offline mode (Network tab > Offline)
# 4. Lighthouse audit for PWA score

# Production build
pnpm build
pnpm start
```

### PWA Best Practices

- ✅ Always use HTTPS in production
- ✅ Provide 192x192 and 512x512 icons
- ✅ Create offline fallback page
- ✅ Test on real mobile devices
- ✅ Implement update notification when new SW is available
- ✅ Use cache versioning strategy
- ✅ Monitor service worker lifecycle events
- ✅ Handle failed notifications gracefully
- ✅ Test installation on iOS Safari and Chrome Android

## Vercel-Specific Optimizations

### Edge Runtime

```typescript
// app/api/edge/route.ts
export const runtime = 'edge';

export const GET = async (request: Request): Promise<Response> => {
  // Runs on Edge Runtime (faster, globally distributed)
  return Response.json({ message: 'Hello from Edge' });
};
```

### Incremental Static Regeneration (ISR)

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

type PageProps = {
  params: Promise<{ slug: string }>;
};

const BlogPost = async ({ params }: PageProps) => {
  const { slug } = await params;

  const post = await db.post.findUnique({
    where: { slug },
  });

  return <article>{post?.content}</article>;
};

export default BlogPost;
```

### Image Optimization

```typescript
import Image from 'next/image';

export const Avatar: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="rounded-full"
      priority={false} // Lazy load by default
    />
  );
};
```

### Metadata API

```typescript
// app/users/[id]/page.tsx
import type { Metadata } from 'next';
import { db } from '@/lib/db';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });

  return {
    title: user?.name ?? 'User',
    description: `Profile of ${user?.name}`,
  };
};

const UserPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });

  return <div>{user?.name}</div>;
};

export default UserPage;
```

## Performance Best Practices

### Streaming with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';

const DashboardPage = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading stats...</div>}>
        <Stats />
      </Suspense>
      <Suspense fallback={<div>Loading orders...</div>}>
        <RecentOrders />
      </Suspense>
    </div>
  );
};

export default DashboardPage;
```

### Parallel Routes

```typescript
// app/dashboard/@stats/page.tsx
const StatsPage = async () => {
  const stats = await getStats();
  return <Stats data={stats} />;
};

// app/dashboard/@activity/page.tsx
const ActivityPage = async () => {
  const activity = await getActivity();
  return <Activity data={activity} />;
};

// app/dashboard/layout.tsx
const DashboardLayout = ({
  stats,
  activity,
}: {
  stats: React.ReactNode;
  activity: React.ReactNode;
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats}
      {activity}
    </div>
  );
};

export default DashboardLayout;
```

## Testing

```typescript
// __tests__/components/counter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Counter } from '@/components/counter';

describe('Counter', () => {
  it('increments count when button is clicked', () => {
    render(<Counter initialCount={0} />);

    const button = screen.getByText('+');
    fireEvent.click(button);

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
```

## Production Configuration

### Comprehensive next.config.js

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // TypeScript and ESLint Configuration
  typescript: {
    ignoreBuildErrors: false, // Fail build on TS errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Fail build on ESLint errors
  },

  // Optimize package bundling
  serverExternalPackages: ['sharp'], // Don't bundle sharp

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cdn.com',
        pathname: '/images/**',
      },
    ],
  },

  // Experimental features (Next.js 15+)
  experimental: {
    // Cache configuration
    staleTimes: {
      dynamic: 30, // 30 seconds for dynamic pages
      static: 180, // 3 minutes for static pages
    },
    // Other experimental features as needed
  },

  // Security and performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security Headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy (adjust based on your needs)
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https: blob:;
              font-src 'self' data:;
              connect-src 'self' https:;
              frame-ancestors 'self';
              base-uri 'self';
              form-action 'self';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          // Performance Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Service Worker - never cache
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
      // Manifest - cache for a short time
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600', // 1 hour
          },
        ],
      },
      // Static assets - cache for a long time
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ];
  },

  // Rewrites for API proxying or URL masking
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: 'https://external-api.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### Production-Ready tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    },
    // Strict TypeScript options
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md,json}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset",
    "analyze": "ANALYZE=true next build",
    "postinstall": "prisma generate",
    "prepare": "husky install"
  }
}
```

### Vercel Configuration

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "true"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "index, follow"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/healthz",
      "destination": "/api/health"
    }
  ]
}
```

## Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Authentication
NEXTAUTH_SECRET="your-secret-minimum-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# PWA Push Notifications (if using)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"

# Analytics (optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_AUTH_TOKEN="..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

```bash
# .env.production (Vercel)

# Database (use connection pooling for serverless)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"

# Authentication
NEXTAUTH_SECRET="your-production-secret-minimum-32-chars"
NEXTAUTH_URL="https://your-domain.com"

# PWA
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-production-vapid-public-key"
VAPID_PRIVATE_KEY="your-production-vapid-private-key"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured in Vercel
- [ ] Database migrations run (`pnpm db:migrate:deploy`)
- [ ] Image domains whitelisted in `next.config.js`
- [ ] Security headers configured
- [ ] TypeScript build passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] All tests pass (`pnpm test`)

### PWA (if applicable)
- [ ] PWA manifest configured (`app/manifest.ts`)
- [ ] Service worker implemented and tested
- [ ] PWA icons generated (192x192, 512x512, apple-touch-icon)
- [ ] Offline fallback page created
- [ ] VAPID keys generated and configured
- [ ] Push notifications tested
- [ ] Lighthouse PWA score > 90

### Monitoring & Analytics
- [ ] Analytics configured (Vercel Analytics or Google Analytics)
- [ ] Error monitoring setup (Sentry)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured

### Performance
- [ ] Images optimized and using Next.js Image component
- [ ] Fonts optimized with `next/font`
- [ ] Bundle size analyzed (`pnpm build && pnpm analyze`)
- [ ] Core Web Vitals tested
- [ ] Edge config setup (if using Edge Runtime)

### Security
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting implemented (if needed)
- [ ] Content Security Policy configured
- [ ] Secrets rotation schedule established

## Troubleshooting

### Build errors
```bash
pnpm clean
rm -rf .next
pnpm build
```

### Database connection issues
```bash
# Check connection
pnpm db:studio

# Reset database
pnpm db:reset
```

### Vercel deployment issues
```bash
# Pull environment variables
vercel env pull .env.local

# Check logs
vercel logs
```
