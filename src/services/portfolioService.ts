import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { DEFAULT_PROFILE } from '../data/defaults';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  BLUEPRINT_LIMITS,
  type Achievement,
  type ContactInquiry,
  type InquiryStatus,
  type PortfolioProfile,
  type Project,
  type SkillItem,
} from '../types/portfolio';

function toDate(val: unknown): Date | null {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return null;
}

function clampString(val: string | undefined | null, maxLen: number): string {
  return (val ?? '').trim().slice(0, maxLen);
}

function normalizeOptionalUrl(val: string | undefined | null, maxLen: number): string {
  const trimmed = clampString(val, maxLen);
  if (!trimmed) return '';
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  return '';
}

function normalizeCoverImage(val: string | undefined | null): string {
  const trimmed = clampString(val, BLUEPRINT_LIMITS.project.coverImageMax);
  if (!trimmed) return '';
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/src/assets/')
  ) {
    return trimmed;
  }
  return '';
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, BLUEPRINT_LIMITS.project.slugMax);
  return base.length >= 2 ? base : 'project-case-study';
}

// --- Subscriptions ---

export function subscribeProfile(
  onData: (profile: PortfolioProfile, existsInDb: boolean) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const ref = doc(db, 'profile', 'main');
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(DEFAULT_PROFILE, false);
        return;
      }
      const data = snap.data();
      onData(
        {
          fullName: typeof data.fullName === 'string' ? data.fullName : DEFAULT_PROFILE.fullName,
          headline: typeof data.headline === 'string' ? data.headline : DEFAULT_PROFILE.headline,
          bio: typeof data.bio === 'string' ? data.bio : DEFAULT_PROFILE.bio,
          institution:
            typeof data.institution === 'string' ? data.institution : DEFAULT_PROFILE.institution,
          degree: typeof data.degree === 'string' ? data.degree : DEFAULT_PROFILE.degree,
          graduationPeriod:
            typeof data.graduationPeriod === 'string'
              ? data.graduationPeriod
              : DEFAULT_PROFILE.graduationPeriod,
          cgpa: typeof data.cgpa === 'string' ? data.cgpa : DEFAULT_PROFILE.cgpa,
          cgpaVerified: Boolean(data.cgpaVerified),
          location: typeof data.location === 'string' ? data.location : DEFAULT_PROFILE.location,
          email: typeof data.email === 'string' ? data.email : DEFAULT_PROFILE.email,
          phone: typeof data.phone === 'string' ? data.phone : '',
          resumeUrl: typeof data.resumeUrl === 'string' ? data.resumeUrl : '',
          githubUrl: typeof data.githubUrl === 'string' ? data.githubUrl : '',
          linkedinUrl: typeof data.linkedinUrl === 'string' ? data.linkedinUrl : '',
          behanceUrl: typeof data.behanceUrl === 'string' ? data.behanceUrl : '',
          updatedAt: toDate(data.updatedAt),
        },
        true,
      );
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'profile/main');
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    },
  );
}

function mapProjectDoc(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : '',
    slug: typeof data.slug === 'string' ? data.slug : id,
    category: (data.category as Project['category']) || 'Software Engineering',
    summary: typeof data.summary === 'string' ? data.summary : '',
    description: typeof data.description === 'string' ? data.description : '',
    techStack: Array.isArray(data.techStack)
      ? data.techStack.filter((item): item is string => typeof item === 'string')
      : [],
    role: typeof data.role === 'string' ? data.role : '',
    timeline: typeof data.timeline === 'string' ? data.timeline : '',
    liveUrl: typeof data.liveUrl === 'string' ? data.liveUrl : '',
    repoUrl: typeof data.repoUrl === 'string' ? data.repoUrl : '',
    coverImage: typeof data.coverImage === 'string' ? data.coverImage : '',
    featured: Boolean(data.featured),
    status: data.status === 'published' ? 'published' : 'draft',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function subscribePublishedProjects(
  onData: (projects: Project[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'projects'), where('status', '==', 'published'));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => mapProjectDoc(d.id, d.data()))
        .sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0);
        });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    },
  );
}

export function subscribeAllProjects(
  onData: (projects: Project[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => mapProjectDoc(d.id, d.data())));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    },
  );
}

function mapAchievementDoc(id: string, data: Record<string, unknown>): Achievement {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : '',
    issuer: typeof data.issuer === 'string' ? data.issuer : '',
    category: (data.category as Achievement['category']) || 'Certification',
    dateLabel: typeof data.dateLabel === 'string' ? data.dateLabel : '',
    credentialUrl: typeof data.credentialUrl === 'string' ? data.credentialUrl : '',
    summary: typeof data.summary === 'string' ? data.summary : '',
    status: data.status === 'published' ? 'published' : 'draft',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function subscribePublishedAchievements(
  onData: (items: Achievement[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'achievements'), where('status', '==', 'published'));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => mapAchievementDoc(d.id, d.data()))
        .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'achievements');
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    },
  );
}

