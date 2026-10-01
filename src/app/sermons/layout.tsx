import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sermons & Spiritual Messages",
  description:
    "Listen to inspiring sermons, Bible studies, keynote presentations, and devotionals from CUCASO rallies and campus fellowships.",
  openGraph: {
    title: "Sermons & Spiritual Messages | CUCASO",
    description:
      "Listen to inspiring sermons and spiritual devotionals from CUCASO rallies and campus fellowships.",
  },
};

export default function SermonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
