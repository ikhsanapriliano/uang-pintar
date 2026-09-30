import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import PricingSection from "./sections/PricingSection";
import FAQSection from "./sections/FAQSection";
import CTASection from "./sections/CTASection";
import ContactSection from "./sections/ContactSection";

const LandingPageContainer = () => {
  return (
    <div className="flex flex-col gap-8">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <ContactSection />
    </div>
  );
};

export default LandingPageContainer;
