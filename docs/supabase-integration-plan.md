# Plan: Incremental Supabase Integration

## Goal
Add Supabase as a cloud storage backend, starting without authentication. This creates a foundation for adding user accounts later.

## Phases Overview
1. **Now**: Abstract storage layer + add Supabase (no auth, public table)
2. **Later**: Add Supabase Auth + per-user movie collections

---

## Phase 1: Storage Abstraction + Supabase (No Auth)

### Step 1: Extract shared types
Create `src/types/movie.ts`:
- Move `Movie` interface from App.tsx
- Export for use across storage implementations

### Step 2: Create storage interface
Create `src/services/storage.ts`:
```typescript
export interface MovieStorage {
  getAll(): Promise<Movie[]>
  add(movie: Omit<Movie, 'id'>): Promise<Movie>
  update(id: string, movie: Partial<Movie>): Promise<Movie>
  delete(id: string): Promise<void>
}
```

### Step 3: Implement localStorage adapter
Create `src/services/localStorageAdapter.ts`:
- Wrap existing localStorage logic
- Implement `MovieStorage` interface
- Keep as fallback/offline option

### Step 4: Install Supabase client
```bash
npm install @supabase/supabase-js
```

### Step 5: Create Supabase project (manual)
User will:
1. Create account at supabase.com
2. Create new project
3. Create `movies` table with schema:
   - `id` (uuid, primary key, default: gen_random_uuid())
   - `title` (text, not null)
   - `year` (integer)
   - `genre` (text)
   - `rating` (integer)
   - `watched` (boolean)
   - `created_at` (timestamptz, default: now())
4. Disable RLS or add policy allowing anonymous access
5. Get project URL and anon key

### Step 6: Create Supabase client
Create `src/services/supabase.ts`:
- Initialize Supabase client with env vars
- Export for use in adapter

### Step 7: Implement Supabase adapter
Create `src/services/supabaseAdapter.ts`:
- Implement `MovieStorage` interface
- Use Supabase client for CRUD operations

### Step 8: Create storage hook
Create `src/hooks/useMovies.ts`:
- Manages loading/error states
- Uses selected storage adapter
- Provides `movies`, `addMovie`, `updateMovie`, `deleteMovie`
- Environment variable to switch between localStorage and Supabase

### Step 9: Update App.tsx
- Remove inline storage logic
- Use `useMovies` hook
- Handle loading and error states in UI

### Step 10: Add environment configuration
Create `.env.example`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STORAGE_TYPE=supabase  # or 'local'
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/types/movie.ts` | Create - Movie type |
| `src/services/storage.ts` | Create - Interface |
| `src/services/localStorageAdapter.ts` | Create - localStorage impl |
| `src/services/supabase.ts` | Create - Supabase client |
| `src/services/supabaseAdapter.ts` | Create - Supabase impl |
| `src/hooks/useMovies.ts` | Create - Storage hook |
| `src/App.tsx` | Modify - Use hook |
| `.env.example` | Create - Env template |
| `.gitignore` | Modify - Add .env |

---

## Verification

1. Run `npm run dev` - app should work with localStorage (default)
2. Set up Supabase project and add credentials to `.env`
3. Change `VITE_STORAGE_TYPE=supabase`
4. Add a movie - verify it appears in Supabase dashboard
5. Refresh page - movie should persist from cloud
6. Test with localStorage by changing env back

---

## Future: Phase 2 (Auth)
After this works, adding auth involves:
- Add `user_id` column to movies table
- Enable RLS with policy: `user_id = auth.uid()`
- Add Supabase Auth UI components
- Update hook to handle auth state
