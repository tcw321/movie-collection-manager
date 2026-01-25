import type { Movie } from "../types/movie"
import type { MovieStorage } from "./storage"

const STORAGE_KEY = "movie-collection"

export function createLocalStorageAdapter(): MovieStorage {
  return {
    async getAll(): Promise<Movie[]> {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      return []
    },

    async add(movieData: Omit<Movie, "id">): Promise<Movie> {
      const movies = await this.getAll()
      const newMovie: Movie = {
        ...movieData,
        id: crypto.randomUUID(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newMovie, ...movies]))
      return newMovie
    },

    async update(id: string, updates: Partial<Omit<Movie, "id">>): Promise<Movie> {
      const movies = await this.getAll()
      const index = movies.findIndex((m) => m.id === id)
      if (index === -1) {
        throw new Error(`Movie with id ${id} not found`)
      }
      const updatedMovie = { ...movies[index], ...updates }
      movies[index] = updatedMovie
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movies))
      return updatedMovie
    },

    async delete(id: string): Promise<void> {
      const movies = await this.getAll()
      const filtered = movies.filter((m) => m.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    },
  }
}
