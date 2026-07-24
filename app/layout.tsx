import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { AppProviders } from "@/components/providers/AppProviders";
import { getSessionContext } from "@/lib/session-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calculator Pro — arithmetic, monetized",
  description:
    "A fully functional calculator where every operation is a paid microtransaction. Addition is free. Everything else has a price.",
};

// Set the theme before first paint to avoid a flash of the wrong palette.
const themeScript = `(function(){try{var t=localStorage.getItem('p2w-theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ctx = await getSessionContext();

  return (
    <html
      lang="en"
      data-theme={ctx.theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <AppProviders
          initialUnlocked={ctx.unlocked}
          isLoggedIn={ctx.isLoggedIn}
          initialTheme={ctx.theme}
          userName={ctx.userName}
        >
          <Navbar />
          <div className="flex-1">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
