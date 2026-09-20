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
  title: "CUCASO — Coastal Universities and Colleges Adventist Schools Organization",
  description:
    "Official digital platform for Seventh-day Adventist universities, colleges, and schools across the Mombasa coast. Chapter registration, capability funding, and rally administration.",
  keywords: [
    "CUCASO",
    "Mombasa Adventist",
    "SDA Coast Rally",
    "Adventist Student Organization",
    "Coastal Universities Adventist",
  ],
};

import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} font-sans scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-body">
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
