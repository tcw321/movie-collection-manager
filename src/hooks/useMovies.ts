import { useState, useEffect, useCallback, useRef } from "react"
import type { Movie } from "../types/movie"
import type { MovieStorage } from "../services/storage"
import { createLocalStorageAdapter } from "../services/localStorageAdapter"
import { createSupabaseAdapter } from "../services/supabaseAdapter"
import { supabase } from "../services/supabase"

const isSupabaseMode = import.meta.env.VITE_STORAGE_TYPE === "supabase"

function createStorage(): MovieStorage {
  if (isSupabaseMode && supabase) {
    return createSupabaseAdapter()
  }

  return createLocalStorageAdapter()
}

const storage = createStorage()

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentUserIdRef = useRef<string | null>(null)

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await storage.getAll()
      setMovies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movies")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // For localStorage mode, just load movies once
    if (!isSupabaseMode || !supabase) {
      loadMovies()
      return
    }

    // For Supabase mode, wait for auth state then load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUserId = session?.user?.id ?? null

        if (event === "SIGNED_OUT" || !newUserId) {
          // Clear movies on logout
          setMovies([])
          setLoading(false)
          currentUserIdRef.current = null
        } else if (newUserId !== currentUserIdRef.current) {
          // User changed (login or switch), reload movies
          currentUserIdRef.current = newUserId
          await loadMovies()
        }
      }
    )

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      currentUserIdRef.current = session?.user?.id ?? null
      if (session?.user) {
        loadMovies()
      } else {
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadMovies])

  const addMovie = useCallback(async (movieData: Omit<Movie, "id">) => {
    try {
      setError(null)
      const newMovie = await storage.add(movieData)
      setMovies((prev) => [newMovie, ...prev])
      return newMovie
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add movie")
      throw err
    }
  }, [])

  const updateMovie = useCallback(async (id: string, updates: Partial<Omit<Movie, "id">>) => {
    try {
      setError(null)
      const updatedMovie = await storage.update(id, updates)
      setMovies((prev) =>
        prev.map((m) => (m.id === id ? updatedMovie : m))
      )
      return updatedMovie
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update movie")
      throw err
    }
  }, [])

  const deleteMovie = useCallback(async (id: string) => {
    try {
      setError(null)
      await storage.delete(id)
      setMovies((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete movie")
      throw err
    }
  }, [])

  return {
    movies,
    loading,
    error,
    addMovie,
    updateMovie,
    deleteMovie,
    refresh: loadMovies,
  }
}
