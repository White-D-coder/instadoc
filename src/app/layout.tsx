import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InstaDoc — Instagram Page Doctor | Free Profile Audit & Bio Optimizer",
  description:
    "Get a comprehensive Instagram profile audit in seconds. InstaDoc analyzes your bio, username, content strategy, and positioning — then gives you a scored diagnosis with AI-powered improvement prescriptions.",
  keywords: [
    "Instagram audit",
    "Instagram bio optimizer",
    "profile doctor",
    "social media audit",
    "Instagram growth",
    "bio generator",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
