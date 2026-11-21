import type { DisciplineCategory, PortfolioProfile } from '../types/portfolio';

export const ADMIN_EMAIL = 'sonukhajotiya01@gmail.com';

export const STUDIO_ASSETS = {
  heroWorkspace: '/src/assets/images/hero_studio_workspace_1795263134920.jpg',
  jaipurStudy: '/src/assets/images/jaipur_geometry_study_1795263134844.jpg',
  engineeringStudy: '/src/assets/images/engineering_lattice_study_1795263134268.jpg',
} as const;

export const DEFAULT_PROFILE: PortfolioProfile = {
  fullName: 'Sonu Khajotiya',
  headline: 'UI/UX Designer | Frontend Developer | AI/ML Enthusiast',
  bio: 'I am a Computer Science and Engineering undergraduate passionate about building intelligent applications, user-friendly digital experiences, and innovative software solutions. My interests include Artificial Intelligence, Machine Learning, Data Science, Frontend Development, and UI/UX Design.',
  institution: 'Poornima Institute of Engineering & Technology, Jaipur',
  degree: 'B.Tech – Computer Science and Engineering',
  graduationPeriod: '2023–2027',
  cgpa: '8.62',
  cgpaVerified: false,
  location: 'Jaipur, Rajasthan, India',
  email: 'sonukhajotiya01@gmail.com',
  phone: '',
  resumeUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  behanceUrl: '',
};

export interface DisciplineBlueprint {
  index: string;
  title: DisciplineCategory;
  summary: string;
  focusAreas: string[];
}

export const CORE_DISCIPLINES: DisciplineBlueprint[] = [
  {
    index: '01',
    title: 'UI/UX Design',
    summary:
      'Designing human-centered interfaces, clear information hierarchies, and accessible interaction flows from wireframe to production.',
    focusAreas: ['Interaction Architecture', 'Design Systems', 'Usability & Accessibility', 'Wireframing & Prototyping'],
  },
  {
    index: '02',
    title: 'Frontend Development',
    summary:
      'Engineering responsive, maintainable web interfaces with clean component architecture, semantic markup, and reliable state management.',
    focusAreas: ['Component Architecture', 'Responsive Layouts', 'Type-Safe Client Code', 'Interactive Web Applications'],
  },
  {
    index: '03',
    title: 'AI & Machine Learning',
    summary:
      'Exploring intelligent software systems, applied model workflows, and practical machine learning pipelines integrated into real products.',
    focusAreas: ['Applied Machine Learning', 'Intelligent Interfaces', 'Model Evaluation', 'Problem Formulation'],
  },
  {
    index: '04',
    title: 'Data Science',
    summary:
      'Transforming structured datasets into clear analytical insights, reproducible workflows, and intuitive visual narratives.',
    focusAreas: ['Exploratory Data Analysis', 'Feature Engineering', 'Data Visualization', 'Quantitative Reasoning'],
  },
  {
    index: '05',
    title: 'Software Engineering',
    summary:
      'Building end-to-end full-stack applications grounded in computer science fundamentals, clean APIs, and persistent data modeling.',
    focusAreas: ['Full-Stack Architecture', 'Database Design', 'Authentication & Security', 'Clean Code Practices'],
  },
];
