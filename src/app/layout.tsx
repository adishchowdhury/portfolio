import type { Metadata, Viewport } from "next";
import "@fontsource/anton/latin-400.css";
import "@fontsource-variable/space-grotesk/index.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "lenis/dist/lenis.css";
import "./globals.css";
import { site } from "@/content/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.title, template: `%s — ${site.name.display}` },
  description: site.description,
  keywords: [
    "Adish",
    "Adrija Chowdhury",
    "AI engineer",
    "software engineer",
    "LLMs",
    "AI agents",
    "Jadavpur University",
    "Threadpool",
    "open source",
    "portfolio",
  ],
  authors: [{ name: site.name.full, url: site.links.github }],
  creator: site.name.full,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: site.title,
    description: site.description,
    siteName: `${site.name.display} — portfolio`,
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name.full,
  alternateName: site.name.display,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  url: siteUrl,
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Jadavpur University" },
    { "@type": "CollegeOrUniversity", name: "Indian Institute of Technology Madras" },
  ],
  sameAs: [site.links.github, site.links.linkedin],
  knowsAbout: ["Artificial intelligence", "Large language models", "AI agents", "Software engineering"],
};

/** Runs before first paint: flags JS + reduced motion so reveal states never flash. */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('rm');}catch(e){}try{var a=localStorage.getItem('adish:accent');if(a&&/^#[0-9a-f]{6}$/i.test(a))d.style.setProperty('--color-acc',a);}catch(e){}setTimeout(function(){d.classList.add('show-all')},6000);})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
