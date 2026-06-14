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
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Kitty Control — Sphynx Cat Clothes for Hairless Cats",
    template: "%s | Kitty Control",
  },
  description:
    "Shop sphynx cat clothes for hairless cats — warm sweaters, breathable cotton shirts, pajamas, hoodies & winter outfits. Soft, seamless, skin-friendly. Free worldwide shipping.",
  keywords: [
    "sphynx cat clothes",
    "hairless cat clothes",
    "sphynx cat sweater",
    "sphynx cat shirt",
    "sphynx cat clothing",
    "clothes for sphynx cats",
    "hairless cat sweater",
    "sphynx cat pajamas",
    "sphynx cat onesie",
    "sphynx cat hoodie",
    "sphynx winter clothes",
    "sphynx cat outfits",
  ],
  metadataBase: new URL("https://kittycontrol.shop"),
  verification: {
    other: {
      "linksindexer-site-verification": "8c2ac6abce1fbd00e38ace9b517b83ad33e22776aaafdc187f7a75332d9a98f0",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Kitty Control",
    title: "Kitty Control — Sphynx Cat Clothes for Hairless Cats",
    description:
      "Shop sphynx cat clothes — warm sweaters, breathable shirts, pajamas, hoodies & winter outfits for hairless cats.",
    url: "https://kittycontrol.shop",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kitty Control — Sphynx Cat Clothes for Hairless Cats",
    description:
      "Warm sweaters, breathable shirts, pajamas & hoodies for sphynx cats. Free worldwide shipping.",
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
      "Online store specializing in sphynx cat clothes for hairless cats — warm sweaters, breathable shirts, pajamas, hoodies and winter outfits.",
  };

  return (
    <html
      lang="en"
      className={`${openSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* GA4 — loaded with `lazyOnload` so the 150 KB+ gtag bundle is fetched
            during browser idle time AFTER the page is interactive, keeping it
            off the mobile critical render path (was costing ~600 ms to LCP). */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RVCJDY77VJ"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
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
