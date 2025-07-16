import type { Metadata } from "next";
import {
  inter,
  interBold,
  interMedium,
  interSemiBold,
  interLight
} from "../../fonts/font";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { UserProvider } from "@/contexts/UserContext";

export const metadata: Metadata = {
  title: "Mexete Hub",
  description: "Mexete Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${interBold.variable} ${interMedium.variable} ${interSemiBold.variable} ${interLight.variable} antialiased`}
      >
        <UserProvider>
          {children}
        </UserProvider>
        <Analytics />
      </body>
    </html>
  );
}
