import { Download, ExternalLink, Printer, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sanitizeHref } from '../lib/firebase';
import type { Achievement, PortfolioProfile, Project, SkillItem } from '../types/portfolio';

interface ResumeModalProps {
  open: boolean;
  onClose: () => void;
  profile: PortfolioProfile;
  projects: Project[];
  achievements: Achievement[];
  skills: SkillItem[];
}

export function ResumeModal({
  open,
  onClose,
  profile,
  projects,
  achievements,
  skills,
}: ResumeModalProps) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const externalResume = sanitizeHref(profile.resumeUrl);

  const groupedSkills = skills.reduce<Record<string, SkillItem[]>>((acc, item) => {
    if (!acc[item.discipline]) acc[item.discipline] = [];
    acc[item.discipline].push(item);
    return acc;
  }, {});

  const handleDownloadMarkdownCv = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/api/resume/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, projects, achievements, skills }),
      });
      if (!response.ok) return;
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Sonu_Khajotiya_CV.md';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm no-print">
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Curriculum Vitae Preview
          </p>
          <div className="flex items-center gap-2">
            {externalResume && (
              <a
                href={externalResume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open PDF
              </a>
            )}
            <button
              type="button"
              onClick={handleDownloadMarkdownCv}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Exporting...' : 'Download CV (.md)'}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close resume preview"
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-10 space-y-8">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <h2
              id="resume-modal-title"
              className="font-display text-3xl font-bold text-zinc-950 dark:text-zinc-50"
            >
              {profile.fullName}
            </h2>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
              {profile.headline}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3">
              {[profile.location, profile.email, profile.phone].filter(Boolean).join(' · ')}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
              Summary
            </h3>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {profile.bio}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-3">
              Education
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {profile.degree}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {profile.institution}
                </p>
              </div>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums sm:text-right">
                <p>{profile.graduationPeriod}</p>
                <p>
                  CGPA {profile.cgpa} ({profile.cgpaVerified ? 'Verified' : 'Pending Verification'})
                </p>
              </div>
            </div>
          </div>

          {Object.keys(groupedSkills).length > 0 && (
            <div>
              <h3 className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-3">
                Technical Capabilities
              </h3>
              <div className="space-y-2">
                {Object.entries(groupedSkills).map(([discipline, items]) => (
                  <p key={discipline} className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {discipline}:
                    </span>{' '}
                    {items.map((i) => i.name).join(', ')}
                  </p>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <h3 className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-3">
                Selected Projects
              </h3>
              <div className="space-y-4">
                {projects.map((p) => (
                  <div key={p.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                        {p.title}
                      </p>
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        {[p.category, p.timeline].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                      {p.summary}
                    </p>
                    {p.techStack.length > 0 && (
                      <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                        {p.techStack.join(' · ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {achievements.length > 0 && (
            <div>
              <h3 className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-3">
                Achievements & Certifications
              </h3>
              <ul className="space-y-2">
                {achievements.map((a) => (
                  <li key={a.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {a.title}
                    </span>{' '}
                    — {a.issuer}
                    {a.dateLabel ? ` (${a.dateLabel})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
