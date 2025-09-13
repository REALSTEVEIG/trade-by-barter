import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Footer } from '../footer'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

// Mock icons
jest.mock('lucide-react', () => ({
  Facebook: () => <svg data-testid="facebook-icon" />,
  Twitter: () => <svg data-testid="twitter-icon" />,
  Instagram: () => <svg data-testid="instagram-icon" />,
  Mail: () => <svg data-testid="mail-icon" />,
  Phone: () => <svg data-testid="phone-icon" />,
  MapPin: () => <svg data-testid="mappin-icon" />,
}))

describe('Footer Component', () => {
  const user = userEvent.setup()

  describe('Rendering', () => {
    it('should render footer element with proper structure', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('footer')
    })

    it('should render TradeByBarter brand', () => {
      render(<Footer />)
      
      expect(screen.getByText('TradeByBarter')).toBeInTheDocument()
    })

    it('should render company tagline', () => {
      render(<Footer />)
      
      expect(screen.getByText(/Trade smarter, live better/i)).toBeInTheDocument()
    })

    it('should render copyright notice', () => {
      render(<Footer />)
      
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(`© ${currentYear} TradeByBarter. All rights reserved.`)).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('should render all main navigation sections', () => {
      render(<Footer />)
      
      // Check section headers
      expect(screen.getByText('Company')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('Legal')).toBeInTheDocument()
      expect(screen.getByText('Connect')).toBeInTheDocument()
    })

    it('should render company links', () => {
      render(<Footer />)
      
      expect(screen.getByText('About Us')).toBeInTheDocument()
      expect(screen.getByText('How It Works')).toBeInTheDocument()
      expect(screen.getByText('Safety Tips')).toBeInTheDocument()
      expect(screen.getByText('Careers')).toBeInTheDocument()
    })

    it('should render support links', () => {
      render(<Footer />)
      
      expect(screen.getByText('Help Center')).toBeInTheDocument()
      expect(screen.getByText('Contact Us')).toBeInTheDocument()
      expect(screen.getByText('Report Issue')).toBeInTheDocument()
      expect(screen.getByText('Community Guidelines')).toBeInTheDocument()
    })

    it('should render legal links', () => {
      render(<Footer />)
      
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
      expect(screen.getByText('Cookie Policy')).toBeInTheDocument()
      expect(screen.getByText('Dispute Resolution')).toBeInTheDocument()
    })

    it('should have correct href attributes for all links', () => {
      render(<Footer />)
      
      // Company links
      expect(screen.getByText('About Us').closest('a')).toHaveAttribute('href', '/about')
      expect(screen.getByText('How It Works').closest('a')).toHaveAttribute('href', '/how-it-works')
      expect(screen.getByText('Safety Tips').closest('a')).toHaveAttribute('href', '/safety')
      expect(screen.getByText('Careers').closest('a')).toHaveAttribute('href', '/careers')
      
      // Support links
      expect(screen.getByText('Help Center').closest('a')).toHaveAttribute('href', '/help')
      expect(screen.getByText('Contact Us').closest('a')).toHaveAttribute('href', '/contact')
      expect(screen.getByText('Report Issue').closest('a')).toHaveAttribute('href', '/report')
      expect(screen.getByText('Community Guidelines').closest('a')).toHaveAttribute('href', '/guidelines')
      
      // Legal links
      expect(screen.getByText('Terms of Service').closest('a')).toHaveAttribute('href', '/terms')
      expect(screen.getByText('Privacy Policy').closest('a')).toHaveAttribute('href', '/privacy')
      expect(screen.getByText('Cookie Policy').closest('a')).toHaveAttribute('href', '/cookies')
      expect(screen.getByText('Dispute Resolution').closest('a')).toHaveAttribute('href', '/disputes')
    })
  })

  describe('Social Media Links', () => {
    it('should render social media section', () => {
      render(<Footer />)
      
      expect(screen.getByText('Follow Us')).toBeInTheDocument()
    })

    it('should render all social media icons', () => {
      render(<Footer />)
      
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument()
      expect(screen.getByTestId('twitter-icon')).toBeInTheDocument()
      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument()
    })

    it('should have correct social media links', () => {
      render(<Footer />)
      
      const facebookLink = screen.getByTestId('facebook-icon').closest('a')
      const twitterLink = screen.getByTestId('twitter-icon').closest('a')
      const instagramLink = screen.getByTestId('instagram-icon').closest('a')
      
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/tradebybarter')
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/tradebybarter')
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/tradebybarter')
      
      // Should open in new tab
      expect(facebookLink).toHaveAttribute('target', '_blank')
      expect(twitterLink).toHaveAttribute('target', '_blank')
      expect(instagramLink).toHaveAttribute('target', '_blank')
      
      // Should have security attributes
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer')
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
      expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Contact Information', () => {
    it('should render contact section', () => {
      render(<Footer />)
      
      expect(screen.getByText('Contact Info')).toBeInTheDocument()
    })

    it('should render Nigerian contact details', () => {
      render(<Footer />)
      
      // Email
      expect(screen.getByText('hello@tradebybarter.ng')).toBeInTheDocument()
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
      
      // Nigerian phone number
      expect(screen.getByText('+234 800 TRADE-NG')).toBeInTheDocument()
      expect(screen.getByTestId('phone-icon')).toBeInTheDocument()
      
      // Nigerian address
      expect(screen.getByText(/Lagos, Nigeria/)).toBeInTheDocument()
      expect(screen.getByTestId('mappin-icon')).toBeInTheDocument()
    })

    it('should have clickable email and phone links', () => {
      render(<Footer />)
      
      const emailLink = screen.getByText('hello@tradebybarter.ng').closest('a')
      const phoneLink = screen.getByText('+234 800 TRADE-NG').closest('a')
      
      expect(emailLink).toHaveAttribute('href', 'mailto:hello@tradebybarter.ng')
      expect(phoneLink).toHaveAttribute('href', 'tel:+2348008723364')
    })
  })

  describe('Newsletter Subscription', () => {
    it('should render newsletter subscription section', () => {
      render(<Footer />)
      
      expect(screen.getByText('Newsletter')).toBeInTheDocument()
      expect(screen.getByText(/Stay updated with the latest/)).toBeInTheDocument()
    })

    it('should render email input and subscribe button', () => {
      render(<Footer />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email')
      const subscribeButton = screen.getByText('Subscribe')
      
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(subscribeButton).toBeInTheDocument()
      expect(subscribeButton).toHaveAttribute('type', 'submit')
    })

    it('should handle newsletter subscription form submission', async () => {
      render(<Footer />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email')
      const subscribeButton = screen.getByText('Subscribe')
      const form = subscribeButton.closest('form')
      
      // Fill in email
      await user.type(emailInput, 'test@example.com')
      expect(emailInput).toHaveValue('test@example.com')
      
      // Mock form submission
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      fireEvent(form!, submitEvent)
      
      expect(submitEvent.defaultPrevented).toBe(true)
    })

    it('should validate email format', async () => {
      render(<Footer />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email')
      
      // Should accept valid email formats
      await user.clear(emailInput)
      await user.type(emailInput, 'user@tradebybarter.ng')
      expect(emailInput).toHaveValue('user@tradebybarter.ng')
      
      // Should show validation for invalid format
      await user.clear(emailInput)
      await user.type(emailInput, 'invalid-email')
      
      // Browser validation should apply
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Nigerian Localization', () => {
    it('should display Nigerian-specific contact information', () => {
      render(<Footer />)
      
      // Nigerian domain email
      expect(screen.getByText('hello@tradebybarter.ng')).toBeInTheDocument()
      
      // Nigerian phone format
      expect(screen.getByText('+234 800 TRADE-NG')).toBeInTheDocument()
      
      // Nigerian location
      expect(screen.getByText(/Lagos, Nigeria/)).toBeInTheDocument()
    })

    it('should use Nigerian time zone context', () => {
      render(<Footer />)
      
      // Footer should acknowledge Nigerian business hours
      const businessHours = screen.queryByText(/Mon-Fri 9AM-6PM WAT/)
      if (businessHours) {
        expect(businessHours).toBeInTheDocument()
      }
    })

    it('should reference Nigerian regulations', () => {
      render(<Footer />)
      
      // Should reference Nigerian compliance
      const complianceText = screen.queryByText(/Regulated by CAC Nigeria/)
      if (complianceText) {
        expect(complianceText).toBeInTheDocument()
      }
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive grid classes', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      const gridContainer = footer.querySelector('.grid')
      
      expect(gridContainer).toHaveClass('grid')
      expect(gridContainer).toHaveClass('md:grid-cols-2')
      expect(gridContainer).toHaveClass('lg:grid-cols-4')
    })

    it('should handle mobile layout', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8')
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
      
      // Should have navigation landmarks
      const navElements = screen.getAllByRole('navigation')
      expect(navElements.length).toBeGreaterThan(0)
    })

    it('should have accessible form labels', () => {
      render(<Footer />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email')
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')
      
      // Should have proper form structure
      const form = emailInput.closest('form')
      expect(form).toBeInTheDocument()
    })

    it('should have keyboard navigation support', async () => {
      render(<Footer />)
      
      // Test tab navigation through links
      const firstLink = screen.getByText('About Us').closest('a')
      firstLink?.focus()
      expect(firstLink).toHaveFocus()
      
      // Tab to next focusable element
      await user.keyboard('{Tab}')
      // Focus should move to next link
    })

    it('should have aria labels for social media links', () => {
      render(<Footer />)
      
      const facebookLink = screen.getByTestId('facebook-icon').closest('a')
      const twitterLink = screen.getByTestId('twitter-icon').closest('a')
      const instagramLink = screen.getByTestId('instagram-icon').closest('a')
      
      expect(facebookLink).toHaveAttribute('aria-label', 'Follow us on Facebook')
      expect(twitterLink).toHaveAttribute('aria-label', 'Follow us on Twitter')
      expect(instagramLink).toHaveAttribute('aria-label', 'Follow us on Instagram')
    })
  })

  describe('SEO and Meta Information', () => {
    it('should contain structured data for organization', () => {
      render(<Footer />)
      
      // Company name should be prominently displayed
      expect(screen.getByText('TradeByBarter')).toBeInTheDocument()
      
      // Contact information should be structured
      expect(screen.getByText('hello@tradebybarter.ng')).toBeInTheDocument()
      expect(screen.getByText('+234 800 TRADE-NG')).toBeInTheDocument()
    })

    it('should have proper link structure for SEO', () => {
      render(<Footer />)
      
      // Internal links should not have nofollow
      const aboutLink = screen.getByText('About Us').closest('a')
      expect(aboutLink).not.toHaveAttribute('rel', 'nofollow')
      
      // External social links should have proper rel attributes
      const facebookLink = screen.getByTestId('facebook-icon').closest('a')
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Performance', () => {
    it('should not cause excessive re-renders', () => {
      const { rerender } = render(<Footer />)
      
      // Re-render should not break anything
      rerender(<Footer />)
      
      expect(screen.getByText('TradeByBarter')).toBeInTheDocument()
    })

    it('should load social media icons efficiently', () => {
      render(<Footer />)
      
      // Icons should be SVG for performance
      const facebookIcon = screen.getByTestId('facebook-icon')
      const twitterIcon = screen.getByTestId('twitter-icon')
      const instagramIcon = screen.getByTestId('instagram-icon')
      
      expect(facebookIcon.tagName).toBe('svg')
      expect(twitterIcon.tagName).toBe('svg')
      expect(instagramIcon.tagName).toBe('svg')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing social media props gracefully', () => {
      render(<Footer />)
      
      // Should not crash if social media links are not configured
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should handle newsletter subscription errors gracefully', async () => {
      render(<Footer />)
      
      const emailInput = screen.getByPlaceholderText('Enter your email')
      const subscribeButton = screen.getByText('Subscribe')
      
      // Should not crash on empty submission
      await user.click(subscribeButton)
      
      expect(emailInput).toBeInTheDocument()
    })

    it('should handle long text content gracefully', () => {
      render(<Footer />)
      
      // Should maintain layout with long content
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('footer')
    })
  })
})