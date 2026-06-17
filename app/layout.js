import { Inter } from "next/font/google";
import "./globals.css";
import TransitionProvider from "@/components/TransitionProvider";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { FileProvider } from "@/lib/FileContext";
import SessionCleanup from "@/components/SessionCleanup";
import BackArrow from "@/components/BackArrow";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Mockify-AI | Professional AI Interview Practice",
  description: "Master your next interview with AI-powered feedback and professional practice.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900">
        <SessionCleanup />
        <BackArrow />
        <BackgroundBlobs />
        <FileProvider>
          <TransitionProvider>
            {children}
          </TransitionProvider>
        </FileProvider>
      </body>
    </html>
  );
}
