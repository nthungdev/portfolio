import ExperienceSection from "@/components/experience-section";
import ExpertiseSection from "@/components/expertise-section";
import LandingSection from "@/components/landing-section";
import ProjectsSection from "@/components/projects-section";

export default function Home() {
  return (
    <div>
      <LandingSection />
      <ExpertiseSection />
      <ExperienceSection />
      <ProjectsSection />
    </div>
  );
}