export function subscribeAllAchievements(
  onData: (items: Achievement[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'achievements'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => mapAchievementDoc(d.id, d.data())));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'achievements');
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    },
  );
}

export function subscribeSkills(
  onData: (skills: SkillItem[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'skills'), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      const items: SkillItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: typeof data.name === 'string' ? data.name : '',
          discipline: (data.discipline as SkillItem['discipline']) || 'Frontend Development',
          focusNote: typeof data.focusNote === 'string' ? data.focusNote : '',
          order: typeof data.order === 'number' ? data.order : 0,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'skills');
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    },
  );
}

export function subscribeInquiries(
  onData: (inquiries: ContactInquiry[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items: ContactInquiry[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          senderName: typeof data.senderName === 'string' ? data.senderName : '',
          senderEmail: typeof data.senderEmail === 'string' ? data.senderEmail : '',
          subject: typeof data.subject === 'string' ? data.subject : '',
          message: typeof data.message === 'string' ? data.message : '',
          inquiryType: (data.inquiryType as ContactInquiry['inquiryType']) || 'General',
          status: (data.status as InquiryStatus) || 'unread',
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'inquiries');
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    },
  );
}

// --- Mutations ---

export async function saveProfile(profile: PortfolioProfile): Promise<void> {
  const payload = {
    fullName: clampString(profile.fullName, BLUEPRINT_LIMITS.profile.fullNameMax),
    headline: clampString(profile.headline, BLUEPRINT_LIMITS.profile.headlineMax),
    bio: clampString(profile.bio, BLUEPRINT_LIMITS.profile.bioMax),
    institution: clampString(profile.institution, BLUEPRINT_LIMITS.profile.institutionMax),
    degree: clampString(profile.degree, BLUEPRINT_LIMITS.profile.degreeMax),
    graduationPeriod: clampString(
      profile.graduationPeriod,
      BLUEPRINT_LIMITS.profile.graduationPeriodMax,
    ),
    cgpa: clampString(profile.cgpa, BLUEPRINT_LIMITS.profile.cgpaMax),
    cgpaVerified: Boolean(profile.cgpaVerified),
    location: clampString(profile.location, BLUEPRINT_LIMITS.profile.locationMax),
    email: clampString(profile.email, BLUEPRINT_LIMITS.profile.emailMax),
    phone: clampString(profile.phone, BLUEPRINT_LIMITS.profile.phoneMax),
    resumeUrl: normalizeOptionalUrl(profile.resumeUrl, BLUEPRINT_LIMITS.profile.resumeUrlMax),
    githubUrl: normalizeOptionalUrl(profile.githubUrl, BLUEPRINT_LIMITS.profile.socialUrlMax),
    linkedinUrl: normalizeOptionalUrl(profile.linkedinUrl, BLUEPRINT_LIMITS.profile.socialUrlMax),
    behanceUrl: normalizeOptionalUrl(profile.behanceUrl, BLUEPRINT_LIMITS.profile.socialUrlMax),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'profile', 'main'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'profile/main');
  }
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

export async function createProject(input: ProjectInput): Promise<string> {
  const techStack = input.techStack
    .map((s) => clampString(s, BLUEPRINT_LIMITS.project.techItemMax))
    .filter(Boolean)
    .slice(0, BLUEPRINT_LIMITS.project.techStackMaxItems);

  const payload = {
    title: clampString(input.title, BLUEPRINT_LIMITS.project.titleMax),
    slug: slugifyTitle(input.slug || input.title),
    category: input.category,
    summary: clampString(input.summary, BLUEPRINT_LIMITS.project.summaryMax),
    description: clampString(input.description, BLUEPRINT_LIMITS.project.descriptionMax),
    techStack,
    role: clampString(input.role, BLUEPRINT_LIMITS.project.roleMax),
    timeline: clampString(input.timeline, BLUEPRINT_LIMITS.project.timelineMax),
    liveUrl: normalizeOptionalUrl(input.liveUrl, BLUEPRINT_LIMITS.project.urlMax),
    repoUrl: normalizeOptionalUrl(input.repoUrl, BLUEPRINT_LIMITS.project.urlMax),
    coverImage: normalizeCoverImage(input.coverImage),
    featured: Boolean(input.featured),
    status: input.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, 'projects'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'projects');
  }
}

