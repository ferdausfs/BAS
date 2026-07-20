import { useEffect, useRef, useState } from 'react';
import { Phone, Send, Cake, X, Camera, Loader2 } from 'lucide-react';
import { useAuthStore, useOrders, useSettingsStore, useUI } from '../lib/store';
import { useProducts } from '../hooks/useProducts';
import { waLink } from '../lib/utils';
import { uploadToCloudinary } from '../lib/firebase';

interface Message {
  role: 'user' | 'bot';
  text: string;
  time: Date;
  image?: string;
}

const QUICK_REPLIES = [
  { q: 'তুমি কী করতে পারো?', label: 'কী পারো?' },
  { q: 'কেক মেনু দেখাও', label: 'মেনু' },
  { q: 'অর্ডার কীভাবে করবো?', label: 'অর্ডার' },
  { q: 'ডেলিভারি কোথায় দাও?', label: 'জোন' },
  { q: 'অর্ডার ট্র্যাক করবো কীভাবে?', label: 'ট্র্যাক' },
  { q: 'মানুষের সাথে কথা বলতে চাই', label: 'সাপোর্ট' },
];

const formatBDT = (n: number) => `৳${n.toLocaleString('en-BD')}`;
const chatHistoryKey = (userId?: string, orderId?: string | null) =>
  orderId ? `bakeart-chat-order-${orderId}` : `bakeart-chat-history-${userId || 'guest'}`;

interface Props {
  embedded?: boolean;
  fullPage?: boolean;
  onClose?: () => void;
}

