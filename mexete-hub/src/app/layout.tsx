import type { Metadata } from "next";
import {
  inter,
} from "../../fonts/font";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { UserProvider } from "@/contexts/UserContext";
import { ProjectProvider } from '@/contexts/ProjectContext';

export const metadata: Metadata = {
  title: "Mexete Hub",
  description: "Mexete Hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <ProjectProvider>
            {children}
            <Analytics />
          </ProjectProvider>
        </UserProvider>
      </body>
    </html>
  )
}
