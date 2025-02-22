"use-client";

import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Data Storyteller",
  description: "Turn your data into compelling visual stories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={`${inter.className} bg-white text-gray-900`}>
          <main className="min-h-screen relative">{children}</main>
        </body>
      </html>
    </AuthProvider>
  );
}
