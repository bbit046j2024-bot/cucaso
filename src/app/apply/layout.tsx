import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply & Register | Chapter Affiliation",
  description:
    "Register your university or college Adventist fellowship with CUCASO or apply for individual membership and leadership programs.",
  openGraph: {
    title: "Apply & Register | CUCASO",
    description:
      "Register your campus fellowship or apply for membership in CUCASO.",
  },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
