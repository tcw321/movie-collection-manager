interface Movie {
  id: number
  title: string
  year: number
  genre: string
  rating: number
  watched: boolean
}

const sampleMovies: Movie[] = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    year: 1994,
    genre: "Drama",
    rating: 5,
    watched: true,
  },
  {
    id: 2,
    title: "Inception",
    year: 2010,
    genre: "Sci-Fi",
    rating: 5,
    watched: true,
  },
  {
    id: 3,
    title: "The Dark Knight",
    year: 2008,
    genre: "Action",
    rating: 5,
    watched: true,
  },
  {
    id: 4,
    title: "Dune: Part Two",
    year: 2024,
    genre: "Sci-Fi",
    rating: 4,
    watched: false,
  },
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

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Movie Collection Manager</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Track and manage your personal movie collection
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sampleMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
