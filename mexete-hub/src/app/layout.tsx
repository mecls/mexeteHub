import type { Metadata } from "next";
import {
  clashDisplay,
  clashDisplayBold,
  clashDisplayMedium,
  clashDisplaySemiBold,
  clashDisplayLight,
} from "../../fonts/font";
import "./globals.css";

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
      <body
        className={`${clashDisplay.variable} ${clashDisplayBold.variable} ${clashDisplayMedium.variable} ${clashDisplaySemiBold.variable} ${clashDisplayLight.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
