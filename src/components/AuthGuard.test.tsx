import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { AuthGuard } from "./AuthGuard"

// Mock the auth context
const mockUseAuth = vi.fn()
vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}))

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loading spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
  })

  it("shows auth form when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
  })

  it("shows children when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "123", email: "test@example.com" },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText(/protected content/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
  })
})
