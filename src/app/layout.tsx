import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Ophir — Jewellery ERP",
    template: "%s · Ophir",
  },
  description:
    "Ophir — Multi-Vertical Enterprise ERP Platform, Jewellery reference vertical. Built to SRS v4.3.1.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="royal" data-density="comfortable" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Prevent theme flash: apply persisted UI config before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=JSON.parse(localStorage.getItem('jwl-erp-ui')||'{}');var r=document.documentElement;if(c.theme)r.setAttribute('data-theme',c.theme);if(c.density)r.setAttribute('data-density',c.density);if(c.rtl)r.setAttribute('dir','rtl');if(c.radius)r.style.setProperty('--radius',(c.radius/16)+'rem');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
