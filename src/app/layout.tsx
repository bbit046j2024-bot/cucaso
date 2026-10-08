import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cucaso.org"),
  title: {
    default: "CUCASO | Coastal Universities & Colleges Adventist Students Organization",
    template: "%s | CUCASO",
  },
  description:
    "Official digital platform for Seventh-day Adventist universities, colleges, and schools across the Kenyan Coast. Chapter directory, rally schedules, sermons, music resources, and student leadership.",
  keywords: [
    "CUCASO",
    "Coastal Universities and Colleges Adventist Students Organization",
    "SDA Students Kenya",
    "Mombasa Adventist",
    "SDA Coast Rally",
    "Adventist Student Organization",
    "Adventist Campus Ministry Kenya",
    "TUM SDA",
    "KU Mombasa SDA",
    "KMTC Mombasa SDA",
    "Seventh-day Adventist Church",
  ],
  authors: [{ name: "CUCASO Media & Communications", url: "https://www.cucaso.org" }],
  creator: "CUCASO",
  publisher: "Seventh-day Adventist Church",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.cucaso.org",
    siteName: "CUCASO",
    title: "CUCASO | Coastal Universities & Colleges Adventist Students Organization",
    description:
      "Official digital platform for Seventh-day Adventist universities, colleges, and schools across the Mombasa coast. Chapter registration, rally administration, sermons, and resources.",
    images: [
      {
        url: "/hero-students.jpg",
        width: 1200,
        height: 630,
        alt: "CUCASO Adventist Students Fellowship",
      },
      {
        url: "/logo-circular.png",
        width: 512,
        height: 512,
        alt: "CUCASO Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CUCASO | Coastal Universities & Colleges Adventist Students Organization",
    description:
      "Connecting and empowering Seventh-day Adventist students across higher learning institutions in the Kenyan coastal region.",
    images: ["/hero-students.jpg"],
    creator: "@cucaso_ke",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" },
      { url: "/cucaso-logo.ico" },
      { url: "/logo.ico" },
    ],
    shortcut: "/cucaso-logo.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { AdventistBrandSidebar } from "@/components/adventist-brand-sidebar";
import { CookieConsentBanner } from "@/components/cookie-banner";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.cucaso.org/#organization",
      name: "Coastal Universities and Colleges Adventist Students Organization",
      alternateName: "CUCASO",
      url: "https://www.cucaso.org",
      logo: "https://www.cucaso.org/logo-circular.png",
      sameAs: [
        "https://www.facebook.com/cucasomedia",
        "https://www.instagram.com/cucaso_official",
        "https://www.youtube.com/@cucasomedia",
      ],
      description:
        "Official fellowship and coordination body for Seventh-day Adventist students across universities, colleges, and higher learning institutions in Kenya's Coastal region.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mombasa",
        addressRegion: "Coast",
        addressCountry: "KE",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.cucaso.org/#website",
      url: "https://www.cucaso.org",
      name: "CUCASO",
      description:
        "Official digital platform for Seventh-day Adventist universities, colleges, and schools across the Mombasa coastal region.",
      publisher: {
        "@id": "https://www.cucaso.org/#organization",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} font-sans scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-body">
        {children}
        <AdventistBrandSidebar />
        <MobileBottomNav />
        <CookieConsentBanner />
      </body>
    </html>
  );
}

