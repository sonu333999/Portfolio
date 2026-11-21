import { useState } from 'react';
import { CORE_DISCIPLINES, STUDIO_ASSETS } from '../data/defaults';
import type { SkillItem } from '../types/portfolio';

interface DisciplinesSectionProps {
  skills: SkillItem[];
}

export function DisciplinesSection({ skills }: DisciplinesSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="disciplines" className="py-16 md:py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-3">
              02. Core Disciplines
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 text-balance">
              Focused across human-centered interfaces and intelligent systems.
            </h2>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 aspect-[16/9]">
              {!imgError ? (
                <img
                  src={STUDIO_ASSETS.engineeringStudy}
                  alt="Precision geometric lattice and optical glass blocks representing engineering structure"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-6 text-zinc-400 text-sm">
                  Engineering & Design Systems
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_DISCIPLINES.map((discipline) => {
            const curatedTools = skills.filter((s) => s.discipline === discipline.title);

            return (
              <div
                key={discipline.index}
                className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mb-2">
                    {discipline.index}
                  </p>
                  <h3 className="font-display text-xl font-semibold text-zinc-950 dark:text-zinc-50 mb-3">
                    {discipline.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 mb-6">
                    {discipline.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                    {curatedTools.length > 0 ? 'Tools & Stack' : 'Key Focus Areas'}
                  </p>
                  <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {curatedTools.length > 0
                      ? curatedTools.map((t) => t.name).join(' · ')
                      : discipline.focusAreas.join(' · ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
