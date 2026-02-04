import { useState } from "react"
import type { Movie } from "./types/movie"
import { useMovies } from "./hooks/useMovies"
import { AuthGuard } from "./components/AuthGuard"
import { UserMenu } from "./components/UserMenu"

const isSupabaseMode = import.meta.env.VITE_STORAGE_TYPE === "supabase"

const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Documentary",
  "Animation",
  "Other",
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-900">{movie.title}</h2>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              movie.watched
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {movie.watched ? "Watched" : "Unwatched"}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3">
          {movie.year} • {movie.genre}
        </p>
        <StarRating rating={movie.rating} />
      </div>
    </div>
  )
}

function StarRatingInput({
  rating,
  onChange,
}: {
  rating: number
  onChange: (rating: number) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${
            star <= rating
              ? "text-yellow-400 hover:text-yellow-500"
              : "text-gray-300 hover:text-gray-400"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function AddMovieForm({ onAdd }: { onAdd: (movie: Omit<Movie, "id">) => void }) {
  const [title, setTitle] = useState("")
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [genre, setGenre] = useState(GENRES[0])
  const [rating, setRating] = useState(3)
  const [watched, setWatched] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd({
      title: title.trim(),
      year: parseInt(year) || new Date().getFullYear(),
      genre,
      rating,
      watched,
    })

    // Reset form
    setTitle("")
    setYear(String(new Date().getFullYear()))
    setGenre(GENRES[0])
    setRating(3)
    setWatched(false)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white rounded-lg shadow-md p-5 border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-gray-500 hover:text-indigo-600"
      >
        <span className="text-2xl">+</span>
        <span className="font-medium">Add Movie</span>
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-5 space-y-4"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter movie title"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Year
          </label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="1888"
            max={new Date().getFullYear() + 5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="genre"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Genre
          </label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating
        </label>
        <StarRatingInput rating={rating} onChange={setRating} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="watched"
          checked={watched}
          onChange={(e) => setWatched(e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="watched" className="text-sm font-medium text-gray-700">
          I've watched this movie
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
        >
          Add Movie
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function AppContent() {
  const { movies, loading, error, addMovie } = useMovies()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Movie Collection Manager</h1>
              <p className="text-indigo-200 text-sm mt-1">
                Track and manage your personal movie collection
              </p>
            </div>
            {isSupabaseMode && <UserMenu />}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading movies...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AddMovieForm onAdd={addMovie} />
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  if (isSupabaseMode) {
    return (
      <AuthGuard>
        <AppContent />
      </AuthGuard>
    )
  }

  return <AppContent />
}

export default App
