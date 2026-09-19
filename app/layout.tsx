import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Velora Trip | AI Travel Planner",
    template: "%s | Velora Trip",
  },

  description:
    "Plan personalized trips with Velora Trip. Generate AI-powered itineraries based on your destination, budget, interests, and travel style.",

  keywords: [
    "Velora Trip",
    "AI travel planner",
    "trip planner",
    "AI itinerary generator",
    "travel itinerary",
    "vacation planner",
  ],

  authors: [{ name: "Velora Trip" }],

  applicationName: "Velora Trip",

  openGraph: {
    title: "Velora Trip | AI Travel Planner",
    description:
      "Turn your travel ideas into personalized AI-powered itineraries.",
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