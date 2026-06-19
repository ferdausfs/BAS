import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Wallet, Check, Shield } from 'lucide-react';
import {
  useCart, useOrders, useUI, formatINR,
  cartSubtotal, qualifiesForFreeDelivery,
} from '../lib/store';

const PAYMENTS = [
  { id: 'apple',  label: 'Apple Pay', sub: 'Express', emoji: '' },
  { id: 'card',   label: 'Credit card', sub: 'Visa · MC · Amex', emoji: '' },
  { id: 'upi',    label: 'UPI', sub: 'GPay · PhonePe · Paytm', emoji: '' },
  { id: 'cash',   label: 'Cash on delivery', sub: 'Pay at your door', emoji: '' },
] as const;

const SLOTS = [
  { v: '10am - 12pm', hot: false },
  { v: '12pm - 2pm',  hot: false },
  { v: '4pm - 6pm',   hot: true },
  { v: '6pm - 8pm',   hot: false },
];

export default function CheckoutScreen() {
  const { items, clear } = useCart();
  const { placeOrder } = useOrders();
  const { back, go } = useUI();

  const [form, setForm] = useState({
    name: 'Aanya Sharma',
    phone: '+91 98765 43210',
    email: 'aanya@bakeartstyle.com',
    address: '12 Baker Lane, Apt 4B',
    city: 'Mumbai',
    pin: '400001',
    date: new Date().toISOString().slice(0, 10),
    time: '4pm - 6pm',
    payment: 'apple' as typeof PAYMENTS[number]['id'],
  });

  const subtotal = cartSubtotal(items);
  const delivery = items.length === 0 ? 0 : (qualifiesForFreeDelivery(subtotal) ? 0 : 49);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  const handleSubmit = () => {
    if (items.length === 0) return;
    const o = placeOrder({
      items,
      customer: { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, pin: form.pin },
      delivery: { date: form.date, time: form.time },
      payment: form.payment,
      subtotal, deliveryFee: delivery, total,
    });
    clear();
    go({ name: 'success', orderId: o.id });
  };

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col bg-cream">
        <Header title="Checkout" onBack={back} />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="text-5xl">🛒</div>
          <h2 className="mt-4 font-display text-[20px] font-bold text-ink">Nothing to checkout</h2>
          <p className="mt-1 text-[12px] text-ink-200">Add a cake first, then come back here.</p>
          <button onClick={back} className="btn-primary mt-5 h-12 rounded-2xl px-6 text-[13px] font-bold">
            Back to cakes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-cream">
      <Header title="Checkout" onBack={back} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-32 pt-1">
        {/* Items */}
        <Section icon={MapPin} title="Items in this order">
          <div className="space-y-2.5">
            {items.slice(0, 3).map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-cream">
                  <img src={it.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="line-clamp-1 text-[13px] font-bold text-ink">{it.name}</div>
                  <div className="text-[10.5px] text-ink-200">{it.size} · ×{it.quantity}</div>
                </div>
                <div className="font-display text-[13px] font-bold tabular text-ink">
                  {formatINR(it.price * it.quantity)}
                </div>
              </div>
            ))}
            {items.length > 3 && (
              <div className="text-center text-[11px] text-ink-200">
                +{items.length - 3} more items
              </div>
            )}
          </div>
        </Section>

        {/* Delivery */}
        <Section icon={MapPin} title="Delivery address" badge="Default">
          <div className="space-y-1 text-[12.5px]">
            <div className="font-bold text-ink">{form.name} · {form.phone}</div>
            <div className="text-ink-200">{form.address}, {form.city} · {form.pin}</div>
          </div>
          <button className="mt-3 inline-flex items-center gap-1 rounded-full bg-coral-50 px-3 py-1.5 text-[11.5px] font-bold text-coral active:scale-95">
            Change address
          </button>
        </Section>

        {/* Date & time */}
        <Section icon={Clock} title="Delivery time">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="h-11 w-full rounded-xl border border-ink-50 bg-white px-3 text-[13px] font-medium text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/15"
          />
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {SLOTS.map((s) => (
              <button
                key={s.v}
                onClick={() => setForm({ ...form, time: s.v })}
                className={`relative h-11 rounded-xl border-2 text-[12px] font-semibold transition active:scale-95 ${
                  form.time === s.v
                    ? 'border-coral bg-coral text-white shadow-[0_6px_16px_-8px_rgba(242,94,115,.5)]'
                    : 'border-ink-50 bg-white text-ink'
                }`}
              >
                {s.v}
                {s.hot && form.time !== s.v && (
                  <span className="absolute -top-1.5 -right-1.5 rounded-full bg-coral px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">
                    Popular
                  </span>
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Payment */}
        <Section icon={Wallet} title="Payment method">
          <div className="space-y-2">
            {PAYMENTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setForm({ ...form, payment: p.id })}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition active:scale-[.99] ${
                  form.payment === p.id
                    ? 'border-coral bg-coral-50/50'
                    : 'border-ink-50 bg-white'
                }`}
              >
                <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-ink">
                  <PaymentGlyph id={p.id} active={form.payment === p.id} />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-ink">{p.label}</div>
                  <div className="text-[10.5px] text-ink-200">{p.sub}</div>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full transition ${
                    form.payment === p.id ? 'bg-coral text-white' : 'border border-ink-50 bg-white'
                  }`}
                >
                  {form.payment === p.id && <Check className="h-3 w-3" strokeWidth={3} />}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Bill */}
        <Section title="Bill details" className="!p-0">
          <div className="space-y-2 px-4 py-4 text-[13px]">
            <Row label={`Subtotal (${items.length} items)`} value={formatINR(subtotal)} />
            <Row
              label="Delivery"
              value={delivery === 0 ? 'FREE' : formatINR(delivery)}
              positive={delivery === 0}
            />
            <Row label="Taxes (GST 5%)" value={formatINR(tax)} />
            <div className="h-px bg-ink-50" />
            <div className="flex items-center justify-between pt-1">
              <span className="font-display text-[15px] font-bold tracking-tight text-ink">Total</span>
              <span className="font-display text-[20px] font-bold tabular text-ink">{formatINR(total)}</span>
            </div>
          </div>
        </Section>

        <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-cream py-3 text-[11px] text-ink-200">
          <Shield className="h-3.5 w-3.5" />
          Secured by 256-bit SSL · PCI-DSS compliant
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="absolute right-0 bottom-0 left-0 z-30 border-t border-ink-50/80 bg-white/95 px-5 pt-3 pb-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-ink-200 uppercase">Pay</div>
            <div className="font-display text-[20px] font-bold tabular text-ink">{formatINR(total)}</div>
          </div>
          <button
            onClick={handleSubmit}
            className="btn-primary ml-auto flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-[14px] font-bold tracking-tight"
          >
            Place order
            <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between px-5 pt-3 pb-3">
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition active:scale-90"
        style={{ boxShadow: '0 1px 2px rgba(26,19,17,.03), 0 6px 16px -10px rgba(26,19,17,.2)' }}
      >
        <ArrowLeft className="h-[20px] w-[20px]" strokeWidth={2} />
      </button>
      <h1 className="font-display text-[16px] font-bold tracking-tight text-ink">{title}</h1>
      <div className="w-10" />
    </header>
  );
}

