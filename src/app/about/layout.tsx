import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Mission, Vision & History",
  description:
    "Learn about CUCASO's mission, history, and vision for Seventh-day Adventist students across universities and colleges in the Kenyan Coast.",
  openGraph: {
    title: "About Us | CUCASO",
    description:
      "Learn about CUCASO's mission, history, and vision for Seventh-day Adventist students in Kenya's Coastal region.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
