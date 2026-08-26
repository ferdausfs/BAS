import { Timestamp } from 'firebase/firestore';
import type { Banner, GalleryItem, Order, Product, Review } from '../types';

export const toMillis = (value: any): number => {
  if (!value) return Date.now();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return new Date(value).getTime() || Date.now();
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  return Date.now();
};

export const toIso = (value: any): string => new Date(toMillis(value)).toISOString();

export const toOccasion = (category?: string): Product['occasion'] => {
  if (category === 'birthday' || category === 'wedding' || category === 'anniversary' || category === 'cupcakes' || category === 'gift' || category === 'premium') return category;
  return 'birthday';
};

export const mapProductDoc = (id: string, row: any): Product => {
  // Support both old nested format (row.data) and new flat format
  const d = (row?.data && typeof row.data === 'object')
    ? { ...row.data, ...row }
    : row;

  return {
    id,
    name: d?.name || 'Cake',
    tagline: d?.tag || d?.tagline || d?.name || 'Freshly baked',
    description: d?.description || '',
    price: Number(d?.pricePerUnit ?? d?.price ?? 0) || 0,
    image: d?.image || '',
    rating: Number(d?.rating ?? 4.5),
    reviews: Number(d?.reviews ?? 0),
    occasion: toOccasion(d?.occasion || d?.category),
    flavors: d?.flavors || ['Chocolate'],
    weights: d?.weights || [{ size: d?.weight || '1 lb', price: 0 }],
    tags: d?.tags || (d?.tag ? [d.tag] : []),
    bestseller: d?.bestseller ?? !!d?.badges?.includes('bestseller'),
    newArrival: d?.newArrival ?? !!d?.badges?.includes('new'),
    tier: d?.tier || (d?.badges?.includes('premium') ? 'premium' : 'normal'),
    pricePerUnit: Number(d?.pricePerUnit ?? d?.price ?? 0) || 0,
    priceUnit: d?.priceUnit === 'kg' ? 'kg' : 'pound',
    inStock: d?.inStock ?? !(d?.badges?.includes('out_of_stock')),
    approved: d?.approved ?? true,
    sizes: d?.sizes,
    addons: d?.addons,
    gallery: Array.isArray(d?.gallery) ? d.gallery : [],
  };
};

export const normalizeProductPricing = (product: Product): Product => {
  const rate = Math.round(Number(product.pricePerUnit ?? product.price) || 0);
  const unit = product.priceUnit === 'kg' ? 'kg' : 'pound';
  return {
    ...product,
    price: rate,
    pricePerUnit: rate,
    priceUnit: unit,
    weights: (product.weights ?? []).map((w) => ({
      size: w.size || (unit === 'kg' ? '1 kg' : '1 lb'),
      price: 0,
    })),
  };
};

