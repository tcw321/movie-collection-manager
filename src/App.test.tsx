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
})
