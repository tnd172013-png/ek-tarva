import Hero from "@/components/Hero";
import WhatIsPitchToHire from "@/components/WhatIsPitchToHire";
import HowItWorks from "@/components/HowItWorks";
import WhoIsThisFor from "@/components/WhoIsThisFor";
import WhyThisWorks from "@/components/WhyThisWorks";
import EventDetails from "@/components/EventDetails";
import ScarcityBanner from "@/components/ScarcityBanner";
import RegistrationForm from "@/components/RegistrationForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <WhatIsPitchToHire />
      <HowItWorks />
      <WhoIsThisFor />
      <WhyThisWorks />
      <EventDetails />
      <ScarcityBanner />
      <RegistrationForm />
      <Footer />
    </main>
  );
}
