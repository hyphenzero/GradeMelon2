import "../styles/globals.css";
import type { ReactNode } from "react";
import AppProvider from "./providers/AppProvider";

export const metadata = {
  title: "Grade Melon",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/assets/icon.png" />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
