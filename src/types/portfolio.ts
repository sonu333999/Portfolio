export type DisciplineCategory =
  | 'UI/UX Design'
  | 'Frontend Development'
  | 'AI & Machine Learning'
  | 'Data Science'
  | 'Software Engineering';

export type AchievementCategory =
  | 'Certification'
  | 'Academic'
  | 'Competition'
  | 'Publication';

export type PublishStatus = 'draft' | 'published';

export type InquiryType =
  | 'Collaboration'
  | 'Internship / Role'
  | 'UI/UX & Frontend'
  | 'AI / ML Project'
  | 'General';

export type InquiryStatus = 'unread' | 'read' | 'archived';

export const DISCIPLINE_CATEGORIES: DisciplineCategory[] = [
  'UI/UX Design',
  'Frontend Development',
  'AI & Machine Learning',
  'Data Science',
  'Software Engineering',
];

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'Certification',
  'Academic',
  'Competition',
  'Publication',
];

export const INQUIRY_TYPES: InquiryType[] = [
  'Collaboration',
  'Internship / Role',
  'UI/UX & Frontend',
  'AI / ML Project',
  'General',
];

export const BLUEPRINT_LIMITS = {
  profile: {
    fullNameMax: 80,
    headlineMax: 140,
    bioMax: 1200,
    institutionMax: 160,
    degreeMax: 120,
    graduationPeriodMax: 40,
    cgpaMax: 20,
    locationMax: 120,
    emailMax: 120,
    phoneMax: 32,
    resumeUrlMax: 500,
    socialUrlMax: 300,
  },
  project: {
    titleMax: 120,
    slugMax: 120,
    summaryMax: 320,
    descriptionMax: 4000,
    techStackMaxItems: 12,
    techItemMax: 40,
    roleMax: 100,
    timelineMax: 60,
    urlMax: 400,
    coverImageMax: 600,
  },
  achievement: {
    titleMax: 140,
    issuerMax: 140,
    dateLabelMax: 40,
    credentialUrlMax: 400,
    summaryMax: 500,
  },
  skill: {
    nameMax: 60,
    focusNoteMax: 160,
  },
  inquiry: {
    senderNameMax: 100,
    senderEmailMax: 140,
    subjectMax: 160,
    messageMax: 2500,
  },
} as const;

export interface PortfolioProfile {
  fullName: string;
  headline: string;
  bio: string;
  institution: string;
  degree: string;
  graduationPeriod: string;
  cgpa: string;
  cgpaVerified: boolean;
  location: string;
  email: string;
  phone: string;
  resumeUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  behanceUrl: string;
  updatedAt?: Date | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: DisciplineCategory;
  summary: string;
  description: string;
  techStack: string[];
  role: string;
  timeline: string;
  liveUrl: string;
  repoUrl: string;
  coverImage: string;
  featured: boolean;
  status: PublishStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  category: AchievementCategory;
  dateLabel: string;
  credentialUrl: string;
  summary: string;
  status: PublishStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface SkillItem {
  id: string;
  name: string;
  discipline: DisciplineCategory;
  focusNote: string;
  order: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface ContactInquiry {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  inquiryType: InquiryType;
  status: InquiryStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
