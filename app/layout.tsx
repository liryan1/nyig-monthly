import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const font = Poppins({
  subsets: ["latin"], weight: ["200", "400", "500", "600", "800"],
})

export const metadata: Metadata = {
  title: "Monthly Leaderboard",
  description: "Leaderboard for the NYIG Monthly Tournaments",
  authors: [{ name: "Ryan Li", url: "https://github.com/liryan1" }],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
