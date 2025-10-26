'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface SwipeArticle {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
}

export default function SwipeReaderPage() {
  const [articles, setArticles] = useState<SwipeArticle[]>([]);
  const [index, setIndex] = useState(0);
  const controls = useAnimation();
  const current = articles[index];

  useEffect(() => {
    apiClient
      .listArticles({ status: 'PUBLISHED', pageSize: 10 })
      .then((res) => setArticles(res.data))
      .catch(() => setArticles([]));
  }, []);

  const handleAction = async (direction: 'left' | 'right') => {
    await controls.start({
      x: direction === 'left' ? -400 : 400,
      opacity: 0,
      transition: { duration: 0.2 }
    });
    controls.set({ x: 0, opacity: 1 });
    setIndex((prev) => (prev + 1) % (articles.length || 1));
  };

  if (!current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        Loading stories…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
      <motion.article
        className="w-full max-w-lg rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur"
        animate={controls}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, info) => {
          if (info.offset.x > 120) {
            handleAction('right');
          } else if (info.offset.x < -120) {
            handleAction('left');
          } else {
            controls.start({ x: 0, transition: { type: 'spring', stiffness: 300 } });
          }
        }}
      >
        <p className="text-xs uppercase tracking-widest text-amber-300">Swipe to explore</p>
        <h1 className="mt-4 text-3xl font-bold text-white">{current.title}</h1>
        {current.excerpt && <p className="mt-4 text-slate-200">{current.excerpt}</p>}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20" onClick={() => handleAction('left')}>
            Skip
          </Button>
          <Button className="bg-amber-500 text-slate-900 hover:bg-amber-400" onClick={() => handleAction('right')}>
            Save to read later
          </Button>
        </div>
      </motion.article>
      <div className="flex gap-2 text-xs uppercase tracking-wide text-slate-200">
        <span>← Skip</span>
        <span>•</span>
        <span>→ Save</span>
      </div>
    </div>
  );
}
