import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next";

const geistSans = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meetly",
  description:
    "AI-powered video call app with real-time AI agents, meeting summaries, transcripts, playback, transcript search, and contextual AI chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <Toaster />
        <html lang="en">
          <link rel="icon" href="./favicon.ico" sizes="any" />
          <link rel="icon" href="/logo.svg" type="image/svg+xml" />
          <body className={`${geistSans.className}`}>{children}</body>
        </html>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
