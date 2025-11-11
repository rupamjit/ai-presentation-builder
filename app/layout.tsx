import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Providers } from "@/provider/Providers";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: {
    default: "AI Presentation Builder",
    template: "%s | AI Presentation Builder",
  },
  description: "Create stunning presentations with AI-powered tools",
  keywords: ["AI", "presentation", "slides", "builder", "design", "PPT"],
  authors: [{ name: "Your Name" }],
  creator: "Your Company",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "AI Presentation Builder",
    description: "Create stunning presentations with AI",
    siteName: "AI Presentation Builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Presentation Builder",
    description: "Create stunning presentations with AI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
