import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Gallery | Memories & Highlights",
  description:
    "Photo and video highlights from CUCASO rallies, Sabbath worship, choir performances, community outreaches, and youth camps.",
  openGraph: {
    title: "Media Gallery | CUCASO",
    description:
      "Photo and video highlights from CUCASO rallies, worship services, and youth camps.",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
