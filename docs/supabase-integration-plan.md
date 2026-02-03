# Plan: Incremental Supabase Integration

## Goal
Add Supabase as a cloud storage backend, starting without authentication. This creates a foundation for adding user accounts later.

## Phases Overview
1. **Phase 1**: Abstract storage layer + add Supabase (no auth, public table) - **IN PROGRESS**
2. **Phase 2**: Add Supabase Auth + per-user movie collections - **NOT STARTED**

---

## Progress Summary

### Completed (2026-01-25)
- [x] Step 1: Extract shared types (`src/types/movie.ts`)
- [x] Step 2: Create storage interface (`src/services/storage.ts`)
- [x] Step 3: Implement localStorage adapter (`src/services/localStorageAdapter.ts`)
- [x] Step 4: Install Supabase client (`@supabase/supabase-js`)
- [x] Step 5: Create Supabase project and `movies` table
- [x] Step 6: Create Supabase client (`src/services/supabase.ts`)
- [x] Step 7: Implement Supabase adapter (`src/services/supabaseAdapter.ts`)
- [x] Step 8: Create storage hook (`src/hooks/useMovies.ts`)
- [x] Step 9: Update App.tsx to use hook with loading/error states
- [x] Step 10: Add environment configuration (`.env.example`, `src/vite-env.d.ts`)
- [x] Fix: TypeScript types for Vite environment variables
- [x] Fix: Year input field allowing clear and retype without leading zeros
- [x] Fix: Test setup localStorage mock

### Remaining Work
- [ ] Fix tests to use localStorage instead of Supabase (tests currently fail because `.env` has Supabase configured)
- [ ] Manually verify Supabase integration works in browser (`npm run dev`)
- [ ] Test switching between localStorage and Supabase via env var

---

## Phase 1: Storage Abstraction + Supabase (No Auth)

### Step 1: Extract shared types ✅
Created `src/types/movie.ts`:
- Movie interface with `id` as `string` (for UUID compatibility)

### Step 2: Create storage interface ✅
Created `src/services/storage.ts`:
```typescript
export interface MovieStorage {
  getAll(): Promise<Movie[]>
  add(movie: Omit<Movie, 'id'>): Promise<Movie>
  update(id: string, movie: Partial<Movie>): Promise<Movie>
  delete(id: string): Promise<void>
}
```

### Step 3: Implement localStorage adapter ✅
Created `src/services/localStorageAdapter.ts`:
- Implements `MovieStorage` interface
- Uses `crypto.randomUUID()` for IDs
- Keeps existing localStorage key `"movie-collection"`

### Step 4: Install Supabase client ✅
```bash
npm install @supabase/supabase-js
```

### Step 5: Create Supabase project ✅
SQL used to create table:
```sql
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INTEGER,
  genre TEXT,
  rating INTEGER,
  watched BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON movies
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Step 6: Create Supabase client ✅
Created `src/services/supabase.ts`:
- Reads credentials from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Returns `null` if not configured (allows fallback to localStorage)

### Step 7: Implement Supabase adapter ✅
Created `src/services/supabaseAdapter.ts`:
- Implements `MovieStorage` interface
- Full CRUD operations via Supabase client

### Step 8: Create storage hook ✅
Created `src/hooks/useMovies.ts`:
- Selects adapter based on `VITE_STORAGE_TYPE` env var
- Manages `loading`, `error`, `movies` state
- Provides `addMovie`, `updateMovie`, `deleteMovie`, `refresh`

### Step 9: Update App.tsx ✅
- Removed inline localStorage logic
- Uses `useMovies` hook
- Shows loading spinner and error messages

### Step 10: Add environment configuration ✅
Created `.env.example`:
```
VITE_STORAGE_TYPE=local
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Created `src/vite-env.d.ts` for TypeScript support.

---

## Files Created/Modified

| File | Status | Purpose |
|------|--------|---------|
| `src/types/movie.ts` | ✅ Created | Movie type definition |
| `src/services/storage.ts` | ✅ Created | Storage interface |
| `src/services/localStorageAdapter.ts` | ✅ Created | localStorage implementation |
| `src/services/supabase.ts` | ✅ Created | Supabase client initialization |
| `src/services/supabaseAdapter.ts` | ✅ Created | Supabase implementation |
| `src/hooks/useMovies.ts` | ✅ Created | React hook for movie operations |
| `src/vite-env.d.ts` | ✅ Created | TypeScript env var types |
| `src/App.tsx` | ✅ Modified | Uses useMovies hook |
| `src/test/setup.ts` | ✅ Modified | Added localStorage mock |
| `src/App.test.tsx` | ✅ Modified | Updated for async loading |
| `.env.example` | ✅ Created | Environment template |
| `.env` | ✅ Created | Local config (gitignored) |

---

## Known Issues

### Tests fail with Supabase configured
When `.env` has `VITE_STORAGE_TYPE=supabase`, tests fail because they try to make real network requests.

**Fix needed:** Update `src/test/setup.ts` to force `VITE_STORAGE_TYPE=local` during tests.

---

## Verification Checklist

- [ ] `npm run dev` works with localStorage (set `VITE_STORAGE_TYPE=local`)
- [ ] `npm run dev` works with Supabase (set `VITE_STORAGE_TYPE=supabase`)
- [ ] Adding a movie appears in Supabase dashboard
- [ ] Refreshing page loads movies from Supabase
- [ ] `npm test` passes
- [ ] `npm run build` passes ✅

---

## Future: Phase 2 (Auth)
After Phase 1 is fully verified, adding auth involves:
- Add `user_id` column to movies table
- Update RLS policy: `user_id = auth.uid()`
- Add Supabase Auth UI components (login/signup)
- Update `useMovies` hook to include user context
- Handle auth state changes (login/logout)
