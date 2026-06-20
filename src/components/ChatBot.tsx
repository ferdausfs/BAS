import { useState, useEffect, useRef } from 'react';
import { Send, Phone } from 'lucide-react';
import { useSettingsStore } from '../lib/store';
import { useProducts } from '../hooks/useProducts';
import { waLink } from '../lib/utils';

interface Message {
  role: 'user' | 'bot';
  text: string;
  time: Date;
}

const QUICK_REPLIES = [
  { q: 'কেক মেনু দেখাও', label: '🧁 মেনু' },
  { q: 'বেস্টসেলার কী?', label: '🔥 বেস্টসেলার' },
  { q: 'কাস্টমাইজ কীভাবে করবো?', label: '✨ কাস্টমাইজ' },
  { q: 'ডেলিভারি কতক্ষণ লাগে?', label: '🚗 ডেলিভারি' },
  { q: 'পেমেন্ট অপশন কী?', label: '💳 পেমেন্ট' },
  { q: 'মানুষের সাথে কথা বলতে চাই', label: '💬 হিউম্যান সাপোর্ট' },
];

const formatBDT = (n: number) => `৳${n.toLocaleString('en-BD')}`;

// Pure rule-based fallback ratio check — if AI fails repeatedly, suggest WhatsApp
const MAX_FAILED_ATTEMPTS = 2;

interface Props {
  embedded?: boolean; // if true, renders as a panel (no floating button), used inside ProfileScreen
}

