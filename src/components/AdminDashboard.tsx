import { signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  Award,
  Check,
  FolderKanban,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  Wrench,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ADMIN_EMAIL, STUDIO_ASSETS } from '../data/defaults';
import { auth, googleProvider } from '../lib/firebase';
import {
  createAchievement,
  createProject,
  createSkill,
  deleteAchievement,
  deleteInquiry,
  deleteProject,
  deleteSkill,
  saveProfile,
  slugifyTitle,
  updateAchievement,
  updateInquiryStatus,
  updateProject,
  updateSkill,
  type AchievementInput,
  type ProjectInput,
  type SkillInput,
} from '../services/portfolioService';
import {
  ACHIEVEMENT_CATEGORIES,
  BLUEPRINT_LIMITS,
  DISCIPLINE_CATEGORIES,
  type Achievement,
  type AchievementCategory,
  type ContactInquiry,
  type DisciplineCategory,
  type InquiryStatus,
  type PortfolioProfile,
  type Project,
  type PublishStatus,
  type SkillItem,
} from '../types/portfolio';

interface AdminDashboardProps {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  profile: PortfolioProfile;
  profileExistsInDb: boolean;
  projects: Project[];
  achievements: Achievement[];
  skills: SkillItem[];
  inquiries: ContactInquiry[];
}

type AdminTab = 'overview' | 'projects' | 'skills' | 'achievements' | 'profile' | 'inquiries';

const EMPTY_PROJECT_FORM: ProjectInput = {
  title: '',
  slug: '',
  category: 'UI/UX Design',
  summary: '',
  description: '',
  techStack: [],
  role: '',
  timeline: '',
  liveUrl: '',
  repoUrl: '',
  coverImage: '',
  featured: false,
  status: 'published',
};

const EMPTY_ACHIEVEMENT_FORM: AchievementInput = {
  title: '',
  issuer: '',
  category: 'Certification',
  dateLabel: '',
  credentialUrl: '',
  summary: '',
  status: 'published',
};

const EMPTY_SKILL_FORM: SkillInput = {
  name: '',
  discipline: 'Frontend Development',
  focusNote: '',
  order: 0,
};

