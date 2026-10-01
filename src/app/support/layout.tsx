import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support & Giving | Empower Adventist Student Ministries",
  description:
    "Partner with CUCASO through financial support, mission project sponsorships, student welfare contributions, and evangelism sponsorship.",
  openGraph: {
    title: "Support & Giving | CUCASO",
    description:
      "Support Adventist student ministry and mission initiatives in Coastal Kenya.",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
