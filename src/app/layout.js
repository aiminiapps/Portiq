import Web3Provider from "@/components/Web3Provider";
import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Portiq | Intelligent Portfolio Agent – $PTIQ",
  description:
    "Portiq ($PTIQ) is an AI-powered portfolio optimization agent. It analyzes your wallet, detects imbalances and risks, and recommends personalized rebalancing strategies for better performance.",
  keywords:
    "Portiq, PTIQ, AI portfolio, crypto portfolio, wallet analysis, risk detection, rebalancing strategies, intelligent investing, blockchain optimization",
  authors: [{ name: "Portiq" }],
  creator: "Portiq AI",
  publisher: "Portiq Labs",
  robots: "index, follow",
  openGraph: {
    title: "Portiq | Intelligent Portfolio Agent – $PTIQ",
    description:
      "Portiq ($PTIQ) helps you optimize your crypto portfolio with AI-powered insights, risk analysis, and smart rebalancing strategies.",
    url: "https://portiq.vercel.app/",
    siteName: "Portiq – $PTIQ",
    type: "website",
    images: [
      {
        url: "/og-portiq.png",
        width: 1200,
        height: 630,
        alt: "Portiq – AI Portfolio Agent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portiq | Intelligent Portfolio Agent – $PTIQ",
    description:
      "Portiq ($PTIQ) analyzes your wallet, detects risks, and provides smart rebalancing recommendations using AI.",
    creator: "@Portiq_AI",
    images: ["/og-portiq.png"],
  },
  viewport:
    "width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover",
  category: "cryptocurrency",
  classification:
    "AI Portfolio Agent, Cryptocurrency, Blockchain, Portfolio Optimization",
  other: {
    "application-name": "Portiq AI",
    "mobile-web-app-capable": "yes",
    "mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
  },
  icons: {
    icon: "/agent/agentlogo.png",
    shortcut: "/agent/agentlogo.png",
    apple: "/agent/agentlogo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <link rel="icon" href="/agent/agentlogo.png" />
        <link rel="apple-touch-icon" href="/agent/agentlogo.png" />
      </head>
      <body className="antialiased min-h-screen bg-[#0B0C10] flex flex-col">
        <Web3Provider>
        {children}
        </Web3Provider>
      </body>
    </html>
  );
}
