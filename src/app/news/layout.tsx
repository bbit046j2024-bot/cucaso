import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Announcements",
  description:
    "Stay informed with the latest announcements, mission updates, event recaps, and stories from CUCASO student ministries.",
  openGraph: {
    title: "News & Announcements | CUCASO",
    description:
      "Latest announcements, mission updates, and news from CUCASO student ministries across the Coast.",
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
