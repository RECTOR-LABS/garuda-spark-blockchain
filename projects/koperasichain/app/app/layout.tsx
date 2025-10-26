import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KoperasiChain - Digital Cooperative Platform",
  description: "Blockchain-powered cooperative management for Indonesian MSMEs",
  metadataBase: new URL("https://koperasichain.rectorspace.com"),
  openGraph: {
    title: "KoperasiChain - Digital Cooperative Platform",
    description: "Blockchain-powered cooperative management for Indonesian MSMEs",
    url: "https://koperasichain.rectorspace.com",
    siteName: "KoperasiChain",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KoperasiChain - Digital Cooperative Platform",
    description: "Blockchain-powered cooperative management for Indonesian MSMEs",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
