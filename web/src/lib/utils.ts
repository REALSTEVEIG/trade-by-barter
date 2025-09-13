import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'NGN'): string {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString('en-NG')}`;
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 234, it's already international format
  if (digits.startsWith('234')) {
    return `+${digits}`;
  }
  
  // If it starts with 0, replace with 234
  if (digits.startsWith('0')) {
    return `+234${digits.slice(1)}`;
  }
  
  // If it's 10 digits, assume it's Nigerian without the leading 0
  if (digits.length === 10) {
    return `+234${digits}`;
  }
  
  return phone;
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
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

  return date.toLocaleDateString('en-NG');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}_${randomStr}`;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidNigerianPhone(phone: string): boolean {
  const nigerianPhoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
  return nigerianPhoneRegex.test(phone.replace(/\s/g, ''));
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  } finally {
    document.body.removeChild(textArea);
  }
}

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT (Abuja)',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

export const CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'VEHICLES', label: 'Vehicles' },
  { value: 'HOME_GARDEN', label: 'Home & Garden' },
  { value: 'BOOKS_EDUCATION', label: 'Books & Education' },
  { value: 'HEALTH_BEAUTY', label: 'Health & Beauty' },
  { value: 'SPORTS_RECREATION', label: 'Sports & Recreation' },
  { value: 'BABY_KIDS', label: 'Baby & Kids' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'ART_CRAFTS', label: 'Arts & Crafts' },
  { value: 'MUSICAL_INSTRUMENTS', label: 'Musical Instruments' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'APPLIANCES', label: 'Appliances' },
  { value: 'BOOKS', label: 'Books' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'TOYS', label: 'Toys' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'OTHER', label: 'Other' },
];

export const PRODUCT_CONDITIONS = [
  { value: 'NEW', label: 'Brand New', description: 'Never used, original packaging' },
  { value: 'LIKE_NEW', label: 'Like New', description: 'Barely used, excellent condition' },
  { value: 'GOOD', label: 'Good', description: 'Used but well maintained' },
  { value: 'FAIR', label: 'Fair', description: 'Shows wear but functional' },
  { value: 'POOR', label: 'Poor', description: 'Heavy wear, may need repair' },
];

export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    });
  });
}