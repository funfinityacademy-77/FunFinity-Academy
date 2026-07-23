import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PhilosophySection } from "@/components/PhilosophySection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { SubjectsSection } from "@/components/SubjectsSection";
import { LearningDNASection } from "@/components/LearningDNASection";
import { RollingExperienceWall } from "@/components/RollingExperienceWall";
import { CTASection } from "@/components/CTASection";
import { LegalPopupSection } from "@/components/LegalPopupSection";
import { Footer } from "@/components/Footer";
import { NotificationBanner } from "@/components/NotificationBanner";
import { CookieConsent } from "@/components/CookieConsent";
import { SupportChatWidget } from "@/components/chat/SupportChatWidget";
import { AgeGate } from "@/components/AgeGate";

const Index = () => {
  return (
    <div 
      className="min-h-screen bg-background flex flex-col"
    >
      <AgeGate />
      <NotificationBanner />
      <Navbar />
      <main 
        id="main-content" 
        className="flex-1 w-full"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <LegalPopupSection />
          <RollingExperienceWall />
          <HowItWorksSection />
          <SubjectsSection />
          <PhilosophySection />
          <LearningDNASection />
          <CTASection />
        </div>
      </main>
      <Footer />
      <CookieConsent />
      <SupportChatWidget />
    </div>
  );
};

export default Index;
