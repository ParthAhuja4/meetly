"use client";
import ErrorState from "@/components/ui/error-state";

export default function Page() {
  return (
    <ErrorState title="Error Loading Meetings" description="Try Again Later" />
  );
}
