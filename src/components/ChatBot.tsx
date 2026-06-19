import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { useSettingsStore } from '../lib/store';
import { useProducts } from '../hooks/useProducts';
import { waLink } from '../lib/utils';

interface Message {
  role: 'user' | 'bot';
  text: string;
  time: Date;
}

const QUICK_REPLIES = [
  { q: 'Show me your cake menu', label: '🧁 Menu' },
  { q: 'What are the bestsellers?', label: '🔥 Bestsellers' },
  { q: 'How do I customize a cake?', label: '✨ Customize' },
  { q: 'How long is delivery?', label: '🚗 Delivery' },
  { q: 'Pricing and payment options?', label: '💳 Payment' },
  { q: 'Talk to a human', label: '💬 Human' },
];

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showQuick, setShowQuick] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettingsStore();
  const { products } = useProducts();

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 200); }
  }, [open]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const addBot = (text: string) => {
    setMessages((m) => [...m, { role: 'bot', text, time: new Date() }]);
    if (!open) setUnread((u) => u + 1);
  };

  const ruleBasedReply = (q: string): string => {
    const lq = q.toLowerCase();
    if (lq.includes('menu') || lq.includes('cake') || lq.includes('product')) {
      const list = products.slice(0, 5).map((p) => `• ${p.name} — ${formatINR(p.price)}`).join('\n');
      return `Here are our popular cakes 🎂\n\n${list}\n\nBrowse the Shop tab for the full menu!`;
    }
    if (lq.includes('bestsell') || lq.includes('popular')) {
      const top = products.find((p) => p.bestseller);
      return top
        ? `Our bestseller is **${top.name}** at ${formatINR(top.price)}! ⭐ ${top.tagline}`
        : `Our top picks: ${products.slice(0, 3).map((p) => p.name).join(', ')} — all customer favourites!`;
    }
    if (lq.includes('custom') || lq.includes('design') || lq.includes('personali')) {
      return `To customise a cake:\n1. Open any product\n2. Tap "Customise"\n3. Choose design, flavour, weight, and add your message\n\nWe bring your vision to life! 🎨`;
    }
    if (lq.includes('deliver') || lq.includes('time') || lq.includes('how long')) {
      return `Delivery usually takes **${settings.deliveryEstimate}** 🚗\n\nOrders before 2 PM get same-day delivery in most areas. We'll keep you updated!`;
    }
    if (lq.includes('price') || lq.includes('payment') || lq.includes('pay') || lq.includes('upi')) {
      return `We accept: Cash on Delivery, UPI, Card 💳\n\nPrices start from ${formatINR(Math.min(...products.map((p) => p.price)))}. ${settings.promoEnabled ? `Use code **${settings.promoCode}** for ${settings.promoPercent}% off! 🎁` : ''}`;
    }
    if (lq.includes('human') || lq.includes('whatsapp') || lq.includes('agent') || lq.includes('help')) {
      const link = waLink(settings.whatsappNumber, 'Hi! I need help with my cake order.');
      return `Connecting you to our team! 👋\n\nWhatsApp: ${link}\n\nAvailable 9 AM – 9 PM daily.`;
    }
    if (lq.match(/^(hi|hello|hey|hii|good|morning|evening|night|namaste)/i)) {
      return `Hello! 😊 How can I help you today? Ask me anything about our cakes!`;
    }
    return `Thanks for reaching out! 🎂 I can help with cake info, delivery, and orders. For anything else, our team is on WhatsApp!`;
  };

  const callGemini = async (userMsg: string): Promise<string> => {
    const productList = products.map((p) => `• ${p.name} — ${formatINR(p.price)}: ${p.tagline}`).join('\n');
    const systemPrompt = `You are "Bake Bot" 🎂, the friendly AI for Bake Art Style, a premium cake shop. Be warm and concise. Reply in English only.\n\nShop info:\n- Delivery: ${settings.deliveryEstimate}, fee: ₹${settings.deliveryFee}\n- Payment: Cash, UPI, Card\n${settings.promoEnabled ? `- Promo: ${settings.promoCode} = ${settings.promoPercent}% off` : ''}\n\nCakes:\n${productList}\n\nKeep replies to 2-4 lines.`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${settings.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\nUser: ' + userMsg }] }] }),
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || ruleBasedReply(userMsg);
  };

  const send = async (msg?: string) => {
    const text = (msg ?? input).trim(); if (!text) return;
    setInput(''); setShowQuick(false);
    setMessages((m) => [...m, { role: 'user', text, time: new Date() }]);
    setLoading(true);
    try {
      const reply = settings.geminiApiKey ? await callGemini(text) : (await new Promise<string>((r) => setTimeout(() => r(ruleBasedReply(text)), 600)));
      addBot(reply);
    } catch { addBot(ruleBasedReply(text)); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-3 z-40 w-12 h-12 rounded-full bg-coral text-white flex items-center justify-center"
        style={{ boxShadow: '0 4px 20px rgba(242,94,115,0.4)' }}
      >
        <MessageCircle className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />
          <div className="fixed bottom-20 right-3 z-50 w-[320px] max-h-[480px] flex flex-col bg-cream rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-coral text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">🎂</div>
                <div>
                  <p className="font-bold text-sm">Bake Bot</p>
                  <p className="text-[10px] text-white/70">Ask me anything!</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[180px]">
              {messages.length === 0 && (
                <div className="text-center py-4 text-ink/40 text-xs">Hi! How can I help you today? 🎂</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-coral text-white rounded-br-sm' : 'bg-white text-ink rounded-bl-sm shadow-sm'}`}>
                    {m.text.split('\n').map((line, j, arr) => (
                      <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {showQuick && messages.length === 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((qr) => (
                  <button key={qr.label} onClick={() => send(qr.q)}
                    className="px-2.5 py-1 rounded-full bg-coral/10 text-coral text-[10px] font-bold border border-coral/20">
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-2 border-t border-ink/8">
              <input ref={inputRef} type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message..."
                className="flex-1 text-xs px-3 py-2 rounded-full bg-ink/5 text-ink focus:outline-none" />
              <button onClick={() => send()} disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full bg-coral text-white flex items-center justify-center disabled:opacity-40">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
