/* app.js — hash router + interactions (plain JS, no build step) */
(function(){
const app = document.getElementById('app');
const view = document.getElementById('view');
let splashTimer = null;
let navDepth = 0;           /* grows as user navigates inside the app */

/* ---------- hash parsing ---------- */
function parseHash(){
  let h = location.hash || '';
  if(h.startsWith('#/')) h = h.slice(2);
  else if(h.startsWith('#')) h = h.slice(1);
  const [pathQ, queryS=''] = h.split('?');
  const segs = pathQ.split('/').filter(Boolean);
  const q = {};
  queryS.split('&').forEach(kv=>{ if(!kv) return; const [k,v='']=kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v); });
  return { name: segs[0]||'', seg: segs[1]||'', q };
}

/* ---------- render ---------- */
function render(){
  const { name, seg, q } = parseHash();
  q.seg = seg;
  const fn = window.SCREENS[name];
  clearTimeout(splashTimer);
  /* clear overlays */
  app.querySelectorAll(':scope > .nav, :scope > .sheetwrap, :scope > .video-full, :scope > .splash, :scope > .gesture.fx').forEach(e=>e.remove());
  if(!fn){ location.replace('#/splash'); return; }
  const r = fn(q) || { v:'', o:'' };
  view.innerHTML = r.v;
  view.scrollTop = 0;
  if(r.o) app.insertAdjacentHTML('beforeend', r.o);
  afterRender(name, q);
}

function afterRender(name, q){
  if(name === 'splash'){
    splashTimer = setTimeout(()=>{ location.replace('#/onboarding'); }, 1600);
  }
  if(name === 'chat'){
    const c = document.getElementById('cbd');
    if(c) c.scrollTop = c.scrollHeight;
  }
  /* wheel pickers: center selected item + snap on scroll */
  app.querySelectorAll('[data-w]').forEach(col=>{
    const kids = [...col.children];
    const on = col.querySelector('.on');
    if(on) col.scrollTop = on.offsetTop - (col.clientHeight - on.offsetHeight)/2;
    let t;
    col.addEventListener('scroll', ()=>{
      clearTimeout(t);
      t = setTimeout(()=>{
        const mid = col.scrollTop + col.clientHeight/2;
        let best=null, bd=1e9;
        kids.forEach(k=>{ const c=k.offsetTop + k.offsetHeight/2; const d=Math.abs(c-mid); if(d<bd){bd=d;best=k;} });
        if(best){ kids.forEach(k=>k.classList.toggle('on', k===best));
          col.scrollTo({top: best.offsetTop - (col.clientHeight - best.offsetHeight)/2, behavior:'smooth'}); }
      }, 120);
    });
  });
  /* dual price slider */
  const ps = app.querySelector('[data-pslider]');
  if(ps) initSlider(ps);
}

/* ---------- slider ---------- */
function initSlider(ps){
  const fl = ps.querySelector('.fl');
  const thLo = ps.querySelector('[data-t="lo"]');
  const thHi = ps.querySelector('[data-t="hi"]');
  let lo = parseFloat(ps.dataset.lo), hi = parseFloat(ps.dataset.hi);
  const draw = ()=>{
    thLo.style.left = lo+'%'; thHi.style.left = hi+'%';
    fl.style.left = lo+'%'; fl.style.right = (100-hi)+'%';
  };
  draw();
  const start = (e, which)=>{
    e.preventDefault();
    const rect = ps.getBoundingClientRect();
    const move = (ev)=>{
      const x = (ev.touches? ev.touches[0].clientX : ev.clientX);
      let p = (x - rect.left)/rect.width*100;
      p = Math.max(0, Math.min(100, p));
      if(which==='lo') lo = Math.min(p, hi-5); else hi = Math.max(p, lo+5);
      draw();
    };
    const up = ()=>{ window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); };
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',up);
  };
  thLo.addEventListener('pointerdown', e=>start(e,'lo'));
  thHi.addEventListener('pointerdown', e=>start(e,'hi'));
}

/* ---------- misc actions ---------- */
function closeOverlay(){
  if(navDepth>0){ history.back(); }
  else { const {name} = parseHash(); location.hash = '#/'+name; }
}

function toggleStar(st){
  const wrap = st.closest('.stars'); if(!wrap) return;
  const n = parseInt(st.dataset.star,10);
  wrap.querySelectorAll('.st').forEach(s=> s.classList.toggle('off', parseInt(s.dataset.star,10) > n));
}

function appendChatMessage(text){
  const c = document.getElementById('cbd'); if(!c) return;
  const html = `
    <div class="msg me"></div>
    <div class="msg-meta" style="justify-content:flex-end"><span class="tm" style="margin:0;margin-right:auto">08:05 pm</span><span class="mini"></span><span>Jennifer Aaker</span></div>`;
  c.insertAdjacentHTML('beforeend', html);
  const msgs = c.querySelectorAll('.msg.me');
  msgs[msgs.length-1].textContent = text;
  c.scrollTop = c.scrollHeight;
}

