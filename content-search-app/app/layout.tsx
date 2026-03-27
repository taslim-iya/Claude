import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentFinder — Search & Download Stock Content",
  description:
    "Search free stock images, videos, and music from Unsplash, Pexels, and Pixabay. Built for travel content creators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
