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