import { ArrowDownRight, FileText, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { STUDIO_ASSETS } from '../data/defaults';
import type { PortfolioProfile } from '../types/portfolio';
import { useTheme } from './ThemeProvider';

interface HeroSectionProps {
  profile: PortfolioProfile;
  onOpenResume: () => void;
}

export function HeroSection({ profile, onOpenResume }: HeroSectionProps) {
  const { theme, toggleTheme } = useTheme();
  const [imgError, setImgError] = useState(false);

  return (
    <section id="top" className="pt-12 pb-16 md:pt-20 md:pb-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Typographic Hierarchy & Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-between py-2"
          >
            <div>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-normal mb-5">
                {profile.location}
                <span className="mx-2" aria-hidden="true">·</span>
                {profile.graduationPeriod}
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08] text-zinc-950 dark:text-zinc-50 text-balance mb-5">
                {profile.fullName}
              </h1>

              <p className="text-base sm:text-lg font-medium text-blue-600 dark:text-blue-400 mb-6">
                {profile.headline}
              </p>

              <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300 max-w-2xl mb-10">
                {profile.bio}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
              >
                Get in Touch
                <ArrowDownRight className="w-4 h-4" />
              </a>

              <a
                href="#projects"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
              >
                Selected Works
              </a>

              <button
                type="button"
                onClick={onOpenResume}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4" />
                Resume
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0 ml-auto sm:ml-0"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Matching-Height Studio Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex"
          >
            <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 min-h-[300px] lg:min-h-[420px] relative">
              {!imgError ? (
                <img
                  src={STUDIO_ASSETS.heroWorkspace}
                  alt="Minimalist studio desk with architectural grid notebook and cobalt optical prism"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full lg:h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
                  <span className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {profile.fullName}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    UI/UX Design · Frontend · AI/ML
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Full-Width 4-Column Academic & Focus Strip Below Hero Split */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Degree Program</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {profile.degree}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Institution</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {profile.institution}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Academic Standing</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              CGPA {profile.cgpa}
              <span className="font-normal text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                · {profile.cgpaVerified ? 'Verified' : 'Verify before publishing'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Primary Focus</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              UI/UX · Frontend · AI/ML · Data Science
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
