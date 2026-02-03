import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage for jsdom
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
})

// Force localStorage storage type in tests to avoid Supabase network calls
vi.stubEnv('VITE_STORAGE_TYPE', 'local')