export function AdminDashboard({
  user,
  authReady,
  isAdmin,
  profile,
  profileExistsInDb,
  projects,
  achievements,
  skills,
  inquiries,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState<PortfolioProfile>(profile);
  const [savingProfile, setSavingProfile] = useState(false);

  // Project form state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectInput>(EMPTY_PROJECT_FORM);
  const [techInput, setTechInput] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  // Achievement form state
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [achievementForm, setAchievementForm] = useState<AchievementInput>(EMPTY_ACHIEVEMENT_FORM);
  const [savingAchievement, setSavingAchievement] = useState(false);

  // Skill form state
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState<SkillInput>(EMPTY_SKILL_FORM);
  const [savingSkill, setSavingSkill] = useState(false);

  // Inquiry filter state
  const [inquiryFilter, setInquiryFilter] = useState<'all' | InquiryStatus>('all');

  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSignIn = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in could not be completed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (!authReady) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="h-48 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="max-w-xl mx-auto px-6 py-20">
        <div className="p-8 sm:p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zinc-950 dark:text-zinc-50 mb-2">
            Portfolio Admin Portal
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
            Sign in with the verified owner Google account ({ADMIN_EMAIL}) to manage projects,
            skills, academic credentials, resume links, and visitor inquiries.
          </p>

          {authError && (
            <p role="alert" className="text-xs text-red-600 dark:text-red-400 mb-4">
              {authError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSignIn}
            disabled={authBusy}
            className="w-full py-2.5 px-4 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {authBusy ? 'Connecting to Google...' : 'Sign in with Google'}
          </button>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="max-w-xl mx-auto px-6 py-20">
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h1 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50 mb-2">
            Restricted Owner Workspace
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Signed in as <span className="font-medium text-zinc-900 dark:text-zinc-100">{user.email}</span>.
            Administrative mutations are restricted strictly to the verified owner account ({ADMIN_EMAIL}).
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </section>
    );
  }

  // --- Handlers for Authenticated Owner ---

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await saveProfile(profileForm);
      notify('Profile and academic credentials saved to Firestore.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      const parsedStack = techInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload: ProjectInput = {
        ...projectForm,
        slug: slugifyTitle(projectForm.slug || projectForm.title),
        techStack: parsedStack,
      };
      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
        notify('Project updated.');
      } else {
        await createProject(payload);
        notify('Project created.');
      }
      setEditingProjectId(null);
      setProjectForm(EMPTY_PROJECT_FORM);
      setTechInput('');
    } finally {
      setSavingProject(false);
    }
  };

  const startEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title,
      slug: p.slug,
      category: p.category,
      summary: p.summary,
      description: p.description,
      techStack: p.techStack,
      role: p.role,
      timeline: p.timeline,
      liveUrl: p.liveUrl,
      repoUrl: p.repoUrl,
      coverImage: p.coverImage,
      featured: p.featured,
      status: p.status,
    });
    setTechInput(p.techStack.join(', '));
  };

  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAchievement(true);
    try {
      if (editingAchievementId) {
        await updateAchievement(editingAchievementId, achievementForm);
        notify('Achievement updated.');
      } else {
        await createAchievement(achievementForm);
        notify('Achievement added.');
      }
      setEditingAchievementId(null);
      setAchievementForm(EMPTY_ACHIEVEMENT_FORM);
    } finally {
      setSavingAchievement(false);
    }
  };

  const startEditAchievement = (a: Achievement) => {
    setEditingAchievementId(a.id);
    setAchievementForm({
      title: a.title,
      issuer: a.issuer,
      category: a.category,
      dateLabel: a.dateLabel,
      credentialUrl: a.credentialUrl,
      summary: a.summary,
      status: a.status,
    });
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSkill(true);
    try {
      if (editingSkillId) {
        await updateSkill(editingSkillId, skillForm);
        notify('Skill updated.');
      } else {
        await createSkill(skillForm);
        notify('Skill added.');
      }
      setEditingSkillId(null);
      setSkillForm({ ...EMPTY_SKILL_FORM, order: skills.length + 1 });
    } finally {
      setSavingSkill(false);
    }
  };

  const publishedProjectsCount = projects.filter((p) => p.status === 'published').length;
  const unreadInquiriesCount = inquiries.filter((i) => i.status === 'unread').length;
  const filteredInquiries =
    inquiryFilter === 'all'
      ? inquiries
      : inquiries.filter((i) => i.status === inquiryFilter);

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Wrench className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile & CV', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'inquiries', label: 'Inquiries', icon: <Inbox className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Workspace Top Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-8">
        <div>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Admin Workspace / {navItems.find((n) => n.id === activeTab)?.label}
          </p>
          <h1 className="font-display text-2xl font-bold text-zinc-950 dark:text-zinc-50 mt-1">
            Portfolio Content Studio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {!profileExistsInDb && (
            <button
              type="button"
              onClick={() => saveProfile(profileForm).then(() => notify('Initial profile saved to Firestore.'))}
              className="px-3.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Initialize Profile Record
            </button>
          )}
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
            {user.email}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="mb-6 px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation (240px–280px visual weight) */}
        <aside className="lg:col-span-3 space-y-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  {item.label}
                </span>
                {item.id === 'inquiries' && unreadInquiriesCount > 0 && (
                  <span className="text-xs font-mono tabular-nums">{unreadInquiriesCount}</span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Viewport */}
        <div className="lg:col-span-9">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Published Projects</p>
                  <p className="font-display text-2xl font-bold tabular-nums text-zinc-950 dark:text-zinc-50 mt-1">
                    {publishedProjectsCount}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 tabular-nums">
                    {projects.length - publishedProjectsCount} drafts
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Curated Skills</p>
                  <p className="font-display text-2xl font-bold tabular-nums text-zinc-950 dark:text-zinc-50 mt-1">
                    {skills.length}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Across 5 disciplines
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Achievements</p>
                  <p className="font-display text-2xl font-bold tabular-nums text-zinc-950 dark:text-zinc-50 mt-1">
                    {achievements.length}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Credentials stored
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Unread Inquiries</p>
                  <p className="font-display text-2xl font-bold tabular-nums text-zinc-950 dark:text-zinc-50 mt-1">
                    {unreadInquiriesCount}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 tabular-nums">
                    {inquiries.length} total messages
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h2 className="font-display text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-2">
                  Publishing Checklist
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
                  Keep your public portfolio accurate and verified before sharing with recruiters.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Academic CGPA ({profile.cgpa}) verification
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {profile.cgpaVerified ? 'Verified' : 'Verify in Profile'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Phone & social profile links (GitHub, LinkedIn)
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {profile.githubUrl || profile.linkedinUrl ? 'Configured' : 'Configure Links'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Publish case studies & real project repositories
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('projects')}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Manage Projects
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <form
                onSubmit={handleProjectSubmit}
                className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {editingProjectId ? 'Edit Project Case Study' : 'Add New Project'}
                  </h2>
                  {editingProjectId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProjectId(null);
                        setProjectForm(EMPTY_PROJECT_FORM);
                        setTechInput('');
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={BLUEPRINT_LIMITS.project.titleMax}
                      value={projectForm.title}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          title: e.target.value,
                          slug: editingProjectId ? projectForm.slug : slugifyTitle(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Discipline Category
                    </label>
                    <select
                      value={projectForm.category}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          category: e.target.value as DisciplineCategory,
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    >
                      {DISCIPLINE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      required
                      pattern="^[a-z0-9-]+$"
                      value={projectForm.slug}
                      onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Your Role
                    </label>
                    <input
                      type="text"
                      maxLength={BLUEPRINT_LIMITS.project.roleMax}
                      value={projectForm.role}
                      onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                      placeholder="e.g. UI/UX & Frontend Lead"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Timeline
                    </label>
                    <input
                      type="text"
                      maxLength={BLUEPRINT_LIMITS.project.timelineMax}
                      value={projectForm.timeline}
                      onChange={(e) => setProjectForm({ ...projectForm, timeline: e.target.value })}
                      placeholder="e.g. Oct 2025"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    One-Line Summary (10–320 chars)
                  </label>
                  <input
                    type="text"
                    required
                    minLength={10}
                    maxLength={BLUEPRINT_LIMITS.project.summaryMax}
                    value={projectForm.summary}
                    onChange={(e) => setProjectForm({ ...projectForm, summary: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Case Study Description (10–4000 chars)
                  </label>
                  <textarea
                    rows={4}
                    required
                    minLength={10}
                    maxLength={BLUEPRINT_LIMITS.project.descriptionMax}
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Tech Stack (comma-separated, max 12)
                    </label>
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="React, TypeScript, Python, PyTorch"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Cover Image URL (https:// or studio asset)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectForm.coverImage}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, coverImage: e.target.value })
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProjectForm({
                            ...projectForm,
                            coverImage: STUDIO_ASSETS.engineeringStudy,
                          })
                        }
                        className="px-2.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Use Studio
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Live Demo URL (optional, https://)
                    </label>
                    <input
                      type="url"
                      value={projectForm.liveUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Repository URL (optional, https://)
                    </label>
                    <input
                      type="url"
                      value={projectForm.repoUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-6">
                    <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={projectForm.featured}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, featured: e.target.checked })
                        }
                        className="rounded border-zinc-300"
                      />
                      Featured Case Study
                    </label>

                    <select
                      aria-label="Publication status"
                      value={projectForm.status}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          status: e.target.value as PublishStatus,
                        })
                      }
                      className="px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProject}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {savingProject
                      ? 'Saving...'
                      : editingProjectId
                        ? 'Update Project'
                        : 'Save Project'}
                  </button>
                </div>
              </form>

              {/* Existing Projects Table */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    All Projects ({projects.length})
                  </h3>
                </div>
                {projects.length === 0 ? (
                  <p className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
                    No projects saved yet. Use the form above to publish your first project.
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-950/60"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {p.title}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {p.category} · {p.status === 'published' ? 'Published' : 'Draft'}
                            {p.featured ? ' · Featured' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditProject(p)}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProject(p.id).then(() => notify('Project deleted.'))}
                            aria-label={`Delete ${p.title}`}
                            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              <form
                onSubmit={handleSkillSubmit}
                className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {editingSkillId ? 'Edit Skill' : 'Add Technical Skill / Tool'}
                  </h2>
                  {editingSkillId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkillId(null);
                        setSkillForm(EMPTY_SKILL_FORM);
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Skill / Tool Name
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={BLUEPRINT_LIMITS.skill.nameMax}
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      placeholder="e.g. React, Figma, PyTorch"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Discipline
                    </label>
                    <select
                      value={skillForm.discipline}
                      onChange={(e) =>
                        setSkillForm({
                          ...skillForm,
                          discipline: e.target.value as DisciplineCategory,
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    >
                      {DISCIPLINE_CATEGORIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={skillForm.order}
                      onChange={(e) =>
                        setSkillForm({ ...skillForm, order: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Context Note (optional)
                    </label>
                    <input
                      type="text"
                      maxLength={BLUEPRINT_LIMITS.skill.focusNoteMax}
                      value={skillForm.focusNote}
                      onChange={(e) => setSkillForm({ ...skillForm, focusNote: e.target.value })}
                      placeholder="Brief usage context"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingSkill}
                    className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
                  >
                    {savingSkill ? 'Saving...' : editingSkillId ? 'Update' : 'Add Skill'}
                  </button>
                </div>
              </form>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Curated Skills ({skills.length})
                  </h3>
                </div>
                {skills.length === 0 ? (
                  <p className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
                    No custom skills added yet. Your 5 core discipline pillars remain visible on
                    the public site.
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {skills.map((s) => (
                      <div
                        key={s.id}
                        className="px-6 py-3.5 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {s.name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {s.discipline}
                            {s.focusNote ? ` · ${s.focusNote}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSkillId(s.id);
                              setSkillForm({
                                name: s.name,
                                discipline: s.discipline,
                                focusNote: s.focusNote,
                                order: s.order,
                              });
                            }}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSkill(s.id).then(() => notify('Skill removed.'))}
                            aria-label={`Delete ${s.name}`}
                            className="p-1.5 text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-8">
              <form
                onSubmit={handleAchievementSubmit}
                className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {editingAchievementId ? 'Edit Credential' : 'Add Certification or Milestone'}
                  </h2>
                  {editingAchievementId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAchievementId(null);
                        setAchievementForm(EMPTY_ACHIEVEMENT_FORM);
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={BLUEPRINT_LIMITS.achievement.titleMax}
                      value={achievementForm.title}
                      onChange={(e) =>
                        setAchievementForm({ ...achievementForm, title: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Issuer / Organization
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={BLUEPRINT_LIMITS.achievement.issuerMax}
                      value={achievementForm.issuer}
                      onChange={(e) =>
                        setAchievementForm({ ...achievementForm, issuer: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Category
                    </label>
                    <select
                      value={achievementForm.category}
                      onChange={(e) =>
                        setAchievementForm({
                          ...achievementForm,
                          category: e.target.value as AchievementCategory,
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    >
                      {ACHIEVEMENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Date Label
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={BLUEPRINT_LIMITS.achievement.dateLabelMax}
                      value={achievementForm.dateLabel}
                      onChange={(e) =>
                        setAchievementForm({ ...achievementForm, dateLabel: e.target.value })
                      }
                      placeholder="e.g. Aug 2025"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Credential URL (https://)
                    </label>
                    <input
                      type="url"
                      value={achievementForm.credentialUrl}
                      onChange={(e) =>
                        setAchievementForm({ ...achievementForm, credentialUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Summary
                  </label>
                  <textarea
                    rows={2}
                    maxLength={BLUEPRINT_LIMITS.achievement.summaryMax}
                    value={achievementForm.summary}
                    onChange={(e) =>
                      setAchievementForm({ ...achievementForm, summary: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <select
                    aria-label="Achievement publication status"
                    value={achievementForm.status}
                    onChange={(e) =>
                      setAchievementForm({
                        ...achievementForm,
                        status: e.target.value as PublishStatus,
                      })
                    }
                    className="px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>

                  <button
                    type="submit"
                    disabled={savingAchievement}
                    className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {savingAchievement
                      ? 'Saving...'
                      : editingAchievementId
                        ? 'Update Credential'
                        : 'Save Credential'}
                  </button>
                </div>
              </form>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    All Credentials ({achievements.length})
                  </h3>
                </div>
                {achievements.length === 0 ? (
                  <p className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
                    No achievements or certifications added yet.
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {achievements.map((a) => (
                      <div
                        key={a.id}
                        className="px-6 py-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {a.title}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {a.issuer} · {a.dateLabel} · {a.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => startEditAchievement(a)}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              deleteAchievement(a.id).then(() => notify('Credential deleted.'))
                            }
                            aria-label={`Delete ${a.title}`}
                            className="p-1.5 text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PROFILE & CV */}
          {activeTab === 'profile' && (
            <form
              onSubmit={handleSaveProfile}
              className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Profile, Academic Credentials & Links
                </h2>
                <Layers className="w-4 h-4 text-zinc-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.profile.fullNameMax}
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.profile.headlineMax}
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Introduction Bio
                </label>
                <textarea
                  rows={4}
                  required
                  maxLength={BLUEPRINT_LIMITS.profile.bioMax}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.profile.degreeMax}
                    value={profileForm.degree}
                    onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.profile.institutionMax}
                    value={profileForm.institution}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, institution: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Graduation Period
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.profile.graduationPeriodMax}
                    value={profileForm.graduationPeriod}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, graduationPeriod: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    CGPA
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.profile.cgpaMax}
                    value={profileForm.cgpa}
                    onChange={(e) => setProfileForm({ ...profileForm, cgpa: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
                <label className="inline-flex items-center gap-2 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileForm.cgpaVerified}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, cgpaVerified: e.target.checked })
                    }
                    className="rounded border-zinc-300"
                  />
                  Mark CGPA as Verified
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.profile.locationMax}
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Public Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={BLUEPRINT_LIMITS.profile.emailMax}
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Phone Number (optional)
                  </label>
                  <input
                    type="text"
                    maxLength={BLUEPRINT_LIMITS.profile.phoneMax}
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 ..."
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    External Resume PDF URL (https://)
                  </label>
                  <input
                    type="url"
                    value={profileForm.resumeUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, resumeUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    GitHub Profile URL (https://)
                  </label>
                  <input
                    type="url"
                    value={profileForm.githubUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    LinkedIn Profile URL (https://)
                  </label>
                  <input
                    type="url"
                    value={profileForm.linkedinUrl}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, linkedinUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Behance / Dribbble URL (https://)
                  </label>
                  <input
                    type="url"
                    value={profileForm.behanceUrl}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, behanceUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  {(['all', 'unread', 'read', 'archived'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setInquiryFilter(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                        inquiryFilter === status
                          ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No contact inquiries in this view.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                            {inq.subject}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {inq.senderName} ({inq.senderEmail}) · {inq.inquiryType}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 capitalize">
                          {inq.status}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line mb-4">
                        {inq.message}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs font-mono text-zinc-400 tabular-nums">
                          {inq.createdAt ? inq.createdAt.toLocaleString() : ''}
                        </span>
                        <div className="flex items-center gap-3">
                          {inq.status !== 'read' && (
                            <button
                              type="button"
                              onClick={() => updateInquiryStatus(inq.id, 'read')}
                              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Mark Read
                            </button>
                          )}
                          {inq.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => updateInquiryStatus(inq.id, 'archived')}
                              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:underline"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              deleteInquiry(inq.id).then(() => notify('Inquiry deleted.'))
                            }
                            aria-label={`Delete inquiry from ${inq.senderName}`}
                            className="p-1 text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
