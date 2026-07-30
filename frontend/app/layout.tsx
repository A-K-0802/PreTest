import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TestPrep | Technical Interview Readiness",
  description: "Master Data Structures & Algorithms with real-time code execution and high-density problem sets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${hankenGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0b1326] text-[#dbe2fd] selection:bg-[#10b981] selection:text-[#0b1326] min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
