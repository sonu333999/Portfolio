import { ArrowUpRight, FolderKanban, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { sanitizeImageSrc } from '../lib/firebase';
import { DISCIPLINE_CATEGORIES, type DisciplineCategory, type Project } from '../types/portfolio';

interface ProjectsSectionProps {
  projects: Project[];
  loading: boolean;
  isAdmin: boolean;
  onSelectProject: (project: Project) => void;
  onOpenAdmin: () => void;
}

export function ProjectsSection({
  projects,
  loading,
  isAdmin,
  onSelectProject,
  onOpenAdmin,
}: ProjectsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | DisciplineCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === 'All' || project.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        project.title.toLowerCase().includes(q) ||
        project.summary.toLowerCase().includes(q) ||
        project.techStack.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <section id="projects" className="py-16 md:py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-3">
              03. Selected Works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 text-balance">
              Projects & Case Studies
            </h2>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or tech..."
              aria-label="Search projects"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Interactive Category Filter Controls */}
        <div
          role="tablist"
          aria-label="Filter projects by discipline"
          className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-x-auto mb-10"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'All'}
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            All Works
          </button>
          {DISCIPLINE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === category
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((skeleton) => (
              <div
                key={skeleton}
                className="h-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Authentic Empty State — zero fake projects */
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 md:p-14 text-center">
            <div className="w-11 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-500 dark:text-zinc-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-semibold text-zinc-950 dark:text-zinc-50 mb-2">
              No published case studies yet
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6">
              Verified projects, UI/UX case studies, and AI/ML repositories are curated directly
              through the Portfolio Admin Portal once ready for publication.
            </p>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-4 py-2 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              {isAdmin ? 'Add First Project in Dashboard' : 'Owner Sign-In to Publish'}
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              No published projects match your current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-medium border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Editorial / Bento Project Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project, index) => {
              const safeImg = sanitizeImageSrc(project.coverImage);
              const isLead = project.featured && index === 0 && filteredProjects.length >= 3;

              return (
                <article
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectProject(project);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className={`group cursor-pointer rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-blue-600/50 dark:hover:border-blue-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 flex flex-col ${
                    isLead ? 'md:col-span-2 md:grid md:grid-cols-12' : ''
                  }`}
                >
                  <div
                    className={`bg-zinc-100 dark:bg-zinc-800 overflow-hidden ${
                      isLead ? 'md:col-span-6 h-64 md:h-full' : 'aspect-[16/10]'
                    }`}
                  >
                    {safeImg ? (
                      <img
                        src={safeImg}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                        <span className="font-display text-lg font-semibold text-zinc-700 dark:text-zinc-300 text-center">
                          {project.title}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={`p-6 flex flex-col justify-between ${isLead ? 'md:col-span-6 md:p-8' : ''}`}>
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {project.category}
                          {project.timeline ? ` · ${project.timeline}` : ''}
                          {project.role ? ` · ${project.role}` : ''}
                        </p>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
                      </div>

                      <h3 className="font-display text-xl font-semibold text-zinc-950 dark:text-zinc-50 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>

                      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 line-clamp-3 mb-5">
                        {project.summary}
                      </p>
                    </div>

                    {project.techStack.length > 0 && (
                      <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        {project.techStack.join(' · ')}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
