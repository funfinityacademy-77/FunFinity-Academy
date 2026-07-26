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
import { LearningStyleQuiz } from "@/components/LearningStyleQuiz";
import { AgeVerificationModal } from "@/components/AgeVerificationModal";
import { useState, useEffect } from "react";

const Index = () => {
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('funfinity_age_verified');
    if (!verified) {
      const timer = setTimeout(() => {
        setShowAgeVerification(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAgeVerified = (isMinor: boolean, consentData?: any) => {
    setAgeVerified(true);
    setShowAgeVerification(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NotificationBanner />
      <Navbar />
      <main id="main-content" className="flex-1 pt-16 sm:pt-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <LearningStyleQuiz />
        <LegalPopupSection />
        <RollingExperienceWall />
        <HowItWorksSection />
        <SubjectsSection />
        <PhilosophySection />
        <LearningDNASection />
        <CTASection />
      </main>
      <Footer />
      <CookieConsent />
      <SupportChatWidget />
      <AgeVerificationModal 
        isOpen={showAgeVerification} 
        onClose={() => setShowAgeVerification(false)}
        onVerified={handleAgeVerified}
      />
    </div>
  );
};

export default Index;
