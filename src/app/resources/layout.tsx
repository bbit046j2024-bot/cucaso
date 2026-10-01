import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources, Hymns & Study Materials",
  description:
    "Download rally theme songs, choir sheet music, Adventist youth study guides, constitutional documents, and ministry guidelines.",
  openGraph: {
    title: "Resources & Music | CUCASO",
    description:
      "Download songs, songbooks, guides, and ministry documents for Adventist student chapters.",
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
