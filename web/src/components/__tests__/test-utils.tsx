import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock Next.js components and hooks
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockPrefetch = jest.fn()

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Test data for Nigerian market
export const NIGERIAN_TEST_DATA = {
  users: {
    lagos: {
      id: '1',
      name: 'Adebayo Johnson',
      location: 'Lagos, Nigeria',
      phone: '+2348012345678',
    },
    abuja: {
      id: '2', 
      name: 'Kemi Adebola',
      location: 'Abuja, Nigeria',
      phone: '+2349087654321',
    },
  },
  listings: {
    iphone: {
      id: 'listing-1',
      title: 'iPhone 13 Pro Max',
      price: 45000000, // 450,000 Naira in kobo
      location: 'Lagos, Nigeria',
      imageUrl: '/images/iphone-13.jpg',
      imageAlt: 'iPhone 13 Pro Max in excellent condition',
    },
    macbook: {
      id: 'listing-2',
      title: 'MacBook Air M2',
      price: 50000000, // 500,000 Naira in kobo
      location: 'Abuja, Nigeria', 
      imageUrl: '/images/macbook-air.jpg',
      imageAlt: 'MacBook Air M2 laptop',
    },
  },
  locations: [
    'Lagos, Nigeria',
    'Abuja, Nigeria',
    'Port Harcourt, Nigeria',
    'Kano, Nigeria',
    'Ibadan, Nigeria',
  ],
  nairaAmounts: [
    { kobo: 1000000, formatted: '₦10,000' },
    { kobo: 5000000, formatted: '₦50,000' },
    { kobo: 10000000, formatted: '₦100,000' },
    { kobo: 45000000, formatted: '₦450,000' },
    { kobo: 100000000, formatted: '₦1,000,000' },
  ],
}

// Mock formatNaira utility function
export const mockFormatNaira = (amountInKobo: number): string => {
  const naira = amountInKobo / 100;
  return `₦${naira.toLocaleString('en-NG')}`;
}

// Custom render function for components that need providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for Nigerian market testing
export const testHelpers = {
  // Test if a phone number is valid Nigerian format
  isValidNigerianPhone: (phone: string): boolean => {
    const nigerianPhoneRegex = /^\+234[789][01]\d{8}$/
    return nigerianPhoneRegex.test(phone)
  },

  // Test if currency is properly formatted for Nigerian Naira
  isValidNairaFormat: (formatted: string): boolean => {
    const nairaRegex = /^₦[\d,]+$/
    return nairaRegex.test(formatted)
  },

  // Generate mock API responses
  createMockApiResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),

  // Create mock fetch for API testing
  setupMockFetch: (responses: any[]) => {
    let callCount = 0
    global.fetch = jest.fn(() => {
      const response = responses[callCount] || responses[responses.length - 1]
      callCount++
      return Promise.resolve(response)
    })
  },

  // Wait for component to settle (useful for async operations)
  waitForComponentToSettle: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Create mock intersection observer for image loading tests
  createMockIntersectionObserver: () => {
    const mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }
    
    global.IntersectionObserver = jest.fn(() => mockObserver) as any
    return mockObserver
  },
}

// Nigerian-specific matchers
export const nigerianMatchers = {
  toBeValidNigerianPhone: (received: string) => {
    const pass = testHelpers.isValidNigerianPhone(received)
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid Nigerian phone number`,
      pass,
    }
  },

  toBeValidNairaFormat: (received: string) => {
    const pass = testHelpers.isValidNairaFormat(received)
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be properly formatted Naira`,
      pass,
    }
  },
}

// Setup function to be called in test files
export const setupTest = () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockReplace.mockClear()
    mockPrefetch.mockClear()
    
    // Reset fetch mock
    if (global.fetch) {
      (global.fetch as jest.Mock).mockClear()
    }
  })

  // Cleanup after tests
  afterEach(() => {
    // Clean up any side effects
  })
}

// Mock API endpoints for testing
export const mockApiEndpoints = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
  },
  listings: {
    search: '/api/listings/search',
    create: '/api/listings',
    byId: (id: string) => `/api/listings/${id}`,
    favorite: (id: string) => `/api/listings/${id}/favorite`,
  },
  offers: {
    create: '/api/offers',
    sent: '/api/offers/sent',
    received: '/api/offers/received',
  },
}

// Performance testing helpers
export const performanceHelpers = {
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const start = performance.now()
    renderFn()
    await testHelpers.waitForComponentToSettle()
    return performance.now() - start
  },

  expectFastRender: (duration: number, maxMs = 100) => {
    expect(duration).toBeLessThan(maxMs)
  },
}

// Accessibility testing helpers
export const a11yHelpers = {
  expectToBeAccessible: async (container: HTMLElement) => {
    // Basic accessibility checks
    const buttons = container.querySelectorAll('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type')
    })

    const images = container.querySelectorAll('img')
    images.forEach(img => {
      expect(img).toHaveAttribute('alt')
    })

    const links = container.querySelectorAll('a')
    links.forEach(link => {
      if (!link.textContent?.trim()) {
        expect(link).toHaveAttribute('aria-label')
      }
    })
  },

  expectToHaveFocusManagement: (element: HTMLElement) => {
    expect(element).toHaveProperty('tabIndex')
    expect(element).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2')
  },
}