import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumni Network | Mentorship & Fellowship",
  description:
    "Join the CUCASO Alumni network to connect with graduates, mentor current students, and support Adventist campus ministries in Coastal Kenya.",
  openGraph: {
    title: "Alumni Network | CUCASO",
    description:
      "Join the CUCASO Alumni network for mentorship, professional networking, and ministry support.",
  },
};

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
