import { ExternalLink, Github, X } from 'lucide-react';
import { useEffect } from 'react';
import { sanitizeHref, sanitizeImageSrc } from '../lib/firebase';
import type { Project } from '../types/portfolio';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const safeImg = sanitizeImageSrc(project.coverImage);
  const safeLive = sanitizeHref(project.liveUrl);
  const safeRepo = sanitizeHref(project.repoUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            {project.category}
            {project.timeline ? ` · ${project.timeline}` : ''}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {safeImg && (
          <div className="aspect-[16/9] bg-zinc-100 dark:bg-zinc-800 overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
            <img
              src={safeImg}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <h2
            id="project-modal-title"
            className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 mb-3"
          >
            {project.title}
          </h2>

          {project.role && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              Role: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{project.role}</span>
            </p>
          )}

          <p className="text-base font-medium text-zinc-800 dark:text-zinc-200 mb-5">
            {project.summary}
          </p>

          <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-line mb-8">
            {project.description}
          </div>

          {project.techStack.length > 0 && (
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 mb-6">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Technologies Used</p>
              <p className="text-xs font-mono text-zinc-800 dark:text-zinc-200">
                {project.techStack.join(' · ')}
              </p>
            </div>
          )}

          {(safeLive || safeRepo) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {safeLive && (
                <a
                  href={safeLive}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Preview
                </a>
              )}
              {safeRepo && (
                <a
                  href={safeRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  Source Code
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
