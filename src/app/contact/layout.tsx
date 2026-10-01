import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Get In Touch",
  description:
    "Connect with CUCASO officers, chapter coordinators, communications team, and regional Adventist Campus Ministry directors.",
  openGraph: {
    title: "Contact Us | CUCASO",
    description:
      "Get in touch with CUCASO leadership and ministry directors across the Coast.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
