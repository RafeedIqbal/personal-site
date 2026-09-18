import PortfolioShell from "@/components/PortfolioShell";
import Footer from "@/components/Footer";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Experience from "@/sections/Experience";
import Projects from "@/sections/Projects";
import Websites from "@/sections/Websites";
import Skills from "@/sections/Skills";
import Contact from "@/sections/Contact";

export default function Page() {
  return (
    <PortfolioShell>
      <Hero />
      <Projects />
      <Experience />
      <Websites />
      <Skills />
      <About />
      <Contact />
      <Footer />
    </PortfolioShell>
  );
}
