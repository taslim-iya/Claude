import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Data Platform",
  description: "Upload, enrich, verify, and distribute company data through secure API access",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
