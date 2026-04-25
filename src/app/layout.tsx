import type { Metadata } from "next";
import { Open_Sans, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kitty Control — Best Cat Toys & Interactive Toys for Indoor Cats",
    template: "%s | Kitty Control",
  },
  description:
    "Shop the best cat toys online — interactive cat toys, wand toys, chew toys & enrichment toys for kittens and indoor cats. Free worldwide shipping.",
  keywords: [
    "cat toys",
    "interactive cat toys",
    "best cat toys",
    "cat toys for indoor cats",
    "indoor cat",
    "cat toy",
    "kitten toys",
    "cat enrichment toys",
    "cat wand toy",
    "cat chew toys",
    "automatic cat toys",
    "cat toys for bored cats",
  ],
  metadataBase: new URL("https://kittycontrol.shop"),
  openGraph: {
    type: "website",
    siteName: "Kitty Control",
    title: "Kitty Control — Best Cat Toys & Interactive Toys for Indoor Cats",
    description:
      "Shop the best cat toys online — interactive toys, wand toys, chew toys & enrichment toys for kittens and indoor cats.",
    url: "https://kittycontrol.shop",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kitty Control — Best Cat Toys for Indoor Cats & Kittens",
    description:
      "Shop interactive cat toys, wand toys, chew toys & enrichment toys. Free worldwide shipping.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kitty Control",
    url: "https://kittycontrol.shop",
    description:
      "Online store specializing in the best cat toys — interactive toys, wand toys, chew toys and enrichment toys for indoor cats and kittens.",
  };

  return (
    <html
      lang="en"
      className={`${openSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RVCJDY77VJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RVCJDY77VJ');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
