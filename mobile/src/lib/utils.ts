/**
 * Utility functions for mobile app
 */

/**
 * Format price in kobo to naira display format
 */
export function formatNaira(kobo: number | null | undefined): string {
  if (kobo == null || isNaN(kobo) || kobo === 0) {
    return '₦0';
  }
  
  const naira = kobo / 100;
  return `₦${naira.toLocaleString()}`;
}

/**
 * Format category enum to display label
 */
export function formatCategory(category: string): string {
  if (!category) return '';
  
  // Convert enum format to readable labels
  const categoryMappings: Record<string, string> = {
    'ELECTRONICS': 'Electronics',
    'FASHION': 'Fashion',
    'VEHICLES': 'Vehicles',
    'HOME_GARDEN': 'Home & Garden',
    'BOOKS_MEDIA': 'Books & Media',
    'BEAUTY_HEALTH': 'Beauty & Health',
    'SPORTS_RECREATION': 'Sports & Recreation',
    'AUTOMOTIVE': 'Automotive',
    'TOYS_GAMES': 'Toys & Games',
    'JEWELRY_ACCESSORIES': 'Jewelry & Accessories',
    'ARTS_CRAFTS': 'Arts & Crafts',
    'MUSICAL_INSTRUMENTS': 'Musical Instruments',
    'FOOD_BEVERAGES': 'Food & Beverages',
    'TOOLS_EQUIPMENT': 'Tools & Equipment',
    'SERVICES': 'Services',
    'HOME_APPLIANCES': 'Home Appliances',
    'PET_SUPPLIES': 'Pet Supplies',
    'OFFICE_SUPPLIES': 'Office Supplies',
    'OTHER': 'Other',
  };
  
  return categoryMappings[category] || category;
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  return date.toLocaleDateString();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}