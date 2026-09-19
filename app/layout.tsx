import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velora Trip | AI Travel Planner",
  description:
    "Plan smarter and travel further with Velora Trip. Create personalized AI-powered itineraries based on your destination, budget, interests, and travel style.",
  applicationName: "Velora Trip",
  keywords: [
    "Velora Trip",
    "AI travel planner",
    "travel itinerary",
    "trip planner",
    "AI itinerary generator",
  ],
  authors: [{ name: "Velora Trip" }],
  openGraph: {
    title: "Velora Trip | AI Travel Planner",
    description:
      "Create personalized AI-powered travel itineraries in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}