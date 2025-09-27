import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { NotificationContainer } from "@/components/ui/notification";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TradeByBarter - Nigerian Barter Marketplace",
  description: "Trade anything with anyone, anywhere in Nigeria. Nigeria's premier barter marketplace platform.",
  keywords: [
    "barter",
    "trade",
    "marketplace",
    "Nigeria",
    "exchange",
    "swap",
    "trading",
    "Nigerian marketplace",
  ],
  authors: [{ name: "TradeByBarter Team" }],
  creator: "TradeByBarter",
  publisher: "TradeByBarter",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tradebybarter.com"),
  openGraph: {
    title: "TradeByBarter - Nigerian Barter Marketplace",
    description: "Trade anything with anyone, anywhere in Nigeria.",
    url: "/",
    siteName: "TradeByBarter",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TradeByBarter - Nigerian Barter Marketplace",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeByBarter - Nigerian Barter Marketplace",
    description: "Trade anything with anyone, anywhere in Nigeria.",
    images: ["/og-image.png"],
    creator: "@tradebybarter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(process.env.GOOGLE_VERIFICATION_ID && {
    verification: {
      google: process.env.GOOGLE_VERIFICATION_ID,
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <NotificationProvider>
          <AuthProvider>
            {children}
            <NotificationContainer />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
