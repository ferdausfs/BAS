import { useEffect, useRef, useState } from 'react';
import { Phone, Send, Cake, X, Camera, Loader2 } from 'lucide-react';
import { useAuthStore, useSettingsStore, useUI } from '../lib/store';
import { useProducts } from '../hooks/useProducts';
import { useOrdersHook } from '../hooks/useOrders';
import { waLink, formatBDT, safeArray } from '../lib/utils';
import { uploadToCloudinary } from '../lib/firebase';
import type { Order } from '../types';

interface Message {
  role: 'user' | 'bot';
  text: string;
  time: Date;
  image?: string;
}

const QUICK_REPLIES = [
  { q: 'আমার অর্ডার কোথায়?', label: 'আমার অর্ডার' },
  { q: 'আমার পেমেন্ট স্ট্যাটাস?', label: 'পেমেন্ট' },
  { q: 'কেক মেনু দেখাও', label: 'মেনু' },
  { q: 'অর্ডার কীভাবে করবো?', label: 'অর্ডার' },
  { q: 'ডেলিভারি কোথায় দাও?', label: 'জোন' },
  { q: 'মানুষের সাথে কথা বলতে চাই', label: 'সাপোর্ট' },
];

const STATUS_BN: Record<string, string> = {
  placed: 'অর্ডার প্লেস হয়েছে',
  confirmed: 'অর্ডার confirm হয়েছে',
  baking: 'কেক bake হচ্ছে',
  ready: 'কেক ready',
  out: 'ডেলিভারির জন্য বের হয়েছে',
  delivered: 'ডেলিভারি complete হয়েছে',
  cancelled: 'অর্ডার cancel হয়েছে',
};

const chatHistoryKey = (userId?: string, orderId?: string | null) =>
  orderId ? `bakeart-chat-order-${orderId}` : `bakeart-chat-history-${userId || 'guest'}`;

interface Props {
  embedded?: boolean;
  fullPage?: boolean;
  onClose?: () => void;
}

