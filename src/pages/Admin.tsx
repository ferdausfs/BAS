import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Trash2 } from 'lucide-react';
export default function Admin() {
  const [pin, setPin] = useState('');
  const [auth, setAuth] = useState(false);
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [prods, setProds] = useState([]);
  const [newP, setNewP] = useState({name:'', price:'', image_url:'', description:''});

  useEffect(() => { if(auth) fetch(); }, [auth, tab]);
  async function fetch() {
    if(!supabase) return;
    if(tab === 'orders') {
      const {data} = await supabase.from('orders').select('*').order('created_at', {ascending:false});
      setOrders(data || []);
    } else {
      const {data} = await supabase.from('products').select('*').order('created_at', {ascending:false});
      setProds(data || []);
    }
  }
  const addProd = async (e: any) => {
    e.preventDefault();
    await supabase?.from('products').insert([{...newP, price: parseFloat(newP.price)}]);
    setNewP({name:'', price:'', image_url:'', description:''});
    fetch();
  };
  if(!auth) return (
    <div className="max-w-xs mx-auto mt-20 p-6 bg-white shadow rounded">
      <input type="password" placeholder="PIN" onChange={e=>setPin(e.target.value)} className="w-full border p-2 mb-4" />
      <button onClick={()=>pin==='1234' ? setAuth(true) : alert('Wrong')} className="w-full bg-pink-600 text-white py-2 rounded">Login</button>
    </div>
  );
  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button onClick={()=>setTab('orders')} className={`px-4 py-2 ${tab==='orders'?'bg-pink-600 text-white':'bg-white'}`}>Orders</button>
        <button onClick={()=>setTab('products')} className={`px-4 py-2 ${tab==='products'?'bg-pink-600 text-white':'bg-white'}`}>Products</button>
      </div>
      {tab==='orders' ? (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-white p-4 shadow rounded border-l-4 border-pink-500">
              <div className="flex justify-between">
                <div><h3 className="font-bold">{o.customer_name}</h3><p>{o.customer_phone}</p></div>
                <p className="font-bold">৳{o.total_amount}</p>
              </div>
              <div className="mt-2 text-sm border-t pt-2">
                {o.items.map((i:any, x:number) => <div key={x}>{i.name} x {i.quantity}</div>)}
              </div>
              {o.status==='pending' && (
                <button onClick={async()=>{await supabase?.from('orders').update({status:'completed'}).eq('id',o.id); fetch();}} className="text-green-600 mt-2 flex items-center gap-1 font-bold"><CheckCircle size={16}/> Complete</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={addProd} className="bg-white p-4 shadow rounded space-y-4 h-fit">
            <input placeholder="Name" required value={newP.name} onChange={e=>setNewP({...newP, name:e.target.value})} className="w-full border p-2" />
            <input placeholder="Price" type="number" required value={newP.price} onChange={e=>setNewP({...newP, price:e.target.value})} className="w-full border p-2" />
            <input placeholder="Image URL" value={newP.image_url} onChange={e=>setNewP({...newP, image_url:e.target.value})} className="w-full border p-2" />
            <button className="w-full bg-green-600 text-white py-2 font-bold">Add Cake</button>
          </form>
          <div className="space-y-2">
            {prods.map((p:any) => (
              <div key={p.id} className="bg-white p-2 shadow rounded flex justify-between items-center">
                <span>{p.name} - ৳{p.price}</span>
                <button onClick={async()=>{await supabase?.from('products').delete().eq('id',p.id); fetch();}} className="text-red-500"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
