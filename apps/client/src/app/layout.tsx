import "./globals.css";
import { Righteous } from "next/font/google";
import { Providers } from "./providers";

const righteous = Righteous({ weight: "400", variable: "--font-righteous", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={righteous.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
