'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, FileText, Folder, FolderOpen } from 'lucide-react';

export interface ArticleItem {
  slug: string;
  title: string;
  date: string;
  description: string;
  cover: string;
  category: string;
}

export interface ArticleGroup {
  id: string;
  name: string;
  description: string;
  posts: ArticleItem[];
}

function formatDate(raw: string) {
  if (!raw) return '未标注日期';
  const text = String(raw).trim().slice(0, 10).replace(/[/.]/g, '-');
  return text || '未标注日期';
}

export default function ArticlesClient({ groups, total }: { groups: ArticleGroup[]; total: number }) {
  const [active, setActive] = useState('all');

  const visible = useMemo(() => {
    const list = active === 'all'
      ? groups.flatMap((group) => group.posts)
      : groups.find((group) => group.id === active)?.posts ?? [];
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [active, groups]);

  const activeGroup = groups.find((group) => group.id === active);

  return (
    <div className="w-full max-w-6xl mx-auto mt-28 px-4 sm:px-10 relative z-10">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-widest mb-3 transition-colors duration-700">
          文章
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium tracking-wider transition-colors duration-700">
          {activeGroup && active !== 'all' ? activeGroup.description || `共 ${visible.length} 篇` : `共 ${total} 篇，按分类归档`}
        </p>
      </div>

      {/* 分类抽屉 */}
      <div className="flex flex-wrap gap-3 mb-12">
        <button
          type="button"
          onClick={() => setActive('all')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${
            active === 'all'
              ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30'
              : 'bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <FolderOpen size={16} />
          全部
          <span className={`text-xs font-black ${active === 'all' ? 'text-white/80' : 'text-slate-400'}`}>{total}</span>
        </button>

        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => setActive(group.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${
              active === group.id
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30'
                : 'bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Folder size={16} />
            {group.name}
            <span className={`text-xs font-black ${active === group.id ? 'text-white/80' : 'text-slate-400'}`}>{group.posts.length}</span>
          </button>
        ))}
      </div>

      {/* 文章卡片 */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group rounded-3xl overflow-hidden bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col"
            >
              <div className="relative h-44 overflow-hidden bg-slate-200/50 dark:bg-slate-700/50">
                {post.cover ? (
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FileText size={36} />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {post.description}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <CalendarDays size={13} />
                  {formatDate(post.date)}
                  {active === 'all' && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {groups.find((group) => group.id === post.category)?.name ?? '未分类'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-slate-500 dark:text-slate-400">
          <Folder size={40} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm font-bold">这个分类下还没有文章</p>
          <p className="text-xs mt-2 opacity-70">在 posts/ 里新建 .md 文件，front matter 写上 category 即可归到这里</p>
        </div>
      )}
    </div>
  );
}
