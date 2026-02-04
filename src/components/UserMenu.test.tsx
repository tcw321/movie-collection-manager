import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { UserMenu } from "./UserMenu"

// Mock the auth context
const mockSignOut = vi.fn()
const mockUseAuth = vi.fn()
vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}))

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue(undefined)
  })

  it("renders nothing when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    })

    const { container } = render(<UserMenu />)

    expect(container).toBeEmptyDOMElement()
  })

  it("displays user email when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "123", email: "test@example.com" },
      signOut: mockSignOut,
    })

    render(<UserMenu />)

    expect(screen.getByText("test@example.com")).toBeInTheDocument()
  })

  it("shows sign out button", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "123", email: "test@example.com" },
      signOut: mockSignOut,
    })

    render(<UserMenu />)

    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument()
  })

  it("calls signOut when button is clicked", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "123", email: "test@example.com" },
      signOut: mockSignOut,
    })

    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole("button", { name: /sign out/i }))

    expect(mockSignOut).toHaveBeenCalled()
  })

  it("disables button while signing out", async () => {
    mockSignOut.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )
    mockUseAuth.mockReturnValue({
      user: { id: "123", email: "test@example.com" },
      signOut: mockSignOut,
    })

    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole("button", { name: /sign out/i }))

    expect(screen.getByRole("button")).toBeDisabled()
  })
})
