import type { PortfolioProfile } from '../types/portfolio';

interface FooterProps {
  profile: PortfolioProfile;
  onOpenAdmin: () => void;
  onOpenResume: () => void;
}

export function Footer({ profile, onOpenAdmin, onOpenResume }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-10 no-print">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {profile.fullName}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {profile.location} · {profile.institution}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400">
          <a
            href={`mailto:${profile.email}`}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {profile.email}
          </a>
          <button
            type="button"
            onClick={onOpenResume}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Admin Portal
          </button>
        </div>
      </div>
    </footer>
  );
}
