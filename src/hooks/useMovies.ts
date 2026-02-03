import { useState, useEffect, useCallback } from "react"
import type { Movie } from "../types/movie"
import type { MovieStorage } from "../services/storage"
import { createLocalStorageAdapter } from "../services/localStorageAdapter"
import { createSupabaseAdapter } from "../services/supabaseAdapter"
import { supabase } from "../services/supabase"

function createStorage(): MovieStorage {
  const storageType = import.meta.env.VITE_STORAGE_TYPE

  if (storageType === "supabase" && supabase) {
    return createSupabaseAdapter()
  }

  return createLocalStorageAdapter()
}

const storage = createStorage()

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    loadMovies()
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
