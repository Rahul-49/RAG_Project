
import { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

const publicSans400 = Public_Sans({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voice Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${publicSans400.className}`}>
      <body className="h-full flex bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <div className="flex h-full w-full">
            <Sidebar />
            <div className="flex-1 relative flex flex-col h-full min-h-0 overflow-hidden">
              {/* Ambient Background */}
              <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />

              <main className="flex-1 h-full w-full min-h-0 overflow-hidden relative">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
