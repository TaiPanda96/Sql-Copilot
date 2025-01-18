import { Inter } from "next/font/google";
import { AsciiBackground } from "@sql-copilot/lib/components/ascii-background";
import "./globals.css";

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
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <AsciiBackground />
        <main className="min-h-screen relative">{children}</main>
      </body>
    </html>
  );
}