export async function updateProject(id: string, input: ProjectInput): Promise<void> {
  const techStack = input.techStack
    .map((s) => clampString(s, BLUEPRINT_LIMITS.project.techItemMax))
    .filter(Boolean)
    .slice(0, BLUEPRINT_LIMITS.project.techStackMaxItems);

  const payload = {
    title: clampString(input.title, BLUEPRINT_LIMITS.project.titleMax),
    slug: slugifyTitle(input.slug || input.title),
    category: input.category,
    summary: clampString(input.summary, BLUEPRINT_LIMITS.project.summaryMax),
    description: clampString(input.description, BLUEPRINT_LIMITS.project.descriptionMax),
    techStack,
    role: clampString(input.role, BLUEPRINT_LIMITS.project.roleMax),
    timeline: clampString(input.timeline, BLUEPRINT_LIMITS.project.timelineMax),
    liveUrl: normalizeOptionalUrl(input.liveUrl, BLUEPRINT_LIMITS.project.urlMax),
    repoUrl: normalizeOptionalUrl(input.repoUrl, BLUEPRINT_LIMITS.project.urlMax),
    coverImage: normalizeCoverImage(input.coverImage),
    featured: Boolean(input.featured),
    status: input.status,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(doc(db, 'projects', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
  }
}

export type AchievementInput = Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>;

export async function createAchievement(input: AchievementInput): Promise<string> {
  const payload = {
    title: clampString(input.title, BLUEPRINT_LIMITS.achievement.titleMax),
    issuer: clampString(input.issuer, BLUEPRINT_LIMITS.achievement.issuerMax),
    category: input.category,
    dateLabel: clampString(input.dateLabel, BLUEPRINT_LIMITS.achievement.dateLabelMax),
    credentialUrl: normalizeOptionalUrl(
      input.credentialUrl,
      BLUEPRINT_LIMITS.achievement.credentialUrlMax,
    ),
    summary: clampString(input.summary, BLUEPRINT_LIMITS.achievement.summaryMax),
    status: input.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, 'achievements'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'achievements');
  }
}

export async function updateAchievement(id: string, input: AchievementInput): Promise<void> {
  const payload = {
    title: clampString(input.title, BLUEPRINT_LIMITS.achievement.titleMax),
    issuer: clampString(input.issuer, BLUEPRINT_LIMITS.achievement.issuerMax),
    category: input.category,
    dateLabel: clampString(input.dateLabel, BLUEPRINT_LIMITS.achievement.dateLabelMax),
    credentialUrl: normalizeOptionalUrl(
      input.credentialUrl,
      BLUEPRINT_LIMITS.achievement.credentialUrlMax,
    ),
    summary: clampString(input.summary, BLUEPRINT_LIMITS.achievement.summaryMax),
    status: input.status,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(doc(db, 'achievements', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `achievements/${id}`);
  }
}

export async function deleteAchievement(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'achievements', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `achievements/${id}`);
  }
}

export type SkillInput = Omit<SkillItem, 'id' | 'createdAt' | 'updatedAt'>;

export async function createSkill(input: SkillInput): Promise<string> {
  const payload = {
    name: clampString(input.name, BLUEPRINT_LIMITS.skill.nameMax),
    discipline: input.discipline,
    focusNote: clampString(input.focusNote, BLUEPRINT_LIMITS.skill.focusNoteMax),
    order: Number.isFinite(input.order) ? input.order : 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, 'skills'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'skills');
  }
}

export async function updateSkill(id: string, input: SkillInput): Promise<void> {
  const payload = {
    name: clampString(input.name, BLUEPRINT_LIMITS.skill.nameMax),
    discipline: input.discipline,
    focusNote: clampString(input.focusNote, BLUEPRINT_LIMITS.skill.focusNoteMax),
    order: Number.isFinite(input.order) ? input.order : 0,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(doc(db, 'skills', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `skills/${id}`);
  }
}

export async function deleteSkill(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'skills', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `skills/${id}`);
  }
}

export interface InquiryInput {
  senderName: string;
  senderEmail: string;
  inquiryType: ContactInquiry['inquiryType'];
  subject: string;
  message: string;
}

export async function submitInquiry(input: InquiryInput): Promise<string> {
  const payload = {
    senderName: clampString(input.senderName, BLUEPRINT_LIMITS.inquiry.senderNameMax),
    senderEmail: clampString(input.senderEmail, BLUEPRINT_LIMITS.inquiry.senderEmailMax),
    inquiryType: input.inquiryType,
    subject: clampString(input.subject, BLUEPRINT_LIMITS.inquiry.subjectMax),
    message: clampString(input.message, BLUEPRINT_LIMITS.inquiry.messageMax),
    status: 'unread' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, 'inquiries'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'inquiries');
  }
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  try {
    await updateDoc(doc(db, 'inquiries', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `inquiries/${id}`);
  }
}

export async function deleteInquiry(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'inquiries', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `inquiries/${id}`);
  }
}
