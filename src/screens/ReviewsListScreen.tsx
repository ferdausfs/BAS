import { useState } from 'react';
import { ArrowLeft, Star, Search, Filter } from 'lucide-react';
import { useUI } from '../lib/store';
import { useReviews } from '../hooks/useReviews';
import { safeArray } from '../lib/utils';

export default function ReviewsListScreen() {
  const { back, go } = useUI();
  const { reviews, avgRating } = useReviews();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'latest'>('all');

  const filtered = safeArray(reviews)
    .filter(r => {
      if (search && !r.comment.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === 'verified') return r.approved;
      return true;
    })
    .sort((a, b) => {
      if (filter === 'latest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  const ratingBreakdown = [5,4,3,2,1].map(star => ({
    star,
    count: filtered.filter(r => r.rating === star).length,
    percent: filtered.length ? Math.round((filtered.filter(r => r.rating === star).length / filtered.length) * 100) : 0
  }));

  return (
    <div className="flex h-full flex-col">
      <header className="flex-shrink-0 px-5 pt-3 pb-3 border-b border-ink-50">
        <div className="flex items-center justify-between">
          <button onClick={back} className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-[18px] font-bold">সব রিভিউ</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-10">
        {/* Big rating + breakdown */}
        <div className="rounded-3xl glass-strong p-5 mb-6">
          <div className="flex items-end gap-4">
            <div className="font-display text-[52px] font-bold leading-none text-ink">{avgRating.toFixed(1)}</div>
            <div className="pb-2">
              <div className="flex text-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
              </div>
              <div className="text-[12px] text-ink-200 mt-0.5">{filtered.length} রিভিউ</div>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            {ratingBreakdown.map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <div className="w-3 text-right font-bold">{star}</div>
                <div className="flex-1 h-2 bg-ink-50 rounded-full overflow-hidden">
                  <div className="h-full bg-coral" style={{ width: `${percent}%` }} />
                </div>
                <div className="w-8 text-right text-ink-200">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-ink-200" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="রিভিউ খুঁজুন..."
              className="w-full h-11 pl-11 rounded-2xl border border-ink-50 bg-white text-sm"
            />
          </div>
          <button onClick={() => setFilter(filter === 'all' ? 'latest' : 'all')} className="px-4 rounded-2xl border border-ink-50 bg-white flex items-center gap-1.5 text-sm font-bold">
            <Filter className="h-4 w-4" /> {filter === 'all' ? 'Latest' : 'All'}
          </button>
        </div>

        {/* Reviews */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((r) => (
              <div key={r.id} className="rounded-2xl glass-strong p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-ink-50 flex items-center justify-center font-bold text-sm">
                    {r.user_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div className="font-bold text-sm">{r.user_name}</div>
                      <div className="flex text-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-1 text-[13px] text-ink-200 leading-snug">{r.comment}</div>
                    {r.image && <img src={r.image} className="mt-2 rounded-xl w-24 h-24 object-cover" />}
                    <div className="mt-2 text-[10px] text-ink-300">{new Date(r.created_at).toLocaleDateString('en-BD')}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-ink-200">কোনো রিভিউ পাওয়া যায়নি</div>
          )}
        </div>
      </div>
    </div>
  );
}
