import About from "@/components/About";
import Assembler from "@/components/Assembler";
import Backdrop from "@/components/Backdrop";
import Beyond from "@/components/Beyond";
import Boot from "@/components/Boot";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Stack from "@/components/Stack";
import Work from "@/components/Work";
import { site } from "@/content/site";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-acc focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <Boot />
      <Backdrop />
      <div className="grain" aria-hidden />
      <Cursor />
      <Nav />
      <Assembler />
      <main id="main">
        <Hero />
        <Marquee items={site.marquee} variant="acc" />
        <About />
        <Work />
        <Marquee items={site.marquee} reverse />
        <Stack />
        <Beyond />
        <Contact />
      </main>
    </>
  );
}
