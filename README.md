# Smart SIEM

A modern Security Information and Event Management (SIEM) dashboard built with TanStack Start and React.

## Tech Stack

- **Framework** — [TanStack Start](https://tanstack.com/start/latest) (React, SSR, Vite)
- **Routing** — [TanStack Router](https://tanstack.com/router) (file-based routing)
- **Data Fetching** — [TanStack Query](https://tanstack.com/query)
- **UI** — [shadcn/ui](https://ui.shadcn.com) components + Tailwind CSS v4
- **Forms** — [TanStack Form](https://tanstack.com/form)
- **Tables** — [TanStack Table](https://tanstack.com/table)
- **Icons** — [Lucide](https://lucide.dev)
- **Backend** — NestJS API (separate repository)

## Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Dashboard with stats, priority incident, recent events | All roles |
| `/logs` | Log explorer with search, filters, sorting, pagination | All roles |
| `/incidents` | Incident triage with status management | All roles (actions: ANALYST+) |
| `/rules` | Correlation rule management | ADMIN only |
| `/admin/users` | User management with RBAC | ADMIN only |
| `/auth/login` | Authentication | Public |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev

# Generate route tree after adding routes
npx @tanstack/router-cli generate
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:3000
```

The backend API runs on port 3000. The frontend runs on port 5173.

## Project Structure

```
src/
├── components/
│   ├── logs/          # Log explorer components
│   ├── sidebar/       # App sidebar navigation
│   └── ui/            # shadcn UI components
├── lib/
│   ├── admin/         # Admin API client
│   ├── auth/          # Auth hooks
│   ├── incidents/     # Incidents API client
│   ├── logs/          # Logs API client & hooks
│   └── rules/         # Rules API client
├── routes/
│   ├── admin/         # Admin-only routes
│   ├── auth/          # Authentication routes
│   └── ...            # App routes
├── types/             # TypeScript type definitions
├── router.tsx         # Router configuration
└── styles.css         # Global styles
```
