import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhyThisWorks from "@/components/WhyThisWorks";
import EventDetails from "@/components/EventDetails";
import Countdown from "@/components/Countdown";
import ScarcityBanner from "@/components/ScarcityBanner";
import RegistrationForm from "@/components/RegistrationForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <WhyThisWorks />
      <EventDetails />
      <Countdown />
      <ScarcityBanner />
      <RegistrationForm />
      <Footer />
    </main>
  );
}
