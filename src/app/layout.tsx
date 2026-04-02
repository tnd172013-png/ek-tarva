import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
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
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="min-h-screen antialiased">
        <script dangerouslySetInnerHTML={{ __html: `if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; window.scrollTo(0,0);` }} />
        {children}
      </body>
    </html>
  );
}