function Section({
  icon: Icon, title, badge, children, className = '',
}: {
  icon?: any;
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`mt-3 overflow-hidden rounded-2xl bg-white ${className}`}
      style={{ boxShadow: '0 1px 2px rgba(26,19,17,.02), 0 8px 24px -16px rgba(26,19,17,.16)' }}
    >
      <div className="flex items-center gap-2.5 border-b border-ink-50 px-4 py-3">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-coral-50 text-coral">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}
        <h3 className="font-display text-[14px] font-bold tracking-tight text-ink">{title}</h3>
        {badge && (
          <span className="ml-auto rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-bold text-coral">
            {badge}
          </span>
        )}
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-200">{label}</span>
      <span className={`tabular font-bold ${positive ? 'text-emerald-600' : 'text-ink'}`}>
        {value}
      </span>
    </div>
  );
}

function PaymentGlyph({ id, active }: { id: string; active?: boolean }) {
  const color = active ? '#fff' : '#fff';
  if (id === 'apple') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
        <path d="M16.5 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.9-.9-3.1-.9c-1.6 0-3 .9-3.8 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.4s1.6-.8 3-.8 1.8.8 3.1.8 2.1-.1 3.4-2.1c.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.7zM14.4 5.6c.6-.8 1.1-1.9.9-3-.9.1-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1-.1 2.1-.5 2.8-1.3z" />
      </svg>
    );
  }
  if (id === 'card') {
    return (
      <svg width="22" height="16" viewBox="0 0 22 16" fill={color}>
        <rect x="0" y="0" width="22" height="16" rx="2" fill={color} />
        <rect x="0" y="4" width="22" height="3" fill="#1a1311" />
      </svg>
    );
  }
  if (id === 'upi') {
    return (
      <svg width="22" height="16" viewBox="0 0 22 16" fill={color}>
        <rect x="0" y="0" width="22" height="16" rx="2" fill={color} />
        <text x="11" y="11" textAnchor="middle" fill="#1a1311" fontSize="7" fontWeight="800" fontFamily="Inter">UPI</text>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="2" fill={color} />
      <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    </svg>
  );
}