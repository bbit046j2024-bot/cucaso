import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners & Conferences | Institutional Collaboration",
  description:
    "Discover the church conferences, fields, universities, and ministry partners collaborating with CUCASO in youth evangelism.",
  openGraph: {
    title: "Partners & Conferences | CUCASO",
    description:
      "Discover conferences, institutions, and ministry partners collaborating with CUCASO.",
  },
};

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
