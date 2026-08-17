import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: "Mtskheta Riviera — River Cruises in Georgia's Ancient Capital",
  description:
    "Experience scenic river cruises on the Mtkvari River in Mtskheta, Georgia. Book your adventure beneath the Svetitskhoveli Cathedral with Mtskheta Riviera.",
  keywords:
    "Mtskheta, river cruise, Georgia, boat tour, Mtkvari, Svetitskhoveli, riverboat, ნავით გასეირნება, მცხეთა",
  openGraph: {
    title: "Mtskheta Riviera — Cruise the Ancient Waters",
    description:
      "Scenic boat tours on the Mtkvari River in Mtskheta, Georgia. UNESCO heritage views, sunset cruises, and private events.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ka_GE",
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as "en" | "ka")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Georgian:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-navy text-cream">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
