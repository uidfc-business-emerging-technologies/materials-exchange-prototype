import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { DemoProvider } from "@/lib/demo";
import { DEMO_COOKIE, parseIdentity } from "@/lib/demo-shared";
import { ToastProvider } from "@/components/ui/overlays";
import "./globals.css";

const ICON =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2048%2048%22%3E%3Crect%20x%3D%226%22%20y%3D%2218%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22%2313294B%22%2F%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2218%22%20r%3D%2212%22%20fill%3D%22%23FF5F05%22%2F%3E%3Cpath%20d%3D%22M30%2018H18A12%2012%200%200%200%2030%2030Z%22%20fill%3D%22%23FFFFFF%22%2F%3E%3C%2Fsvg%3E";

export const metadata: Metadata = {
  title: { default: "Teaching Materials Exchange", template: "%s · Teaching Materials Exchange" },
  description: "Free, classroom-ready teaching materials from business school faculty.",
  icons: { icon: ICON },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const identity = parseIdentity((await cookies()).get(DEMO_COOKIE)?.value);
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Public+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <DemoProvider initial={identity}>
          <ToastProvider>{children}</ToastProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
