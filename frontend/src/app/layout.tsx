import type { Metadata } from "next";
import localFont from "next/font/local";
import QueryProvider from "@/utils/tanstack/QueryProvider";
import NavbarProvider from "@/components/navbar-provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Envolve",
  description: "Take action towards change!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <NavbarProvider>
            {children}
          </NavbarProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
