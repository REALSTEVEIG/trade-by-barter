import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '../product-card'
import { NIGERIAN_TEST_DATA } from '../../__tests__/test-utils'

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
  formatNaira: (amountInKobo: number) => `₦${(amountInKobo / 100).toLocaleString('en-NG')}`,
}))

describe('ProductCard Component', () => {
  const user = userEvent.setup()
  
  const defaultProps = {
    id: 'listing-1',
    title: 'iPhone 13 Pro Max 256GB',
    price: 45000000, // 450,000 Naira in kobo
    location: 'Lagos, Nigeria',
    imageUrl: '/images/iphone-13.jpg',
    imageAlt: 'iPhone 13 Pro Max in excellent condition',
  }

  describe('Rendering', () => {
    it('should render with all basic props', () => {
      render(<ProductCard {...defaultProps} />)
      
      expect(screen.getByText('iPhone 13 Pro Max 256GB')).toBeInTheDocument()
      expect(screen.getByText('₦450,000')).toBeInTheDocument()
      expect(screen.getByText('Lagos, Nigeria')).toBeInTheDocument()
      
      const image = screen.getByAltText('iPhone 13 Pro Max in excellent condition')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', '/images/iphone-13.jpg')
    })

    it('should render with default image alt text when not provided', () => {
      const { imageAlt, ...propsWithoutAlt } = defaultProps
      render(<ProductCard {...propsWithoutAlt} />)
      
      const image = screen.getByAltText('iPhone 13 Pro Max 256GB')
      expect(image).toBeInTheDocument()
    })

    it('should render as a clickable link to listing details', () => {
      render(<ProductCard {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/listings/listing-1')
    })

    it('should render favorite button', () => {
      render(<ProductCard {...defaultProps} />)
      
      const favoriteButton = screen.getByRole('button')
      expect(favoriteButton).toBeInTheDocument()
      
      // Heart icon should be present
      const heartIcon = favoriteButton.querySelector('svg')
      expect(heartIcon).toBeInTheDocument()
    })
  })

  describe('Nigerian Currency Formatting', () => {
    it('should format various Nigerian Naira amounts correctly', () => {
      const testAmounts = [
        { kobo: 1000000, expected: '₦10,000' },
        { kobo: 5000000, expected: '₦50,000' },
        { kobo: 10000000, expected: '₦100,000' },
        { kobo: 45000000, expected: '₦450,000' },
        { kobo: 100000000, expected: '₦1,000,000' },
      ]

      testAmounts.forEach(({ kobo, expected }) => {
        const { rerender } = render(
          <ProductCard {...defaultProps} price={kobo} />
        )
        
        expect(screen.getByText(expected)).toBeInTheDocument()
        
        rerender(<div />) // Clear for next test
      })
    })

    it('should handle zero price gracefully', () => {
      render(<ProductCard {...defaultProps} price={0} />)
      
      expect(screen.getByText('₦0')).toBeInTheDocument()
    })

    it('should display naira symbol consistently', () => {
      render(<ProductCard {...defaultProps} />)
      
      const priceElement = screen.getByText('₦450,000')
      expect(priceElement).toHaveClass('naira-symbol')
    })
  })

  describe('Nigerian Locations', () => {
    it('should display various Nigerian cities correctly', () => {
      const nigerianCities = [
        'Lagos, Nigeria',
        'Abuja, Nigeria',
        'Port Harcourt, Rivers State',
        'Kano, Kano State',
        'Ibadan, Oyo State',
      ]

      nigerianCities.forEach(city => {
        const { rerender } = render(
          <ProductCard {...defaultProps} location={city} />
        )
        
        expect(screen.getByText(city)).toBeInTheDocument()
        
        const locationIcon = screen.getByText(city).previousElementSibling
        expect(locationIcon).toBeInTheDocument() // MapPin icon
        
        rerender(<div />) // Clear for next test
      })
    })
  })

  describe('Favorite Functionality', () => {
    it('should show unfavorited state by default', () => {
      render(<ProductCard {...defaultProps} />)
      
      const favoriteButton = screen.getByRole('button')
      expect(favoriteButton).toHaveClass('text-neutral-gray')
      
      const heartIcon = favoriteButton.querySelector('svg')
      expect(heartIcon).toHaveAttribute('fill', 'none')
    })

    it('should show favorited state when isFavorite is true', () => {
      render(<ProductCard {...defaultProps} isFavorite={true} />)
      
      const favoriteButton = screen.getByRole('button')
      expect(favoriteButton).toHaveClass('text-red-500')
      
      const heartIcon = favoriteButton.querySelector('svg')
      expect(heartIcon).toHaveAttribute('fill', 'currentColor')
    })

    it('should call onFavoriteToggle when favorite button is clicked', async () => {
      const onFavoriteToggle = jest.fn()
      render(
        <ProductCard 
          {...defaultProps} 
          onFavoriteToggle={onFavoriteToggle}
        />
      )
      
      const favoriteButton = screen.getByRole('button')
      await user.click(favoriteButton)
      
      expect(onFavoriteToggle).toHaveBeenCalledTimes(1)
      expect(onFavoriteToggle).toHaveBeenCalledWith('listing-1')
    })

    it('should prevent event propagation when favorite button is clicked', async () => {
      const onFavoriteToggle = jest.fn()
      const onCardClick = jest.fn()
      
      render(
        <div onClick={onCardClick}>
          <ProductCard 
            {...defaultProps} 
            onFavoriteToggle={onFavoriteToggle}
          />
        </div>
      )
      
      const favoriteButton = screen.getByRole('button')
      await user.click(favoriteButton)
      
      expect(onFavoriteToggle).toHaveBeenCalledTimes(1)
      expect(onCardClick).not.toHaveBeenCalled()
    })

    it('should not crash when onFavoriteToggle is not provided', async () => {
      render(<ProductCard {...defaultProps} />)
      
      const favoriteButton = screen.getByRole('button')
      
      expect(() => user.click(favoriteButton)).not.toThrow()
    })
  })

  describe('Image Loading', () => {
    it('should set lazy loading on images', () => {
      render(<ProductCard {...defaultProps} />)
      
      const image = screen.getByAltText('iPhone 13 Pro Max in excellent condition')
      expect(image).toHaveAttribute('loading', 'lazy')
    })

    it('should set correct image dimensions', () => {
      render(<ProductCard {...defaultProps} />)
      
      const image = screen.getByAltText('iPhone 13 Pro Max in excellent condition')
      expect(image).toHaveAttribute('width', '300')
      expect(image).toHaveAttribute('height', '200')
    })

    it('should apply correct CSS classes to image', () => {
      render(<ProductCard {...defaultProps} />)
      
      const image = screen.getByAltText('iPhone 13 Pro Max in excellent condition')
      expect(image).toHaveClass('product-card-image')
    })
  })

  describe('Styling and Layout', () => {
    it('should apply custom className when provided', () => {
      render(<ProductCard {...defaultProps} className="custom-class" />)
      
      const cardContainer = screen.getByRole('link').firstElementChild
      expect(cardContainer).toHaveClass('custom-class')
    })

    it('should apply default product-card classes', () => {
      render(<ProductCard {...defaultProps} />)
      
      const cardContainer = screen.getByRole('link').firstElementChild
      expect(cardContainer).toHaveClass('product-card')
      expect(cardContainer).toHaveClass('group')
      expect(cardContainer).toHaveClass('cursor-pointer')
    })

    it('should apply correct CSS classes to title', () => {
      render(<ProductCard {...defaultProps} />)
      
      const title = screen.getByText('iPhone 13 Pro Max 256GB')
      expect(title).toHaveClass('product-card-title')
      expect(title).toHaveClass('line-clamp-2')
    })

    it('should apply correct CSS classes to price', () => {
      render(<ProductCard {...defaultProps} />)
      
      const price = screen.getByText('₦450,000')
      expect(price).toHaveClass('product-card-price')
      expect(price).toHaveClass('naira-symbol')
    })

    it('should apply correct CSS classes to location', () => {
      render(<ProductCard {...defaultProps} />)
      
      const location = screen.getByText('Lagos, Nigeria')
      expect(location).toHaveClass('product-card-location')
    })
  })

  describe('Accessibility', () => {
    it('should have proper link accessibility', () => {
      render(<ProductCard {...defaultProps} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/listings/listing-1')
    })

    it('should have proper button accessibility for favorites', () => {
      render(<ProductCard {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should have proper image alt text', () => {
      render(<ProductCard {...defaultProps} />)
      
      const image = screen.getByAltText('iPhone 13 Pro Max in excellent condition')
      expect(image).toBeInTheDocument()
    })

    it('should maintain focus management', async () => {
      render(<ProductCard {...defaultProps} />)
      
      const favoriteButton = screen.getByRole('button')
      favoriteButton.focus()
      
      expect(favoriteButton).toHaveFocus()
    })
  })

  describe('Nigerian Market Context', () => {
    it('should handle Nigerian product names correctly', () => {
      const nigerianProducts = [
        'Ankara Fabric Bundle',
        'Jollof Rice Pot Set',
        'Nigerian Nollywood DVDs',
        'Traditional Agbada Outfit',
        'Palm Wine Calabash',
      ]

      nigerianProducts.forEach(productName => {
        const { rerender } = render(
          <ProductCard {...defaultProps} title={productName} />
        )
        
        expect(screen.getByText(productName)).toBeInTheDocument()
        
        rerender(<div />) // Clear for next test
      })
    })

    it('should work with very long Nigerian location names', () => {
      const longLocation = 'New GRA Phase 2, Port Harcourt, Rivers State, Nigeria'
      render(<ProductCard {...defaultProps} location={longLocation} />)
      
      expect(screen.getByText(longLocation)).toBeInTheDocument()
    })

    it('should handle high-value Nigerian items', () => {
      const expensivePrice = 200000000000 // 2 million Naira
      render(<ProductCard {...defaultProps} price={expensivePrice} />)
      
      expect(screen.getByText('₦2,000,000')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should not cause unnecessary re-renders with same props', () => {
      const { rerender } = render(<ProductCard {...defaultProps} />)
      
      const initialTitle = screen.getByText('iPhone 13 Pro Max 256GB')
      
      rerender(<ProductCard {...defaultProps} />)
      
      const rerenderedTitle = screen.getByText('iPhone 13 Pro Max 256GB')
      expect(rerenderedTitle).toBe(initialTitle) // Same DOM node
    })

    it('should handle rapid favorite toggle clicks', async () => {
      const onFavoriteToggle = jest.fn()
      render(
        <ProductCard 
          {...defaultProps} 
          onFavoriteToggle={onFavoriteToggle}
        />
      )
      
      const favoriteButton = screen.getByRole('button')
      
      // Rapid clicks
      await user.click(favoriteButton)
      await user.click(favoriteButton)
      await user.click(favoriteButton)
      
      expect(onFavoriteToggle).toHaveBeenCalledTimes(3)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing image gracefully', () => {
      const propsWithoutImage = { ...defaultProps, imageUrl: '' }
      
      expect(() => render(<ProductCard {...propsWithoutImage} />)).not.toThrow()
    })

    it('should handle very long titles gracefully', () => {
      const longTitle = 'This is an extremely long product title that should be truncated or handled gracefully by the component without breaking the layout or causing overflow issues'
      
      render(<ProductCard {...defaultProps} title={longTitle} />)
      
      const titleElement = screen.getByText(longTitle)
      expect(titleElement).toHaveClass('line-clamp-2')
    })

    it('should handle empty or invalid price values', () => {
      const invalidPrices = [undefined, null, NaN, -1]
      
      invalidPrices.forEach(price => {
        expect(() => 
          render(<ProductCard {...defaultProps} price={price as any} />)
        ).not.toThrow()
      })
    })
  })
})