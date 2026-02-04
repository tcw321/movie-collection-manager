import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { AuthForm } from "./AuthForm"

describe("AuthForm", () => {
  const mockSignIn = vi.fn()
  const mockSignUp = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSignIn.mockResolvedValue(undefined)
    mockSignUp.mockResolvedValue(undefined)
  })

  it("renders email and password fields", () => {
    render(<AuthForm onSignIn={mockSignIn} onSignUp={mockSignUp} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("starts in sign in mode", () => {
    render(<AuthForm onSignIn={mockSignIn} onSignUp={mockSignUp} />)

    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it("toggles to sign up mode", async () => {
    const user = userEvent.setup()
    render(<AuthForm onSignIn={mockSignIn} onSignUp={mockSignUp} />)

    await user.click(screen.getByRole("button", { name: /sign up/i }))

    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })

  it("toggles back to sign in mode", async () => {
    const user = userEvent.setup()
    render(<AuthForm onSignIn={mockSignIn} onSignUp={mockSignUp} />)

    // Go to sign up
    await user.click(screen.getByRole("button", { name: /sign up/i }))
    // Go back to sign in
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(
      screen.getByRole("button", { name: /^sign in$/i })
    ).toBeInTheDocument()
  })

  it("calls onSignIn with email and password", async () => {
    const user = userEvent.setup()
    render(<AuthForm onSignIn={mockSignIn} onSignUp={mockSignUp} />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123")
  })

  it("calls onSignUp with email and password in signup mode", async () => {
    const user = userEvent.setup()
    render(<AuthForm onSignIn={mockSignIn} onSignUp={mockSignUp} />)

    await user.click(screen.getByRole("button", { name: /sign up/i }))
    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    expect(mockSignUp).toHaveBeenCalledWith("new@example.com", "password123")
  })

  it("displays error message when sign in fails", async () => {
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"))
    const user = userEvent.setup()
    render(<AuthForm onSignIn={mockSignIn} onSignUp={mockSignUp} />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpassword")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it("disables inputs and button while loading", async () => {
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )
    const user = userEvent.setup()
    render(<AuthForm onSignIn={mockSignIn} onSignUp={mockSignUp} />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(screen.getByText(/please wait/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByLabelText(/password/i)).toBeDisabled()
  })

  it("clears error when switching modes", async () => {
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"))
    const user = userEvent.setup()
    render(<AuthForm onSignIn={mockSignIn} onSignUp={mockSignUp} />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpassword")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /sign up/i }))

    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
  })
})
