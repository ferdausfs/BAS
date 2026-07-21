import { useState, useEffect, useRef } from 'react';
import {
  X, Plus, Trash2, Edit3, Download, RefreshCw, Star, Image as ImageIcon,
  Users, MapPin, Clock, CheckCircle2, ChefHat, Package, Truck, PartyPopper, Cake,
  ArrowLeft, BarChart3, Tag, Settings, LogOut, Wifi, Battery, Home, ShieldCheck
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useOrdersHook } from '../hooks/useOrders';
import { useGallery } from '../hooks/useGallery';
import { useReviews } from '../hooks/useReviews';
import { useCustomers } from '../hooks/useCustomers';
import { useBanners } from '../hooks/useBanners';
import { useSettingsStore, useUI } from '../lib/store';
import { DEFAULT_SETTINGS } from '../lib/data';
import { formatINR, waLink } from '../lib/utils';
import type { Product, Order, Banner } from '../types';

export type AdminTab = 'analytics' | 'orders' | 'products' | 'banners' | 'gallery' | 'reviews' | 'customers' | 'zones' | 'settings';
export type AdminScreenState = 'launcher' | AdminTab;

const STATUS_LABELS: Record<string, string> = {
  placed: 'Placed', confirmed: 'Confirmed',
  baking: 'Baking', ready: 'Ready', out: 'Out for Delivery', delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_ICON: Record<string, typeof Clock> = {
  placed: Clock, confirmed: CheckCircle2,
  baking: ChefHat, ready: Package, out: Truck, delivered: PartyPopper,
  cancelled: X,
};

const EMPTY_PRODUCT = {
  id: '', name: '', tagline: '', description: '',
  price: 500, oldPrice: undefined as number | undefined,
  image: '', gallery: [] as string[],
  rating: 4.5, reviews: 0,
  occasion: 'birthday' as const,
  flavors: ['Chocolate', 'Vanilla', 'Strawberry'],
  weights: [{ size: '1 kg', price: 500 }],
  toppings: [] as string[],
  tags: [] as string[],
  bestseller: false,
  newArrival: true,
  tier: 'normal' as const,
  inStock: true,
  pricePerUnit: undefined as number | undefined,
  priceUnit: 'kg' as const,
};

const EMPTY_BANNER = {
  id: '', title: '', subtitle: '', image: '', tag: 'Shop Now', color: '#FFD6E4',
  type: 'new_item' as const, promoCode: '', productId: '', noticeText: '',
};

interface Props { onClose?: () => void; }

export function AdminPanel({ onClose }: Props) {
  const { settings, updateSettings } = useSettingsStore();
  const safeSettings = settings ?? DEFAULT_SETTINGS;
  const { products, saveProduct, deleteProduct, uploadProductImage } = useProducts();
  const { orders, fetchOrders, updateStatus, subscribeToNewOrders } = useOrdersHook();
  const { gallery, saveGalleryItem, deleteGalleryItem, uploadGalleryImage } = useGallery();
  const { reviews, deleteReview } = useReviews();
  const { customers, loading: customersLoading } = useCustomers();
  const { banners, saveBanner, deleteBanner, uploadBannerImage } = useBanners();
  const { clearNewOrders, addNotification } = useUI();

  const [screen, setScreen] = useState<AdminScreenState>('launcher');

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [localSettings, setLocalSettings] = useState(safeSettings);
  const [imgUploading, setImgUploading] = useState(false);
  const [bannerImgUploading, setBannerImgUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [newGalleryCaption, setNewGalleryCaption] = useState('');
  const [newZone, setNewZone] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | Order['status']>('all');
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<Order | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const productImgRef = useRef<HTMLInputElement>(null);
  const bannerImgRef = useRef<HTMLInputElement>(null);
  const galleryImgRef = useRef<HTMLInputElement>(null);

  // Lists initialization
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeGallery = Array.isArray(gallery) ? gallery : [];
  const safeBanners = Array.isArray(banners) ? banners : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];

  useEffect(() => {
    fetchOrders();
    clearNewOrders();
    const unsub = subscribeToNewOrders();
    return unsub;
  }, []);

  useEffect(() => { setLocalSettings(safeSettings); }, [safeSettings]);

  // Derived metrics
  const pendingCount = safeOrders.filter((o) => o && ['placed', 'confirmed', 'baking'].includes(o.status)).length;
  const totalRevenue = safeOrders.filter((o) => o && o.status === 'delivered').reduce((s, o) => s + (o ? o.total : 0), 0);
  const todayCount = safeOrders.filter((o) => o && o.createdAt && new Date(o.createdAt).toDateString() === new Date().toDateString()).length;

  const ORDER_STATUSES: Order['status'][] = ['placed', 'confirmed', 'baking', 'ready', 'out', 'delivered', 'cancelled'];
  const filteredOrders = orderFilter === 'all' ? safeOrders.filter(Boolean) : safeOrders.filter((o) => o && o.status === orderFilter);

  const CANCEL_REASON_PRESETS = [
    'গ্রাহক নিজে বাতিল চেয়েছেন',
    'পেমেন্ট যাচাই করা যায়নি',
    'ডেলিভারি জোনের বাইরে',
    'সময়মতো তৈরি করা সম্ভব না',
    'উপকরণ/স্টক নেই',
    'ভুল/ডুপ্লিকেট অর্ডার',
  ];

  const requestStatusChange = (o: Order, status: Order['status']) => {
    if (status === 'cancelled') {
      setCancelReasonInput('');
      setCancelModal(o);
      return;
    }
    updateStatus(o.id, status);
  };

  const confirmCancel = () => {
    if (!cancelModal) return;
    const reason = cancelReasonInput.trim();
    if (!reason) return;
    updateStatus(cancelModal.id, 'cancelled', reason);
    setCancelModal(null);
    setCancelReasonInput('');
  };

  const openPaymentScreenshot = async (pathOrUrl?: string) => {
    if (!pathOrUrl) return;
    window.open(pathOrUrl, '_blank');
  };

  const topProducts = Object.entries(
    safeOrders.filter(Boolean).reduce<Record<string, number>>((acc, o) => {
      if (o.items) {
        o.items.forEach((item) => {
          if (item && item.productId) {
            acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
          }
        });
      }
      return acc;
    }, {})
  )
    .map(([id, qty]) => ({ product: safeProducts.find((p) => p && p.id === id), qty }))
    .filter((x) => x.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const exportCSV = () => {
    const rows = safeOrders.filter(Boolean).map((o) => [
      o.id || 'N/A', o.customer?.name || 'Guest', o.customer?.phone || 'N/A', o.customer?.address || 'N/A',
      o.delivery?.date || '', o.delivery?.time || '',
      o.items?.map((i) => `${i?.name || 'N/A'}×${i?.quantity || 1}`).join('; ') || '',
      o.subtotal || 0, o.deliveryFee || 0, o.total || 0, o.status || 'placed', o.payment || 'cash',
      o.advanceAmount ?? '', o.advancePayment ?? '', o.remainingAmount ?? '',
    ]);
    const csv = [['ID','Name','Phone','Address','Date','Time','Items','Subtotal','Delivery','Total','Status','Payment','Advance Amount','Advance Method','Remaining Amount'], ...rows]
      .map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const StatusPill = ({ status }: { status: string }) => {
    const Icon = STATUS_ICON[status] ?? Clock;
    return (
      <span className="inline-flex items-center gap-1">
        <Icon className="w-3 h-3" strokeWidth={2} />
        {STATUS_LABELS[status]}
      </span>
    );
  };

  // Apps configuration for App Launcher Grid
  const APPS = [
    { id: 'orders' as AdminTab, label: 'Orders', icon: Package, badge: pendingCount, bg: 'bg-blue-500/10 text-blue-600' },
    { id: 'products' as AdminTab, label: 'Products', icon: Cake, bg: 'bg-pink-500/10 text-pink-600' },
    { id: 'banners' as AdminTab, label: 'Banners', icon: Tag, bg: 'bg-amber-500/10 text-amber-600' },
    { id: 'gallery' as AdminTab, label: 'Gallery', icon: ImageIcon, bg: 'bg-teal-500/10 text-teal-600' },
    { id: 'reviews' as AdminTab, label: 'Reviews', icon: Star, bg: 'bg-purple-500/10 text-purple-600' },
    { id: 'customers' as AdminTab, label: 'Customers', icon: Users, badge: safeCustomers.length, bg: 'bg-emerald-500/10 text-emerald-600' },
    { id: 'zones' as AdminTab, label: 'Zones', icon: MapPin, bg: 'bg-orange-500/10 text-orange-600' },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings, bg: 'bg-slate-500/10 text-slate-600' },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3, bg: 'bg-indigo-500/10 text-indigo-600' },
  ];

  return (
    <div className="fixed inset-0 z-[999] flex flex-col h-[100dvh] w-full bg-bg overflow-hidden anim-fade">
      {/* ── Android OS Top Chrome Bar ── */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-surface border-b border-border text-[11px] font-semibold text-ink-300 select-none flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-coral" strokeWidth={2} />
          <span className="font-bold text-ink text-xs">Admin Phone OS</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-bold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> LIVE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchOrders} className="p-1.5 rounded-full hover:bg-secondary text-ink-300 transition" title="Refresh Data">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Main Screen View Area ── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* 1. LAUNCHER HOME SCREEN */}
        {screen === 'launcher' && (
          <div className="p-6 space-y-6 anim-fade">
            {/* Launcher Header Widget */}
            <div className="rounded-[24px] bg-gradient-to-br from-coral to-coral-700 p-5 text-white shadow-btn flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">Bake Art Control Center</span>
                <h1 className="text-[22px] font-bold tracking-tight mt-0.5">Admin OS Launcher</h1>
                <p className="text-xs text-white/90 mt-1">Select an app below to manage store operations</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                <Cake className="w-6 h-6" strokeWidth={1.8} />
              </div>
            </div>

            {/* Quick KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Revenue', value: formatINR(totalRevenue), color: 'text-coral' },
                { label: 'Pending Orders', value: pendingCount, color: 'text-amber-600' },
                { label: "Today's Orders", value: todayCount, color: 'text-blue-600' },
                { label: 'Active Products', value: safeProducts.length, color: 'text-emerald-600' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                  <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] font-semibold text-ink-300 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Android Sector Apps Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-300">Admin Sector Apps</h2>
                <span className="text-[11px] font-semibold text-coral">9 Apps Available</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
                {APPS.map((app) => {
                  const IconComp = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => setScreen(app.id)}
                      className="group flex flex-col items-center text-center p-3.5 rounded-[22px] bg-surface border border-border shadow-card hover:shadow-card-hover transition active:scale-95"
                    >
                      <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${app.bg} transition group-hover:scale-105`}>
                        <IconComp className="h-6 w-6" strokeWidth={2} />
                        {(app.badge ?? 0) > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-black text-white shadow-sm">
                            {app.badge}
                          </span>
                        )}
                      </div>
                      <span className="mt-2 text-xs font-bold text-ink leading-tight">{app.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. SUB-APP SECTOR SCREENS */}
        {screen !== 'launcher' && (
          <div className="flex flex-col min-h-full anim-up">
            {/* Sub-App Android Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-surface border-b border-border sticky top-0 z-10">
              <button
                onClick={() => setScreen('launcher')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-ink shadow-card transition active:scale-95"
                title="Back to Launcher"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={2} />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-[18px] font-bold text-ink truncate capitalize">
                  {screen === 'analytics' ? 'Analytics & Reports' : `${screen} App`}
                </h2>
                <p className="text-[11px] text-ink-300 truncate">Admin Sector Control</p>
              </div>

              {screen === 'orders' && (
                <button onClick={exportCSV} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-coral text-white text-xs font-bold shadow-btn active:scale-95">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              )}
              {screen === 'products' && (
                <button onClick={() => setEditProduct({ ...EMPTY_PRODUCT, id: `p-${Date.now()}` })} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-coral text-white text-xs font-bold shadow-btn active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
              {screen === 'banners' && (
                <button onClick={() => setEditBanner({ ...EMPTY_BANNER, id: `b-${Date.now()}` })} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-coral text-white text-xs font-bold shadow-btn active:scale-95">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>

            {/* Sub-App Body Content */}
            <div className="p-6 flex-1 space-y-4">

              {/* 📊 Analytics Sub-App */}
              {screen === 'analytics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Revenue', value: formatINR(totalRevenue) },
                      { label: 'Pending', value: pendingCount },
                      { label: 'Today', value: todayCount },
                      { label: 'Products', value: safeProducts.length },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                        <p className="text-xl font-black text-coral">{s.value}</p>
                        <p className="text-xs font-bold text-ink">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                    <p className="text-xs font-bold text-ink mb-3">Top Products Sold</p>
                    {topProducts.map(({ product, qty }) => (
                      <div key={product!.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                        <img src={product!.image} alt="" className="h-10 w-10 rounded-xl object-cover bg-blush" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-ink">{product!.name || 'N/A'}</p>
                          <p className="text-[10px] text-ink/40">{qty} sold</p>
                        </div>
                        <p className="text-xs font-black text-coral">{formatINR((product!.price || 0) * qty)}</p>
                      </div>
                    ))}
                    {topProducts.length === 0 && <p className="text-center text-xs text-ink-200 py-4">No product sales yet</p>}
                  </div>

                  <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                    <p className="text-xs font-bold text-ink mb-3">Recent Orders</p>
                    {safeOrders.filter(Boolean).slice(0, 5).map((o) => (
                      <div key={o.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-xs font-bold text-ink">{o.customer?.name || 'Guest'}</p>
                          <p className="text-[10px] font-mono text-ink/40">#{o.id || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-coral">{formatINR(o.total || 0)}</p>
                          <p className="text-[10px] font-bold text-ink/50">{STATUS_LABELS[o.status || 'placed'] ?? (o.status || 'placed')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 📦 Orders Sub-App */}
              {screen === 'orders' && (
                <div className="space-y-3">
                  <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                    {(['all', ...ORDER_STATUSES] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setOrderFilter(s)}
                        className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold capitalize ${orderFilter === s ? 'bg-coral text-white' : 'border border-border bg-surface text-ink-300'}`}
                      >
                        {s === 'all' ? 'All' : s}
                      </button>
                    ))}
                  </div>

                  {filteredOrders.map((o) => (
                    <div key={o.id} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-ink truncate">{o.customer?.name || 'Guest'}</p>
                          <p className="text-[10px] font-mono text-ink/40">#{o.id || 'N/A'} · {o.createdAt ? new Date(o.createdAt).toLocaleString('en-BD') : 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-coral">{formatINR(o.total || 0)}</p>
                          <p className="text-[10px] font-bold text-ink/45 capitalize">বাকি: {o.payment || 'cash'}</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-ink-50 p-3 text-[11px] leading-relaxed text-ink/65">
                        <p><span className="font-bold text-ink">Phone:</span> {o.customer?.phone || 'N/A'}</p>
                        {o.customer?.email && <p><span className="font-bold text-ink">Email:</span> {o.customer.email}</p>}
                        <p><span className="font-bold text-ink">Address:</span> {o.customer?.address || 'N/A'}, {o.customer?.city || ''}</p>
                        <p><span className="font-bold text-ink">Delivery:</span> {o.delivery?.date || ''} · {o.delivery?.time || ''}</p>
                      </div>

                      <div className="mt-2 space-y-2">
                        {(o.items || []).map((i, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                            {i?.image ? (
                              <button
                                onClick={() => setViewImage(i.image!)}
                                className="flex-shrink-0 h-12 w-12 rounded-xl overflow-hidden border border-border bg-surface active:scale-95 transition"
                              >
                                <img src={i.image} alt={i?.name || ''} className="h-full w-full object-cover" />
                              </button>
                            ) : (
                              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-ink/5 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-ink/25" strokeWidth={1.5} />
                              </div>
                            )}
                            <div className="flex flex-1 items-start justify-between gap-1 min-w-0 pt-0.5">
                              <span className="text-[11px] leading-relaxed text-ink/65 min-w-0">
                                <span className="font-semibold text-ink">{i?.name || 'N/A'}</span>
                                {' · '}{i?.size || 'N/A'}{' · '}{i?.flavor || 'N/A'}{' ×'}{i?.quantity || 1}
                              </span>
                              <span className="flex-shrink-0 text-xs font-bold text-ink">{formatINR((i?.price || 0) * (i?.quantity || 1))}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3">
                        <label className="text-[10px] font-bold uppercase text-ink/40">Change order status</label>
                        <select
                          value={o.status || 'placed'}
                          onChange={(e) => requestStatusChange(o, e.target.value as Order['status'])}
                          className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs font-bold text-ink focus:outline-none"
                        >
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ORDER_STATUSES.map((s) => (
                          <button key={s}
                            onClick={() => requestStatusChange(o, s)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 ${o.status === s ? 'bg-coral text-white' : 'bg-ink/5 text-ink/45'}`}>
                            <StatusPill status={s} />
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2 flex-wrap">
                        <a
                          href={waLink(o.customer?.phone || safeSettings.whatsappNumber, `Hello ${o.customer?.name || 'Customer'}, your Bake Art Style order #${o.id || 'N/A'} is now ${o.status || 'placed'}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-xl bg-success/10 py-2 text-center text-xs font-bold text-success"
                        >
                          WhatsApp Customer
                        </a>
                        {o.paymentScreenshot && (
                          <button onClick={() => void openPaymentScreenshot(o.paymentScreenshot)} className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-700">
                            Advance Proof
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 🎂 Products Sub-App */}
              {screen === 'products' && (
                <div className="space-y-3">
                  {editProduct && (
                    <div className="rounded-2xl border-2 border-coral/30 bg-surface p-4 space-y-3 shadow-card">
                      <p className="font-bold text-sm text-ink">{safeProducts.find((p) => p && p.id === editProduct.id) ? 'Edit' : 'New'} Product</p>
                      {(['name', 'tagline', 'description'] as const).map((f) => (
                        <div key={f}>
                          <label className="text-[10px] font-bold text-ink/50 uppercase">{f}</label>
                          <input className="w-full mt-0.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs text-ink focus:outline-none"
                            value={String(editProduct[f] ?? '')}
                            onChange={(e) => setEditProduct({ ...editProduct, [f]: e.target.value })} />
                        </div>
                      ))}
                      <div>
                        <label className="text-[10px] font-bold text-ink/50 uppercase">Price (৳)</label>
                        <input type="number" className="w-full mt-0.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs text-ink focus:outline-none"
                          value={editProduct.price}
                          onChange={(e) => setEditProduct({ ...editProduct, price: +e.target.value })} />
                      </div>

                      <div className="flex items-center gap-3">
                        {editProduct.image && <img src={editProduct.image} alt="" className="w-14 h-14 rounded-xl object-cover" />}
                        <div className="flex-1">
                          <input ref={productImgRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            setImgUploading(true);
                            try { const url = await uploadProductImage(file); setEditProduct(prev => prev ? { ...prev, image: url } : prev); }
                            finally { setImgUploading(false); }
                          }} />
                          <button onClick={() => productImgRef.current?.click()} disabled={imgUploading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ink/5 text-xs font-bold text-ink disabled:opacity-50">
                            <ImageIcon className="w-3.5 h-3.5" /> {imgUploading ? 'Uploading...' : 'Upload Image'}
                          </button>
                          <input className="mt-1 w-full px-2 py-1 rounded-lg border border-border text-[10px] text-ink focus:outline-none bg-surface"
                            placeholder="Or paste image URL"
                            value={editProduct.image?.startsWith('data:') ? '' : editProduct.image}
                            onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })} />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button onClick={async () => { await saveProduct(editProduct); setEditProduct(null); }} className="flex-1 py-2.5 rounded-xl bg-coral text-white font-bold text-xs">
                          Save Product
                        </button>
                        <button onClick={() => setEditProduct(null)} className="flex-1 py-2.5 rounded-xl bg-ink/5 text-ink/60 font-bold text-xs">Cancel</button>
                      </div>
                    </div>
                  )}

                  {safeProducts.filter(Boolean).map((p) => (
                    <div key={p.id} className="rounded-2xl border border-border bg-surface p-3 flex gap-3 items-center shadow-card">
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-blush" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-ink truncate">{p.name || 'N/A'}</p>
                        <p className="text-xs font-black text-coral">{formatINR(p.price || 0)}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditProduct(p)} className="w-8 h-8 rounded-xl bg-ink/5 flex items-center justify-center">
                          <Edit3 className="w-3.5 h-3.5 text-ink/60" />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 rounded-xl bg-error/10 flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5 text-error" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 🎨 Banners Sub-App */}
              {screen === 'banners' && (
                <div className="space-y-3">
                  {editBanner && (
                    <div className="rounded-2xl border-2 border-coral/30 bg-surface p-4 space-y-3 shadow-card">
                      <p className="font-bold text-sm text-ink">{safeBanners.find((b) => b && b.id === editBanner.id) ? 'Edit' : 'New'} Banner</p>
                      {(['title', 'subtitle', 'tag'] as const).map((f) => (
                        <div key={f}>
                          <label className="text-[10px] font-bold text-ink/50 uppercase">{f}</label>
                          <input className="w-full mt-0.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs text-ink focus:outline-none"
                            value={String(editBanner[f] ?? '')}
                            onChange={(e) => setEditBanner({ ...editBanner, [f]: e.target.value })} />
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                        {editBanner.image && <img src={editBanner.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-blush" />}
                        <div className="flex-1">
                          <input ref={bannerImgRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            setBannerImgUploading(true);
                            try { const url = await uploadBannerImage(file); setEditBanner(prev => prev ? { ...prev, image: url } : prev); }
                            finally { setBannerImgUploading(false); }
                          }} />
                          <button onClick={() => bannerImgRef.current?.click()} disabled={bannerImgUploading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ink/5 text-xs font-bold text-ink disabled:opacity-50">
                            <ImageIcon className="w-3.5 h-3.5" /> {bannerImgUploading ? 'Uploading...' : 'Upload Image'}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={async () => { await saveBanner(editBanner); setEditBanner(null); }} className="flex-1 py-2.5 rounded-xl bg-coral text-white font-bold text-xs">
                          Save Banner
                        </button>
                        <button onClick={() => setEditBanner(null)} className="flex-1 py-2.5 rounded-xl bg-ink/5 text-ink/60 font-bold text-xs">Cancel</button>
                      </div>
                    </div>
                  )}

                  {safeBanners.filter(Boolean).map((b) => (
                    <div key={b.id} className="rounded-2xl border border-border bg-surface p-3 flex gap-3 items-center shadow-card">
                      <img src={b.image} alt={b.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-blush" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-ink truncate">{b.title || 'N/A'}</p>
                        <p className="text-xs font-bold text-coral capitalize">{b.type || 'new_item'}</p>
                      </div>
                      <button onClick={() => setEditBanner(b)} className="w-8 h-8 rounded-xl bg-ink/5 flex items-center justify-center">
                        <Edit3 className="w-3.5 h-3.5 text-ink/60" />
                      </button>
                      <button onClick={() => deleteBanner(b.id)} className="w-8 h-8 rounded-xl bg-error/10 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5 text-error" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 🖼️ Gallery Sub-App */}
              {screen === 'gallery' && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-surface p-4 shadow-card space-y-2">
                    <p className="text-xs font-bold text-ink">Add Gallery Photo</p>
                    <input className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none"
                      placeholder="Caption (optional)" value={newGalleryCaption} onChange={(e) => setNewGalleryCaption(e.target.value)} />
                    <input ref={galleryImgRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      setGalleryUploading(true);
                      try {
                        const url = await uploadGalleryImage(file);
                        await saveGalleryItem({ id: `gl-${Date.now()}`, image: url, caption: newGalleryCaption || file.name, created_at: new Date().toISOString() });
                        setNewGalleryCaption('');
                      } finally { setGalleryUploading(false); }
                    }} />
                    <button onClick={() => galleryImgRef.current?.click()} disabled={galleryUploading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-coral text-white font-bold text-xs shadow-btn disabled:opacity-50">
                      <ImageIcon className="w-3.5 h-3.5" /> {galleryUploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {safeGallery.filter(Boolean).map((g) => (
                      <div key={g.id} className="relative rounded-2xl overflow-hidden bg-blush">
                        <img src={g.image} alt={g.caption || ''} className="w-full h-28 object-cover" />
                        <button onClick={() => deleteGalleryItem(g.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-error flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ⭐ Reviews Sub-App */}
              {screen === 'reviews' && (
                <div className="space-y-3">
                  {safeReviews.filter(Boolean).map((r: any) => (
                    <div key={r.id} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm text-ink">{r.user_name || 'Anonymous'}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < (r.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-ink/20'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-ink/60 mb-2">{r.comment || ''}</p>
                      <button onClick={() => deleteReview(r.id)} className="px-3 py-1.5 rounded-xl bg-error/10 text-error text-[10px] font-bold">
                        Delete Review
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 👥 Customers Sub-App */}
              {screen === 'customers' && (
                <div className="space-y-3">
                  {customersLoading && <p className="text-xs text-ink/40 text-center py-4">Loading customers...</p>}
                  {safeCustomers.filter(Boolean).map((c) => (
                    <div key={c.id} className="rounded-2xl border border-border bg-surface p-4 shadow-card flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-coral font-bold">
                        {c.name ? c.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{c.name || 'Guest'}</p>
                        <p className="truncate text-[11px] text-ink/45">{c.phone || c.email || 'No contact'}</p>
                      </div>
                      <p className="text-xs font-black text-coral">{formatINR(c.totalSpent || 0)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 📍 Zones Sub-App */}
              {screen === 'zones' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-ink">Delivery zone gating</p>
                      <button
                        onClick={() => updateSettings({ deliveryZonesEnabled: !safeSettings.deliveryZonesEnabled })}
                        className={`h-7 w-12 rounded-full transition-colors ${safeSettings.deliveryZonesEnabled ? 'bg-coral' : 'bg-ink/20'}`}
                      >
                        <div className={`m-1 h-5 w-5 rounded-full bg-white transition-transform ${safeSettings.deliveryZonesEnabled ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        value={newZone}
                        onChange={(e) => setNewZone(e.target.value)}
                        placeholder="Add zone..."
                        className="h-11 flex-1 rounded-xl border border-border bg-surface px-3 text-xs text-ink focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const zone = newZone.trim();
                          if (!zone) return;
                          if (!(safeSettings.allowedZones ?? []).some((z) => z.toLowerCase() === zone.toLowerCase())) {
                            updateSettings({ allowedZones: [...(safeSettings.allowedZones ?? []), zone] });
                          }
                          setNewZone('');
                        }}
                        className="rounded-xl bg-coral px-4 text-xs font-bold text-white shadow-btn"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ⚙️ Settings Sub-App */}
              {screen === 'settings' && (
                <div className="space-y-4">
                  {[
                    { label: 'Admin Email', field: 'adminEmail' as const, type: 'email' },
                    { label: 'Admin PIN', field: 'adminPin' as const, type: 'password' },
                    { label: 'WhatsApp Number', field: 'whatsappNumber' as const, type: 'text' },
                    { label: 'bKash Number', field: 'bkashNumber' as const, type: 'text' },
                    { label: 'Nagad Number', field: 'nagadNumber' as const, type: 'text' },
                  ].map(({ label, field, type }) => (
                    <div key={field}>
                      <label className="text-[10px] font-bold text-ink/50 uppercase">{label}</label>
                      <input type={type}
                        className="w-full mt-0.5 px-3 py-2.5 rounded-xl border border-border bg-surface text-xs text-ink focus:outline-none"
                        value={String(localSettings[field] ?? '')}
                        onChange={(e) => setLocalSettings({ ...localSettings, [field]: e.target.value })} />
                    </div>
                  ))}
                  <button onClick={() => { updateSettings(localSettings); addNotification('Admin Settings', 'Settings saved successfully.'); }} className="w-full py-3 rounded-2xl bg-coral text-white font-bold text-sm shadow-btn">
                    Save Admin Settings
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* ── Fixed Phone Bottom Dock Navigation Bar ── */}
      <div className="flex items-center justify-around px-2 py-2 bg-surface border-t border-border flex-shrink-0 z-20">
        <button
          onClick={() => setScreen('launcher')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${screen === 'launcher' ? 'text-coral font-bold' : 'text-ink-300'}`}
        >
          <Home className="w-5 h-5" strokeWidth={screen === 'launcher' ? 2.2 : 1.8} />
          <span className="text-[10px]">Launcher</span>
        </button>

        <button
          onClick={() => setScreen('orders')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${screen === 'orders' ? 'text-coral font-bold' : 'text-ink-300'}`}
        >
          <Package className="w-5 h-5" strokeWidth={screen === 'orders' ? 2.2 : 1.8} />
          <span className="text-[10px]">Orders</span>
          {pendingCount > 0 && (
            <span className="absolute top-0.5 right-2 h-2 w-2 rounded-full bg-error" />
          )}
        </button>

        <button
          onClick={() => setScreen('products')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${screen === 'products' ? 'text-coral font-bold' : 'text-ink-300'}`}
        >
          <Cake className="w-5 h-5" strokeWidth={screen === 'products' ? 2.2 : 1.8} />
          <span className="text-[10px]">Products</span>
        </button>

        <button
          onClick={() => setScreen('settings')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${screen === 'settings' ? 'text-coral font-bold' : 'text-ink-300'}`}
        >
          <Settings className="w-5 h-5" strokeWidth={screen === 'settings' ? 2.2 : 1.8} />
          <span className="text-[10px]">Settings</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-error/80 hover:text-error transition"
            title="Exit Admin OS"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px]">Exit</span>
          </button>
        )}
      </div>

      {/* ── Shared Overlays at OS Root Level ── */}
      {viewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-ink/90" onClick={() => setViewImage(null)}>
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <img src={viewImage} alt="Preview" className="w-full max-h-[72vh] rounded-3xl object-contain bg-white shadow-float" />
            <button onClick={() => setViewImage(null)} className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-card">
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-ink/60" onClick={() => setCancelModal(null)}>
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl border border-border bg-surface p-5 shadow-float" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-error/10">
                <X className="h-5 w-5 text-error" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">অর্ডার বাতিল করবেন?</p>
                <p className="text-[11px] text-ink/45">Order #{cancelModal.id} — কারণ লিখুন</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {CANCEL_REASON_PRESETS.map((r) => (
                <button key={r} onClick={() => setCancelReasonInput(r)} className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border ${cancelReasonInput === r ? 'bg-coral text-white border-coral' : 'bg-ink/5 text-ink/60 border-transparent'}`}>
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="বাতিলের কারণ লিখুন..."
              rows={3}
              className="mt-3 w-full rounded-2xl border border-border bg-surface px-3 py-2.5 text-[13px] text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/15"
            />

            <div className="mt-4 flex gap-2">
              <button onClick={() => setCancelModal(null)} className="flex-1 rounded-2xl bg-ink/5 py-3 text-[13px] font-bold text-ink/60">
                রাখুন
              </button>
              <button onClick={confirmCancel} disabled={!cancelReasonInput.trim()} className="flex-1 rounded-2xl bg-error py-3 text-[13px] font-bold text-white disabled:opacity-40">
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
