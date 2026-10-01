import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chapters Directory | University & College Fellowships",
  description:
    "Explore affiliated CUCASO campus chapters across Mombasa and the Coast, including TUM, KU Mombasa, KMTC Mombasa, and more.",
  openGraph: {
    title: "Chapters Directory | CUCASO",
    description:
      "Explore affiliated CUCASO campus chapters across Mombasa and the Kenyan Coast.",
  },
};

export default function ChaptersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
