# BIXNOII Secure Next.js migration

Branch: `nextjs-secure`

## Architecture
- Next.js App Router
- Vercel-ready deployment
- Supabase Auth + SSR cookies
- Supabase publishable key in browser
- No service-role/secret key in frontend
- Existing Supabase RLS remains the primary data boundary
- Existing production static app remains unchanged on `main`

## Environment variables
Copy `.env.example` to `.env.local`.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Only add a server-only `SUPABASE_SECRET_KEY` later if a server feature actually requires elevated access. Never prefix a secret with `NEXT_PUBLIC_`.

## Migration plan
1. Secure foundation and SSR auth
2. Customer dashboard/profile
3. Orders/returns/payments/expenses
4. Inventory + purchase history
5. Support tickets
6. Owner/admin routes
7. Vercel deployment
8. Custom domain + Supabase Site URL/Redirect URLs
9. Cutover after mobile/desktop testing