export const productToDoc = (product: Product) => {
  const next = normalizeProductPricing(product);
  const badges = [
    next.bestseller ? 'bestseller' : null,
    next.newArrival ? 'new' : null,
    next.tier === 'premium' ? 'premium' : null,
    next.inStock === false ? 'out_of_stock' : null,
  ].filter(Boolean);

  return {
    id: next.id,
    name: next.name,
    tagline: next.tagline ?? null,
    category: next.occasion || 'birthday',
    occasion: next.occasion || 'birthday',
    price: Math.round(next.price),
    oldPrice: next.oldPrice ?? null,
    pricePerUnit: Math.round(next.pricePerUnit ?? next.price),
    priceUnit: next.priceUnit ?? 'pound',
    rating: next.rating ?? 4.5,
    reviews: next.reviews ?? 0,
    tag: next.tags?.[0] ?? next.tagline ?? null,
    tags: next.tags ?? [],
    weight: next.weights?.[0]?.size ?? '1 lb',
    weights: next.weights ?? [],
    flavors: next.flavors ?? [],
    toppings: next.toppings ?? [],
    sizes: next.sizes ?? [],
    addons: next.addons ?? [],
    gallery: next.gallery ?? [],
    image: next.image ?? null,
    description: next.description ?? null,
    approved: next.approved ?? true,
    inStock: next.inStock ?? true,
    tier: next.tier ?? 'normal',
    bestseller: next.bestseller ?? false,
    newArrival: next.newArrival ?? false,
    badges,
    created_at: next.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

const normalizeStatus = (status: string): Order['status'] => {
  if (status === 'pending') return 'placed';
  if (status === 'preparing') return 'baking';
  if (status === 'delivering') return 'out';
  if (['placed', 'confirmed', 'baking', 'ready', 'out', 'delivered', 'cancelled'].includes(status)) return status as Order['status'];
  return 'placed';
};

export const toDbOrderStatus = (status: Order['status']): string => {
  if (status === 'placed') return 'pending';
  if (status === 'baking') return 'preparing';
  if (status === 'out') return 'delivering';
  return status;
};

const normalizePayment = (payment: string): Order['payment'] => {
  if (payment === 'bkash') return 'bkash';
  if (payment === 'nagad') return 'nagad';
  return 'cash';
};

export const mapOrderDoc = (id: string, o: any): Order => ({
  id,
  userId: o.userId || o.user_id || undefined,
  items: Array.isArray(o.items) ? o.items : [],
  customer: {
    name: o.customer_name ?? o.customer?.name ?? '',
    phone: o.customer_phone ?? o.customer?.phone ?? '',
    email: o.customer_email ?? o.customer?.email ?? '',
    address: o.customer_address ?? o.customer?.address ?? '',
    city: o.district ?? o.customer?.city ?? '',
    pin: o.customer?.pin ?? '',
  },
  delivery: { date: o.delivery_date ?? o.delivery?.date ?? '', time: o.delivery_time ?? o.delivery?.time ?? '' },
  payment: normalizePayment(o.payment_method ?? o.payment),
  advancePayment: o.advance_payment === 'nagad' || o.advancePayment === 'nagad'
    ? 'nagad'
    : o.advance_payment === 'bkash' || o.advancePayment === 'bkash'
      ? 'bkash'
      : undefined,
  advanceAmount: o.advance_amount != null || o.advanceAmount != null
    ? Number(o.advance_amount ?? o.advanceAmount)
    : undefined,
  remainingAmount: o.remaining_amount != null || o.remainingAmount != null
    ? Number(o.remaining_amount ?? o.remainingAmount)
    : undefined,
  subtotal: Number(o.subtotal ?? 0),
  discount: Number(o.discount ?? 0),
  deliveryFee: Number(o.delivery_fee ?? o.deliveryFee ?? 0),
  total: Number(o.total ?? 0),
  promoCode: o.promo_code ?? o.promoCode ?? undefined,
  loyaltyPointsRedeemed: o.loyaltyPointsRedeemed,
  paymentScreenshot: o.payment_screenshot ?? o.paymentScreenshot ?? undefined,
  paymentVerified: !!(o.payment_verified ?? o.paymentVerified),
  gpsLat: o.gps_lat ?? o.gpsLat ?? null,
  gpsLng: o.gps_lng ?? o.gpsLng ?? null,
  locationAddress: o.location_address ?? o.locationAddress ?? undefined,
  locationVerified: !!(o.location_verified ?? o.locationVerified),
  status: normalizeStatus(o.status),
  cancelReason: o.cancel_reason ?? o.cancelReason ?? undefined,
  createdAt: toMillis(o.created_at ?? o.createdAt),
  gift: o.gift,
});

export const orderToDoc = (o: Order) => ({
  id: o.id,
  userId: o.userId ?? null,
  user_id: o.userId ?? null,
  customer_name: o.customer.name,
  customer_phone: o.customer.phone,
  customer_email: o.customer.email ?? '',
  customer_address: o.customer.address,
  district: o.customer.city,
  delivery_date: o.delivery.date,
  delivery_time: o.delivery.time,
  payment_method: o.payment,
  payment_screenshot: o.paymentScreenshot ?? null,
  payment_verified: o.paymentVerified ?? false,
  advance_payment: o.advancePayment ?? null,
  advance_amount: o.advanceAmount ?? null,
  remaining_amount: o.remainingAmount ?? null,
  items: o.items,
  subtotal: o.subtotal,
  discount: Math.max(0, Math.round(o.discount ?? (o.subtotal + o.deliveryFee - o.total))),
  delivery_fee: o.deliveryFee,
  total: o.total,
  status: toDbOrderStatus(o.status),
  cancel_reason: o.cancelReason ?? null,
  promo_code: o.promoCode ?? null,
  loyaltyPointsRedeemed: o.loyaltyPointsRedeemed ?? null,
  gps_lat: o.gpsLat ?? null,
  gps_lng: o.gpsLng ?? null,
  location_address: o.locationAddress ?? o.customer.address,
  location_verified: o.locationVerified ?? false,
  gift: o.gift ?? null,
  created_at: new Date(o.createdAt).toISOString(),
  updated_at: new Date().toISOString(),
});

export const mapBannerDoc = (id: string, row: any): Banner => ({
  id,
  title: row.title || '',
  subtitle: row.subtitle || '',
  image: row.image || '',
  tag: row.tag || 'Shop Now',
  color: row.color || '#FFE2E7',
  type: row.type || 'new_item',
  promoCode: row.promo_code ?? row.promoCode ?? undefined,
  productId: row.product_id ?? row.productId ?? undefined,
  noticeText: row.notice_text ?? row.noticeText ?? undefined,
  active: row.active ?? true,
  sortOrder: row.sort_order ?? row.sortOrder ?? 0,
  link: row.link || undefined,
  ctaText: row.cta_text ?? row.ctaText ?? undefined,
});

export const bannerToDoc = (b: Banner) => ({
  id: b.id,
  title: b.title,
  subtitle: b.subtitle,
  image: b.image,
  tag: b.tag,
  color: b.color,
  type: b.type,
  promo_code: b.promoCode ?? null,
  product_id: b.productId ?? null,
  notice_text: b.noticeText ?? null,
  active: b.active ?? true,
  sort_order: b.sortOrder ?? 0,
  link: b.link ?? null,
  cta_text: b.ctaText ?? null,
  updated_at: new Date().toISOString(),
});

export const mapGalleryDoc = (id: string, row: any): GalleryItem => ({
  id,
  image: row.image || '',
  caption: row.caption || '',
  product_id: row.product_id ?? row.productId ?? undefined,
  created_at: row.created_at ? toIso(row.created_at) : new Date().toISOString(),
});

export const mapReviewDoc = (id: string, row: any): Review => ({
  id,
  product_id: row.product_id ?? row.productId ?? '',
  user_id: row.user_id ?? row.userId ?? undefined,
  user_name: row.user_name ?? row.userName ?? 'Anonymous',
  rating: Number(row.rating ?? 5),
  comment: row.comment || '',
  image: row.image || undefined,
  approved: row.approved ?? false,
  created_at: row.created_at ? toIso(row.created_at) : new Date().toISOString(),
});

// Deep-clean undefined values for Firestore
export const sanitizeForFirestore = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, sanitizeForFirestore(v)])
    );
  }
  return obj;
};
