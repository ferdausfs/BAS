import { useState } from 'react';
import { ArrowLeft, Star, Search, Filter, MessageSquare } from 'lucide-react';
import { useUI } from '../lib/store';
import { useReviews } from '../hooks/useReviews';
import { safeArray } from '../lib/utils';

export default function ReviewsListScreen() {
  const { back } = useUI();
  const { reviews, avgRating } = useReviews();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'latest'>('all');

  const filtered = safeArray(reviews)
    .filter((r: any) => {
      if (search && !r.comment?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === 'verified') return r.approved;
      return true;
    })
    .sort((a: any, b: any) => {
      if (filter === 'latest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  const ratingBreakdown = [5,4,3,2,1].map(star => ({
    star,
    count: filtered.filter((r: any) => r.rating === star).length,
    percent: filtered.length ? Math.round((filtered.filter((r: any) => r.rating === star).length / filtered.length) * 100) : 0
  }));

  return (
    <div className="flex h-full flex-col">
      <header className="flex-shrink-0 px-6 pt-3 pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={back}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-card"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[18px] font-bold text-ink">সব রিভিউ</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-4 pb-10">
        {/* Big rating + breakdown */}
        <div className="rounded-2xl bg-surface border border-border shadow-card p-5 mb-6">
          <div className="flex items-end gap-4">
            <div className="text-[52px] font-bold leading-none text-ink">{avgRating.toFixed(1)}</div>
            <div className="pb-2">
              <div className="flex text-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
              </div>
              <div className="text-[12px] text-text-secondary mt-0.5">{filtered.length} রিভিউ</div>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            {ratingBreakdown.map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <div className="w-3 text-right font-bold">{star}</div>
                <div className="flex-1 h-2 bg-ink-50 rounded-full overflow-hidden">
                  <div className="h-full bg-coral rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <div className="w-8 text-right text-text-secondary">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="রিভিউ খুঁজুন..."
              className="w-full h-11 pl-11 rounded-2xl border border-border bg-surface text-sm outline-none focus:border-coral focus:ring-4 focus:ring-coral/10"
            />
          </div>
          <button
            onClick={() => setFilter(filter === 'all' ? 'latest' : 'all')}
            className="px-4 rounded-2xl border border-border bg-surface flex items-center gap-1.5 text-sm font-bold text-ink shadow-card"
          >
            <Filter className="h-4 w-4" /> {filter === 'all' ? 'Latest' : 'All'}
          </button>
        </div>

        {/* Reviews */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((r: any) => (
              <div key={r.id} className="rounded-2xl bg-surface border border-border shadow-card p-4">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center font-bold text-sm text-coral">
                    {r.user_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div className="font-bold text-sm text-ink">{r.user_name}</div>
                      <div className="flex text-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-1 text-[13px] text-text-secondary leading-snug">{r.comment}</div>
                    {r.image && <img src={r.image} className="mt-2 rounded-xl w-24 h-24 object-cover" />}
                    <div className="mt-2 text-[10px] text-text-tertiary">{new Date(r.created_at).toLocaleDateString('en-BD')}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Designed empty state — no reviews found */
            <div className="flex flex-col items-center justify-center pt-10 text-center anim-fade">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary">
                <MessageSquare className="h-9 w-9 text-coral" strokeWidth={1.6} />
              </div>
              <h2 className="mt-4 text-[16px] font-bold text-ink">কোনো রিভিউ পাওয়া যায়নি</h2>
              <p className="mt-1.5 max-w-xs text-[13px] text-text-secondary leading-relaxed">
                এখনো কেউ রিভিউ দেয়নি। প্রথম রিভিউ দিন!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
