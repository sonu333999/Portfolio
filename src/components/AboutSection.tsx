import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { STUDIO_ASSETS } from '../data/defaults';
import { sanitizeHref } from '../lib/firebase';
import type { PortfolioProfile } from '../types/portfolio';

interface AboutSectionProps {
  profile: PortfolioProfile;
}

export function AboutSection({ profile }: AboutSectionProps) {
  const [imgError, setImgError] = useState(false);

  const githubHref = sanitizeHref(profile.githubUrl);
  const linkedinHref = sanitizeHref(profile.linkedinUrl);
  const behanceHref = sanitizeHref(profile.behanceUrl);
  const hasSocials = Boolean(githubHref || linkedinHref || behanceHref);

  return (
    <section id="about" className="py-16 md:py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 aspect-[3/4] max-h-[520px] w-full">
              {!imgError ? (
                <img
                  src={STUDIO_ASSETS.jaipurStudy}
                  alt="Minimalist architectural geometry inspired by Jaipur, Rajasthan"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 text-center">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {profile.location}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
              Based in {profile.location}
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-3">
                01. About
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 text-balance mb-6">
                Bridging interface craft with intelligent software engineering.
              </h2>

              <div className="space-y-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300 max-w-2xl">
                <p>{profile.bio}</p>
                <p>
                  Currently pursuing {profile.degree} ({profile.graduationPeriod}) at{' '}
                  {profile.institution}, combining foundational computer science coursework with
                  practical frontend architecture, thoughtful UX design, and applied machine
                  learning exploration.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Location</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {profile.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Direct Email</p>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mt-0.5 inline-block break-all"
                  >
                    {profile.email}
                  </a>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Phone</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-0.5 tabular-nums">
                      {profile.phone}
                    </p>
                  </div>
                </div>
              )}

              {hasSocials && (
                <div className="sm:col-span-2 pt-2 flex flex-wrap items-center gap-6">
                  {githubHref && (
                    <a
                      href={githubHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      GitHub
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {linkedinHref && (
                    <a
                      href={linkedinHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      LinkedIn
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {behanceHref && (
                    <a
                      href={behanceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Behance
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
