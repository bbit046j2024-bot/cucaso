import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rallies & Events | Annual Coast Adventist Gatherings",
  description:
    "Information on upcoming and past CUCASO rallies, host campuses, theme songs, registration details, and event schedules.",
  openGraph: {
    title: "Rallies & Events | CUCASO",
    description:
      "Join Adventist youth and students in dynamic annual rallies across coastal Kenya.",
  },
};

export default function RalliesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
