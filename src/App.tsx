import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { AdminDashboard } from './components/AdminDashboard';
import { ContactSection } from './components/ContactSection';
import { DisciplinesSection } from './components/DisciplinesSection';
import { EducationAchievementsSection } from './components/EducationAchievementsSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProjectModal } from './components/ProjectModal';
import { ProjectsSection } from './components/ProjectsSection';
import { ResumeModal } from './components/ResumeModal';
import { ThemeProvider } from './components/ThemeProvider';
import { ADMIN_EMAIL, DEFAULT_PROFILE } from './data/defaults';
import { auth, testFirestoreConnection } from './lib/firebase';
import {
  subscribeAllAchievements,
  subscribeAllProjects,
  subscribeInquiries,
  subscribeProfile,
  subscribePublishedAchievements,
  subscribePublishedProjects,
  subscribeSkills,
} from './services/portfolioService';
import type {
  Achievement,
  ContactInquiry,
  PortfolioProfile,
  Project,
  SkillItem,
} from './types/portfolio';

function PortfolioWorkspace() {
  const [activeView, setActiveView] = useState<'portfolio' | 'admin'>(() =>
    window.location.pathname === '/admin' ? 'admin' : 'portfolio',
  );
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [profile, setProfile] = useState<PortfolioProfile>(DEFAULT_PROFILE);
  const [profileExistsInDb, setProfileExistsInDb] = useState(false);

  const [publishedProjects, setPublishedProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [publishedAchievements, setPublishedAchievements] = useState<Achievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);

  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);

  const isAdmin = Boolean(user && user.emailVerified && user.email === ADMIN_EMAIL);

  const navigateView = (view: 'portfolio' | 'admin') => {
    setActiveView(view);
    const targetPath = view === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => {
      setActiveView(window.location.pathname === '/admin' ? 'admin' : 'portfolio');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    void testFirestoreConnection();

    const unsubAuth = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });

    const unsubProfile = subscribeProfile((nextProfile, exists) => {
      setProfile(nextProfile);
      setProfileExistsInDb(exists);
    });

    const unsubProjects = subscribePublishedProjects((items) => {
      setPublishedProjects(items);
      setProjectsLoading(false);
    });

    const unsubAchievements = subscribePublishedAchievements((items) => {
      setPublishedAchievements(items);
    });

    const unsubSkills = subscribeSkills((items) => {
      setSkills(items);
    });

    return () => {
      unsubAuth();
      unsubProfile();
      unsubProjects();
      unsubAchievements();
      unsubSkills();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !isAdmin) {
      setAllProjects([]);
      setAllAchievements([]);
      setInquiries([]);
      return;
    }

    const unsubAdminProjects = subscribeAllProjects(setAllProjects);
    const unsubAdminAchievements = subscribeAllAchievements(setAllAchievements);
    const unsubInquiries = subscribeInquiries(setInquiries);

    return () => {
      unsubAdminProjects();
      unsubAdminAchievements();
      unsubInquiries();
    };
  }, [authReady, isAdmin]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Header activeView={activeView} isAdmin={isAdmin} onNavigateView={navigateView} />

      <main className="flex-1">
        {activeView === 'admin' ? (
          <AdminDashboard
            user={user}
            authReady={authReady}
            isAdmin={isAdmin}
            profile={profile}
            profileExistsInDb={profileExistsInDb}
            projects={allProjects}
            achievements={allAchievements}
            skills={skills}
            inquiries={inquiries}
          />
        ) : (
          <>
            <HeroSection profile={profile} onOpenResume={() => setResumeOpen(true)} />
            <AboutSection profile={profile} />
            <DisciplinesSection skills={skills} />
            <ProjectsSection
              projects={publishedProjects}
              loading={projectsLoading}
              isAdmin={isAdmin}
              onSelectProject={setSelectedProject}
              onOpenAdmin={() => navigateView('admin')}
            />
            <EducationAchievementsSection
              profile={profile}
              achievements={publishedAchievements}
            />
            <ContactSection profile={profile} />
          </>
        )}
      </main>

      <Footer
        profile={profile}
        onOpenAdmin={() => navigateView('admin')}
        onOpenResume={() => setResumeOpen(true)}
      />

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      <ResumeModal
        open={resumeOpen}
        onClose={() => setResumeOpen(false)}
        profile={profile}
        projects={publishedProjects}
        achievements={publishedAchievements}
        skills={skills}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PortfolioWorkspace />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