export function ChatBot({ embedded = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showQuick, setShowQuick] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettingsStore();
  const { products } = useProducts();

  useEffect(() => {
    if (embedded) setTimeout(() => inputRef.current?.focus(), 200);
  }, [embedded]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const addBot = (text: string) => {
    setMessages((m) => [...m, { role: 'bot', text, time: new Date() }]);
  };

  const whatsappCTA = () => {
    const link = waLink(settings.whatsappNumber, 'হ্যালো! আমার একটা প্রশ্ন আছে কেক অর্ডার নিয়ে।');
    return `দুঃখিত, আমি এই প্রশ্নের সঠিক উত্তর দিতে পারছি না। 😔\n\nআমাদের টিমের সাথে সরাসরি WhatsApp-এ কথা বলুন:\n👉 ${link}\n\nআমরা সকাল ৯টা থেকে রাত ৯টা পর্যন্ত আছি।`;
  };

  const ruleBasedReply = (q: string): { text: string; matched: boolean } => {
    const lq = q.toLowerCase();
    if (lq.includes('menu') || lq.includes('মেনু') || lq.includes('cake') || lq.includes('কেক')) {
      const list = products.slice(0, 5).map((p) => `• ${p.name} — ${formatBDT(p.price)}`).join('\n');
      return { text: `আমাদের জনপ্রিয় কেকগুলো 🎂\n\n${list}\n\nপুরো মেনু দেখতে Shop ট্যাবে যান!`, matched: true };
    }
    if (lq.includes('bestsell') || lq.includes('popular') || lq.includes('বেস্ট')) {
      const top = products.find((p) => p.bestseller);
      return {
        text: top
          ? `আমাদের বেস্টসেলার হলো **${top.name}** — ${formatBDT(top.price)}! ⭐ ${top.tagline}`
          : `টপ পিক: ${products.slice(0, 3).map((p) => p.name).join(', ')} — সবাই পছন্দ করে!`,
        matched: true,
      };
    }
    if (lq.includes('custom') || lq.includes('কাস্টমাইজ') || lq.includes('design')) {
      return { text: `কেক কাস্টমাইজ করতে:\n1. যেকোনো প্রোডাক্ট খুলুন\n2. "Customise" ট্যাপ করুন\n3. ডিজাইন, ফ্লেভার, ওজন বেছে নিন, মেসেজ লিখুন\n\nআপনার চাহিদামতো কেক তৈরি করি! 🎨`, matched: true };
    }
    if (lq.includes('deliver') || lq.includes('ডেলিভারি') || lq.includes('কতক্ষণ')) {
      return { text: `ডেলিভারি সাধারণত **${settings.deliveryEstimate}** সময় লাগে 🚗\n\nদুপুর ২টার আগে অর্ডার করলে একই দিনে ডেলিভারি পাবেন বেশিরভাগ এলাকায়।`, matched: true };
    }
    if (lq.includes('price') || lq.includes('payment') || lq.includes('দাম') || lq.includes('পেমেন্ট') || lq.includes('bkash') || lq.includes('nagad')) {
      return { text: `আমরা গ্রহণ করি: bKash, Nagad, Cash on Delivery 💳\n\nদাম শুরু ${formatBDT(Math.min(...products.map((p) => p.price)))} থেকে। ${settings.promoEnabled ? `কোড **${settings.promoCode}** ব্যবহার করুন ${settings.promoPercent}% ছাড়ের জন্য! 🎁` : ''}`, matched: true };
    }
    if (lq.includes('human') || lq.includes('whatsapp') || lq.includes('হিউম্যান') || lq.includes('মানুষ') || lq.includes('সাহায্য') || lq.includes('help')) {
      const link = waLink(settings.whatsappNumber, 'হ্যালো! আমার একটা প্রশ্ন আছে কেক অর্ডার নিয়ে।');
      return { text: `আমাদের টিমের সাথে কানেক্ট করে দিচ্ছি! 👋\n\nWhatsApp: ${link}\n\nসকাল ৯টা থেকে রাত ৯টা পর্যন্ত পাবেন।`, matched: true };
    }
    if (lq.match(/^(hi|hello|hey|হ্যালো|হাই|আসসালামু|সালাম)/i)) {
      return { text: `হ্যালো! 😊 আজ কীভাবে সাহায্য করতে পারি? আমাদের কেক নিয়ে যেকোনো প্রশ্ন করুন!`, matched: true };
    }
    return { text: '', matched: false };
  };

  const callGemini = async (userMsg: string): Promise<string> => {
    const productList = products.map((p) => `• ${p.name} — ${formatBDT(p.price)}: ${p.tagline}`).join('\n');
    const systemPrompt = `তুমি "Bake Bot" 🎂, Bake Art Style বেকারির বন্ধুত্বপূর্ণ AI সহায়ক — কুমিল্লা, বাংলাদেশ ভিত্তিক। উষ্ণ এবং সংক্ষিপ্ত উত্তর দাও বাংলায়।\n\nদোকানের তথ্য:\n- ডেলিভারি: ${settings.deliveryEstimate}, চার্জ: ৳${settings.deliveryFee}\n- পেমেন্ট: bKash, Nagad, Cash on Delivery\n${settings.promoEnabled ? `- প্রোমো: ${settings.promoCode} = ${settings.promoPercent}% ছাড়` : ''}\n\nকেকসমূহ:\n${productList}\n\nউত্তর ২-৪ লাইনের মধ্যে রাখো।`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${settings.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\nব্যবহারকারী: ' + userMsg }] }] }),
    });
    if (!res.ok) throw new Error('Gemini API failed');
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response');
    return text;
  };

  const send = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text) return;
    setInput('');
    setShowQuick(false);
    setMessages((m) => [...m, { role: 'user', text, time: new Date() }]);
    setLoading(true);

    try {
      if (settings.geminiApiKey) {
        // Try AI first
        try {
          const reply = await callGemini(text);
          addBot(reply);
          setFailedAttempts(0);
          return;
        } catch {
          // AI failed — fall through to rule-based
        }
      }

      // Rule-based fallback
      await new Promise((r) => setTimeout(r, 500));
      const { text: reply, matched } = ruleBasedReply(text);

      if (matched) {
        addBot(reply);
        setFailedAttempts(0);
      } else {
        const next = failedAttempts + 1;
        setFailedAttempts(next);
        if (next >= MAX_FAILED_ATTEMPTS) {
          addBot(whatsappCTA());
          setFailedAttempts(0);
        } else {
          addBot(`দুঃখিত, ঠিক বুঝতে পারিনি। আবার বলবেন কি? অথবা নিচের অপশন থেকে বেছে নিন:`);
          setShowQuick(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Embedded mode (inside ProfileScreen > Contact section) — always rendered as inline panel
  if (embedded) {
    return (
      <div className="flex flex-col rounded-2xl bg-white overflow-hidden" style={{ height: 420, boxShadow: '0 1px 2px rgba(26,19,17,.02), 0 8px 24px -16px rgba(26,19,17,.16)' }}>
        <div className="flex items-center gap-2 px-4 py-3 bg-coral text-white flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">🎂</div>
          <div>
            <p className="font-bold text-sm">Bake Bot সহায়তা</p>
            <p className="text-[10px] text-white/70">যেকোনো প্রশ্ন করুন</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.length === 0 && (
            <div className="text-center py-4 text-ink/40 text-xs">হ্যালো! কীভাবে সাহায্য করতে পারি? 🎂</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-coral text-white rounded-br-sm' : 'bg-cream text-ink rounded-bl-sm'}`}>
                {m.text.split('\n').map((line, j, arr) => (
                  <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-cream px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {showQuick && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
            {QUICK_REPLIES.map((qr) => (
              <button key={qr.label} onClick={() => send(qr.q)}
                className="px-2.5 py-1 rounded-full bg-coral/10 text-coral text-[10px] font-bold border border-coral/20">
                {qr.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-2 border-t border-ink/8 flex-shrink-0">
          <input ref={inputRef} type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="মেসেজ লিখুন..."
            className="flex-1 text-xs px-3 py-2 rounded-full bg-ink/5 text-ink focus:outline-none" />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full bg-coral text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <a
          href={waLink(settings.whatsappNumber, 'হ্যালো! আমার একটা প্রশ্ন আছে।')}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 text-xs font-bold flex-shrink-0"
        >
          <Phone className="w-3.5 h-3.5" /> সরাসরি WhatsApp-এ কথা বলুন
        </a>
      </div>
    );
  }

  return null;
}
