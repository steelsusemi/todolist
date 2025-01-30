import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  title: "조프로의 Todo List",
  description: "Manage your tasks efficiently with real-time weather updates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
