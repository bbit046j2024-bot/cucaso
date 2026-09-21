"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AttendeeRegistrationView } from "@/components/attendee-registration-view";

function RegisterContent() {
  const searchParams = useSearchParams();
  const chapterCode = searchParams.get("chapter") || searchParams.get("code") || undefined;
  return <AttendeeRegistrationView chapterCode={chapterCode} />;
}

export default function RegisterMainPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-navy-900 border-t-teal-500 rounded-full animate-spin" />
            <span className="text-xs font-bold text-navy-950">Loading CUCASO Registration Portal...</span>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
