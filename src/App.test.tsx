import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('can add a movie', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Click the "Add Movie" button to open the form
    await user.click(screen.getByRole('button', { name: /add movie/i }))

    // Fill in the movie title
    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'The Matrix')

    // Submit the form
    await user.click(screen.getByRole('button', { name: /add movie/i }))

    // Verify the movie appears in the list
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
  })

  it('allows clearing and retyping the year field without leading zeros', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Open the form
    await user.click(screen.getByRole('button', { name: /add movie/i }))

    // Get the year input and clear it
    const yearInput = screen.getByLabelText(/year/i)
    await user.clear(yearInput)

    // Type a new year
    await user.type(yearInput, '1999')

    // Verify the input shows 1999, not 01999
    expect(yearInput).toHaveValue(1999)

    // Fill in title and submit
    await user.type(screen.getByLabelText(/title/i), 'The Matrix')
    await user.click(screen.getByRole('button', { name: /add movie/i }))

    // Verify the movie shows with correct year
    expect(screen.getByText('1999 • Action')).toBeInTheDocument()
  })
})
