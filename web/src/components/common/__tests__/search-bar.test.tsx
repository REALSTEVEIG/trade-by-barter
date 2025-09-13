import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../search-bar'

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

describe('SearchBar Component', () => {
  const user = userEvent.setup()

  describe('Rendering', () => {
    it('should render with default placeholder', () => {
      render(<SearchBar />)
      
      const input = screen.getByPlaceholderText('Search for items...')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render with custom placeholder', () => {
      render(<SearchBar placeholder="Search Nigerian products..." />)
      
      expect(screen.getByPlaceholderText('Search Nigerian products...')).toBeInTheDocument()
    })

    it('should render search icon', () => {
      render(<SearchBar />)
      
      const searchIcon = document.querySelector('svg')
      expect(searchIcon).toBeInTheDocument()
    })

    it('should render as a form element', () => {
      render(<SearchBar />)
      
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Value Management', () => {
    it('should display controlled value', () => {
      render(<SearchBar value="iPhone" />)
      
      const input = screen.getByDisplayValue('iPhone')
      expect(input).toBeInTheDocument()
    })

    it('should handle uncontrolled input', async () => {
      render(<SearchBar />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'MacBook')
      
      expect(input).toHaveValue('MacBook')
    })

    it('should sync internal value with prop changes', () => {
      const { rerender } = render(<SearchBar value="iPhone" />)
      
      expect(screen.getByDisplayValue('iPhone')).toBeInTheDocument()
      
      rerender(<SearchBar value="MacBook" />)
      expect(screen.getByDisplayValue('MacBook')).toBeInTheDocument()
    })
  })

  describe('Nigerian Market Search Terms', () => {
    it('should handle Nigerian product search terms', async () => {
      const nigerianProducts = [
        'Ankara fabric',
        'Jollof rice ingredients',
        'Nollywood movies',
        'Agbada traditional wear',
        'Palm wine calabash',
        'Kente cloth',
        'Yoruba traditional beads',
      ]

      const onValueChange = jest.fn()
      render(<SearchBar onValueChange={onValueChange} />)
      
      const input = screen.getByRole('textbox')
      
      for (const product of nigerianProducts) {
        await user.clear(input)
        await user.type(input, product)
        
        expect(input).toHaveValue(product)
        expect(onValueChange).toHaveBeenCalledWith(product)
      }
    })

    it('should handle searches in Nigerian cities', async () => {
      const nigerianCities = [
        'Lagos electronics',
        'Abuja furniture', 
        'Port Harcourt cars',
        'Kano textiles',
        'Ibadan machinery',
      ]

      const onValueChange = jest.fn()
      render(<SearchBar onValueChange={onValueChange} />)
      
      const input = screen.getByRole('textbox')
      
      for (const citySearch of nigerianCities) {
        await user.clear(input)
        await user.type(input, citySearch)
        
        expect(input).toHaveValue(citySearch)
      }
    })
  })

  describe('Event Handling', () => {
    it('should call onValueChange when typing', async () => {
      const onValueChange = jest.fn()
      render(<SearchBar onValueChange={onValueChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'iPhone')
      
      expect(onValueChange).toHaveBeenCalledTimes(6) // One for each character
      expect(onValueChange).toHaveBeenLastCalledWith('iPhone')
    })

    it('should call onSearch when form is submitted', async () => {
      const onSearch = jest.fn()
      render(<SearchBar onSearch={onSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'MacBook')
      await user.keyboard('{Enter}')
      
      expect(onSearch).toHaveBeenCalledTimes(1)
      expect(onSearch).toHaveBeenCalledWith('MacBook')
    })

    it('should prevent default form submission', async () => {
      const onSearch = jest.fn()
      render(<SearchBar onSearch={onSearch} />)
      
      const form = document.querySelector('form')!
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      
      fireEvent(form, submitEvent)
      
      expect(submitEvent.defaultPrevented).toBe(true)
    })

    it('should call onClear when clear button is clicked', async () => {
      const onClear = jest.fn()
      const onValueChange = jest.fn()
      
      render(<SearchBar value="test search" onClear={onClear} onValueChange={onValueChange} />)
      
      const clearButton = screen.getByRole('button')
      await user.click(clearButton)
      
      expect(onClear).toHaveBeenCalledTimes(1)
      expect(onValueChange).toHaveBeenCalledWith('')
    })
  })

  describe('Clear Functionality', () => {
    it('should show clear button when input has value', () => {
      render(<SearchBar value="search term" />)
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
      
      // Should contain X icon
      const xIcon = clearButton.querySelector('svg')
      expect(xIcon).toBeInTheDocument()
    })

    it('should hide clear button when input is empty', () => {
      render(<SearchBar value="" />)
      
      const clearButton = screen.queryByRole('button')
      expect(clearButton).not.toBeInTheDocument()
    })

    it('should clear input when clear button is clicked', async () => {
      render(<SearchBar value="initial value" />)
      
      const input = screen.getByDisplayValue('initial value')
      const clearButton = screen.getByRole('button')
      
      await user.click(clearButton)
      
      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should adjust input padding when clear button is present', () => {
      render(<SearchBar value="search term" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('pr-10')
    })
  })

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      render(<SearchBar className="custom-search" />)
      
      const form = document.querySelector('form')
      expect(form).toHaveClass('custom-search')
    })

    it('should apply input field classes', () => {
      render(<SearchBar />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('input-field')
      expect(input).toHaveClass('w-full')
      expect(input).toHaveClass('pl-10')
    })

    it('should position search icon correctly', () => {
      render(<SearchBar />)
      
      const searchIcon = document.querySelector('svg')
      expect(searchIcon).toHaveClass('absolute', 'left-3', 'top-1/2')
    })

    it('should position clear button correctly when present', () => {
      render(<SearchBar value="test" />)
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toHaveClass('absolute', 'right-2', 'top-1/2')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<SearchBar />)
      
      const form = document.querySelector('form')!
      const input = screen.getByRole('textbox')
      
      expect(form.contains(input)).toBe(true)
    })

    it('should support keyboard navigation', async () => {
      render(<SearchBar />)
      
      const input = screen.getByRole('textbox')
      input.focus()
      
      expect(input).toHaveFocus()
      
      await user.keyboard('{Tab}')
      // Focus should move away from input
      expect(input).not.toHaveFocus()
    })

    it('should support keyboard submission', async () => {
      const onSearch = jest.fn()
      render(<SearchBar onSearch={onSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'search term')
      await user.keyboard('{Enter}')
      
      expect(onSearch).toHaveBeenCalledWith('search term')
    })

    it('should have accessible clear button', () => {
      render(<SearchBar value="test" />)
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Performance', () => {
    it('should not cause excessive re-renders', async () => {
      const onValueChange = jest.fn()
      render(<SearchBar onValueChange={onValueChange} />)
      
      const input = screen.getByRole('textbox')
      
      // Type quickly
      await user.type(input, 'fast')
      
      expect(onValueChange).toHaveBeenCalledTimes(4) // One per character
    })

    it('should handle rapid clear and type operations', async () => {
      const onValueChange = jest.fn()
      const onClear = jest.fn()
      
      const { rerender } = render(
        <SearchBar value="initial" onValueChange={onValueChange} onClear={onClear} />
      )
      
      // Clear
      const clearButton = screen.getByRole('button')
      await user.click(clearButton)
      
      // Re-render with empty value
      rerender(<SearchBar value="" onValueChange={onValueChange} onClear={onClear} />)
      
      // Type new value
      const input = screen.getByRole('textbox')
      await user.type(input, 'new search')
      
      expect(onClear).toHaveBeenCalledTimes(1)
      expect(onValueChange).toHaveBeenCalledWith('new search')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty search submission', async () => {
      const onSearch = jest.fn()
      render(<SearchBar onSearch={onSearch} />)
      
      screen.getByRole('textbox')
      await user.keyboard('{Enter}')
      
      expect(onSearch).toHaveBeenCalledWith('')
    })

    it('should handle special characters in search', async () => {
      const specialChars = '!@#$%^&*()_+-='
      const onValueChange = jest.fn()
      
      render(<SearchBar onValueChange={onValueChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, specialChars)
      
      expect(input).toHaveValue(specialChars)
      expect(onValueChange).toHaveBeenLastCalledWith(specialChars)
    })

    it('should handle very long search terms', async () => {
      const longSearchTerm = 'a'.repeat(1000)
      const onValueChange = jest.fn()
      
      render(<SearchBar onValueChange={onValueChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, longSearchTerm)
      
      expect(input).toHaveValue(longSearchTerm)
    })

    it('should not crash when callbacks are not provided', async () => {
      render(<SearchBar />)
      
      const input = screen.getByRole('textbox')
      
      // These should not throw errors
      await user.type(input, 'test')
      await user.keyboard('{Enter}')
      
      expect(input).toHaveValue('test')
    })
  })

  describe('Nigerian Language Support', () => {
    it('should handle searches with Nigerian language terms', async () => {
      const nigerianTerms = [
        'gele headwrap',
        'aso ebi fabric',
        'akara ingredients',
        'buba and sokoto',
        'egusi soup materials',
      ]

      render(<SearchBar />)
      
      const input = screen.getByRole('textbox')
      
      for (const term of nigerianTerms) {
        await user.clear(input)
        await user.type(input, term)
        
        expect(input).toHaveValue(term)
      }
    })

    it('should support searches with accented characters', async () => {
      const accentedTerms = ['café', 'résumé', 'naïve']
      
      render(<SearchBar />)
      
      const input = screen.getByRole('textbox')
      
      for (const term of accentedTerms) {
        await user.clear(input)
        await user.type(input, term)
        
        expect(input).toHaveValue(term)
      }
    })
  })
})