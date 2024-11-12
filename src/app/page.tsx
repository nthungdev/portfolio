import LandingSection from "@/components/landing-section";
import ExpertiseSection from "@/components/expertise-section";
import ExperienceSection from "@/components/experience-section";
import ProjectsSection from "@/components/projects-section";
import ContactSection from "@/components/contact-section";

export default function Home() {
  return (
    <div className="background-animation bg-gray-800">
      <LandingSection />
      <ExpertiseSection />
      <ExperienceSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}
