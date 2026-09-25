import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import WhereUsed from "@/components/sections/WhereUsed";
import Footer from "@/components/sections/Footer";
import IntroReveal from "@/components/IntroReveal";

export default function Home() {
  return (
    <main>
      <IntroReveal />
      <Hero />
      <HowItWorks />
      <WhereUsed />
      <Footer />
    </main>
  );
}
