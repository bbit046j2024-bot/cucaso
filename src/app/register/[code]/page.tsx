import React from "react";
import { Metadata } from "next";
import { AttendeeRegistrationView } from "@/components/attendee-registration-view";

interface Props {
  params: Promise<{ code: string }> | { code: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const code = resolvedParams.code?.toUpperCase() || "DELEGATE";
  return {
    title: `Delegate Registration — ${code} | CUCASO Coastal Unity Rally 2026`,
    description: `Official registration link for CUCASO Coastal Unity Rally 2026 for chapter ${code}. Check pre-registration status and register.`,
  };
}

export default async function RegisterByCodePage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  return <AttendeeRegistrationView chapterCode={resolvedParams.code} />;
}
