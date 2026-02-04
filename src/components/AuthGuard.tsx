import type { ReactNode } from "react"
import { useAuth } from "../contexts/AuthContext"
import { AuthForm } from "./AuthForm"

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, signIn, signUp } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />
  }

  return <>{children}</>
}