/* ---------- global click delegation ---------- */
document.addEventListener('click', (e)=>{
  const t = e.target;

  /* backdrop close */
  const drop = t.closest && t.classList && t.classList.contains('sheetwrap') ? t : null;
  if(drop && drop.hasAttribute('data-bdrop')){ closeOverlay(); return; }

  const fav = t.closest && t.closest('[data-fav]');
  if(fav){ e.stopPropagation();
    const id = parseInt(fav.dataset.fav,10);
    const prod = window.D && window.D.products.find(p=>p.id===id);
    if(!prod) return;
    prod.fav = prod.fav ? 0 : 1;
    fav.classList.toggle('dim', !prod.fav);
    const svg = fav.querySelector('svg');
    if(svg) svg.style.color = prod.fav ? 'var(--primary)' : '#d9d9d9';
    return;
  }

  const add = t.closest && t.closest('[data-add]');
  if(add){ e.stopPropagation();
    add.animate([{transform:'scale(1)'},{transform:'scale(.8)'},{transform:'scale(1)'}],{duration:220});
    return;
  }

  const chip = t.closest && t.closest('[data-chip]');
  if(chip){
    const row = chip.parentElement;
    row.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
    chip.classList.add('on');
    return;
  }

  const radio = t.closest && t.closest('[data-radio]');
  if(radio){
    const key = radio.dataset.radio;
    document.querySelectorAll(`[data-radio="${key}"]`).forEach(r=>{ const rd=r.querySelector('.radio'); if(rd) rd.classList.remove('on'); });
    const rd = radio.querySelector('.radio'); if(rd) rd.classList.add('on');
    return;
  }

  const star = t.closest && t.closest('[data-star]');
  if(star){ toggleStar(star); return; }

  const stp = t.closest && t.closest('[data-step]');
  if(stp){ e.stopPropagation();
    const wrap = stp.closest('.step');
    const cnt = wrap && wrap.querySelector('.cnt');
    if(cnt){ let v = parseInt(cnt.textContent,10)||1; v = Math.max(1, Math.min(9, v + parseInt(stp.dataset.step,10))); cnt.textContent = v; }
    return;
  }

  const clr = t.closest && t.closest('[data-clear]');
  if(clr){ const r = document.querySelector('.rchips'); if(r) r.innerHTML=''; return; }

  const fq = t.closest && t.closest('[data-faq]');
  if(fq){ const card = fq.closest('.faq'); const open = card.classList.toggle('open');
    const svgs = fq.querySelectorAll('svg'); svgs.forEach(s=>s.remove());
    fq.insertAdjacentHTML('beforeend', window.ICON(open?'chev-u':'chev-d'));
    return;
  }

  const hc = t.closest && t.closest('[data-hc]');
  if(hc){ const card = hc.closest('.hc-card'); const open = card.classList.toggle('open');
    const ar = hc.querySelector('.arw'); if(ar) ar.innerHTML = window.ICON(open?'chev-u':'chev-d');
    return;
  }

  const inv = t.closest && t.closest('[data-invite]');
  if(inv){ const on = inv.classList.toggle('inv');
    if(on){ inv.textContent='Invited'; inv.style.background='var(--fill)'; inv.style.color='#969696'; }
    else { inv.textContent='Invite'; inv.style.background=''; inv.style.color=''; }
    return;
  }

  const otc = t.closest && t.closest('[data-otype-continue]');
  if(otc){
    const sel = document.querySelector('[data-radio="otype"] .radio.on');
    const btn = sel && sel.closest('[data-radio="otype"]');
    const v = btn ? btn.dataset.val : 'delivery';
    location.hash = v==='pickup' ? '#/cart?type=pickup&sheet=pickup' : '#/delivery-type';
    return;
  }

  const go = t.closest && t.closest('[data-go]');
  if(go){
    const to = go.dataset.go;
    if(!to) return;
    const cur = location.hash;
    if(cur === to){ /* same route: re-render (e.g. closing sheet w/ same base) */
      render();
    } else {
      location.hash = to;
    }
    return;
  }

  const back = t.closest && t.closest('[data-back]');
  if(back){ closeOverlay(); return; }
});

/* ---------- keyboard ---------- */
document.addEventListener('input', (e)=>{
  const inp = e.target;
  if(inp.matches && inp.matches('.otp input')){
    inp.value = inp.value.replace(/\D/g,'').slice(0,1);
    if(inp.value){ const n = inp.nextElementSibling; if(n) n.focus(); }
  }
});
document.addEventListener('keydown', (e)=>{
  const inp = e.target;
  if(inp.matches && inp.matches('.otp input') && e.key==='Backspace' && !inp.value){
    const p = inp.previousElementSibling; if(p){ p.focus(); p.value=''; }
  }
  if(inp.id === 'sq' && e.key==='Enter'){ location.hash = '#/search-results'; }
  if(inp.id === 'cin' && e.key==='Enter' && inp.value.trim()){
    appendChatMessage(inp.value.trim()); inp.value='';
  }
});

/* ---------- router ---------- */
window.addEventListener('hashchange', ()=>{ navDepth++; render(); });
function boot(){
  if(!location.hash){ location.replace('#/splash'); return; }
  render();
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
