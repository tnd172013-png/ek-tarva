import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pitch to Hire | Ektarva — Where Companies Pitch, You Choose",
  description:
    "A live hiring event for frontend developers. 20+ companies pitch their openings. You choose where you get hired. Book your spot for ₹199.",
  openGraph: {
    title: "Pitch to Hire | Ektarva",
    description:
      "A live hiring event for frontend developers. 20+ companies pitch, you choose.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${sora.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