export function ChatBot({ embedded = false, fullPage = false, onClose }: Props) {
  // মূল history load এখন নিচের useEffect-এ হয় ([user?.id, chatOrderContext] অনুযায়ী) —
  // এখানে খালি রাখা হলো যাতে order-context থেকে খোলা হলে পুরনো general history flash না করে
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettingsStore();
  const { products } = useProducts();
  const { orders } = useOrders();
  const { user } = useAuthStore();
  const { chatOpen, setChatOpen, chatOrderContext } = useUI();
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || settings.geminiApiKey || '';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(chatHistoryKey(user?.id, chatOrderContext));
      if (!raw) {
        if (chatOrderContext) {
          // নির্দিষ্ট order থেকে chat খোলা হয়েছে — পুরনো general history এখানে দেখানো হবে না,
          // এই order নিয়ে fresh conversation শুরু হবে
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
    try {
      localStorage.setItem(chatHistoryKey(user?.id, chatOrderContext), JSON.stringify(messages));
    } catch {
      // ignore storage failures
    }
  }, [messages, user?.id, chatOrderContext]);

  const addBot = (text: string) => {
    setMessages((m) => [...m, { role: 'bot', text, time: new Date() }]);
  };

  // Reference cake ছবি পাঠানো — user শুধু ছবি পাঠাতে পারবে (Cloudinary-তে upload),
  // bot নিজে থেকে ছবি বুঝে respond করে না, শুধু acknowledgment + support route দেয়
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
      addBot('ছবিটা পেয়েছি! রেফারেন্স হিসেবে রাখা হলো — অর্ডার করার সময় Customize-এ message-এ mention করে দিতে পারেন, বা সরাসরি WhatsApp-এ পাঠিয়ে দিলে team দ্রুত দেখতে পারবে।');
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
      // word-boundary aware: 'kha' এখন আর 'opekkha'-এর ভিতরের substring হিসেবে match করবে না
      const re = new RegExp(`(^|[^a-z0-9\\u0980-\\u09FF])${escaped}([^a-z0-9\\u0980-\\u09FF]|$)`, 'i');
      return re.test(text);
    });

  const supportText = () => {
    const digits = settings.whatsappNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      return 'WhatsApp number এখনো সেট করা নেই। Admin Panel → Settings থেকে WhatsApp Number দিন, তারপর আমি সরাসরি WhatsApp link দেখাতে পারবো।';
    }
    return `আমাদের টিমের সাথে সরাসরি কথা বলতে পারেন\n\nনিচের সবুজ WhatsApp বাটনটি চাপুন — সাথে সাথে চ্যাট খুলে যাবে।\n\nসাধারণত সকাল ৯টা থেকে রাত ৯টা পর্যন্ত সাপোর্ট পাওয়া যায়।`;
  };

  const menuText = () => {
    const list = products
      .slice(0, 6)
      .map((p, i) => `${i + 1}. ${p.name} — ${formatBDT(p.price)}\n   ${p.tagline}`)
      .join('\n');
    return `আমাদের জনপ্রিয় কেকগুলো\n\n${list}\n\nআরও দেখতে Shop/Browse tab খুলুন। কোনো কেক পছন্দ হলে Add to cart বা Customize করতে পারবেন।`;
  };

  const appGuideText = () =>
    `আমি BAS — Bake Art Style app-এর সহকারী। আমি এগুলোতে সাহায্য করতে পারি:\n\n` +
    `• কেক মেনু, দাম ও বেস্টসেলার দেখানো\n` +
    `• কাস্টম কেক অর্ডার করার ধাপ বলা\n` +
    `• ডেলিভারি জোন/সময়/চার্জ বোঝানো\n` +
    `• Payment বোঝানো — ১/৩ অগ্রিম (bKash/Nagad) + বাকি delivery-তে (Cash/bKash/Nagad)\n` +
    `• Cart, Wishlist, Checkout, Order tracking বুঝিয়ে দেওয়া\n` +
    `• সমস্যা হলে WhatsApp support link দেওয়া\n\n` +
    `আপনি সাধারণভাবেও কথা বলতে পারেন — যেমন “kemon aso”, “ki koro”, “order korte chai”।`;

  const adminGuideText = () =>
    `Admin Panel-এ যা আছে\n\n` +
    `• Dashboard: revenue, pending order, today order, products\n` +
    `• Orders: অর্ডার দেখা, status দেখা, CSV export\n` +
    `• Products: cake add/edit/delete, image upload\n` +
    `• Gallery: gallery photo add/delete\n` +
    `• Reviews: review approve/delete\n` +
    `• Customers: customer list, total spent, order count\n` +
    `• Zones: delivery zone add/remove, zone gating on/off\n` +
    `• Settings: admin email/PIN, WhatsApp, delivery fee, promo, Gemini API key\n\n` +
    `Admin খুলতে Profile footer logo ৫ বার tap করুন → admin email দিয়ে login → PIN দিন।`;

  const orderText = () =>
    `অর্ডার করার ধাপ\n\n` +
    `1. Shop/Browse থেকে কেক সিলেক্ট করুন\n` +
    `2. Size, flavour, topping বা message customize করুন\n` +
    `3. Add to cart চাপুন\n` +
    `4. Cart → Checkout এ নাম, ফোন, ঠিকানা দিন\n` +
    `5. অর্ডার নিশ্চিত করুন, তারপর ১/৩ টাকা অগ্রিম bKash/Nagad-এ পাঠিয়ে screenshot upload করুন — কেক প্রস্তুতি তখনই শুরু হবে\n\n` +
    `অর্ডার হলে Order ID পাবেন, তারপর Tracking screen থেকে status দেখতে পারবেন।`;

  const zoneText = () => {
    const zones = (settings.allowedZones ?? []).join(', ');
    return `বর্তমান delivery zones\n${zones || 'এখনো zone সেট করা নেই'}\n\nCheckout-এর আগে location check করা যায়। আপনার এলাকা না থাকলে WhatsApp-এ কথা বলুন — admin চাইলে zone add করতে পারবেন।`;
  };

  const paymentText = () => {
    const minPrice = products.length ? Math.min(...products.map((p) => p.price)) : 0;
    return `Payment — ২ ধাপে\n\n` +
      `1️⃣ অগ্রিম (১/৩ টাকা) — এখনই, checkout-এর শেষ ধাপে। কেক প্রস্তুতি শুরু হয় এই টাকা পাওয়ার পর। শুধু bKash বা Nagad-এ দিতে হয় (অনলাইন), আর screenshot upload করতে হয় verify-এর জন্য।\n` +
      `2️⃣ বাকি (২/৩ টাকা) — ডেলিভারির সময় দেবেন, Cash on Delivery বা bKash/Nagad যেভাবে সুবিধা।\n\n` +
      `দাম শুরু ${formatBDT(minPrice)} থেকে। Delivery fee ${formatBDT(settings.deliveryFee)}। ${settings.promoEnabled ? `Promo code ${settings.promoCode} দিলে ${settings.promoPercent}% discount পেতে পারেন।` : ''}`;
  };

  const getSavedCustomer = (): { name?: string; phone?: string; address?: string; district?: string; payment?: string } => {
    try {
      const key = user?.id ? `bakeart-customer-profile-${user.id}` : 'bakeart-customer-profile';
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      return {};
    }
  };

  const myOrders = () => {
    const saved = getSavedCustomer();
    const userName = user?.name?.trim().toLowerCase();
    const userEmail = user?.email?.trim().toLowerCase();
    const phone = saved.phone?.trim();
    const savedName = saved.name?.trim().toLowerCase();

    const matched = orders.filter((o) => {
      const orderName = o.customer?.name?.trim().toLowerCase();
      const orderEmail = o.customer?.email?.trim().toLowerCase();
      return (
        (!!phone && o.customer?.phone === phone) ||
        (!!userEmail && orderEmail === userEmail) ||
        (!!savedName && orderName === savedName) ||
        (!!userName && orderName === userName)
      );
    });

    return (matched.length ? matched : orders).slice().sort((a, b) => b.createdAt - a.createdAt);
  };

  const orderStatusText = (rawQuestion: string) => {
    const normalizedQuestion = rawQuestion.toLowerCase();
    const idMatch = normalizedQuestion.match(/bas[-\s]?\d{3,}[a-z0-9]{0,4}/i);
    const cleanId = idMatch?.[0]?.replace(/[-\s]/g, '').toUpperCase();

    const list = cleanId
      ? orders.filter((o) => o.id.toUpperCase() === cleanId)
      : myOrders();

    if (list.length === 0) {
      return `আপনার কোনো saved order এখনো পাচ্ছি না।\n\nযদি order করে থাকেন, Order ID লিখুন — যেমন BAS123456। Profile → Orders থেকেও status দেখতে পারবেন।`;
    }

    const latest = list[0];
    const itemText = latest.items.map((i) => `${i.name} ×${i.quantity}`).join(', ');
    const statusMap: Record<string, string> = {
      placed: 'অর্ডার প্লেস হয়েছে',
      confirmed: 'অর্ডার confirm হয়েছে',
      baking: 'কেক bake হচ্ছে',
      ready: 'কেক ready',
      out: 'ডেলিভারির জন্য বের হয়েছে',
      delivered: 'ডেলিভারি complete হয়েছে',
      cancelled: 'অর্ডার cancel হয়েছে',
    };

    const cancelLine = latest.status === 'cancelled' && latest.cancelReason ? `\nবাতিলের কারণ: ${latest.cancelReason}` : '';
    return `আপনার latest order status\n\nOrder #${latest.id} — ${statusMap[latest.status] ?? latest.status}${cancelLine}\nItems: ${itemText}\nTotal: ${formatBDT(latest.total)}\nDelivery: ${latest.delivery.date} · ${latest.delivery.time}\n\nআরও detail দেখতে Orders tab → Open tracking চাপুন।`;
  };

  // "payment koresi / diyechi" জাতীয় completed-action message-এর জন্য —
  // paymentText()-এর মতো process আবার না বলে, বরং user-এর real order status দেখানো হয়
  const paymentDoneText = () => {
    const latest = myOrders()[0];
    const statusMap: Record<string, string> = {
      placed: 'অর্ডার প্লেস হয়েছে',
      confirmed: 'অর্ডার confirm হয়েছে',
      baking: 'কেক bake হচ্ছে',
      ready: 'কেক ready',
      out: 'ডেলিভারির জন্য বের হয়েছে',
      delivered: 'ডেলিভারি complete হয়েছে',
      cancelled: 'অর্ডার cancel হয়েছে',
    };
    if (!latest) {
      return `Payment পাঠানোর জন্য ধন্যবাদ! 🙏\n\nতবে আপনার নামে এখনো কোনো order খুঁজে পাচ্ছি না — Order ID (যেমন BAS123456) লিখুন, খুঁজে বের করি।\n\nScreenshot verify হতে কিছুক্ষণ সময় লাগতে পারে। জলদি দরকার হলে সরাসরি WhatsApp-এ screenshot পাঠান:\n\n${supportText()}`;
    }
    return `বুঝলাম, আপনি payment পাঠিয়ে দিয়েছেন 🙏\n\nআপনার latest order #${latest.id} এখন "${statusMap[latest.status] ?? latest.status}" অবস্থায় আছে।\n\nPayment পাঠানোর পরেও status আপডেট না হলে screenshot verify হতে কিছুক্ষণ সময় লাগতে পারে (admin manually check করেন)। জলদি দরকার হলে সরাসরি WhatsApp-এ screenshot পাঠিয়ে জানান:\n\n${supportText()}`;
  };

  const ruleBasedReply = (question: string): { text: string; matched: boolean } => {
    const q = normalize(question);

    // Order-ID-এর মতো টেক্সট (যেমন BAS616606J7Z) দেখলেই সরাসরি real data দিয়ে answer —
    // কখনো Gemini-কে fabricate করতে দেওয়া যাবে না (keyword match লাগবে না)
    if (/bas[-\s]?\d{3,}[a-z0-9]{0,4}/i.test(question)) {
      return { text: orderStatusText(question), matched: true };
    }

    if (has(q, ['hi', 'hello', 'hey', 'হাই', 'হ্যালো', 'সালাম', 'আসসালামু', 'salam', 'assalamu', 'helo', 'helo', 'helllo', 'ki obostha', 'ki khobor', 'ki korcho'])) {
      return { text: 'হ্যালো! আমি BAS। কেক অর্ডার, দাম, ডেলিভারি, tracking বা app ব্যবহার নিয়ে যা জানতে চান বলুন।', matched: true };
    }

    if (has(q, ['kemon aso', 'কেমন আছ', 'kamon acho', 'kmn aso', 'how are you'])) {
      return { text: 'আমি ভালো আছি, ধন্যবাদ! আপনি কেমন আছেন? আজ কি কোনো birthday/anniversary cake লাগবে, নাকি শুধু app নিয়ে সাহায্য চান?', matched: true };
    }

    if (has(q, ['ki koro', 'কি কর', 'ki korte paro', 'কী করতে পারো', 'what can you do', 'tumi ki', 'তুমি কে', 'who are you'])) {
      return { text: appGuideText(), matched: true };
    }

    if (has(q, ['thanks', 'thank you', 'ধন্যবাদ', 'tnx', 'thx'])) {
      return { text: 'স্বাগতম! আর কিছু জানতে চাইলে বলুন — আমি আছি।', matched: true };
    }

    if (has(q, ['bye', 'good night', 'বিদায়', 'আল্লাহ হাফেজ'])) {
      return { text: 'আল্লাহ হাফেজ! ভালো থাকবেন। কেক লাগলে আবার Knock করবেন।', matched: true };
    }

    if (has(q, ['admin', 'অ্যাডমিন', 'panel', 'প্যানেল', 'dashboard', 'ড্যাশবোর্ড'])) {
      return { text: adminGuideText(), matched: true };
    }

    if (has(q, ['menu', 'মেনু', 'cake', 'কেক', 'product', 'প্রোডাক্ট', 'দেখাও', 'kek', 'cake koto', 'ki cake', 'kon cake', 'ki ache', 'product list', 'menu ta', 'dam koto', 'ki pawa jay', 'kemon cake', 'cake show'])) {
      return { text: menuText(), matched: true };
    }

    if (has(q, ['bestsell', 'popular', 'বেস্ট', 'জনপ্রিয়', 'ভালো কোন', 'recommend', 'সাজেস্ট'])) {
      const top = products.find((p) => p.bestseller) ?? products[0];
      return {
        text: top
          ? `আমার suggestion: ${top.name}\nদাম ${formatBDT(top.price)} — ${top.tagline}\n\nBirthday/anniversary হলে এটা safe choice। চাইলে Customize করে message/topping দিতে পারবেন।`
          : 'এখনো product list load হয়নি। একটু পরে আবার চেষ্টা করুন।',
        matched: true,
      };
    }

    if (
      has(q, ['track', 'tracking', 'ট্র্যাক', 'status', 'স্ট্যাটাস', 'order id', 'খবর', 'khobor', 'khabar', 'koi', 'কই']) ||
      (has(q, ['order', 'অর্ডার']) && has(q, ['amar', 'আমার', 'my', 'খবর', 'khobor', 'khabar', 'status', 'স্ট্যাটাস']))
    ) {
      return { text: orderStatusText(question), matched: true };
    }

    if (has(q, ['order', 'অর্ডার', 'kinbo', 'kivabe kinbo', 'কিনব', 'checkout', 'cart', 'কার্ট', 'order dite', 'order korte', 'kivabe order', 'order process', 'kibhabe', 'ki vabe', 'kemon kore', 'kemon vabe'])) {
      return { text: orderText(), matched: true };
    }

    if (has(q, ['custom', 'customize', 'কাস্টম', 'কাস্টমাইজ', 'design', 'ডিজাইন', 'message', 'নাম লিখ'])) {
      return { text: `Custom cake করতে পারবেন।\n\nProduct খুলুন → Customize চাপুন → size/flavour/topping/message দিন → cart এ add করুন।\n\nআপনি চাইলে cake-এর ওপর নাম/ছোট message লিখতে পারেন।`, matched: true };
    }

    if (has(q, ['delivery', 'ডেলিভারি', 'zone', 'জোন', 'area', 'এলাকা', 'কোথায়', 'kothay', 'লোকেশন', 'deliver', 'pathabo', 'pathate', 'pathano', 'niye jabe', 'niye asbe', 'delivery ki', 'deliver ki', 'kothay daw', 'kothay pathaw'])) {
      return { text: zoneText(), matched: true };
    }

    if (has(q, ['time', 'সময়', 'কতক্ষণ', 'kotokkhon', 'delivery estimate'])) {
      return { text: `ডেলিভারি estimate: ${settings.deliveryEstimate}\n\nসময় এলাকা, অর্ডার rush এবং cake customization অনুযায়ী বদলাতে পারে। Same-day order চাইলে যত দ্রুত সম্ভব checkout করুন।`, matched: true };
    }

    // Delay complaint — "deri hocche", "ashe nai" ইত্যাদি generic delivery/zone info-এর বদলে
    // real order status + empathy + support দেখাবে
    if (has(q, ['deri', 'দেরি', 'delay', 'ashe nai', 'asheni', 'আসেনি', 'ekhono ashe nai', 'koto deri', 'onek deri', 'late hoye gese', 'time shesh hoye gese', 'ekhono pai nai'])) {
      return {
        text: `${orderStatusText('')}\n\nদেরির জন্য দুঃখিত 🙏 উপরের status অনুযায়ী থাকার পরেও যদি অনেক দেরি মনে হয়, সরাসরি WhatsApp-এ জানান — আমরা দ্রুত check করে জানাবো।\n\n${supportText()}`,
        matched: true,
      };
    }

    // "payment koresi / diyechi / already dise" — user বলছে টাকা পাঠিয়ে দিয়েছে,
    // এটা payment-process জানতে চাওয়া না — তাই paymentText()-এর আগেই ধরতে হবে
    if (
      has(q, ['payment', 'পেমেন্ট', 'taka', 'টাকা', 'bkash', 'bikash', 'nagad', 'send', 'money']) &&
      has(q, ['koresi', 'kore disi', 'diyechi', 'diye disi', 'dise', 'disi', 'already', 'hoye gese', 'kore fellsi', 'দিয়েছি', 'হয়ে গেছে', 'send korsi', 'pathaisi', 'pathiye disi', 'screenshot dise', 'screenshot disi'])
    ) {
      return { text: paymentDoneText(), matched: true };
    }

    // Wrong/damaged item complaint — এখন পর্যন্ত এই intent ধরার কোনো branch ছিল না,
    // fallback message-এ চলে যেত যেটা food-damage complaint-এর জন্য একদম উপযুক্ত না
    if (has(q, ['wrong item', 'ভুল কেক', 'vul cake', 'vul order eshe', 'damage', 'damaged', 'নষ্ট', 'noshto', 'vanga', 'bhanga', 'pocha', 'pochano', 'kharap ese', 'kharap cake', 'expired cake'])) {
      return {
        text: `দুঃখিত এই সমস্যার জন্য! 🙏\n\nCake ভুল আসা বা damage হয়ে যাওয়া হলে যত দ্রুত সম্ভব ছবিসহ জানানো ভালো, যাতে দ্রুত ব্যবস্থা নেওয়া যায়।\n\n${supportText()}`,
        matched: true,
      };
    }

    // Promo code not working — price/payment block-এ পড়ে গিয়ে generic info পেত আগে
    if (
      has(q, ['promo', 'discount', 'ডিসকাউন্ট', 'কুপন', 'coupon', 'code']) &&
      has(q, ['kaj korche na', 'hocche na', 'kore na', 'na hocche', 'invalid', 'error', 'কাজ করছে না', 'হচ্ছে না'])
    ) {
      return {
        text: settings.promoEnabled
          ? `Promo code "${settings.promoCode}" দিলে ${settings.promoPercent}% discount পাওয়ার কথা — checkout screen-এ বানান ঠিক আছে কিনা (case অনুযায়ী) check করুন।\n\nতাও কাজ না করলে সরাসরি জানান:\n\n${supportText()}`
          : `এই মুহূর্তে কোনো promo code active নেই। নতুন offer এলে app-এ জানিয়ে দেওয়া হবে।`,
        matched: true,
      };
    }

    if (has(q, ['price', 'দাম', 'tk', 'টাকা', 'payment', 'পেমেন্ট', 'bkash', 'bikash', 'nagad', 'cash', 'koto taka', 'koto dam', 'daam', 'dam', 'taka koto', 'cost', 'charge', 'fee', 'koye taka', 'koto koye'])) {
      return { text: paymentText(), matched: true };
    }

    if (has(q, ['track', 'tracking', 'ট্র্যাক', 'status', 'স্ট্যাটাস', 'order id'])) {
      return { text: `Order tracking\n\nOrder confirm হলে যে Order ID পাবেন, সেটি Tracking screen-এ লিখুন। Orders page থেকেও “Open tracking” চাপতে পারবেন। Status: placed → confirmed → baking → ready → out → delivered।`, matched: true };
    }

    if (has(q, ['wishlist', 'wish', 'heart', 'পছন্দ', 'save'])) {
      return { text: `Wishlist ব্যবহার করতে cake card-এর heart চাপুন। পরে Wishlist screen থেকে saved cake দেখতে, remove করতে বা cart-এ add করতে পারবেন।`, matched: true };
    }

    if (has(q, ['support', 'help', 'সাহায্য', 'মানুষ', 'human', 'whatsapp', 'contact', 'যোগাযোগ', 'problem', 'somossa', 'shomossha', 'issue', 'help lagbe', 'help koro', 'darkar', 'dorkar'])) {
      return { text: supportText(), matched: true };
    }

    // User নিজে order cancel করতে চাইছে (future intent) — এটা "কেন cancel হলো" প্রশ্নের থেকে আলাদা,
    // নিচের block-টা ধরে নেয় order ইতিমধ্যে cancelled, তাই আগে এখানেই ধরতে হবে
    if (has(q, ['cancel korte chai', 'cancel korbo', 'order cancel korte', 'বাতিল করতে চাই', 'বাতিল করব', 'ami cancel korbo', 'cancel dite chai'])) {
      return {
        text: `Order cancel করতে চাইলে —\n\nCake preparation এখনো শুরু না হয়ে থাকলে সরাসরি WhatsApp-এ Order ID দিয়ে জানান, আমরা cancel করে দেবো।\n\nBaking শুরু হয়ে গেলে cancel নাও করা যেতে পারে (ingredient/prep নষ্ট হয়ে যায় বলে) — তাই যত দ্রুত সম্ভব জানানো ভালো।\n\n${supportText()}`,
        matched: true,
      };
    }

    if (has(q, ['cancel', 'refund', 'বাতিল', 'রিফান্ড'])) {
      const cancelled = myOrders().filter((o) => o.status === 'cancelled');
      const latestCancelled = cancelled[0];
      if (latestCancelled) {
        const reasonLine = latestCancelled.cancelReason
          ? `কারণ: ${latestCancelled.cancelReason}`
          : 'কারণ এখনো লেখা হয়নি — সরাসরি জানতে সাপোর্টে যোগাযোগ করুন।';
        return {
          text: `Order #${latestCancelled.id} বাতিল হয়েছে।\n\n${reasonLine}\n\nআপনার পেমেন্ট ওয়ালেটে ফেরত দেওয়া হয়েছে বা দেওয়া হবে। আবার অর্ডার করতে চাইলে Tracking screen থেকে "পুনরায় অর্ডার করুন" চাপুন।\n\nকিছু জিজ্ঞাসা থাকলে:\n${supportText()}`,
          matched: true,
        };
      }
      return { text: `Order cancel/refund বিষয়ে দ্রুত support-এ কথা বলাই ভালো। Cake preparation শুরু হয়ে গেলে cancel policy আলাদা হতে পারে।\n\n${supportText()}`, matched: true };
    }

    // New friendly chat blocks (Task I2)
    if (has(q, ['khabar', 'khaite', 'khite', 'bhook', 'bhuk', 'hungry', 'kha', 'misti'])) {
      return { text: "মিষ্টি কিছু খেতে মন চাইলে একটা কেক অর্ডার করুন। আমাদের মেনু দেখতে বলুন!", matched: true };
    }

    if (has(q, ['birthday', 'janmadin', 'anniversary', 'wedding', 'biye', 'celebration', 'party', 'উৎসব', 'biday', 'congratulation'])) {
      return { text: "অভিনন্দন! বিশেষ দিনকে আরও মিষ্টি করুন একটা custom কেক দিয়ে। Size, flavor, message সব customize করা যায়। চাইলে মেনু দেখাই?", matched: true };
    }

    if (has(q, ['sundor', 'sundar', 'darun', 'nice', 'good', 'chomotkar', 'chomokdar', 'wow', 'great', 'ভালো', 'চমৎকার', 'সুন্দর', 'দারুণ'])) {
      return { text: "ধন্যবাদ! আপনার ভালো লাগলেই আমরা খুশি। আর কিছু জানতে চান?", matched: true };
    }

    if (has(q, ['bore', 'bored', 'bor lage', 'ektu gopo kori', 'kotha boli', 'time pass', 'notun kiso'])) {
      return { text: "আমি শুধু বকবক করা জানি। তবে cake নিয়ে গল্প করতে পারি সারাদিন! নতুন কোনো flavor try করতে চান?", matched: true };
    }

    return {
      text: `হুম, ঠিক বুঝলাম না। একটু অন্যভাবে বলুন? বা এগুলো try করতে পারেন:\n• "কেক মেনু দেখাও"\n• "অর্ডার করতে চাই"\n• "ডেলিভারি কোথায় দাও"\n• "মানুষের সাথে কথা বলব"`,
      matched: false,
    };
  };

  const callGemini = async (userMsg: string, history: Message[]): Promise<string> => {
    const productList = products.map((p) => `• ${p.name} — ${formatBDT(p.price)}: ${p.tagline}`).join('\n');
    const zones = (settings.allowedZones ?? []).join(', ');
    const systemPrompt = `তুমি "BAS", Bake Art Style বেকারির friendly AI assistant। তোমার সাথে যে কোনো বিষয়ে কথা বলা যাবে — সাধারণ গল্প, প্রশ্ন, বা বেকারির ব্যাপার।

কথা বলার ধরন:
- বাংলা বা Banglish — user যেভাবে লেখে সেভাবে reply করো
- Short, warm, friendly — 2-5 লাইনের মধ্যে রাখো সাধারণত
- Misspelled বা ভাঙা বাংলা হলেও বোঝার চেষ্টা করো, জিজ্ঞেস করো না "আপনি কী বললেন" — নিজেই best guess করো
- Cake/bakery-related হলে নিচের info ব্যবহার করো, না হলে স্বাভাবিকভাবে কথা বলো
- কখনো "আমি শুধু cake-related প্রশ্নে সাহায্য করতে পারি" বলবে না — সব বিষয়ে friendly থাকো

Store info:
- Currency: BDT (৳)
- Delivery estimate: ${settings.deliveryEstimate}, fee: ৳${settings.deliveryFee}
- Zones: ${zones}
- Payment: ২ ধাপে — (1) অগ্রিম ১/৩ টাকা, checkout-এর শেষ ধাপে, শুধু bKash/Nagad (অনলাইন, screenshot লাগে) — কেক প্রস্তুতি শুরু হয় এই টাকা পাওয়ার পর, (2) বাকি ২/৩ টাকা ডেলিভারির সময়, Cash on Delivery বা bKash/Nagad যেকোনোটা
${settings.promoEnabled ? `- Promo: ${settings.promoCode} = ${settings.promoPercent}% off` : ''}

Products:
${productList}

উত্তর 2-6 লাইনের মধ্যে রাখো।`;
    const recentHistory = history.slice(-8).map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    
    // NOTE: client-side key — restrict this key in Google Cloud Console to your Vercel domain only
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
      const local = ruleBasedReply(text);
      if (local.matched || !geminiKey) {
        await new Promise((r) => setTimeout(r, 300));
        addBot(local.matched ? local.text : `${local.text}\n\n${!geminiKey ? 'Tip: set VITE_GEMINI_API_KEY (or save Gemini API Key in Admin Settings) for AI-powered free chat.' : ''}`.trim());
        if (!local.matched) setShowQuick(true);
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
          <p className="text-[15px] font-semibold">BAS support</p>
          <p className="truncate text-[11px] text-white/80">কেক, অর্ডার, tracking বা সাধারণ প্রশ্ন করুন</p>
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
            <p className="mt-3 text-[15px] font-semibold text-text">হ্যালো! আমি BAS</p>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">আপনার কেক বা অর্ডার নিয়ে যেকোনো প্রশ্ন লিখুন, অথবা নিচের একটি option বেছে নিন।</p>
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
          placeholder="মেসেজ লিখুন..."
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
