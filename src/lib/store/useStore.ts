import { create } from 'zustand';
import { Product, CartItem } from '../../types';
interface StoreState {
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, q: number) => void;
}
export const useStore = create<StoreState>((set) => ({
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  addToCart: (p) => set((s) => {
    const ex = s.cart.find(i => i.id === p.id);
    const newCart = ex ? s.cart.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i) : [...s.cart, {...p, quantity: 1}];
    localStorage.setItem('cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  removeFromCart: (id) => set((s) => {
    const newCart = s.cart.filter(i => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  updateQuantity: (id, q) => set((s) => {
    const newCart = s.cart.map(i => i.id === id ? {...i, quantity: q} : i);
    localStorage.setItem('cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  clearCart: () => { localStorage.removeItem('cart'); set({ cart: [] }); }
}));
