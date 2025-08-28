import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AGFI",
  description: "AGFI - Your is task assistant. Complete the tasks and get the coins.",
  keywords: "cryptocurrency, bitcoin, ethereum, blockchain, DeFi, crypto trading, mobile AI assistant, AGFI, crypto analysis, digital assets, mobile crypto",
  authors: [{ name: "AGFI" }],
  creator: "AGFI",
  publisher: "AGFI",
  robots: "index, follow",
  openGraph: {
    title: "AGFI | Your AI Tasks",
    description: "Expert AI-powered cryptocurrency insights and blockchain guidance. Trade smarter with CryptoBot AI on mobile.",
    url: "agentfi-lovat.vercel.app",
    siteName: "AGFI CryptoBot",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "AGFI | Your AI Tasks",
    description: "Expert AI-powered cryptocurrency insights and blockchain guidance on mobile.",
    creator: "@AGFI_AI"
  },
  viewport: "width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover",
  category: "cryptocurrency",
  classification: "Mobile AI Assistant, Cryptocurrency, Blockchain",
  other: {
    "application-name": "CryptoBot AI",
    "mobile-web-app-capable": "yes",
    "mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
