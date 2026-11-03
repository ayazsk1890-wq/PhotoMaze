import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";

export const metadata: Metadata = {
  title: "PhotoMaze - 100% Free Biometric Passport & Visa Photo Maker",
  description:
    "PhotoMaze is a 100% free passport, visa, and ID photo maker. Automatically remove backgrounds, crop to Indian 35x45mm and global standards, generate multi-page print sheets, and download in high-res 300 DPI — completely free with zero sign-up required.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
