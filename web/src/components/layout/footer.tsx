import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps): React.ReactElement {
  return (
    <footer className={cn('bg-neutral-dark text-white py-12', className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="splash-logo w-8 h-8">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <span className="text-xl font-bold font-display">
                TradeByBarter
              </span>
            </div>
            <p className="text-neutral-gray mb-4 max-w-md">
              Nigeria's premier barter marketplace. Trade anything with anyone, anywhere in Nigeria.
            </p>
            <p className="text-sm text-neutral-gray">
              Made with care in Nigeria 🇳🇬
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-neutral-gray hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-neutral-gray hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-neutral-gray hover:text-white transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-neutral-gray hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-neutral-gray hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-gray hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-gray hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-gray hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-gray/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-neutral-gray">
              © {new Date().getFullYear()} TradeByBarter. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                href="/download/android" 
                className="text-neutral-gray hover:text-white transition-colors text-sm"
              >
                Download Android App
              </Link>
              <Link 
                href="/download/ios" 
                className="text-neutral-gray hover:text-white transition-colors text-sm"
              >
                Download iOS App
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;