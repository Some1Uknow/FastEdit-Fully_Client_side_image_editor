import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fastedit.raghav.codes"),
  title: {
    default: "FastEdit | Professional Online Photo Editing",
    template: "%s | FastEdit",
  },
  description:
    "A powerful, privacy-focused, fully client-side image editor. Edit photos with professional adjustments, filters, drawing tools, text overlays, and shapes directly in your browser.",
  keywords: [
    "image editor",
    "photo editor",
    "online photo editor",
    "client-side editor",
    "privacy focused",
    "image adjustments",
    "filters",
    "drawing tools",
    "text overlay",
    "crop image",
    "resize image",
    "fastedit",
  ],
  authors: [{ name: "Raghav Sharma" }],
  creator: "Raghav Sharma",
  publisher: "Raghav Sharma",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "FastEdit | Professional Online Photo Editing",
    description:
      "Edit photos securely in your browser. No uploads required. Features include adjustments, filters, drawing, text, and more.",
    url: "https://fastedit.raghav.codes",
    siteName: "FastEdit",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FastEdit",
    description:
      "Professional, privacy-first image editing in your browser. Try it now.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-[#fafafa]`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
