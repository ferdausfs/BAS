/** Shared live-status colors for Orders + Tracking. Deep enough for white icons. */
export const ORDER_STATUS_TONE = {
  placed: { color: '#D45A3C', bg: '#FBE7E1' },
  confirmed: { color: '#D36A38', bg: '#FCE9DF' },
  baking: { color: '#B57A12', bg: '#F6EED8' },
  ready: { color: '#2C8A7C', bg: '#E3F3F0' },
  out: { color: '#3A7AB8', bg: '#E4EFF8' },
  delivered: { color: '#2F8F4E', bg: '#E3F4E8' },
} as const;

export type OrderStatusToneKey = keyof typeof ORDER_STATUS_TONE;