export function ChatBot({ embedded = false, fullPage = false, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const skipPersistRef = useRef(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettingsStore();
  const { products } = useProducts();
  const { orders, fetchMyOrders } = useOrdersHook();
  const { user } = useAuthStore();
  const { chatOpen, setChatOpen, chatOrderContext } = useUI();
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || settings.geminiApiKey || '';

  useEffect(() => {
    void fetchMyOrders();
  }, [fetchMyOrders, user?.id]);

  const getSavedCustomer = (): { name?: string; phone?: string; address?: string; district?: string; payment?: string } => {
    try {
      const key = user?.id ? `bakeart-customer-profile-${user.id}` : 'bakeart-customer-profile';
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      return {};
    }
  };

  const mineOrders = (): Order[] => {
    const saved = getSavedCustomer();
    const uid = user?.id && !user.id.startsWith('local-') ? user.id : '';
    const phone = saved.phone?.trim() || user?.contact?.trim() || '';
    const email = user?.email?.trim().toLowerCase() || '';

    return safeArray<Order>(orders)
      .filter((order) => {
        if (uid && order.userId && order.userId !== uid) return false;
        if (uid && order.userId === uid) return true;
        if (phone && order.customer?.phone === phone) return true;
        if (email && order.customer?.email?.trim().toLowerCase() === email) return true;
        if (!uid && !order.userId) return true;
        return false;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  };

  const extractOrderId = (text: string, known: Order[]): string | null => {
    const compact = text.replace(/\s+/g, '');
    const match = compact.match(/BAS\d{8,}[-]?[A-Za-z0-9]{0,8}/i);
    if (match) {
      const raw = match[0].toUpperCase();
      const exact = known.find((order) => order.id.toUpperCase() === raw);
      if (exact) return exact.id;
      const loose = known.find((order) => order.id.replace(/-/g, '').toUpperCase() === raw.replace(/-/g, ''));
      if (loose) return loose.id;
      return raw;
    }
    const upper = text.toUpperCase();
    return known.find((order) => upper.includes(order.id.toUpperCase()))?.id ?? null;
  };

  const pickOrder = (question: string): Order | undefined => {
    const mine = mineOrders();
    const askedId = extractOrderId(question, mine) || extractOrderId(chatOrderContext || '', mine);
    if (askedId) return mine.find((order) => order.id.toUpperCase() === askedId.toUpperCase() || order.id.replace(/-/g, '').toUpperCase() === askedId.replace(/-/g, '').toUpperCase());
    if (chatOrderContext) {
      const focused = mine.find((order) => order.id === chatOrderContext);
      if (focused) return focused;
    }
    return mine[0];
  };

  const describeOrder = (order: Order) => {
    const items = safeArray<Order['items'][number]>(order.items).map((item) => `${item.name} ×${item.quantity}`).join(', ');
    const advance = order.advanceAmount ?? 0;
    const remaining = order.remainingAmount ?? Math.max(0, order.total - advance);
    const cancelLine = order.status === 'cancelled' && order.cancelReason ? `\nবাতিলের কারণ: ${order.cancelReason}` : '';
    return (
      `Order #${order.id} — ${STATUS_BN[order.status] ?? order.status}${cancelLine}\n` +
      `Items: ${items || '—'}\n` +
      `Total: ${formatBDT(order.total)}\n` +
      `অগ্রিম: ${formatBDT(advance)} (${order.advancePayment || 'bKash/Nagad'}) · ${order.paymentVerified ? 'verify হয়েছে' : 'এখনো verify হয়নি'}\n` +
      `Screenshot: ${order.paymentScreenshot ? 'আছে' : 'নেই'}\n` +
      `বাকি: ${formatBDT(remaining)} (${order.payment === 'cash' ? 'Cash on Delivery' : order.payment})\n` +
      `Delivery: ${order.delivery?.date || '—'} · ${order.delivery?.time || '—'}`
    );
  };

  const orderStatusText = (rawQuestion: string) => {
    const mine = mineOrders();
    const askedId = extractOrderId(rawQuestion, mine) || extractOrderId(chatOrderContext || '', mine);
    if (askedId) {
      const found = mine.find((order) =>
        order.id.toUpperCase() === askedId.toUpperCase() ||
        order.id.replace(/-/g, '').toUpperCase() === askedId.replace(/-/g, '').toUpperCase()
      );
      if (!found) {
        return `Order #${askedId} আপনার অ্যাকাউন্টে পাইনি।\n\nশুধু আপনার নিজের Order ID দিয়ে খোঁজা হয় — অন্য কারো অর্ডার দেখানো হয় না। ID আবার চেক করুন, অথবা Orders tab খুলুন।`;
      }
      return `আপনার অর্ডার\n\n${describeOrder(found)}\n\nআরও detail: Orders tab → Open tracking।`;
    }
    const latest = mine[0];
    if (!latest) {
      return 'আপনার নামে কোনো অর্ডার পাচ্ছি না। Order ID লিখুন, অথবা আগে সাইন-ইন করুন। অন্য কাস্টমারের অর্ডার আমি দেখাই না।';
    }
    return `আপনার latest order\n\n${describeOrder(latest)}\n\nঅন্য অর্ডার হলে Order ID লিখুন।`;
  };

  const paymentStatusText = (question: string, asDone: boolean) => {
    const order = pickOrder(question);
    if (!order) {
      return asDone
        ? 'পেমেন্ট পাঠানোর কথা বললেন, কিন্তু আপনার নামে অর্ডার খুঁজে পাইনি। নিজের Order ID লিখুন — অন্য কারো পেমেন্ট মিলিয়ে বলব না।'
        : 'আপনার অর্ডার খুঁজে পাইনি, তাই পেমেন্ট স্ট্যাটাস বলতে পারছি না। Order ID দিন।';
    }
    const advance = order.advanceAmount ?? 0;
    const remaining = order.remainingAmount ?? Math.max(0, order.total - advance);
    const head = asDone ? 'বুঝলাম, আপনি পেমেন্ট পাঠিয়েছেন। আপনার অর্ডার অনুযায়ী:' : 'আপনার পেমেন্ট স্ট্যাটাস:';
    return (
      `${head}\n\n${describeOrder(order)}\n\n` +
      (order.paymentVerified
        ? 'অগ্রিম verify হয়েছে — প্রস্তুতি চলতে পারে।'
        : order.paymentScreenshot
          ? 'Screenshot আছে, admin verify করছে। কিছুক্ষণ লাগতে পারে।'
          : `অগ্রিম ${formatBDT(advance)} এখনো verify হয়নি — checkout-এ screenshot upload করুন।`) +
      `\nবাকি ${formatBDT(remaining)} ডেলিভারির সময় (${order.payment === 'cash' ? 'ক্যাশ' : order.payment})।`
    );
  };

  useEffect(() => {
    skipPersistRef.current = true;
    try {
      const raw = localStorage.getItem(chatHistoryKey(user?.id, chatOrderContext));
      if (!raw) {
        if (chatOrderContext) {
          setMessages([{ role: 'bot', text: orderStatusText(chatOrderContext), time: new Date() }]);
        } else {
          setMessages([]);
        }
        return;
      }
      const parsed = JSON.parse(raw) as Array<{ role: 'user' | 'bot'; text: string; time: string }>;
      setMessages(Array.isArray(parsed) ? parsed.map((m) => ({ ...m, time: new Date(m.time) })) : []);
    } catch {
      setMessages([]);
    }
  }, [user?.id, chatOrderContext]);

  useEffect(() => {
    if (embedded || chatOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [embedded, chatOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    try {
      localStorage.setItem(chatHistoryKey(user?.id, chatOrderContext), JSON.stringify(messages));
    } catch {
      // ignore storage failures
    }
  }, [messages, user?.id, chatOrderContext]);

  const addBot = (text: string) => {
    setMessages((m) => [...m, { role: 'bot', text, time: new Date() }]);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('শুধু image file পাঠানো যাবে।');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageError('ছবির size ৮MB-এর কম হতে হবে।');
      return;
    }

    setImageError(null);
    setImageUploading(true);
    setShowQuick(false);
    try {
      const url = await uploadToCloudinary(file, 'bake-art-style/chat-references');
      setMessages((m) => [...m, { role: 'user', text: '', image: url, time: new Date() }]);
      await new Promise((r) => setTimeout(r, 250));
      addBot('ছবিটা পেয়েছি, রেফারেন্স হিসেবে রাখলাম। অর্ডার/পেমেন্ট নিয়ে কিছু জানতে চাইলে Order ID লিখুন।');
    } catch {
      setImageError('ছবি upload করা যায়নি, আবার চেষ্টা করুন।');
    } finally {
      setImageUploading(false);
    }
  };

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[?.,!।…]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const has = (text: string, words: string[]) =>
    words.some((w) => {
      const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(^|[^a-z0-9\\u0980-\\u09FF])${escaped}([^a-z0-9\\u0980-\\u09FF]|$)`, 'i');
      return re.test(text);
    });

  const supportText = () => {
    const digits = settings.whatsappNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      return 'এখন WhatsApp নম্বর সেট নেই। নিচের অপশন কাজ না করলে একটু পরে আবার চেষ্টা করুন।';
    }
    return 'টিমের সাথে কথা বলতে নিচের সবুজ WhatsApp বাটন চাপুন। সাধারণত সকাল ৯টা–রাত ৯টা সাপোর্ট থাকে।';
  };

  const menuText = () => {
    const list = products
      .slice(0, 6)
      .map((p, i) => `${i + 1}. ${p.name} — ${formatBDT(p.price)}\n   ${p.tagline}`)
      .join('\n');
    return `আমাদের জনপ্রিয় কেকগুলো\n\n${list}\n\nআরও দেখতে Shop/Browse tab খুলুন।`;
  };

  const customerFacts = () => {
    const saved = getSavedCustomer();
    const mine = mineOrders();
    const identity = [
      user?.id ? `customerId: ${user.id}` : 'customerId: guest',
      `name: ${saved.name || user?.name || '—'}`,
      `phone: ${saved.phone || user?.contact || '—'}`,
      `email: ${user?.email || '—'}`,
    ].join('\n');
    const orderLines = mine.slice(0, 8).map((order) => describeOrder(order)).join('\n---\n');
    return `THIS CUSTOMER ONLY:\n${identity}\nfocusOrderId: ${chatOrderContext || 'none'}\norders (${mine.length}):\n${orderLines || 'none'}`;
  };

  const agentReply = (question: string): { text: string; kind: 'grounded' | 'local' | 'open' } => {
    const q = normalize(question);
    const mine = mineOrders();

    if (extractOrderId(question, mine) || extractOrderId(question, [])) {
      return { text: orderStatusText(question), kind: 'grounded' };
    }

    if (has(q, ['hi', 'hello', 'hey', 'হাই', 'হ্যালো', 'সালাম', 'আসসালামু', 'salam', 'assalamu'])) {
      const latest = mine[0];
      return {
        text: latest
          ? `হ্যালো! আমি BAS, আপনার অর্ডার এজেন্ট। Latest order #${latest.id} — ${STATUS_BN[latest.status] ?? latest.status}। অর্ডার, পেমেন্ট বা ID নিয়ে যা জানতে চান বলুন।`
          : 'হ্যালো! আমি BAS, আপনার অর্ডার এজেন্ট। Order ID, পেমেন্ট বা স্ট্যাটাস লিখুন — শুধু আপনার ডেটা দিয়ে উত্তর দেব।',
        kind: 'local',
      };
    }

    if (has(q, ['thanks', 'thank you', 'ধন্যবাদ', 'tnx', 'thx'])) {
      return { text: 'স্বাগতম। আর কিছু লাগলে অর্ডার/পেমেন্ট নিয়ে বলুন।', kind: 'local' };
    }

    if (has(q, ['bye', 'good night', 'বিদায়', 'আল্লাহ হাফেজ'])) {
      return { text: 'আল্লাহ হাফেজ।', kind: 'local' };
    }

    if (has(q, ['ki koro', 'কি কর', 'ki korte paro', 'কী করতে পারো', 'what can you do', 'tumi ki', 'তুমি কে', 'who are you'])) {
      return {
        text: 'আমি আপনার BAS এজেন্ট। আপনি যা বলবেন — Order ID, পেমেন্ট, স্ট্যাটাস — সেটাই বিশ্লেষণ করে উত্তর দিই। অন্য কাস্টমারের অর্ডার বা অপ্রাসঙ্গিক অ্যাপ গাইড গুলিয়ে বলি না।',
        kind: 'local',
      };
    }

    if (
      has(q, ['payment', 'পেমেন্ট', 'taka', 'টাকা', 'bkash', 'bikash', 'nagad', 'send', 'money', 'screenshot']) &&
      has(q, ['koresi', 'kore disi', 'diyechi', 'diye disi', 'dise', 'disi', 'already', 'hoye gese', 'দিয়েছি', 'হয়ে গেছে', 'pathaisi', 'pathiye', 'screenshot dise', 'screenshot disi'])
    ) {
      return { text: paymentStatusText(question, true), kind: 'grounded' };
    }

    if (
      has(q, ['amar payment', 'my payment', 'payment status', 'পেমেন্ট স্ট্যাটাস', 'payment koi', 'bkash gese', 'nagad gese', 'verify', 'screenshot']) ||
      (has(q, ['payment', 'পেমেন্ট', 'bkash', 'nagad']) && has(q, ['amar', 'আমার', 'my', 'status', 'স্ট্যাটাস', 'koi', 'কই']))
    ) {
      return { text: paymentStatusText(question, false), kind: 'grounded' };
    }

    if (
      has(q, ['track', 'tracking', 'ট্র্যাক', 'status', 'স্ট্যাটাস', 'order id', 'amar order', 'আমার অর্ডার', 'my order']) ||
      (has(q, ['order', 'অর্ডার']) && has(q, ['amar', 'আমার', 'my', 'koi', 'কই', 'khobor', 'কই গেল']))
    ) {
      return { text: orderStatusText(question), kind: 'grounded' };
    }

    if (has(q, ['deri', 'দেরি', 'delay', 'ashe nai', 'asheni', 'আসেনি', 'ekhono pai nai', 'late'])) {
      return {
        text: `${orderStatusText(question)}\n\nদেরির জন্য দুঃখিত। উপরের স্ট্যাটাস আপনার অর্ডারের। তাও দেরি মনে হলে WhatsApp-এ নিজের Order ID দিন।\n\n${supportText()}`,
        kind: 'grounded',
      };
    }

    if (has(q, ['cancel korte chai', 'cancel korbo', 'order cancel korte', 'বাতিল করতে চাই', 'বাতিল করব'])) {
      const order = pickOrder(question);
      return {
        text: order
          ? `Order #${order.id} এখন "${STATUS_BN[order.status] ?? order.status}"। Baking শুরু না হলে WhatsApp-এ এই ID দিয়ে cancel চাইতে পারেন।\n\n${supportText()}`
          : `Cancel করতে চাইলে আপনার Order ID লাগবে।\n\n${supportText()}`,
        kind: 'grounded',
      };
    }

    if (has(q, ['cancel', 'refund', 'বাতিল', 'রিফান্ড'])) {
      const cancelled = mine.filter((order) => order.status === 'cancelled')[0];
      if (cancelled) {
        return {
          text: `আপনার Order #${cancelled.id} বাতিল। ${cancelled.cancelReason ? `কারণ: ${cancelled.cancelReason}` : 'কারণ লেখা নেই।'}\n\n${supportText()}`,
          kind: 'grounded',
        };
      }
      const order = pickOrder(question);
      return {
        text: order
          ? `Order #${order.id} এখনো cancelled নয় — স্ট্যাটাস ${STATUS_BN[order.status] ?? order.status}।`
          : `আপনার কোনো cancelled অর্ডার পাইনি।`,
        kind: 'grounded',
      };
    }

    if (has(q, ['wrong item', 'ভুল কেক', 'vul cake', 'damage', 'damaged', 'নষ্ট', 'noshto', 'kharap cake'])) {
      const order = pickOrder(question);
      return {
        text: `দুঃখিত। ${order ? `আপনার Order #${order.id} নিয়ে ` : ''}ছবিসহ WhatsApp-এ জানালে দ্রুত দেখা হবে। অন্য অর্ডারের সাথে মিলিয়ে ব্যবস্থা নেওয়া হবে না।\n\n${supportText()}`,
        kind: 'grounded',
      };
    }

    if (has(q, ['menu', 'মেনু', 'product list', 'কী কেক আছে', 'ki cake ache']) || (has(q, ['cake', 'কেক']) && has(q, ['দেখাও', 'list', 'মেনু', 'menu']))) {
      return { text: menuText(), kind: 'local' };
    }

    if (has(q, ['kivabe order', 'order korte', 'কীভাবে অর্ডার', 'how to order', 'order process'])) {
      return {
        text: 'অর্ডার: Shop থেকে কেক → size/flavour → cart → checkout → নাম/ফোন/ঠিকানা → অগ্রিম ১/৩ bKash বা Nagad + screenshot। ID পেলে এখানে দিলে স্ট্যাটাস বলব।',
        kind: 'local',
      };
    }

    if (has(q, ['zone', 'জোন', 'kothay daw', 'কোথায় দাও', 'delivery zone', 'এলাকা'])) {
      const zones = (settings.allowedZones ?? []).join(', ');
      return { text: `ডেলিভারি জোন: ${zones || 'এখনো সেট নেই'}।`, kind: 'local' };
    }

    if ((has(q, ['payment', 'পেমেন্ট', 'bkash', 'nagad']) && has(q, ['kivabe', 'কীভাবে', 'process', 'কিভাবে'])) || has(q, ['kivabe payment'])) {
      return {
        text: 'পেমেন্ট ২ ধাপ: এখন ১/৩ অগ্রিম (শুধু bKash/Nagad + screenshot), বাকি ডেলিভারিতে cash/bKash/Nagad। আপনার অর্ডারের হিসাব জানতে Order ID দিন।',
        kind: 'local',
      };
    }

    if (has(q, ['support', 'help', 'সাহায্য', 'মানুষ', 'whatsapp', 'যোগাযোগ'])) {
      return { text: supportText(), kind: 'local' };
    }

    if (has(q, ['admin', 'অ্যাডমিন', 'dashboard', 'ড্যাশবোর্ড', 'panel'])) {
      return { text: 'আমি কাস্টমার এজেন্ট — অ্যাডমিন প্যানেল এখানে বলি না। অর্ডার বা পেমেন্ট নিয়ে বলুন।', kind: 'local' };
    }

    return {
      text: 'আপনার কথাটা অর্ডার/পেমেন্ট হিসেবে মিলাতে পারিনি। Order ID, পেমেন্ট বা স্ট্যাটাস লিখুন — শুধু আপনার ডেটা দিয়ে উত্তর দেব।',
      kind: 'open',
    };
  };

  const callGemini = async (userMsg: string, history: Message[]): Promise<string> => {
    const facts = customerFacts();
    const systemPrompt =
      `তুমি BAS, Bake Art Style-এর customer-support agent। শুধু এই কাস্টমারের জন্য কথা বলো।\n\n` +
      `নিয়ম:\n` +
      `1. কাস্টমার যা জিজ্ঞেস করেছে শুধু সেটার উত্তর দাও। মেনু, অ্যাডমিন, অন্য ফিচার, গল্প — না চাইলে বলো না।\n` +
      `2. অন্য কাস্টমারের অর্ডার/পেমেন্ট কখনো দেখাবে না, মিক্স করবে না, invent করবে না।\n` +
      `3. Order ID, payment, status শুধু নিচের THIS CUSTOMER facts থেকে। না থাকলে বলো পাইনি, ID চাও।\n` +
      `4. অ্যাপের সাধারণ নিয়ম (জোন, কীভাবে অর্ডার) শুধু তখনই যখন তারা সেটা চায়।\n` +
      `5. বাংলা/Banglish, ২–৬ লাইন, উষ্ণ কিন্তু সংক্ষিপ্ত।\n` +
      `6. Admin PIN, অন্য ইউজার, অভ্যন্তরীণ সেটিংস কখনো না।\n\n` +
      `${facts}`;
    const recentHistory = history.slice(-8).map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nConversation so far:\n${recentHistory}\nUser: ${userMsg}` }] }] }),
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
    const nextMessages = [...messages, { role: 'user' as const, text, time: new Date() }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const local = agentReply(text);
      if (local.kind === 'grounded' || local.kind === 'local' || !geminiKey) {
        await new Promise((r) => setTimeout(r, 280));
        addBot(local.text);
        if (local.kind === 'open') setShowQuick(true);
        return;
      }

      try {
        const reply = await callGemini(text, nextMessages);
        addBot(reply);
      } catch {
        addBot(local.text);
        setShowQuick(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!embedded && !fullPage && !chatOpen) return null;

  const latestBotText = [...messages].reverse().find((message) => message.role === 'bot')?.text ?? '';
  const showWhatsappCta = /WhatsApp|হোয়াটসঅ্যাপ|সাপোর্ট|support/i.test(latestBotText);

  const panel = (
    <div
      className={`flex flex-col overflow-hidden bg-surface ${fullPage ? 'h-full' : embedded ? 'rounded-[24px] border border-border shadow-card' : 'h-full'}`}
      style={embedded && !fullPage ? { height: 440 } : undefined}
    >
      <header className={`flex shrink-0 items-center gap-3 border-b border-primary-hover bg-primary px-4 text-white ${fullPage ? 'pb-4 pt-[max(18px,env(safe-area-inset-top))]' : 'py-3.5'}`}>
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/18 shadow-[0_2px_8px_rgba(44,44,44,0.12)]">
          <Cake className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">BAS agent</p>
          <p className="truncate text-[11px] text-white/80">শুধু আপনার অর্ডার, পেমেন্ট ও ID</p>
        </div>
        {(!embedded || fullPage) && (
          <button type="button" onClick={() => (onClose ? onClose() : setChatOpen(false))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/15 transition active:scale-90" aria-label="Close chat">
            <X className="h-5 w-5" />
          </button>
        )}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-bg p-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-col items-center px-5 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-secondary text-primary shadow-card"><Cake className="h-7 w-7" strokeWidth={1.5} /></span>
            <p className="mt-3 text-[15px] font-semibold text-text">হ্যালো! আমি আপনার BAS এজেন্ট</p>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">আপনি যা বলবেন — অর্ডার, পেমেন্ট, ID — সেটাই বিশ্লেষণ করব। অন্য কাস্টমারের তথ্য মিশাব না।</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[18px] px-3 py-2.5 text-[12px] leading-relaxed shadow-card ${message.role === 'user' ? 'rounded-br-sm bg-primary text-white' : 'rounded-bl-sm border border-border bg-surface text-text'}`}>
              {message.image && <img src={message.image} alt="Reference" className="mb-2 max-h-40 w-full rounded-[12px] object-cover" />}
              {message.text.split('\n').map((line, lineIndex, lines) => <span key={lineIndex}>{line}{lineIndex < lines.length - 1 && <br />}</span>)}
            </div>
          </div>
        ))}
        {imageUploading && (
          <div className="flex justify-end"><div className="flex items-center gap-2 rounded-[18px] rounded-br-sm bg-primary/80 px-3 py-2.5 text-[12px] text-white shadow-card"><Loader2 className="h-3.5 w-3.5 animate-spin" />ছবি পাঠানো হচ্ছে...</div></div>
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-[18px] rounded-bl-sm border border-border bg-surface px-3 py-2.5 shadow-card">
              <span className="flex gap-1" aria-label="BAS is responding">{[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${dot * 0.15}s` }} />)}</span>
              <span className="text-[11px] font-medium text-text-secondary">BAS is responding</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {showQuick && (
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-divider bg-surface px-3 py-2.5">
          {QUICK_REPLIES.map((reply) => (
            <button key={reply.label} type="button" onClick={() => send(reply.q)} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-semibold text-primary transition active:scale-95">{reply.label}</button>
          ))}
        </div>
      )}

      {imageError && <p className="shrink-0 bg-error/10 px-4 py-2 text-[11px] font-semibold text-error">{imageError}</p>}

      <div className="flex shrink-0 items-center gap-2 border-t border-divider bg-surface px-3 py-3">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageUploading} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-secondary text-primary transition active:scale-90 disabled:opacity-40" aria-label="Send reference image" title="রেফারেন্স ছবি পাঠান"><Camera className="h-4 w-4" /></button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && send()}
          placeholder="অর্ডার, পেমেন্ট বা ID লিখুন..."
          className="h-10 min-w-0 flex-1 rounded-[14px] border border-border bg-bg px-3 text-[12px] text-text outline-none transition placeholder:text-text-tertiary focus:border-accent focus:ring-4 focus:ring-primary/10"
        />
        <button type="button" onClick={() => send()} disabled={!input.trim() || loading} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary text-white shadow-btn transition hover:bg-primary-hover disabled:opacity-40 active:scale-90" aria-label="Send message"><Send className="h-4 w-4" /></button>
      </div>

      {showWhatsappCta && (
        <div className="shrink-0 border-t border-success/20 bg-success/10 px-3 py-2 anim-up">
          <a
            href={settings.whatsappNumber.replace(/\D/g, '').length >= 10 ? waLink(settings.whatsappNumber, 'হ্যালো! আমার একটা প্রশ্ন আছে।') : '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => { if (settings.whatsappNumber.replace(/\D/g, '').length < 10) event.preventDefault(); }}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-success/10 px-4 text-[12px] font-semibold text-success transition hover:bg-success/15 active:scale-[.98]"
          >
            <Phone className="h-4 w-4" /> সরাসরি WhatsApp-এ কথা বলুন
          </a>
        </div>
      )}
    </div>
  );

  if (embedded) return panel;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-end justify-center bg-ink/45 p-4 sm:items-center"
      onClick={() => setChatOpen(false)}
    >
      <div
        className="h-[82vh] w-full overflow-hidden rounded-[28px] border border-border bg-surface shadow-float sm:h-[600px] sm:max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {panel}
      </div>
    </div>
  );
}
