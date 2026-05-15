'use client';

import React from 'react';
import type { PromptTag } from '../../types/community';

interface TagFilterProps {
  tags: (PromptTag & { prompts_count?: number })[];
  activeTag: string | null;
  onTagSelect: (slug: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, activeTag, onTagSelect }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* All button */}
      <button
        onClick={() => onTagSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
          !activeTag
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
        }`}
      >
        🌐 الكل
      </button>

      {tags.map(tag => (
        <button
          key={tag.slug}
          onClick={() => onTagSelect(tag.slug === activeTag ? null : tag.slug)}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTag === tag.slug
              ? 'text-white shadow-lg'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
          }`}
          style={activeTag === tag.slug ? {
            backgroundColor: tag.color,
            boxShadow: `0 8px 16px -4px ${tag.color}40`,
          } : {}}
        >
          <span className="text-base">{tag.icon}</span>
          {tag.label_ar}
          {tag.prompts_count !== undefined && tag.prompts_count > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeTag === tag.slug ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
            }`}>
              {tag.prompts_count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
