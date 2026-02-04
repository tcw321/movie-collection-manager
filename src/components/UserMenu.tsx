import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
    } catch (err) {
      console.error("Sign out error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-indigo-200 text-sm truncate max-w-[200px]">
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="px-3 py-1.5 text-sm bg-indigo-500 hover:bg-indigo-400 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Sign Out"}
      </button>
    </div>
  )
}
