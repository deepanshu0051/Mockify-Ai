import { Inter } from "next/font/google";
import "./globals.css";
import TransitionProvider from "@/components/TransitionProvider";
import BackgroundBlobs from "@/components/BackgroundBlobs";

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
        <BackgroundBlobs />
        <TransitionProvider>
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
