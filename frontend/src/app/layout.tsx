import "./globals.css";
import NavbarWrapper from "@/components/Navbar/NavbarWrapper";
import Providers from "./providers";
import { BrowseProvider } from "@/context/BrowseContext";
import DemoAccessGuard from "@/components/DemoAccessGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <Providers>
          <BrowseProvider>
            <DemoAccessGuard>
              <NavbarWrapper />
              {children}
            </DemoAccessGuard>
          </BrowseProvider>
        </Providers>
      </body>
    </html>
  );
}