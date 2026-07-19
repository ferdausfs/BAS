/* data.js — ALL app content lives here. Replace with real API data later.
   Structure matches the mock exactly (names, prices, IDs). */
window.D = {

user: {
  name: 'Jennifer Aaker',
  email: 'example@gmail.com',
  phone: '(208) 555-0112',
  phoneCode: '+1',
  dob: '15/02/2002',
  gender: 'Female'
},

categories: [
  ['vegetables','Vegetables'], ['fruits','Fruits'], ['drinks','Drinks'], ['milk','Milk & Eggs'],
  ['cakes','Cakes'], ['icecream','Ice-Cream'], ['bakery','Bakery'], ['snacks','Snacks'],
  ['grain','Grain'], ['skincare','Skin Care'], ['soap','Soap'], ['dryfruit','Dry Fruit'],
  ['coffee','Coffee'], ['sugar','Sugar'], ['biscuit','Biscuit'], ['petfood','Pet Food'],
  ['haircare','Hair Care'], ['baby','Baby Esse..'], ['kitchen','Kitchen S..'], ['garden','Garden S..'],
  ['laundry','Laundry P..'], ['chocolates','Chocolates'], ['frozen','Frozen']
],

products: [
  {id:1, name:'Fresh Strawberry', cat:'Fruit', wt:'1 lb', price:2.55, old:3.00, rating:4.9, off:15, fav:1},
  {id:2, name:'Cabbage',          cat:'Vegetables', wt:'4 lb', price:3.15, old:3.50, rating:4.8, off:10, fav:0},
  {id:3, name:'Fresh Onion',      cat:'Vegetables', wt:'3 lb', price:3.28, old:4.10, rating:4.9, off:20, fav:0},
  {id:4, name:'Fresh Tomato',     cat:'Vegetables', wt:'1 lb', price:3.15, old:4.50, rating:4.8, off:30, fav:0},
  {id:5, name:'Fresh Lemon',      cat:'Fruit', wt:'2 lb', price:4.30, old:5.00, rating:4.9, off:15, fav:0},
  {id:6, name:'Fresh Green Apple',cat:'Fruit', wt:'1 lb', price:4.80, old:6.20, rating:4.8, off:20, fav:0},
  {id:7, name:'Apple',            cat:'Fruit', wt:'3 lb', price:6.40, old:7.00, rating:5.0, off:9,  fav:0},
  {id:8, name:'Watermelon',       cat:'Fruit', wt:'3 lb', price:1.80, old:2.00, rating:4.9, off:10, fav:0},
  {id:9, name:'Banana',           cat:'Fruit', wt:'1 lb', price:3.15, old:4.00, rating:4.9, off:21, fav:0},
  {id:10,name:'Fresh Orange',     cat:'Fruit', wt:'4 lb', price:4.80, old:6.00, rating:4.8, off:20, fav:0},
  {id:11,name:'Pomegranate',      cat:'Fruit', wt:'2 lb', price:4.80, old:6.00, rating:4.8, off:20, fav:0},
  {id:12,name:'Pineapple',        cat:'Fruit', wt:'3 lb', price:6.75, old:7.50, rating:5.0, off:10, fav:0},
  {id:13,name:'Potato',           cat:'Vegetables', wt:'5 lb', price:3.15, old:4.50, rating:5.0, off:30, fav:0},
  {id:14,name:'Sweet Corn',       cat:'Vegetables', wt:'1 lb', price:1.25, old:2.00, rating:4.7, off:12, fav:0}
],

offers: [
  {chip:'Exclusive Offer', title:'Get Special Offers', pc:30},
  {chip:'Limited Time Deal', title:'Save Big Today', pc:20},
  {chip:'Weekend Grocery Sale', title:'Unlock Your Reward', pc:25},
  {chip:'Fresh Deals Today', title:'Daily Grocery Offers', pc:10}
],

favChips: ['All','Fresh Produce','Beverages','Dairy & Eggs'],
dealChips: ['All','Best Seller','Fresh Produce','Beverages'],
filterCats: ['All','Vegetables','Fruits','Drinks'],
filterSort: ['All','Best Rated','Popular','New Arrival'],
filterType: ['All','Packaged Goods','Frozen Foods'],
filterStars: ['4.5 and above','4.0 - 4.5','3.5 - 4.0','3.0 - 3.5','2.5 - 3.0'],

recentSearches: ['Strawberries','Watermelon','Green Apple','Banana','Milk','Onion','Orange','Cabbage'],

cart: [1, 9, 6],       /* product ids: Strawberry, Banana(but mock order Banana,Strawberry,GreenApple) */
cartIds: [9, 1, 6],

orderType: [
  {id:'delivery', icon:'box', t:'Delivery', s:'30–45 mins • To your address'},
  {id:'pickup', icon:'walk', t:'Pickup', s:'30–35 mins • Collect from Store'}
],
deliveryTypes: [
  {icon:'scooter', t:'Express Delivery', s:'Delivery in 15–25 mins', p:'$15', on:false},
  {icon:'box', t:'Standard Delivery', s:'Delivery in 30–45 mins', p:'$10', on:true},
  {icon:'bicycle', t:'Eco Saver Delivery', s:'Delivery in 45–60+ mins', p:'$05', on:false}
],
pickup: { store:'GreenBasket Co.', addr:'88 Bedford Street, New York, NY 10014', dist:'2.5 miles away from your location' },

addresses: [
  {t:'Home', a:'245 Madison Ave, New York, NY 10016, USA', on:true},
  {t:'Office', a:'780 Broadway, New York, NY 10003, USA', on:false},
  {t:'Parent’s House', a:'210 E 34th St, New York, NY 10016, USA', on:false},
  {t:'Friend’s House', a:'400 W 42nd St, New York, NY 10036, USA', on:false}
],

payments: [
  {group:'Cash', items:[{icon:'cash', t:'Cash', radio:true, on:false}]},
  {group:'Wallet', items:[{icon:'wallet', t:'Wallet', radio:true, on:true}]},
  {group:'Credit & Debit Card', items:[{icon:'card', t:'Add Card', arrow:true}]},
  {group:'More Payment Options', items:[
    {icon:'paypal', t:'Paypal', radio:true, on:true},
    {icon:'apple', t:'Apple Pay', radio:true, on:false},
    {icon:'gpay', t:'Google Pay', radio:true, on:false}
  ]}
],

orders: {
  active: [
    {id:'#GR968547', items:[9,1,6], badge:'Active Order'},
    {id:'#GR854163', items:[10], badge:'Active Order'}
  ],
  completed: [
    {id:'#GR857415', items:[4,3], badge:'Completed Order'},
    {id:'#GR968574', items:[12], badge:'Completed Order'}
  ],
  cancelled: [
    {id:'#GR754218', items:[14], badge:'Cancel Order'},
    {id:'#GR965124', items:[11], badge:'Cancel Order'},
    {id:'#GR968574', items:[5], badge:'Cancel Order'}
  ]
},
trackSteps: [
  {t:'Order Placed', s:'June 12, 2026 | 06:05 PM', icon:'clipboard', done:true},
  {t:'In Progress', s:'June 12, 2026 | 06:16 PM', icon:'box', done:true},
  {t:'On the Way', s:'June 12, 2026 | 06:35 PM', icon:'scooter', done:true},
  {t:'Delivered', s:'Arriving by 06:45 PM', icon:'box-check', done:false}
],
courier: { name:'Charlotte Taylor', role:'Delivery Partner', rating:'4.8', id:'#GR854163' },

cancelReasons: ['Ordered by mistake','No longer needed','Delivery is taking too long','Added wrong address','Found a better price elsewhere','Other'],

coupons: [
  {off:'10% OFF', code:'SAVE10', d:'Enjoy 10% OFF on Grocery Orders', un:'Add items worth $60 more to unlock', en:'Ends in 1 day'},
  {off:'15% OFF', code:'FRESH15', d:'Get 15% OFF on Daily Essentials', un:'Add items worth $150 more to unlock', en:'Ends in 2 day'},
  {off:'15% OFF', code:'MARKET15', d:'Flat 15% OFF on All Essentials', un:'Spend $160 more to unlock', en:'Ends in 4 day'},
  {off:'25% OFF', code:'FRESH25', d:'Save 25% OFF on Selected Items', un:'Shop $250 more to unlock coupon', en:'Ends in 6 day'}
],

notifications: {
  today: [
    {icon:'scooter', t:'Order On the Way', d:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', tm:'1h'},
    {icon:'percent', t:'Discount Coupons Available', d:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', tm:'1h'},
    {icon:'star-o', t:'Rate Your Order', d:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis', tm:'1h'}
  ],
  yesterday: [
    {icon:'scooter', t:'Order On the Way', d:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', tm:'1d'},
    {icon:'wallet', t:'New Paypal Added', d:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', tm:'1d'},
    {icon:'box-check', t:'Order Delivered', d:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', tm:'1d'}
  ]
},

reviews: [
  {n:'Charlotte Wilson', tm:'1 day ago', d:'Very satisfied with this purchase. The strawberries are juicy, ripe, and absolutely delicious.', r:'5.0'},
  {n:'Sophia Bennett', tm:'1 months ago', d:'Really happy with these strawberries. They’re perfectly ripe and great for desserts.', r:'5.0', imgs:2}
],
reviewChips: ['Filter','Verified','Latest','Detailed Reviews'],
hist: [80,45,22,12,6],

chat: [
  {who:'them', type:'text', d:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', by:'Sophia Mitchell', tm:'08:04 pm'},
  {who:'me', type:'text', d:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', by:'Jennifer Aaker', tm:'08:04 pm'},
  {who:'them', type:'img', by:'Sophia Mitchell', tm:'08:04 pm'},
  {who:'me', type:'voice', d:'0:13', by:'Jennifer Aaker', tm:'08:04 pm'}
],
chatWith: {n:'Sophia Mitchell', s:'Online'},

wallet: {
  bal:'$2400.00',
  groups: [
    {t:'Today', items:[{t:'Money Added to Wallet', d:'12 June | 11:30 AM', a:'+ $250.00', b:'Balance $2400.00'}]},
    {t:'Yesterday', items:[{t:'Order ID #GR968542', d:'11 June | 10:30 AM', a:'- $50.00', b:'Balance $2100.00'}]},
    {t:'10 June 2026', items:[
      {t:'Money Added to Wallet', d:'10 June | 11:30 AM', a:'+ $500.00', b:'Balance $2150.00'},
      {t:'Order ID #GR425386', d:'10 June | 10:48 AM', a:'- $50.00', b:'Balance $1,650.00'},
      {t:'Order ID #GR741589', d:'10 June | 8:36 AM', a:'- $50.00', b:'Balance $1700.00'},
      {t:'Order ID #GR968574', d:'10 June | 6:30 AM', a:'- $50.00', b:'Balance $1750.00'}
    ]}
  ]
},

friends: [
  ['Isabella Davis','(212) 555-0147'], ['Olivia Williams','(310) 555-0265'],
  ['Harper Jackson','(202) 555-0129'], ['Evelyn White','(718) 555-0246'],
  ['Mia Anderson','(617) 555-0152'], ['Charlotte Taylor','(808) 555-0111'],
  ['Isabella Davis','(646) 555-0234'], ['Scarlett Moore','(305) 555-0176']
],

faqChips: ['All','Services','General','Account'],
faqs: [
  {q:'How can I track my order?', a:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', open:true},
  {q:'What payment methods do you accept?'},
  {q:'Can I rate my delivery experience?'},
  {q:'Do you deliver in my area?'},
  {q:'How do I contact customer support?'},
  {q:'Can I reorder previous purchases?'},
  {q:'Can I use promo codes on my order?'}
],
contacts: [
  {icon:'headset', t:'Customer Service'}, {icon:'wa', t:'WhatsApp', d:'(480) 555-0103', open:true},
  {icon:'globe', t:'Website'}, {icon:'fb', t:'Facebook'}, {icon:'xlogo', t:'X'}, {icon:'ig', t:'Instagram'}
],

profileMenu: [
  {icon:'user', t:'Your profile', go:'#/your-profile'},
  {icon:'pin', t:'Manage Address', go:'#/manage-address'},
  {icon:'card', t:'Payment Methods', go:'#/payments'},
  {icon:'clipboard', t:'My Orders', go:'#/orders/active'},
  {icon:'ticket', t:'My Coupons', go:'#/coupons'},
  {icon:'wallet', t:'My Wallet', go:'#/wallet'},
  {icon:'gear', t:'Settings', go:'#/settings'},
  {icon:'headset', t:'Help Center', go:'#/help/faq'},
  {icon:'share', t:'Invite Friends', go:'#/invite'},
  {icon:'arr-r', t:'Log Out', go:'#/profile?sheet=logout'}
],
settingsMenu: [
  {icon:'bell', t:'Notification Settings', go:'#/notif-access'},
  {icon:'key', t:'Password Manager', go:'#/password-manager'},
  {icon:'sun', t:'Theme', go:'#/settings'},
  {icon:'trash', t:'Delete Account', go:'#/settings'}
],

receipt: {
  items:[9,1,6],
  orderId:'#GR968547', customer:'Jennifer Aaker', phone:'+1 (208) 555-0112',
  promo:'GR45HJ2026', method:'Wallet', txn:'TR8574UTHG'
},

summary: { date:'June 12, 2026 | 07:30 PM' },
locationQuery: 'Mane Avenue',
locationResult: { t:'Mane Avenue', s:'8502 Preston Rd. Ingl..' },
onboarding: [
  {t:'All Your Grocery<br>Needs in One Place', d:'Explore a range of fresh groceries and daily essentials, in one seamless shopping experience.'},
  {t:'Your Preferred Items,<br>Saved for You', d:'Save your preferred items and access them anytime, making reordering quick and effortless.'},
  {t:'Stay Updated Every<br>Step of the Way', d:'Enjoy fast, reliable delivery with tracking, bringing your groceries right to your doorstep.'}
]
};
window.PROD = id => window.D.products.find(p=>p.id===id);
