import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock supabase before importing hook
const mockGetSession = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock("../services/supabase", () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      signInWithPassword: (params: unknown) => mockSignInWithPassword(params),
      signUp: (params: unknown) => mockSignUp(params),
      signOut: () => mockSignOut(),
      onAuthStateChange: (callback: unknown) => {
        mockOnAuthStateChange(callback)
        return {
          data: {
            subscription: {
              unsubscribe: mockUnsubscribe,
            },
          },
        }
      },
    },
  },
}))

import { useSupabaseAuth } from "./useSupabaseAuth"

describe("useSupabaseAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null } })
  })

  it("starts in loading state", () => {
    const { result } = renderHook(() => useSupabaseAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
  })

  it("loads initial session and sets user", async () => {
    const mockUser = { id: "123", email: "test@example.com" }
    const mockSession = { user: mockUser, access_token: "token" }
    mockGetSession.mockResolvedValue({ data: { session: mockSession } })

    const { result } = renderHook(() => useSupabaseAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
  })

  it("sets loading to false when no session exists", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const { result } = renderHook(() => useSupabaseAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
  })

  it("subscribes to auth state changes", async () => {
    renderHook(() => useSupabaseAuth())

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled()
    })
  })

  it("unsubscribes on unmount", async () => {
    const { unmount } = renderHook(() => useSupabaseAuth())

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled()
    })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it("updates user when auth state changes", async () => {
    const mockUser = { id: "456", email: "new@example.com" }
    const mockSession = { user: mockUser, access_token: "newtoken" }

    const { result } = renderHook(() => useSupabaseAuth())

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled()
    })

    // Simulate auth state change
    const authCallback = mockOnAuthStateChange.mock.calls[0][0]
    act(() => {
      authCallback("SIGNED_IN", mockSession)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
  })

  describe("signIn", () => {
    it("calls signInWithPassword with email and password", async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSupabaseAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signIn("test@example.com", "password123")
      })

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
    })

    it("throws error when sign in fails", async () => {
      const mockError = new Error("Invalid credentials")
      mockSignInWithPassword.mockResolvedValue({ error: mockError })

      const { result } = renderHook(() => useSupabaseAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.signIn("test@example.com", "wrongpassword")
        })
      ).rejects.toThrow("Invalid credentials")
    })
  })

  describe("signUp", () => {
    it("calls signUp with email and password", async () => {
      mockSignUp.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSupabaseAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signUp("new@example.com", "password123")
      })

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
      })
    })

    it("throws error when sign up fails", async () => {
      const mockError = new Error("Email already exists")
      mockSignUp.mockResolvedValue({ error: mockError })

      const { result } = renderHook(() => useSupabaseAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.signUp("existing@example.com", "password123")
        })
      ).rejects.toThrow("Email already exists")
    })
  })

  describe("signOut", () => {
    it("calls signOut", async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useSupabaseAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSignOut).toHaveBeenCalled()
    })

    it("throws error when sign out fails", async () => {
      const mockError = new Error("Sign out failed")
      mockSignOut.mockResolvedValue({ error: mockError })

      const { result } = renderHook(() => useSupabaseAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.signOut()
        })
      ).rejects.toThrow("Sign out failed")
    })
  })
})
