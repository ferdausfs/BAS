/* screens.js — every screen as a render function.
   Each returns { v: viewHTML (scrollable), o: overlayHTML (nav / sheets / fixed) } */
(function(){
const I = window.ICON, C = window.CATICON, D = window.D, P = window.PROD;

/* ---------------- shared bits ---------------- */
const sb = (dark)=> `<div class="sb${dark?' on-dark':''}"><span>9:41</span><span class="sbi">${I('signal')}${I('wifi')}${I('batt')}</span></div>`;
const backBtn = ()=> `<button class="back" data-back aria-label="back">${I('chev-l')}</button>`;
const appbar = (t, o={}) => `${sb()}<div class="appbar">${o.back===false?'':backBtn()}<div class="title">${t}</div>${o.right?`<div class="right">${o.right}</div>`:''}</div>`;
const navBar = (on)=>{
  const items=[['home','home','home-o','#/home'],['cart','cart-f','cart','#/cart'],['heart','heart-f','heart','#/favorite'],['chat','chatb-f','chatb','#/chat'],['user','user-f','user','#/profile']];
  return `<nav class="nav">${items.map(([k,f,o2,to])=>`<a data-go="${to}" class="${k===on?'on':''}">${I(k===on?f:o2)}</a>`).join('')}</nav>`;
};
const secRow = (t, see)=> `<div class="sec-row"><span class="sec-title">${t}</span>${see?`<a class="see-all" data-go="${see}">See All</a>`:''}</div>`;
const secRowSm = (t, r)=> `<div class="sec-row"><span class="sec-sm2">${t}</span>${r||''}</div>`;
const gesture = ()=> `<div class="gesture fx"></div>`;

/* product card (grid / horizontal) */
const pcard = (p)=> `
<div class="pcard" data-go="#/product">
  <div class="pimg">${p.off?`<span class="off">${p.off}% OFF</span>`:''}
    <button class="hv${p.fav?'':' dim'}" data-fav="${p.id}">${I('heart-f')}</button></div>
  <div class="pmeta" style="margin-top:.55rem"><span class="pname">${p.name}</span><span class="prate">${I('star')}${p.rating.toFixed(1)}</span></div>
  <div class="pwt" style="margin:.12rem .2rem 0">${p.wt}</div>
  <div class="prow"><span class="price">$${p.price.toFixed(2)}<s>$${p.old.toFixed(2)}</s></span>
    <button class="addbtn" data-add>${I('plus')}</button></div>
</div>`;

/* list product row */
const lprod = (p)=> `
<div class="lprod" data-go="#/product">
  <div class="lt"><button class="hv" data-fav="${p.id}"><svg viewBox="0 0 24 24" fill="currentColor" class="${p.fav?'f':''}"><path d="M12 21.2S3.1 15.9 1.5 10.8C.4 7.3 2.7 3.4 6.5 3.4c2.3 0 4.1 1.2 5.5 3.1 1.4-1.9 3.2-3.1 5.5-3.1 3.8 0 6.1 3.9 5 7.4-1.6 5.1-10.5 10.4-10.5 10.4Z"/></svg></button></div>
  <div class="li"><div class="ln">${p.name}</div><div class="lm">${p.wt}</div>
    <div class="lr">${I('star')}${p.rating.toFixed(1)}</div>
    <div class="lp price">$${p.price.toFixed(2)}<s>$${p.old.toFixed(2)}</s></div></div>
  <button class="addbtn big" data-add>${I('plus')}</button>
</div>`;

/* offer card */
const offerCard = (o)=> `
<div class="offer" data-go="#/offers">
  <span class="oc">${o.chip}</span>
  <div class="ot">${o.title}</div>
  <div class="up"><span class="t">Up to</span><span class="num">${o.pc}<i class="pc">%</i><i class="sp">${I('sparkle2')}</i></span></div>
  <span class="sbtn">Shop Now</span>
  <svg style="position:absolute;right:-1rem;top:50%;transform:translateY(-50%);width:8.5rem;height:8.5rem;color:#ececec" viewBox="0 0 24 24" fill="currentColor"><path d="M17 4c3 1 4.5 3.2 4.3 5.8-.2 2.3-2 3.6-4.4 4-.5 2.7-2.4 4.7-5 5.1-2.6.3-5-.9-6.1-3.2C7 12.4 9.5 8.6 13.5 8c-.8 1.6-.8 3.4.1 5 1-1.5 2.7-2.1 4.4-1.6-.7-2.5-2.6-4-5-4.6 1.2-1.7 2.8-2.6 4-2.8Z" opacity=".6"/></svg>
</div>`;

/* order product line */
const oitem = (p,q)=> `
<div class="oitem"><div class="oimg"></div><div class="oinfo">
  <div class="on">${p.name}</div><div class="om">${p.wt} • Qty. : ${q||1}</div>
  <div class="op">$${p.price.toFixed(2)} <s>$${p.old.toFixed(2)}</s></div></div></div>`;
const itemCard = (p,q)=> `<div class="bcard" style="padding:.9rem .85rem;margin-bottom:1rem">${oitem(p,q)}</div>`;

/* stepper */
const step = (big)=> `<div class="step${big?' big':''}"><button class="sbtn2" data-step="-1">${I('minus')}</button><span class="cnt">1</span><button class="splus" data-step="1">${I('plus')}</button></div>`;

/* cart item (+optional swipe delete state) */
const citemRow = (p, sw, type)=> {
  const inner = `<div class="oimg"></div><div class="oinfo">
      <div class="on">${p.name}</div><div class="om">${p.qty||p.wt}</div>
      <div class="op">$${p.price.toFixed(2)} <s>$${p.old.toFixed(2)}</s></div></div>${step()}`;
  if(!sw) return `<div class="citem">${inner}</div>`;
  return `<div class="swipe-row"><div class="citem">${inner}</div>
    <button class="del" data-go="#/cart?sheet=remove${type==='pickup'?'&type=pickup':''}">${I('trash')}</button></div>`;
};

/* info card (order type / address / pickup) */
const icard = (ic, t1, t2, act, t3, bordered)=> `
<div class="icard"><span class="ic-chip${bordered?' b':''}">${ic}</span>
  <div class="tx"><div class="t1">${t1}</div><div class="t2${String(t2).length>34?' w2':''}">${t2}</div>
  ${t3?`<div class="t3">${I('clock')}${t3}</div>`:''}</div>
  ${act?`<button class="act" data-go="${act.go}">${act.t}</button>`:''}
</div>`;
const STORE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 9.5 6 4.5h12L19.5 9.5M4.5 9.5V19a1.5 1.5 0 0 0 1.5 1.5h12A1.5 1.5 0 0 0 19.5 19V9.5M4.5 9.5h15M9.6 20.5V15h4.8v5.5"/></svg>`;

/* radio group card */
const paycard = (rows)=> `<div class="paycard">${rows}</div>`;
const payr = (content, key, val, on)=> `<button class="payr" ${key?`data-radio="${key}" data-val="${val}"`:''}>${content}${key?`<span class="radio${on?' on':''}"></span>`:''}</button>`;

/* stars */
const stars = (n, sm)=> `<div class="stars${sm?' sm':''}">${[1,2,3,4,5].map(i=>`<span class="st${i<=n?'':' off'}" data-star="${i}">${I('star')}</span>`).join('')}</div>`;

/* barcode (deterministic pattern) */
const barcode = ()=> {
  const w=[3,2,5,2,1,3,2,4,2,5,1,2,3,2,4,2,2,1,5,3,2,2,4,1,3,2,5,2,2,4,1,2,3,5,2,1,2,3,2,4,5,2,3,1,2,4,3,2,5,1,2];
  return `<div class="barcode">${w.map(x=>`<i style="width:${(x*.12).toFixed(2)}rem"></i>`).join('')}</div>`;
};

/* waveform bars */
const wave = ()=> {
  const h=[.5,.9,.4,1.2,.7,1.4,.5,1,.6,1.3,.8,.45,1.1,.6,1.5,.9,.5,1.2,.7,1,.4,.8,1.3,.6,1.1,.5,.9,.7,1.2,.45];
  return `<span class="wv">${h.map(x=>`<i style="height:${x}rem"></i>`).join('')}</span>`;
};

/* mini avatar */
const avatar = (sz)=> `<span class="avatar" style="${sz?`width:${sz}rem;height:${sz}rem;`:''}"></span>`;

/* onboarding phone mock */
const phoneMock = `
<svg class="ob-phone" viewBox="0 0 300 580" fill="none">
  <rect x="30" y="12" width="240" height="556" rx="46" fill="#2e2e2e"/>
  <rect x="42" y="24" width="216" height="532" rx="36" fill="#c6c6c6"/>
  <rect x="112" y="38" width="76" height="22" rx="11" fill="#2e2e2e"/>
  <rect x="25" y="120" width="6" height="26" rx="3" fill="#2e2e2e"/>
  <rect x="25" y="160" width="6" height="46" rx="3" fill="#2e2e2e"/>
  <rect x="25" y="216" width="6" height="46" rx="3" fill="#2e2e2e"/>
  <rect x="269" y="168" width="6" height="72" rx="3" fill="#2e2e2e"/>
</svg>`;

/* rotated scallop badge (welcome) */
const badgeSVG = (()=>{
  let pts=''; const N=36;
  for(let k=0;k<N;k++){ const a=k/N*Math.PI*2; const r=k%2? 45:40;
    pts+=`${(50+r*Math.cos(a)).toFixed(1)},${(50+r*Math.sin(a)).toFixed(1)} `;}
  return `<svg class="wel-badge" viewBox="0 0 100 100">
    <polygon points="${pts}" fill="#efefef" stroke="#c9c9c9" stroke-width="1"/>
    <defs><path id="bcp" d="M50 50 m-27 0 a27 27 0 1 1 54 0 a27 27 0 1 1 -54 0"/></defs>
    <text font-size="7.3" fill="#8f8f8f" letter-spacing="1.1" font-weight="600"><textPath href="#bcp">SHOP BEST SELLER • FRESH FINDS • </textPath></text>
    <path d="M50 40c.5 4.2 1.6 5.9 5.6 6.9-4 1.1-5.1 2.8-5.6 7-.5-4.2-1.6-5.9-5.6-7 4-1 5.1-2.7 5.6-6.9Z" fill="#8a8a8a" transform="translate(0 .5)"/>
  </svg>`;
})();

/* map svg (track / direction) */
const icoInner = (n)=> I(n).replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
const mapSVG = (kind)=>{
  const L=(x,y,t,r)=>`<text x="${x}" y="${y}" transform="rotate(${r||-36} ${x} ${y})" font-size="11.5" font-weight="500" fill="#b9b9b9">${t}</text>`;
  const A=(x,y,r)=>`<path d="M0 0 7 3.4 0 7Z" transform="translate(${x} ${y}) rotate(${r||0})" fill="#cbcbcb" opacity=".7"/>`;
  const pin=(x,y,inner)=>`<g transform="translate(${x} ${y})">
    <path d="M-12 -10 0 9 12 -10Z" fill="#8f8f8f"/>
    <circle cx="0" cy="-19" r="17" fill="#8f8f8f" stroke="#fff" stroke-width="3.4"/>
    <svg x="-8" y="-27" width="16" height="16" viewBox="0 0 24 24">${inner}</svg></g>`;
  const homeGlyph = `<g fill="#fff"><path d="M3.6 11 12 4.2 20.4 11V20a1 1 0 0 1-1 1h-4.6v-5.6H9.2V21H4.6a1 1 0 0 1-1-1v-9Z"/></g>`;
  const shopGlyph = `<g transform="scale(.92)"><path d="M4.5 10.6h15l-1.6 7.6a2.3 2.3 0 0 1-2.3 1.8H8.4a2.3 2.3 0 0 1-2.3-1.8L4.5 10.6Z" fill="#fff"/><path d="M9.6 4.6 7.8 10.6M14.4 4.6l1.8 6" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round"/></g>`;
  const you=(x,y)=>`<g transform="translate(${x} ${y})">
    <circle r="25" fill="#8f8f8f" opacity=".16"/><circle r="14.5" fill="#8f8f8f" stroke="#fff" stroke-width="3.2"/>
    <g transform="translate(-8.5 -8.5) scale(.7)" fill="#fff">${icoInner('nav-arrow')}</g></g>`;
  const streets=`
    <rect width="400" height="440" fill="#f5f5f5"/>
    <path d="M-40 90 430 -20" stroke="#fff" stroke-width="30"/>
    <path d="M-50 205 430 110" stroke="#fff" stroke-width="26"/>
    <path d="M-30 320 430 235" stroke="#fff" stroke-width="22"/>
    <path d="M80 -30 20 470" stroke="#fff" stroke-width="24"/>
    <path d="M235 -30 300 470" stroke="#fff" stroke-width="24"/>
    <path d="M-20 420 300 340" stroke="#fff" stroke-width="16"/>
    <path d="M150 -30 120 470" stroke="#ececec" stroke-width="1.5"/>
    <path d="M340 -30 380 470" stroke="#ececec" stroke-width="1.5"/>
    <path d="M-40 150 430 60" stroke="#ececec" stroke-width="1.5"/>
    <path d="M-40 270 430 180" stroke="#ececec" stroke-width="1.5"/>`;
  const labels =
    L(120,24,'Worth St',-14)+L(237,32,'Leonard St',-14)+L(36,42,'W Broadway',70)+
    L(283,150,'Broadway',78)+L(118,165,'Reade St',-14)+L(96,215,'Chambers St',-14)+
    L(14,262,'Church St',74)+L(70,272,'Warren St',-14)+L(10,332,'Park Pl',-20)+
    (kind==='dir' ? L(150,300,'Park Row',-14)+L(236,306,'Spruce St',82)+L(52,368,'Ann St',-18)+L(300,390,'", "'.length?'':'' , -14) : '');
  const arrows = A(60,105,20)+A(200,80,-35)+A(320,120,30)+A(110,250,-20)+A(250,220,10)+A(180,330,45)+A(50,380,-15)+A(330,300,-40)+A(280,60,65);
  let route='', pins='';
  if(kind==='track'){
    route = `<path d="M168 84 L168 128 Q168 144 154 150 L114 166 Q100 171 100 186 L100 252 Q100 266 112 272 L214 320 Q228 326 228 340 L228 370"
      fill="none" stroke="#8a8a8a" stroke-width="6" stroke-linecap="round"/>`;
    pins = pin(168,66,homeGlyph)+pin(228,358,shopGlyph)+
      `<g transform="translate(76 152)"><rect width="48" height="21" rx="10.5" fill="#fff" stroke="#e3e3e3"/>
       <svg x="6" y="3.4" width="14" height="14" viewBox="0 0 24 24" color="#8f8f8f">${icoInner('scooter')}</svg>
       <text x="23" y="14.5" font-size="9.5" font-weight="600" fill="#8f8f8f">10</text></g>`;
  } else {
    route = `<path d="M186 92 L186 148 Q186 162 172 168 L138 184 Q126 189 126 202 L126 246 Q126 260 138 266 L262 330 Q278 338 284 352"
      fill="none" stroke="#8a8a8a" stroke-width="6" stroke-linecap="round"/>`;
    pins = pin(186,74,shopGlyph)+you(288,366);
  }
  return `<svg viewBox="0 0 400 440" preserveAspectRatio="xMidYMid slice">${streets}${labels}${arrows}${route}${pins}</svg>`;
};

/* coupon ticket */
const ticket = (c)=> `
<div class="ticket"><div class="strip"><span>${c.off}</span></div>
  <div class="bd"><div class="code">${c.code}</div><div class="ds">${c.d}</div>
  <div class="dash"></div><div class="un">${c.un}</div><div class="en">${c.en} • <b>T&amp;Cs Apply</b></div></div></div>`;

/* notification row */
const nrow = (n)=> `
<div class="nrow"><span class="nic">${I(n.icon)}</span>
  <div class="nt"><div class="nh"><span class="t1">${n.t}</span><span class="tm">${n.tm}</span></div>
  <div class="t2">${n.d}</div></div></div>`;

/* menu row */
const mrow = (m)=> `<a class="mrow" data-go="${m.go}"><span class="ic-chip">${I(m.icon)}</span><span class="lb">${m.t}</span><span class="arw">${I('chev-r')}</span></a>`;

/* success page frame */
const success = (badge, title, sub, foot)=> ({
  v:`<div class="scr">${sb()}<div style="height:1rem"></div><div class="appbar" style="justify-content:flex-start;min-height:3.4rem;padding-top:0">${backBtn()}</div>
    <div class="succ-wrap" style="margin-top:-2rem">
      <div class="succ-badge">${badge}</div>
      <div class="succ-t">${title}</div><div class="succ-s">${sub}</div>
    </div>${foot}</div>`,
  o:'' });
const badgeCheck = I('badge-check');

/* order card */
const ocard = (o2, acts)=> `
<div class="ocard">
  <div class="oh"><span class="oid">Order ID : <b>${o2.id}</b></span><span class="obadge">${o2.badge}</span></div>
  <div class="items">${o2.items.map(id=>oitem(P(id))).join('')}</div>
  <div class="acts">${acts}</div>
</div>`;

/* ================================================================
   SCREENS
   ================================================================ */
window.SCREENS = {

/* ---------- splash / onboarding / welcome ---------- */
splash: ()=> ({ v:'', o:`
  <div class="splash">
    <span class="sl-logo">${I('logo')}</span>
    <div class="sl-t">Grocery.</div>
    <svg class="sl-leaf" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5C9 3.5 4.5 9 4.5 15.5c0 2 .5 3.5 1 5 .8-4 2.8-9 8-11-3.5 3-5.8 7-6.2 11.5 1.2.5 2.7.5 4 .5 7 0 9.2-9 9.2-18Z"/></svg>
    <div class="gesture fx" style="background:#efefef"></div>
  </div>` }),

onboarding: (q)=> {
  const i = Math.min(2, Math.max(0, parseInt(q.i||'0',10)||0));
  const d = D.onboarding[i];
  return { v:`
  <div class="ob">
    ${sb()}
    <a class="ob-skip" data-go="#/welcome">Skip</a>
    <span class="ob-spark">${I('sparkle2')}</span>
    <div class="ob-stage">${phoneMock}</div>
    <div class="ob-sheet">
      <div class="ob-t">${d.t}</div>
      <div class="ob-s">${d.d}</div>
      <div class="ob-foot">
        <div class="dots">${[0,1,2].map(k=>`<i class="${k===i?'on':''}"></i>`).join('')}</div>
        <button class="ob-next" data-go="${i<2?`#/onboarding?i=${i+1}`:'#/welcome'}">${I('arr-r')}</button>
      </div>
    </div>
  </div>`, o:'' };
},

welcome: ()=> ({ v:`
  <div class="wel">
    ${sb()}
    <div class="wel-circle"></div>
    ${badgeSVG}
    <svg class="wel-leaf" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5C9 3.5 4.5 9 4.5 15.5c0 2 .5 3.5 1 5 .8-4 2.8-9 8-11-3.5 3-5.8 7-6.2 11.5 1.2.5 2.7.5 4 .5 7 0 9.2-9 9.2-18Z"/></svg>
    <div class="wel-cards">
      <div class="wcard2"><span class="wc-ic">${C('vegetables')}</span><div class="wl-t">Farm Fresh</div><div class="wl-s">Top-Grade<br>Fresh Produce</div><div class="wl-d"></div></div>
      <div class="wcard2 mid"><span class="wc-ic">${I('box')}</span><div class="wl-t">Fast Delivery</div><div class="wl-s">Quick &amp; reliable<br>delivery</div><div class="wl-d"></div></div>
      <div class="wcard2"><span class="wc-ic">${I('gear')}</span><div class="wl-t">Best Price</div><div class="wl-s">Great quality<br>at best Price</div><div class="wl-d"></div></div>
    </div>
    <div class="wel-body">
      <div class="hero-t it">Find fresh groceries<br>anytime, anywhere easy</div>
      <div class="sub-c">Get fresh groceries and essentials delivered quickly, making shopping simple and convenient</div>
    </div>
    <div class="wel-foot">
      <button class="btn" data-go="#/signup">Let’s Get Started</button>
      <div class="link-l">Already have an account? <u data-go="#/login">Sign In</u></div>
    </div>
  </div>`, o:'' }),

/* ---------- auth ---------- */
login: ()=> ({ v:`
  <div class="scr" style="background:var(--auth-hd)">
    <div style="color:#f0f0f0">${sb(1)}</div>
    <div class="auth-hd" style="padding-top:3.1rem">
      <div class="logo"><span style="width:8.2rem;display:block">${I('logo')}</span></div>
      <h1>Let’s get you Login!</h1>
      <p>Hi! Welcome back, you've been missed</p>
    </div>
    <div class="auth-card" style="flex:1">
      <div class="soc">
        <a style="color:#111">${I('apple')}</a><a style="color:#5c5c5c">${I('gpay')}</a><a style="color:#adadad">${I('fb')}</a>
      </div>
      <div class="or-line">Or sign in with</div>
      <div class="fld"><label>Email</label><div class="inp"><input value="example@gmail.com"></div></div>
      <div class="fld"><label>Password</label><div class="inp"><input type="password" value="................"><span class="tr">${I('eye-off')}</span></div></div>
      <div style="text-align:right;margin:-.2rem 0 1.6rem"><a class="link-u" data-go="#/verify?f=forgot">Forgot Password?</a></div>
      <button class="btn" data-go="#/home">Sign In</button>
      <div style="text-align:center;margin-top:1.4rem;font-size:.86rem;color:#9b9b9b">Don't have an account? <a class="link-u" data-go="#/signup">Sign Up</a></div>
      <div class="gesture"></div>
    </div>
  </div>`, o:'' }),

signup: ()=> ({ v:`
  <div class="scr" style="background:var(--auth-hd)">
    <div style="color:#f0f0f0">${sb(1)}</div>
    <div class="auth-hd" style="padding-top:2.6rem;padding-bottom:4.6rem">
      <h1>Create Account</h1>
      <p>Fill your information below or register<br>with your social account.</p>
    </div>
    <div class="auth-card" style="flex:1">
      <div class="soc">
        <a style="color:#111">${I('apple')}</a><a style="color:#5c5c5c">${I('gpay')}</a><a style="color:#adadad">${I('fb')}</a>
      </div>
      <div class="or-line">Or sign up with</div>
      <div class="fld"><label>Name</label><div class="inp"><input placeholder="Ex. John Doe"></div></div>
      <div class="fld"><label>Email</label><div class="inp"><input value="example@gmail.com"></div></div>
      <div class="fld"><label>Password</label><div class="inp"><input type="password" value="................"><span class="tr">${I('eye-off')}</span></div></div>
      <div class="check-row"><span class="cbx">${I('check')}</span>Agree with <a class="link-u" data-go="#/privacy" style="margin-left:.2rem">Terms &amp; Condition</a></div>
      <button class="btn" data-go="#/verify">Sign Up</button>
      <div style="text-align:center;margin-top:1.3rem;font-size:.86rem;color:#9b9b9b">Already have an account? <a class="link-u" data-go="#/login">Sign In</a></div>
      <div class="gesture"></div>
    </div>
  </div>`, o:'' }),

verify: (q)=> { const f = q.f||'signup'; return { v:`
  <div class="scr">${sb()}
    <div class="appbar" style="justify-content:flex-start;min-height:3.8rem">${''}<button class="back" data-back>${I('chev-l')}</button></div>
    <div class="page center-col" style="align-items:center;padding-top:1.2rem">
      <div class="h-page">Verify Code</div>
      <div class="sub-c" style="margin-top:.8rem">Enter the verification code we sent to<br>example@email.com</div>
      <div class="otp" data-otp>
        <input maxlength="1" inputmode="numeric" value="2"><input maxlength="1" inputmode="numeric" value="8">
        <input maxlength="1" inputmode="numeric" placeholder="-"><input maxlength="1" inputmode="numeric" placeholder="-">
      </div>
      <div class="sub-c" style="margin-bottom:.5rem">Didn’t receive OTP?</div>
      <a class="link-u">Resend code</a>
      <button class="btn" style="margin-top:2.3rem" data-go="${f==='forgot'?'#/new-password':'#/complete-profile'}">Verify</button>
    </div>
  </div>`, o:'' }; },

'new-password': ()=> ({ v:`
  <div class="scr">${sb()}
    <div class="appbar" style="justify-content:flex-start;min-height:3.8rem"><button class="back" data-back>${I('chev-l')}</button></div>
    <div class="page" style="padding-top:1.2rem">
      <div class="h-page">New Password</div>
      <div class="sub-c" style="margin:.8rem 0 2.2rem">Your new password must be different<br>from previously used passwords.</div>
      <div class="fld"><label>Password</label><div class="inp"><input type="password" value="................"><span class="tr">${I('eye-off')}</span></div></div>
      <div class="fld"><label>Confirm Password</label><div class="inp"><input type="password" value="................"><span class="tr">${I('eye-off')}</span></div></div>
      <button class="btn" data-go="#/login" style="margin-top:1.2rem">Create New Password</button>
    </div>
  </div>`, o:'' }),

'complete-profile': ()=> ({ v:`
  <div class="scr">${sb()}
    <div class="appbar" style="justify-content:flex-start;min-height:3.8rem"><button class="back" data-back>${I('chev-l')}</button></div>
    <div class="page" style="padding-top:.6rem">
      <div class="h-page">Complete Your Profile</div>
      <div class="sub-c" style="margin:.8rem 0 1.8rem">Don't worry, only you can see your personal<br>data. No one else will be able to see it.</div>
      <div class="center-col" style="margin-bottom:1.9rem">
        <span style="position:relative;display:inline-block">
          <span class="ic-chip lg" style="width:6.4rem;height:6.4rem;background:#f6f6f6;color:#b5b5b5">${I('user')}</span>
          <span class="av-edit" style="position:absolute;right:-.05rem;bottom:.15rem;width:2.25rem;height:2.25rem;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;border:.14rem solid #fff"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:.95rem;height:.95rem"><path d="m14.5 5 4.5 4.5L8 20.5l-5 .5.5-5L14.5 5Z"/></svg></span>
        </span>
      </div>
      <div class="fld"><label>Name</label><div class="inp"><input placeholder="Ex. John Doe"></div></div>
      <div class="fld"><label>Phone Number</label><div class="inp"><span class="tr-t">+1</span><span class="tr" style="margin-left:.35rem">${I('chev-d')}</span><span class="sep"></span><input placeholder="Enter Phone Number"></div></div>
      <div class="fld"><label>Gender</label><div class="inp"><span class="hint-t" style="flex:1">Select</span><span class="tr">${I('chev-d')}</span></div></div>
      <button class="btn" data-go="#/notif-access" style="margin-top:1.3rem">Complete Profile</button>
    </div>
  </div>`, o:'' }),

'notif-access': ()=> ({ v:`
  <div class="scr">${sb()}
    <div class="perm">
      <span class="perm-ico">${I('bell')}</span>
      <div class="h-page">Enable Notification Access</div>
      <div class="sub-c" style="margin-top:.8rem">Enable notifications to receive real-time<br>updates .</div>
      <button class="btn" data-go="#/location-access">Allow Notification</button>
      <a class="link-t" data-go="#/location-access">Maybe Later</a>
    </div>
  </div>`, o:'' }),

'location-access': ()=> ({ v:`
  <div class="scr">${sb()}
    <div class="perm">
      <span class="perm-ico">${I('pin')}</span>
      <div class="h-page">What is Your Location?</div>
      <div class="sub-c" style="margin-top:.8rem">Turn on location services to get better<br>delivery estimates.</div>
      <button class="btn" data-go="#/home">Allow Location Access</button>
      <a class="link-t" data-go="#/enter-location">Enter Location Manually</a>
    </div>
  </div>`, o:'' }),

'enter-location': ()=> ({ v:`
  <div class="scr">${sb()}
    ${`<div class="appbar">${backBtn()}<div class="title">Enter Your Location</div></div>`}
    <div class="page">
      <div class="sbar">${I('search')}<input value="${D.locationQuery}"><span class="tr">${I('x-c')}</span></div>
      <button class="loc-res" style="margin-top:1.2rem;width:100%">${I('nav-arrow')}<span><span class="lt" style="font-weight:500">Use my current location</span></span></button>
      <div class="divider" style="margin:1.1rem 0 0"></div>
      <div class="lab-sm">SEARCH RESULT</div>
      <button class="loc-res" data-go="#/home">${I('nav-arrow')}<span><span class="lt">${D.locationResult.t}</span><div class="ls">${D.locationResult.s}</div></span></button>
    </div>
  </div>`, o:'' }),

/* ---------- home ---------- */
home: ()=> ({
  v:`
  <div class="scr">
    <div class="hd">${sb(1)}
      <div class="hd-top">${avatar()}<div class="hd-loc"><div class="l1">Location</div><div class="l2">${I('pin')}New York, USA<span class="dn">${I('chev-d')}</span></div></div>
        <button class="bell" data-go="#/notifications">${I('bell')}</button></div>
      <div class="hd-search"><div class="search-bar" data-go="#/search">${I('search')}<span>Search Products...</span></div>
        <button class="flt-btn" data-go="#/filter">${I('sliders')}</button></div>
    </div>
    <div class="page">
      ${secRow('Exclusive Offers','#/offers')}
      ${offerCard(D.offers[0])}
      <div class="dots"><i class="on"></i><i></i><i></i><i></i></div>
      ${secRow('Explore Categories','#/categories')}
    </div>
    <div class="chip-row">${D.categories.slice(0,6).map(([k,l],idx)=>`<button class="chip${idx===0?' on':''}" data-go="#/featured">${C(k)}${l}</button>`).join('')}</div>
    <div class="page" style="margin-top:.4rem">${secRow('Featured Products','#/featured')}</div>
    <div class="grid2">${[1,6,9,3].map(id=>pcard(P(id))).join('')}</div>
    <div class="nbot"></div>
  </div>`,
  o: navBar('home') }),

categories: ()=> ({ v:`
  <div class="scr">${appbar('Explore Categories')}
    <div class="catg">${D.categories.map(([k,l])=>`<button class="catc" data-go="#/featured"><span class="cc">${C(k)}</span><span class="cl">${l}</span></button>`).join('')}</div>
  </div>`, o:'' }),

offers: ()=> ({ v:`
  <div class="scr">${appbar('Special Offers')}
    <div class="page">${D.offers.map(o2=>`<div style="margin-bottom:1.2rem">${offerCard(o2)}</div>`).join('')}</div>
  </div>`, o:'' }),

featured: ()=> ({ v:`
  <div class="scr">${appbar('Featured Products')}
    <div class="grid2" style="margin-top:.2rem">${[1,10,5,6,3,8].map(id=>pcard(P(id))).join('')}</div>
    <div class="nbot" style="height:2rem"></div>
  </div>`, o:'' }),

'daily-deal': ()=> ({ v:`
  <div class="scr">${appbar('Daily Deal')}
    <div class="chip-row" style="margin-top:.2rem">${D.dealChips.map((c,idx)=>`<button class="chip${idx===1?' on':''}" data-chip>${c}</button>`).join('')}</div>
    <div class="page" style="margin-top:1.3rem">${[4,9,11,12,13].map(id=>lprod(P(id))).join('')}</div>
  </div>`, o: gesture() }),

/* ---------- product / video / reviews ---------- */
product: ()=> {
  const p = P(1);
  const weights=[['1 lb','$2.55',1],['2 lb','$5.10',0],['3 lb','$7.65',0],['4 lb','$10.20',0],['5 lb','$12.75',0]];
  return { v:`
  <div class="scr" style="background:var(--thumb)">${sb()}
    <div class="phero">
      <div class="p-top"><button class="back" style="position:static;transform:none" data-back>${I('chev-l')}</button>
        <span class="grp"><button class="round-act" data-fav="1" style="color:var(--primary)">${I('heart-f')}</button><button class="round-act">${I('share')}</button></span></div>
      <div class="ptumbs">
        <span class="ptb"></span><span class="ptb"></span><span class="ptb"></span><span class="ptb"></span>
        <button class="ptb vid" data-go="#/video">${I('q-dot')}</button>
      </div>
    </div>
    <div class="page" style="flex:1;padding-top:2.7rem;background:#fff;border-radius:0">
      <div class="p-meta1"><span class="pcat">${p.cat}</span><a class="prate2" data-go="#/reviews">${I('star')}4.9 (1.3K)</a></div>
      <div class="p-title">${p.name}</div>
      <div class="flabel" style="margin-top:1.5rem">Store Contact</div>
      <div class="scontact">${avatar(3.3)}<div class="sc-t"><b>Sophia Mitchell</b><span>Manager</span></div>
        <button class="round-act g" data-go="#/chat">${I('chatb')}</button><button class="round-act g">${I('phone')}</button></div>
      <div class="flabel" style="margin-top:1.5rem">Weight : 1 lb</div>
      <div class="wchips">${weights.map(w=>`<button class="wchip${w[2]?' on':''}" data-chip><span>${w[0]}</span><b>${w[1]}</b></button>`).join('')}</div>
      <div class="flabel" style="margin-top:1.5rem">Product Details</div>
      <p class="body-t">Fresh, juicy strawberries picked at peak ripeness. Naturally sweet and rich in vitamin C — perfect for snacking, desserts, smoothies and salads. Store chilled and consume within 2–3 days for best taste.</p>
      <div style="height:1.2rem"></div>
    </div>
    <div class="btn-row bar" style="align-items:center">${step(1)}<button class="btn half" data-go="#/cart">Add item&nbsp;&nbsp;$${p.price.toFixed(2)}</button></div>
  </div>`, o:'' };
},

video: ()=> ({ v:'', o:`
  <div class="video-full"><div class="vland">
    <div class="video-stage">
      <button class="vcoll" data-back>${I('chev-u')}</button>
      <span class="vplay" style="background:rgba(255,255,255,.92);color:#6d6d6d">${I('pause')}</span>
      <button class="vmore">${I('more')}</button>
      <span class="vthumb"></span>
    </div>
    <div class="vbar">
      <div class="vseek"><div class="vtrack"><i></i></div><span class="vtime">01 : 15 / 01:59</span></div>
      <div class="vctrl">
        <span class="vgrp">${I('vsetting')}${I('expand')}</span>
        <span class="vgrp">${I('rr')}${I('ff')}</span>
        <span class="vgrp">${I('cast')}</span>
      </div>
    </div>
  </div></div>` }),

reviews: ()=> ({ v:`
  <div class="scr">${appbar('Review')}
    <div class="rv-sum">
      <div class="rv-l"><div class="rv-big">4.9</div>${stars(5,1)}<div class="rv-cnt">(1.3K Reviews)</div></div>
      <div class="hist">${D.hist.map((h,i)=>`<div class="hrow"><span class="n">${5-i}</span><span class="bar"><i style="width:${h}%"></i></span></div>`).join('')}</div>
    </div>
    <div class="page">
      <div class="sbar" style="margin:.4rem 0 1.1rem">${I('search')}<input placeholder="Search in reviews"></div>
      <div class="chip-row" style="padding-left:0;padding-right:0;margin-bottom:1.3rem">
        <button class="chip ghost">${I('sliders')}Filter${I('chev-d')}</button>
        <button class="chip on" data-chip>Verified</button><button class="chip on" data-chip>Latest</button>
        <button class="chip ghost" data-chip>Detailed Reviews</button>
      </div>
      ${D.reviews.map(r=>`
      <div class="rcard">
        <div class="rh"><span class="rav">${avatar(2.9)}<span class="vf">${I('badge-check')}</span></span><span class="rn">${r.n}</span><span class="rt">${r.tm}</span></div>
        <div class="rb">${r.d}</div>
        <div class="rs">${stars(5,1).replace(' stars','').replace('class="','class="')}<span style="margin-left:.4rem">${r.r}</span></div>
        ${r.imgs?`<div class="imgs">${'<i></i>'.repeat(r.imgs)}</div>`:''}
      </div>`).join('')}
    </div>
    <div class="btn-row bar"><button class="btn" data-go="#/review-product">Write Review</button></div>
  </div>`, o:'' }),

'review-product': ()=> ({ v:`
  <div class="scr">${appbar('Review')}
    <div class="page">
      <div class="bcard" style="display:flex;align-items:center;gap:1rem;padding:.85rem">
        <div class="oimg" style="width:4.9rem;height:4.5rem"></div>
        <div style="flex:1;min-width:0"><div class="oinfo">
          <div class="on">Fresh Strawberry</div><div class="om">Fruit | 1 lb</div>
          <div class="op">$2.55 <s>$3.00</s></div></div></div>
        <button class="btn xs" data-go="#/cart">Re-Order</button>
      </div>
      <div class="rd-q">How Was Your Experience With Us?</div>
      <div class="bcard" style="padding:1.25rem 1rem .5rem;text-align:center">
        <div class="yr">Your overall rating</div>${stars(5)}
      </div>
      <span class="fld-l">Add detailed review</span>
      <textarea class="ta" placeholder="Enter here"></textarea>
      <button class="addph">${I('cam')}Add Photo</button>
    </div>
    <div class="btn-row bar"><button class="btn" data-go="#/home">Submit</button></div>
  </div>`, o:'' }),

/* ---------- search / filter ---------- */
search: ()=> ({ v:`
  <div class="scr">${sb()}
    <div class="appbar" style="min-height:4.1rem;padding-right:1.25rem"><button class="back" data-back>${I('chev-l')}</button>
      <div class="sbar" style="flex:1;margin-left:3.3rem">${I('search')}<input id="sq" placeholder="Search…"></div></div>
    <div class="page">
      ${secRowSm('Recent Search','<button class="see-all" data-clear>Clear All</button>')}
      <div class="rchips">${D.recentSearches.map(t=>`<button class="chip ghost x" data-go="#/search-results">${t}${I('x')}</button>`).join('')}</div>
      ${secRowSm('Recently Viewed','<a class="see-all" data-go="#/search-results">See All</a>')}
      <div style="height:.4rem"></div>
      ${[5,4,3,14].map(id=>lprod(P(id))).join('')}
    </div>
  </div>`, o:'' }),

'search-results': ()=> ({ v:`
  <div class="scr">${sb()}
    <div class="appbar" style="min-height:4.1rem;padding-right:1.25rem"><button class="back" data-back>${I('chev-l')}</button>
      <div class="sbar" style="flex:1;margin-left:3.3rem">${I('search')}<span style="color:#929292;font-size:.86rem">Fruits</span></div></div>
    <div class="page" style="margin-top:.2rem">
      ${secRowSm('Results for “Fruits”','<span class="res-c">56 Results Found</span>')}
      <div class="grid2" style="padding:0">${[7,8,9,1,10,11].map(id=>pcard(P(id))).join('')}</div>
    </div>
  </div>`, o: gesture() }),

filter: ()=> {
  const chipRow = (arr, key)=> `<div class="chip-row" style="padding-left:0;padding-right:0">${arr.map((c,i)=>`<button class="chip${i===0?' on':''}" data-chip>${c}</button>`).join('')}</div>`;
  return { v:`
  <div class="scr">${appbar('Filter')}
    <div class="page">
      <div class="flabel" style="margin-top:.2rem">Category</div>${chipRow(D.filterCats)}
      <div class="flabel">Sort by</div>${chipRow(D.filterSort)}
      <div class="flabel">Reviews</div>
      <div>${D.filterStars.map((s,i)=>`<button class="frrow" data-radio="stars"><span class="stars sm" style="gap:.3rem">${[1,2,3,4,5].map(k=>`<span class="st">${I('star')}</span>`).join('')}</span><span class="frlab">${s}</span><span class="radio${i===0?' on':''}"></span></button>`).join('')}</div>
      <div class="flabel" style="margin-top:1.6rem">Price Range</div>
      <div class="pslider" data-pslider data-lo="14.3" data-hi="85.7">
        <div class="trk"></div><div class="fl" style="left:14.3%;right:14.3%"></div>
        <div class="th" data-t="lo" style="left:14.3%"></div><div class="th" data-t="hi" style="left:85.7%"></div>
      </div>
      <div class="plb">${[2,4,6,8,10,12,14,16].map(v=>`<span>$${v}</span>`).join('')}</div>
      <div class="flabel" style="margin-top:1.6rem">Product Type</div>${chipRow(D.filterType)}
      <div style="height:1rem"></div>
    </div>
    <div class="btn-row bar"><button class="btn ghost half" data-back>Reset Filter</button><button class="btn half" data-go="#/search-results">Apply</button></div>
  </div>`, o:'' }; },

/* ---------- favorite ---------- */
favorite: ()=> ({
  v:`
  <div class="scr">${appbar('Favorite',{right:`<button class="round-act">${I('search')}</button>`})}
    <div class="chip-row" style="margin-top:.1rem">${D.favChips.map((c,i)=>`<button class="chip${i===0?' on':''}" data-chip>${c}</button>`).join('')}</div>
    <div class="grid2" style="margin-top:1.2rem">${[1,2,3,4,8,6].map(id=>pcard(P(id))).join('')}</div>
    <div class="nbot"></div>
  </div>`,
  o: navBar('heart') }),

/* ---------- cart flow ---------- */
cart: (q)=> {
  const type = q.type==='pickup' ? 'pickup':'delivery';
  const items = D.cartIds.map((id,i)=>{
    const p = Object.assign({}, P(id));
    if(type==='pickup' || true){ /* mock cart shows “2 lb” for green apple */
      if(p.id===6) p.qty='2 lb';
    }
    return citemRow(p, i===1, type);
  }).join('');
  let sheet='';
  if(q.sheet==='remove'){
    sheet = `
    <div class="sheetwrap" data-bdrop><div class="sheet">
      <div class="handle"></div><h3>Remove from Cart?</h3>
      <div class="mprod"><div class="oimg"></div><div class="mi"><div class="mn">Fresh Strawberry</div><div class="mm">1 Lb</div><div class="mp">$2.55 <s>$3.00</s></div></div></div>
      <div class="sh-btns"><button class="btn ghost half" data-back>Cancel</button><button class="btn half" data-go="#/cart${type==='pickup'?'?type=pickup':''}">Yes, Remove</button></div>
    </div></div>`;
  } else if(q.sheet==='pickup'){
    const col=(vals,on)=>`<div class="wcol" data-w>${vals.map(v=>`<div${v===on?' class="on"':''}>${v}</div>`).join('')}</div>`;
    sheet = `
    <div class="sheetwrap" data-bdrop><div class="sheet">
      <div class="handle"></div>
      <div class="head-line"><span class="t">PickUp Time</span><span class="pk">PICKUP NOW</span></div>
      <div class="divider"></div>
      <div class="sh-sub" style="margin:1.15rem 0 .4rem">Today, 12 June 2026</div>
      <div class="wheels" style="margin:.6rem 0 1.2rem"><div class="hl"></div>
        <div class="wcols">
          ${col(['05','06','07','08'],'07')}
          <span class="wcolon">:</span>
          ${col(['28','29','30','31'],'30')}
          ${col(['AM','PM'],'PM')}
        </div>
      </div>
      <button class="btn" data-go="#/cart?type=pickup">Confirm</button>
    </div></div>`;
  }
  const orderCard = type==='pickup'
    ? `<div data-go="#/cart?type=pickup&sheet=pickup">${icard(I('walk'),'Pickup','30–35 mins • Collect from Store',{t:'CHANGE',go:'#/order-type'})}</div>`
    : icard(I('box'),'Delivery','30–45 mins • To your address',{t:'CHANGE',go:'#/order-type'});
  const addrCard = type==='pickup'
    ? `<div data-go="#/get-direction">${icard(STORE,'GreenBasket Co.','88 Bedford Street, New York, NY 10014',null,'2.5 miles away from your location',1)}</div>`
    : icard(I('pin'),'Home','245 Madison Ave, New York, NY 10016, USA',{t:'CHANGE',go:'#/delivery-address'},'35 minute estimate arrived',1);
  return {
  v:`
  <div class="scr">${appbar('My Cart')}
    <div class="page" style="flex:1">
      ${items}
      <div class="flabel">Order Type</div>
      ${orderCard}
      <div class="flabel">${type==='pickup'?'Pickup Address':'Delivery Address'}</div>
      ${addrCard}
      <div style="height:1rem"></div>
    </div>
    <div class="btn-row bar"><button class="btn" data-go="#/review-summary">Proceed to Checkout</button></div>
  </div>`,
  o: sheet };
},

'order-type': ()=> ({ v:`
  <div class="scr">${appbar('Order Type')}
    <div class="page">
      ${paycard(
        payr(`<span class="ic-chip">${I('box')}</span><span class="tx"><span class="t1">${D.orderType[0].t}</span><span class="t2">${D.orderType[0].s}</span></span>`,'otype','delivery',1)+
        payr(`<span class="ic-chip">${I('walk')}</span><span class="tx"><span class="t1">${D.orderType[1].t}</span><span class="t2">${D.orderType[1].s}</span></span>`,'otype','pickup',0)
      )}
    </div>
    <div class="btn-row bar" style="margin-top:auto"><button class="btn" data-otype-continue>Continue</button></div>
  </div>`, o:'' }),

'delivery-type': ()=> ({ v:`
  <div class="scr">${appbar('Delivery Type')}
    <div class="page">
      ${paycard(D.deliveryTypes.map((d,i)=>
        payr(`<span class="ic-chip">${I(d.icon)}</span><span class="tx"><span class="t1">${d.t}</span><span class="t2">${d.s}</span></span><span class="pp">${d.p}</span>`,'dtype',i,d.on?1:0)
      ).join(''))}
    </div>
    <div class="btn-row bar" style="margin-top:auto"><button class="btn" data-go="#/cart">Continue</button></div>
  </div>`, o:'' }),

'delivery-address': ()=> ({ v:`
  <div class="scr">${appbar('Delivery Address')}
    <div class="page">
      <div class="acard" style="padding:.3rem 1.15rem">
        ${D.addresses.map((a,i)=>`<button class="addr" style="width:100%;text-align:left" data-radio="addr"><span class="pin">${I('pin')}</span><span class="at"><span class="an">${a.t}</span><div class="aa">${a.a}</div></span><span class="radio${a.on?' on':''}"></span></button>`).join('')}
      </div>
      <button class="dashed">${I('plus')}Add New Shipping Address</button>
    </div>
    <div class="btn-row bar" style="margin-top:auto"><button class="btn" data-go="#/cart">Continue</button></div>
  </div>`, o:'' }),

'manage-address': ()=> ({ v:`
  <div class="scr">${appbar('Manage Address')}
    <div class="page">
      <div class="acard" style="padding:.3rem 1.15rem">
        ${D.addresses.map(a=>`<div class="addr"><span class="pin">${I('pin')}</span><span class="at"><span class="an">${a.t}</span><div class="aa">${a.a}</div></span></div>`).join('')}
      </div>
      <button class="dashed">${I('plus')}Add New Shipping Address</button>
    </div>
  </div>`, o:'' }),

'review-summary': ()=> ({ v:`
  <div class="scr">${appbar('Review Summary')}
    <div class="page">
      ${D.cartIds.map(id=>itemCard(P(id))).join('')}
      <div class="flabel" style="margin-top:.4rem">Order Date</div>
      ${icard(I('cal'),'Date and Time',D.summary.date)}
      <div class="flabel" style="display:flex;justify-content:space-between;align-items:center">Order Type <a class="see-all" style="font-size:.72rem" data-go="#/order-type">Edit Details</a></div>
      ${icard(I('box'),'Delivery','30–45 mins • To your address')}
      <div style="height:1rem"></div>
    </div>
    <div class="btn-row bar"><button class="btn" data-go="#/payments?checkout=1">Place Order</button></div>
  </div>`, o:'' }),

/* ---------- payments ---------- */
payments: (q)=> {
  const checkout = q.checkout==='1';
  const groups = checkout ? D.payments : D.payments.filter(g=>['Credit & Debit Card','More Payment Options'].includes(g.group));
  const rowFor = (it)=>{
    const left = it.icon==='paypal'?`<span class="bic" style="color:#8a8a8a">${I('paypal')}</span>`
      : it.icon==='apple'?`<span class="bic" style="color:#111">${I('apple')}</span>`
      : it.icon==='gpay'?`<span class="bic" style="color:#5c5c5c">${I('gpay')}</span>`
      : `<span class="pic">${I(it.icon)}</span>`;
    if(it.arrow) return `<button class="payr">${left}<span class="lb" style="flex:1">${it.t}</span><span class="arw">${I('chev-r')}</span></button>`;
    return payr(`${left}<span class="lb" style="flex:1">${it.t}</span>`,'pay',it.t,it.on?1:0);
  };
  return { v:`
  <div class="scr">${appbar('Payment Methods')}
    <div class="page">
      ${groups.map(g=>`<div class="flabel" style="margin-top:1.1rem">${g.group}</div>${paycard(g.items.map(rowFor).join(''))}`).join('')}
    </div>
    ${checkout?`<div class="btn-row bar" style="margin-top:auto"><button class="btn" data-go="#/payment-success">Confirm Payment</button></div>`:''}
  </div>`, o:'' }; },

'payment-success': ()=> success(badgeCheck,'Payment Successful!','Order placed successfully!',
  `<div class="btn-col" style="width:100%"><button class="btn" data-go="#/orders/active">View Order</button><a class="link" data-go="#/e-receipt">View E-Receipt</a></div>`),

'topup-success': ()=> success(badgeCheck,'Top Up Successful!','You have successfully Top-Up<br>e-wallet for $250.00',
  `<div class="btn-col" style="width:100%"><button class="btn" data-go="#/wallet">OK</button></div>`),

'e-receipt': ()=> ({ v:`
  <div class="scr">${appbar('E-Receipt',{right:`<button class="round-act">${I('download')}</button>`})}
    ${barcode()}
    <div class="page">
      ${D.receipt.items.map(id=>itemCard(P(id))).join('')}
      <div class="flabel" style="margin-top:.3rem">Order Details</div>
      <div class="rec-grid">
        <div class="c1"><div class="k">Order ID</div><div class="v">${D.receipt.orderId}</div></div>
        <div class="c1"><div class="k">Customer Name</div><div class="v">${D.receipt.customer}</div></div>
        <div class="c1"><div class="k">Phone</div><div class="v">${D.receipt.phone}</div></div>
        <div class="c1"><div class="k">Promo Code</div><div class="v">${D.receipt.promo}</div></div>
        <div class="c1"><div class="k">Payment Methods</div><div class="v">${D.receipt.method}</div></div>
        <div class="c1"><div class="k">Transaction ID</div><div class="v">${D.receipt.txn} ${I('doc')}</div></div>
      </div>
      <div style="height:1.6rem"></div>
    </div>
  </div>`, o:'' }),

/* ---------- orders ---------- */
orders: (q)=> {
  const tab = ['active','completed','cancelled'].includes(q.seg)? q.seg : 'active';
  const acts = tab==='active'
    ? `<button class="btn ghost half" data-go="#/cancel-order">Cancel</button><button class="btn half" data-go="#/track-order">Track Order</button>`
    : tab==='completed'
    ? `<button class="btn ghost half" data-go="#/review-product">Leave Review</button><button class="btn half" data-go="#/e-receipt">View E-Receipt</button>`
    : `<button class="btn" style="border-radius:.85rem;height:2.9rem;font-size:.88rem" data-go="#/cart">Re - Order</button>`;
  const ti = ['active','completed','cancelled'].indexOf(tab);
  return { v:`
  <div class="scr">${appbar('My Orders',{right:`<button class="round-act">${I('search')}</button>`})}
    <div class="tabs">
      <a class="${tab==='active'?'on':''}" data-go="#/orders/active">Active</a>
      <a class="${tab==='completed'?'on':''}" data-go="#/orders/completed">Completed</a>
      <a class="${tab==='cancelled'?'on':''}" data-go="#/orders/cancelled">Cancelled</a>
      <span class="ind" style="left:${ti*33.333}%"></span>
    </div>
    <div class="page" style="padding-top:1.3rem">${D.orders[tab].map(o2=>ocard(o2,acts)).join('')}</div>
  </div>`, o:'' }; },

'cancel-order': ()=> ({ v:`
  <div class="scr">${appbar('Cancel Order')}
    <div class="page">
      <p class="body-t" style="margin:.2rem 0 .6rem">Please select the reason for cancellations:</p>
      ${D.cancelReasons.map((r,i)=>`<button class="payr" style="padding:.62rem 0" data-radio="cancel"><span class="radio${i===0?' on':''}"></span><span class="lb">${r}</span></button>`).join('')}
      <div class="divider" style="margin:.8rem 0 0"></div>
      <span class="fld-l">Other</span>
      <textarea class="ta" placeholder="Enter your Reason" style="min-height:8.6rem"></textarea>
    </div>
    <div class="btn-row bar"><button class="btn" data-go="#/orders/cancelled">Cancel Order</button></div>
  </div>`, o:'' }),

'track-order': ()=> { const o2 = D.orders.active[1]; return { v:`
  <div class="scr">${appbar('Track Order')}
    <div class="page">
      ${itemCard(P(o2.items[0]))}
      <div class="flabel" style="margin-top:.3rem">Order Details</div>
      ${icard(I('clipboard'),'Order ID',o2.id)}
      <div class="flabel">Order Status</div>
      <div class="bcard" style="padding:.6rem 1.1rem 0">
        <div class="tsteps">
          ${D.trackSteps.map((s,i,a)=>`
          <div class="tstep ${s.done?'done':'todo'}">
            ${i<a.length-1?'<span class="tline"></span>':''}
            <span class="tdot">${I('check')}</span>
            <div class="tt"><div class="t1">${s.t}</div><div class="t2">${s.s}</div></div>
            <span class="tico">${I(s.icon)}</span>
          </div>`).join('')}
        </div>
      </div>
      <div style="height:1.2rem"></div>
    </div>
    <div class="btn-row bar"><button class="btn" data-go="#/track-map">Track Live Location</button></div>
  </div>`, o:'' }; },

'track-map': ()=> ({ v:`
  <div class="scr">
    <div class="mapwrap">${mapSVG('track')}
      <div class="mapbar">${sb()}
        <div class="row">${backBtn()}<div class="title">Track Order</div></div>
      </div>
    </div>
    <div class="sheet static" style="max-height:55%">
      <div class="handle"></div>
      <div class="eta-t">Estimated Arrival Time</div>
      <div class="eta-v">06:40 PM - 06:50 PM</div>
      <div class="cour">
        ${avatar(3.4)}
        <div class="ct"><div class="cn2">${D.courier.name}</div><div class="cr">${D.courier.role}</div></div>
        <button class="round-act g" data-go="#/chat">${I('chatb')}</button>
        <button class="round-act g">${I('phone')}</button>
      </div>
      <div class="route2">
        <div class="rr1"><span class="rp">${I('q-dot')}</span><span class="rt">GreenBasket Co.</span></div>
        <div class="rc2"></div>
        <div class="rr1"><span class="rp">${I('pin')}</span><span class="rt">245 Madison Ave, New York, N..</span></div>
      </div>
      <div class="flabel" style="margin-top:.2rem">Item</div>
      ${oitem(P(10))}
      <div style="height:.6rem"></div>
    </div>
  </div>`, o:'' }),

'get-direction': ()=> ({ v:`
  <div class="scr">
    <div class="mapwrap">${mapSVG('dir')}
      <div class="mapbar">${sb()}
        <div class="row">${backBtn()}<div class="title">Get Direction</div></div>
      </div>
      <button class="gps" style="bottom:1.3rem">${I('target')}</button>
    </div>
    <div class="sheet static" style="padding-bottom:.6rem">
      <div class="handle"></div>
      <div class="route2" style="border:none;margin:0;padding:.3rem .2rem .6rem">
        <div class="rr1"><span class="rp">${I('q-dot')}</span><span style="min-width:0"><span class="rt">GreenBasket Co.</span><div class="rs">${D.pickup.addr}</div></span></div>
      </div>
      <div class="btn-row" style="padding:.2rem 0 0"><button class="btn" data-go="#/arrived">Start</button></div>
    </div>
  </div>`, o:'' }),

arrived: ()=> success(badgeCheck,'You Have Arrived!','Your groceries are waiting. Begin<br>collecting your items now.',
  `<div class="btn-col" style="width:100%"><button class="btn" data-go="#/rate-delivery">Collect Items</button></div>`),

'rate-delivery': ()=> ({ v:`
  <div class="scr">${appbar('Rate Delivery Partner')}
    <div class="page">
      <div class="bcard" style="padding:1.7rem 1rem 1.4rem;text-align:center">
        ${avatar(5.2)}<div class="rd-n" style="margin-top:1rem">${D.courier.name}</div>
        <div class="rd-r">${D.courier.role}</div>
        <div class="rd-m">${I('star')} ${D.courier.rating} <i>|</i> ${D.courier.id}</div>
      </div>
      <div class="rd-q">How was Delivery Experience<br>with Charlotte?</div>
      <div class="bcard" style="padding:1.2rem 1rem .5rem;text-align:center">
        <div class="yr">Your overall rating</div>${stars(5)}
      </div>
      <span class="fld-l">Add detailed review</span>
      <textarea class="tac" placeholder="Enter here"></textarea>
    </div>
    <div class="btn-row bar"><button class="btn ghost half" data-back>Cancel</button><button class="btn half" data-go="#/review-product">Submit</button></div>
  </div>`, o:'' }),

/* ---------- chat / notifications / coupons / wallet ---------- */
chat: ()=> {
  const meta = (m)=> m.who==='them'
    ? `<div class="msg-meta"><span class="mini"></span><span>${m.by}</span><span class="tm">${m.tm}</span></div>`
    : `<div class="msg-meta" style="justify-content:flex-end"><span class="tm" style="margin:0;margin-right:auto">${m.tm}</span><span class="mini"></span><span>${m.by}</span></div>`;
  const bubble = (m)=>{
    if(m.type==='img') return `<div class="msg them" style="width:78%"><div class="msg-img"></div></div>${meta(m)}`;
    if(m.type==='voice') return `<div class="voice"><span class="vpl">${I('play')}</span>${wave()}<span class="vd"><i></i>${m.d}</span></div>${meta(m)}`;
    return `<div class="msg ${m.who}">${m.d}</div>${meta(m)}`;
  };
  return { v:`
  <div class="scr chat-page" style="overflow:hidden">
    <div style="background:var(--primary)">${sb(1)}
      <div class="chat-hd" style="padding-top:.55rem">
        <button class="cback" data-back>${I('chev-l')}</button>
        <span class="cav"></span>
        <div class="cn"><div class="n">${D.chatWith.n}</div><div class="o">${D.chatWith.s}</div></div>
        <button class="cmenu">${I('more')}</button>
      </div>
    </div>
    <div class="chat-bd" id="cbd">
      <div class="day-lab">TODAY</div>
      ${D.chat.map(bubble).join('')}
    </div>
    <div class="chat-input">
      <div class="fld2">${I('smile')}<input id="cin" placeholder="Type a message here...">${I('link2')}</div>
      <button class="mic">${I('mic')}</button>
    </div>
  </div>`, o:'' }; },

notifications: ()=> ({ v:`
  <div class="scr">${appbar('Notification',{right:'<span class="badge-pill" style="position:static;transform:none">2 NEW</span>'})}
    <div class="page">
      <div class="nhead"><span class="g">TODAY</span><button class="m">Mark all as read</button></div>
      ${D.notifications.today.map(nrow).join('')}
      <div class="nhead"><span class="g">YESTERDAY</span><button class="m">Mark all as read</button></div>
      ${D.notifications.yesterday.map(nrow).join('')}
      <div style="height:1.2rem"></div>
    </div>
  </div>`, o:'' }),

coupons: ()=> ({ v:`
  <div class="scr">${appbar('Coupon')}
    <div class="page"><div class="cp-h">Best offers for you</div>
      ${D.coupons.map(ticket).join('')}
    </div>
  </div>`, o:'' }),

wallet: ()=> ({ v:`
  <div class="scr">${appbar('My Wallet')}
    <div class="page">
      <div class="wcard">
        <div class="wr"><div><div class="wl">Wallet Balance</div><div class="wv2">${D.wallet.bal}</div></div>
          <span class="wch">${I('wallet')}</span></div>
        <button class="btn r10" data-go="#/topup-success" style="margin-top:1.05rem">Add Money</button>
      </div>
      ${D.wallet.groups.map(g=>`
        <div class="wgh">${g.t}</div>
        ${g.items.map(t=>`
        <div class="wtx"><div class="tt"><div class="t1">${t.t}</div><div class="t2">${t.d}</div></div>
          <div class="ta2"><div class="a1">${t.a}</div><div class="a2">${t.b}</div></div></div>`).join('')}
      `).join('')}
      <div style="height:1.2rem"></div>
    </div>
  </div>`, o:'' }),

/* ---------- profile & settings ---------- */
profile: (q)=> {
  const sheet = q.sheet==='logout' ? `
    <div class="sheetwrap" data-bdrop><div class="sheet">
      <div class="handle"></div>
      <h3 style="border-bottom:1px solid #f0f0f0;padding-bottom:1rem;margin-bottom:0">Logout</h3>
      <div class="sh-sub">Are you sure you want to log out?</div>
      <div class="sh-btns"><button class="btn ghost half" data-back>Cancel</button><button class="btn half" data-go="#/login">Yes, Logout</button></div>
      <div class="gesture"></div>
    </div></div>` : '';
  return {
  v:`
  <div class="scr">${appbar('Profile')}
    <div class="center-col" style="margin-top:.3rem">${avatar(6.5)}<div style="font-size:1.18rem;font-weight:600;color:#8f8f8f;margin-top:1rem">${D.user.name}</div></div>
    <div class="page" style="margin-top:1.6rem">${D.profileMenu.filter(m=>m.t!=='Log Out').map(mrow).join('')}
      <a class="mrow" data-go="#/profile?sheet=logout"><span class="ic-chip">${I('arr-r')}</span><span class="lb">Log Out</span><span class="arw">${I('chev-r')}</span></a>
    </div>
    <div class="nbot"></div>
  </div>`,
  o: sheet + navBar('user') }; },

'your-profile': ()=> ({ v:`
  <div class="scr">${appbar('Your Profile')}
    <div class="center-col" style="margin-top:.5rem;margin-bottom:1.9rem">
      <span style="position:relative;display:inline-block">
        ${avatar(7.3)}
        <span style="position:absolute;right:.05rem;bottom:.2rem;width:2.4rem;height:2.4rem;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;border:.16rem solid #fff"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:1rem;height:1rem"><path d="m14.5 5 4.5 4.5L8 20.5l-5 .5.5-5L14.5 5Z"/></svg></span>
      </span>
    </div>
    <div class="page">
      <div class="fld"><label>Name</label><div class="inp"><input value="${D.user.name}"></div></div>
      <div class="fld"><label>Email</label><div class="inp"><input value="${D.user.email}"><span class="tr-t" style="margin-left:.6rem">Change</span></div></div>
      <div class="fld"><label>Phone Number</label><div class="inp"><span class="tr-t">${D.user.phoneCode}</span><span class="tr" style="margin-left:.35rem">${I('chev-d')}</span><span class="sep"></span><input value="${D.user.phone}"></div></div>
      <div class="fld"><label>Date of Birth</label><div class="inp"><input value="${D.user.dob}"></div></div>
      <div class="fld"><label>Gender</label><div class="inp"><input value="${D.user.gender}"><span class="tr">${I('chev-d')}</span></div></div>
    </div>
    <div class="btn-row bar" style="margin-top:auto"><button class="btn" data-go="#/profile">Update</button></div>
  </div>`, o:'' }),

settings: ()=> ({ v:`
  <div class="scr">${appbar('Settings')}
    <div class="page">${D.settingsMenu.map(mrow).join('')}</div>
  </div>`, o:'' }),

'password-manager': ()=> ({ v:`
  <div class="scr">${appbar('Password Manager')}
    <div class="page">
      <div class="fld" style="margin-top:.3rem"><label>Current Password</label><div class="inp"><input type="password" value="................"><span class="tr">${I('eye-off')}</span></div></div>
      <div style="text-align:right;margin:-.3rem 0 1.3rem"><a class="link-u">Forgot Password?</a></div>
      <div class="fld"><label>New Password</label><div class="inp"><input type="password" value="................"><span class="tr">${I('eye-off')}</span></div></div>
      <div class="fld"><label>Confirm New Password</label><div class="inp"><input type="password" value="................"><span class="tr">${I('eye-off')}</span></div></div>
    </div>
    <div class="btn-row bar" style="margin-top:auto"><button class="btn" data-back>Reset Password</button></div>
  </div>`, o:'' }),

help: (q)=> {
  const tab = q.seg==='contact'?'contact':'faq';
  const ti = tab==='faq'?0:1;
  const body = tab==='faq' ? `
    <div class="chip-row" style="padding-left:0;padding-right:0;margin:1.1rem 0 1.2rem">${D.faqChips.map((c,i)=>`<button class="chip${i===0?' on':''}" data-chip>${c}</button>`).join('')}</div>
    ${D.faqs.map(f=>`<div class="faq${f.open?' open':''}"><button class="fq" data-faq>${f.q}${I(f.open?'chev-u':'chev-d')}</button><div class="fa">${f.a||'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}</div></div>`).join('')}`
  : `<div style="height:1.2rem"></div>
    ${D.contacts.map(c=>`<div class="hc-card${c.open?' open':''}"><button class="hc-t" data-hc style="width:100%"><span class="pic">${I(c.icon)}</span>${c.t}<span class="arw">${I(c.open?'chev-u':'chev-d')}</span></button>${c.d?`<div class="hc-b"><span class="dot"></span>${c.d}</div>`:''}</div>`).join('')}`;
  return { v:`
  <div class="scr">${appbar('Help Center')}
    <div class="page"><div class="sbar" style="margin:.2rem 0 .2rem">${I('search')}<input placeholder="Search"></div></div>
    <div class="tabs w2">
      <a class="${tab==='faq'?'on':''}" data-go="#/help/faq">FAQ</a>
      <a class="${tab==='contact'?'on':''}" data-go="#/help/contact">Contact Us</a>
      <span class="ind" style="left:${ti*50}%"></span>
    </div>
    <div class="page">${body}<div style="height:1.2rem"></div></div>
  </div>`, o:'' }; },

invite: ()=> ({ v:`
  <div class="scr">${appbar('Invite Friends')}
    <div class="page">
      ${D.friends.map(f=>`
      <div class="irow"><span class="iav"></span>
        <div class="it"><div class="n">${f[0]}</div><div class="p">${f[1]}</div></div>
        <button class="ibtn" data-invite>Invite</button>
      </div>`).join('')}
    </div>
  </div>`, o:'' }),

privacy: ()=> ({ v:`
  <div class="scr">${appbar('Privacy Policy')}
    <div class="page">
      <div class="flabel" style="margin-top:.4rem">Cancelation Policy</div>
      <p class="body-t">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <p class="body-t" style="margin-top:.9rem">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <div class="flabel">Terms &amp; Condition</div>
      <p class="body-t">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <p class="body-t" style="margin-top:.9rem">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <p class="body-t" style="margin-top:.9rem">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <div style="height:1.4rem"></div>
    </div>
  </div>`, o:'' }),

};
})();
