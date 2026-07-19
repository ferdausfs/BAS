import { useState } from 'react';
import { ArrowLeft, Camera, X, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { useUI, useSettingsStore } from '../lib/store';
import { fileToBase64 } from '../lib/utils';

export default function CustomizeScreen() {
  const { view, back } = useUI();
  const { settings } = useSettingsStore();
  const [refImagePreview, setRefImagePreview] = useState('');
  const [note, setNote] = useState('');

  if (view.name !== 'customize') return null;

  const whatsappNumber = settings?.whatsappNumber ?? '';
  const waMessage = encodeURIComponent(
    `আসসালামু আলাইকুম! আমি একটা কাস্টম কেক অর্ডার করতে চাই।${note ? `\n\n can বিস্তারিত: ${note}` : ''}${refImagePreview ? '\n\n(রেফারেন্স ছবি সংযুক্ত আছে, চ্যাটে পাঠাবো)' : ''}`
  );
  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex items-center gap-3 px-6 pt-4 pb-3">
        <button
          onClick={back}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-card transition active:scale-90"
        >
          <ArrowLeft className="h-[18px] w-[18px] text-ink" strokeWidth={2} />
        </button>
        <h1 className="font-sans text-[16px] font-bold tracking-tight text-ink">Custom Cake</h1>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-8">
        <div className="mt-2 rounded-2xl border border-border bg-surface p-4 shadow-card anim-up">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-coral/10">
              <Sparkles className="h-4 w-4 text-coral" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-sans text-[14px] font-bold text-ink">আপনার স্বপ্নের কেক</h3>
              <p className="text-[11px] text-ink-300">প্রতিটা কাস্টম কেক আলাদা — চলুন সরাসরি কথা বলি</p>
            </div>
          </div>
        </div>

        <div className="mt-3.5 rounded-2xl border border-border bg-surface p-4 shadow-card anim-up delay-1">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-coral">
              <Camera className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-sans text-[14px] font-bold text-ink">রেফারেন্স ছবি</h3>
              <p className="text-[11px] text-ink-300">যেমন কেক চান তার ছবি দিন (ঐচ্ছিক)</p>
            </div>
          </div>
          {refImagePreview ? (
            <div className="relative">
              <img src={refImagePreview} alt="reference" className="w-full aspect-video rounded-2xl object-cover" />
              <button
                onClick={() => setRefImagePreview('')}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-ink/60 text-white flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ছবি যোগ হয়েছে
              </div>
            </div>
          ) : (
            <label className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-coral-200 bg-coral-50/50 active:bg-coral-100/50 transition">
              <Camera className="h-9 w-9 text-coral-400" strokeWidth={1.5} />
              <span className="text-[12px] font-semibold text-ink-300">ছবি আপলোড করতে ট্যাপ করুন</span>
              <span className="text-[10px] text-ink-200">JPG, PNG — সর্বোচ্চ ৫MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { alert('সর্বোচ্চ ৫MB'); return; }
                fileToBase64(file).then(setRefImagePreview);
              }} />
            </label>
          )}
        </div>

        <div className="mt-3.5 rounded-2xl border border-border bg-surface p-4 shadow-card anim-up delay-2">
          <h3 className="mb-2 font-sans text-[14px] font-bold text-ink">বিস্তারিত লিখুন</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={300}
            placeholder="ফ্লেভার, ওজন, ডিজাইন, বাজেট, ডেলিভারির তারিখ — যা জানাতে চান লিখুন"
            className="w-full resize-none rounded-2xl border border-border bg-coral-50/20 px-4 py-3 text-[13px] text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 transition placeholder:text-ink-200"
          />
          <div className="mt-1 text-right text-[10.5px] text-ink-200 tabular">{note.length}/300</div>
        </div>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-3.5 text-[14px] font-bold text-white transition active:scale-[.98] anim-up delay-3 shadow-[0_8px_20px_-6px_rgba(37,211,102,0.55)]"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2} fill="currentColor" />
          WhatsApp এ কথা বলুন
        </a>
        <p className="mt-3 text-center text-[11px] text-ink-300">
          আমরা দ্রুত রিপ্লাই দেব এবং দাম ঠিক করব
        </p>
      </div>
    </div>
  );
}
