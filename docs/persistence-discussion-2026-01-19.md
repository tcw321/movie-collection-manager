# Persistence Options Discussion Log
**Date:** 2026-01-19
**Project:** Movie Collection Manager

---

## Context

The movie-collection-manager app currently stores data in browser localStorage, which is not persistent across devices or browsers. The app is hosted as a static site on AWS S3.

**User Goal:** Implement persistent data storage that works across computers, with incremental changes to keep the site working.

---

## Current Implementation

- Data stored in `localStorage` under key `"movie-collection"`
- Location: `src/App.tsx` (lines 27-37)
- Simple `loadMovies()` and `saveMovies()` functions
- Synchronous, no cloud connectivity

---

## Options Discussed

### Option 1: Export/Import JSON Files
- **Effort:** Low
- **Cost:** Free
- **Multi-user:** No
- Manual backup/restore via file download/upload. No infrastructure needed.

### Option 2: Firebase/Firestore
- **Effort:** Medium
- **Cost:** Free tier
- **Multi-user:** Yes (but document DB less ideal for relational data)
- Google's BaaS with real-time sync and offline support.

### Option 3: Supabase (Selected)
- **Effort:** Medium
- **Cost:** Free tier
- **Multi-user:** Yes (PostgreSQL is ideal for relational/social features)
- Open-source Firebase alternative with PostgreSQL backend.

### Option 4: AWS S3 + Cognito
- **Effort:** High
- **Cost:** ~$1/month
- **Multi-user:** Yes (but requires more manual setup)
- Stays in AWS ecosystem but complex configuration.

---

## Decision: Export/Import + Supabase

**Rationale:**
- Supabase's PostgreSQL foundation better supports future multi-user features (shared lists, social features, complex queries across users)
- Open-source, can self-host later if needed
- Data easily exportable (standard PostgreSQL)
- Export/Import provides immediate backup capability with no risk

---

## Architecture Clarification

| Component | Location |
|-----------|----------|
| Static site (HTML/JS/CSS) | AWS S3 bucket (unchanged) |
| User data (movies) | Supabase cloud (free tier) |
| Backup files (export) | User's local computer |

**No changes needed to AWS configuration.** Supabase is a separate managed service.

---

## Security Model (Supabase)

- **Authentication:** Users must sign in (email, Google, etc.)
- **Row-Level Security (RLS):** Database policies ensure users can only access their own data
- **API Keys:** The `anon` key is designed to be public; security comes from RLS, not hiding keys
- **HTTPS:** All data encrypted in transit

---

## Planned PostgreSQL Schema

```sql
CREATE TABLE movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  genre TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  watched BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movies_user_id ON movies(user_id);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own movies"
  ON movies
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Key Schema Changes from Current App
- `id`: Changed from `number` (Date.now()) to `UUID`
- `user_id`: Added to link movies to authenticated users
- `notes`: Added for future feature (per CLAUDE.md goals)
- `created_at`, `updated_at`: Added for tracking
- Constraints: Database enforces rating range (1-5), required title

---

## Supabase Setup Required

1. Create free account at supabase.com
2. Create a project (pick region, set DB password)
3. Create `movies` table (run SQL in dashboard)
4. Enable Row-Level Security with policies
5. Enable Authentication (email or Google sign-in)
6. Copy API keys into app config

---

## Next Steps

1. **Phase 1:** Implement Export/Import (immediate backup capability)
2. **Phase 2:** Set up Supabase project and schema
3. **Phase 3:** Add authentication to the app
4. **Phase 4:** Implement Supabase storage service
5. **Phase 5:** Migrate existing localStorage data to cloud

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/types/index.ts` | Create | Extract Movie interface |
| `src/utils/fileStorage.ts` | Create | Export/import functions |
| `src/config/supabase.ts` | Create | Supabase client config |
| `src/hooks/useSupabaseAuth.ts` | Create | Auth state management |
| `src/services/supabaseStorage.ts` | Create | Database operations |
| `src/App.tsx` | Modify | Add auth, export/import UI |
| `package.json` | Modify | Add @supabase/supabase-js |
