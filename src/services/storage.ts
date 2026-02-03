import type { Movie } from "../types/movie"

export interface MovieStorage {
  getAll(): Promise<Movie[]>
  add(movie: Omit<Movie, "id">): Promise<Movie>
  update(id: string, updates: Partial<Omit<Movie, "id">>): Promise<Movie>
  delete(id: string): Promise<void>
}
