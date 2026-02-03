import { createContext, useContext, type ReactNode } from "react"
import { useSupabaseAuth, type UseSupabaseAuthReturn } from "../hooks/useSupabaseAuth"

const AuthContext = createContext<UseSupabaseAuthReturn | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useSupabaseAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth(): UseSupabaseAuthReturn {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
