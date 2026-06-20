import { useState } from 'react';
import { useStore } from '../lib/store/useStore';
import { supabase } from '../lib/supabase';
export default function Cart() {
  const { cart, removeFromCart, clearCart } = useStore();
  const [done, setDone] = useState(false);
  const [cust, setCust] = useState({name:'', phone:'', address:''});
  const total = cart.reduce((a, i) => a + i.price * i.quantity, 0);

  const order = async (e: any) => {
    e.preventDefault();
    if(!supabase) return;
    const {error} = await supabase.from('orders').insert([{customer_name:cust.name, customer_phone:cust.phone, customer_address:cust.address, total_amount:total, items:cart, status:'pending'}]);
    if(!error) { clearCart(); setDone(true); }
  };

  if(done) return <div className="text-center py-20 font-bold text-2xl">Order Placed Successfully!</div>;
  if(cart.length===0) return <div className="text-center py-20">Cart is empty</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-4 shadow rounded">
        {cart.map(i => (
          <div key={i.id} className="flex justify-between py-2 border-b">
            <div>{i.name} x {i.quantity}</div>
            <button onClick={()=>removeFromCart(i.id)} className="text-red-500">Remove</button>
          </div>
        ))}
        <div className="mt-4 text-xl font-bold">Total: ৳{total}</div>
      </div>
      <form onSubmit={order} className="bg-white p-4 shadow rounded space-y-4">
        <input placeholder="Name" required onChange={e=>setCust({...cust, name:e.target.value})} className="w-full border p-2" />
        <input placeholder="Phone" required onChange={e=>setCust({...cust, phone:e.target.value})} className="w-full border p-2" />
        <textarea placeholder="Address" required onChange={e=>setCust({...cust, address:e.target.value})} className="w-full border p-2"></textarea>
        <button className="w-full bg-pink-600 text-white py-3 font-bold rounded">Confirm Order</button>
      </form>
    </div>
  );
}
