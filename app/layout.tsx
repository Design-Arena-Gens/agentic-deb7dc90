export const metadata = {
  title: "Best Player Parlays | Nov 14, 2025",
  description: "EV-ranked player parlays and props for Friday Nov 14, 2025.",
};

import "./styles.css";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
