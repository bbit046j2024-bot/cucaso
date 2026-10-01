import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leadership Council | Executive Committee & Patrons",
  description:
    "Meet the elected student leaders, executive committee members, ministry directors, and church elders guiding CUCASO.",
  openGraph: {
    title: "Leadership Council | CUCASO",
    description:
      "Meet the dedicated student leaders and executive committee guiding CUCASO.",
  },
};

export default function LeadershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
