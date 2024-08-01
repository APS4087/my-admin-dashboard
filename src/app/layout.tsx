import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@/components/ui/toast"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Core Admin - Weblabs Studio",
  description: "",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <ToastProvider>
        <body className={`${inter.className} min-h-screen`}>
          {children}
          <Toaster />
        </body>
      </ToastProvider>
    </html>
  )
}
