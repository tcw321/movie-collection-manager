import type { Movie } from "../types/movie"
import type { MovieStorage } from "./storage"
import { supabase } from "./supabase"

export function createSupabaseAdapter(): MovieStorage {
  if (!supabase) {
    throw new Error("Supabase client not initialized. Check your environment variables.")
  }

  const client = supabase

  return {
    async getAll(): Promise<Movie[]> {
      const { data, error } = await client
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch movies: ${error.message}`)
      }

      return data.map((row) => ({
        id: row.id,
        title: row.title,
        year: row.year,
        genre: row.genre,
        rating: row.rating,
        watched: row.watched,
      }))
    },

    async add(movieData: Omit<Movie, "id">): Promise<Movie> {
      const { data: { user } } = await client.auth.getUser()
      if (!user) {
        throw new Error("Must be authenticated to add movies")
      }

      const { data, error } = await client
        .from("movies")
        .insert({
          title: movieData.title,
          year: movieData.year,
          genre: movieData.genre,
          rating: movieData.rating,
          watched: movieData.watched,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to add movie: ${error.message}`)
      }

      return {
        id: data.id,
        title: data.title,
        year: data.year,
        genre: data.genre,
        rating: data.rating,
        watched: data.watched,
      }
    },

    async update(id: string, updates: Partial<Omit<Movie, "id">>): Promise<Movie> {
      const { data, error } = await client
        .from("movies")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update movie: ${error.message}`)
      }

      return {
        id: data.id,
        title: data.title,
        year: data.year,
        genre: data.genre,
        rating: data.rating,
        watched: data.watched,
      }
    },

    async delete(id: string): Promise<void> {
      const { error } = await client
        .from("movies")
        .delete()
        .eq("id", id)

      if (error) {
        throw new Error(`Failed to delete movie: ${error.message}`)
      }
    },
  }
}
