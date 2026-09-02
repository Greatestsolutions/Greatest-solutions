import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import { ContactModalProvider } from "@/components/contact/ContactModal";
import { site, siteUrl } from "@/config/site";
import "./globals.css";

/**
 * Fonts.
 *
 * The reference build pulls 59 .woff2 files across two origins
 * (framerusercontent.com and fonts.gstatic.com). All three families are on
 * Google Fonts, so next/font self-hosts them at build time: no third-party
 * connection, no render-blocking stylesheet, and `adjustFontFallback` (on by
 * default) matches fallback metrics so the swap causes no layout shift.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  // The reference drives four axes on Fraunces — SOFT 100, WONK 1, wght 350 and
  // optical sizing. All of them have to be present in the downloaded file or the
  // `font-variation-settings` in globals.css silently does nothing; `wght` ships
  // by default for a variable family, the other three are opt-in.
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const title = `${site.name} — ${site.tagline}`;

/**
 * Metadata is derived from `config/site.ts` rather than written inline. The
 * reference build hardcoded it and shipped with the previous owner's name in
 * the title, OG tags and canonical URL; deriving it makes that failure mode
 * impossible.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    locale: "en_US",
    title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/** Separate from `metadata` — Next requires the viewport export for these. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#f9f8f6", // matches --color-background, so browser chrome blends
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={site.locale}
      dir="ltr"
      className={`${fraunces.variable} ${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full">
        {/*
          Skip link: the first focusable element, visually hidden until focused.
          Keyboard and screen-reader users can jump past the navigation straight
          to content — WCAG 2.2 AA, 2.4.1 Bypass Blocks. It matters more once the
          nav ships with its dropdowns, but it belongs in the shell from the start.
        */}
        <a
          href="#main"
          className="sr-only rounded-[var(--radius-xs)] bg-ink px-4 py-2 text-surface focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[var(--z-nav)]"
        >
          Skip to content
        </a>
        {/*
          The contact dialog's state lives here, at the root, because its triggers
          are in three unrelated subtrees — the navbar, the footer and the pricing
          cards. The provider renders nothing until something opens it; the dialog
          itself is portalled to <body>, above everything including the nav.
        */}
        <ContactModalProvider>{children}</ContactModalProvider>
      </body>
    </html>
  );
}
