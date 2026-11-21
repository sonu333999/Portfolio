import { ArrowUpRight, Award, GraduationCap } from 'lucide-react';
import { sanitizeHref } from '../lib/firebase';
import type { Achievement, PortfolioProfile } from '../types/portfolio';

interface EducationAchievementsSectionProps {
  profile: PortfolioProfile;
  achievements: Achievement[];
}

export function EducationAchievementsSection({
  profile,
  achievements,
}: EducationAchievementsSectionProps) {
  return (
    <section id="education" className="py-16 md:py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-3">
            04. Academic Record & Milestones
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 text-balance">
            Education & Verified Credentials
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Education Block */}
          <div className="lg:col-span-6 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-medium">Undergraduate Degree</span>
              </div>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                {profile.graduationPeriod}
              </span>
            </div>

            <h3 className="font-display text-xl font-semibold text-zinc-950 dark:text-zinc-50 mb-2">
              {profile.degree}
            </h3>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-6">
              {profile.institution}
            </p>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Cumulative GPA</p>
                <p className="text-lg font-semibold font-mono text-zinc-950 dark:text-zinc-50 tabular-nums mt-0.5">
                  {profile.cgpa}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Verification Status</p>
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                  {profile.cgpaVerified ? 'Verified Record' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>

          {/* Achievements / Certifications Block */}
          <div className="lg:col-span-6">
            {achievements.length === 0 ? (
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400 mb-4">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-medium">Certifications & Achievements</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-2">
                  Ready for verified credentials
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Certifications, hackathon outcomes, and academic recognitions added via the
                  Admin Portal appear here with issuer attribution and credential links.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {achievements.map((item) => {
                  const credHref = sanitizeHref(item.credentialUrl);
                  return (
                    <div
                      key={item.id}
                      className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {item.category} · {item.issuer}
                        </p>
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                          {item.dateLabel}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-2">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
                          {item.summary}
                        </p>
                      )}
                      {credHref && (
                        <a
                          href={credHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Verify Credential
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
