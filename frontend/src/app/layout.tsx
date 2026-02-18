  import "./globals.css";
  import NavbarWrapper from "@/components/Navbar/NavbarWrapper";
  import Providers from "./providers";
  import { BrowseProvider } from "@/context/BrowseContext";
  import DemoAccessGuard from "@/components/DemoAccessGuard";
  import { Analytics } from "@vercel/analytics/next"

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <title>Nikoflix</title>
        </head>
        <body>
          <Providers>
            <BrowseProvider>
              <DemoAccessGuard>
                <NavbarWrapper />
                {children}
                <Analytics/>
              </DemoAccessGuard>
            </BrowseProvider>
          </Providers>
        </body>
      </html>
    );
  }