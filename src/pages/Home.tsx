import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store/useStore';
export default function Home() {
  const [products, setProducts] = useState([]);
  const addToCart = useStore((s) => s.addToCart);
  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data } = await supabase.from('products').select('*').order('created_at', {ascending: false});
      if (data) setProducts(data);
    }
    load();
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((p: any) => (
        <div key={p.id} className="bg-white p-4 rounded shadow">
          <img src={p.image_url} className="w-full h-40 object-cover rounded mb-4" />
          <h2 className="font-bold">{p.name}</h2>
          <p className="text-pink-600 font-bold">৳{p.price}</p>
          <button onClick={() => addToCart(p)} className="w-full bg-pink-600 text-white py-2 mt-4 rounded">Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
