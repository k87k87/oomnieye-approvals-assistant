import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OomniEye Command Centre · Approvals & Review",
  description: "Enterprise Digital Twin Operations Dashboard with AI Approvals Assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f4f6fa] text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
