import { useEffect } from 'react';
import { useLanguageStore } from '../lib/i18n';

const PHASE_1_BROWSE: Record<string, string> = {
  'All': 'সব',
  'Cake': 'Cake',
  'Search cakes': 'Cake খুঁজুন',
  'Search': 'Search',
  'Results Found': 'result পাওয়া গেছে',
  'results': 'result',
  'Reset filter': 'Filter reset',
  'Open filters': 'Filter খুলুন',
  'Back to home': 'Home-এ ফিরে যান',
  'No results': 'কোনো result নেই',
  'No products found': 'কোনো product পাওয়া যায়নি',
  'Try changing filters or search terms': 'Filter বা search term বদলে try করুন',
  'All occasions': 'সব occasion',
  'Alert set!': 'Alert set হয়েছে!',
  "We'll notify you when": 'Available হলে জানানো হবে',
  'Your wishlist is empty': 'আপনার wishlist খালি',
  'Save cakes you love and order them later.': 'পছন্দের cake save করে পরে order করুন।',
  'Browse cakes': 'Cake দেখুন',
  'Out of Stock': 'Stock নেই',
  'Add': 'Add',
  'Added': 'Added',
  'Best': 'Best',
  'New': 'New',
};

const PHASE_2_PRODUCT_CART: Record<string, string> = {
  'Show less': 'কম দেখান',
  'Read more': 'আরও পড়ুন',
  'Reviews': 'Review',
  'Write a Review': 'Review লিখুন',
  'Add to Cart': 'Cart-এ add করুন',
  'Buy Now': 'এখনই কিনুন',
  'Customize': 'Customize',
  'Size': 'Size',
  'Flavor': 'Flavor',
  'Topping': 'Topping',
  'Message': 'Message',
  'Quantity': 'Quantity',
  'My Cart': 'আমার Cart',
  'Cart empty': 'Cart খালি',
  'Your cart is empty': 'আপনার cart খালি',
  'Add some delicious cakes first.': 'আগে কিছু delicious cake add করুন।',
  'Subtotal': 'Subtotal',
  'Delivery': 'Delivery',
  'Discount': 'Discount',
  'Total': 'Total',
  'Checkout': 'Checkout',
  'Remove': 'Remove',
  'Apply': 'Apply',
  'Promo code': 'Promo code',
  'Invalid promo code': 'Promo code ঠিক নেই',
  'Order Summary': 'Order summary',
  'Continue': 'Continue',
  'Close details': 'Details close করুন',
  'Product details': 'Product details',
  'Item total': 'Item total',
  'Unit price': 'Unit price',
};

const PHASE_3_CHECKOUT: Record<string, string> = {
  'Send money / Payment': 'Send money / Payment',
  'Cash on Delivery': 'Cash on Delivery',
  'Pay when you receive': 'Receive করার সময় payment',
  'Pay when delivered': 'Delivery time payment',
  'Delivery Address': 'Delivery address',
  'Choose delivery address': 'Delivery address choose করুন',
  'Current address': 'Current address',
  'Tap to select saved address': 'Saved address select করুন',
  'Change': 'Change',
  'No saved address yet. Add one from Profile → Manage Address, or type below.': 'Saved address নেই। Profile → Manage Address থেকে add করুন, অথবা নিচে লিখুন।',
  'Delivery Time': 'Delivery time',
  'Choose your delivery date and preferred slot': 'Delivery date আর slot choose করুন',
  'Tomorrow': 'আগামীকাল',
  'Pickup / Delivery Slot': 'Pickup / Delivery slot',
  'Confirm': 'Confirm',
  'This is a gift order': 'এটা gift order',
  'Add message, gift wrap & recipient details': 'Message, gift wrap আর recipient details add করুন',
  'Gift wrap': 'Gift wrap',
  'Hide price from recipient': 'Recipient থেকে price hide করুন',
  'Recipient name (optional)': 'Recipient name (optional)',
  'Recipient phone (optional)': 'Recipient phone (optional)',
  'Promo code': 'Promo code',
  'Referral code applied!': 'Referral code applied!',
  'Invalid code format': 'Code format ঠিক নেই',
  'Continue to Payment': 'Payment-এ যান',
  'Submitting...': 'Submit হচ্ছে...',
  'Payment screenshot': 'Payment screenshot',
  'Remaining amount': 'বাকি amount',
  'Payment Methods': 'Payment method',
  'Order placed': 'Order placed',
};

const PHASE_4_ORDERS_TRACKING: Record<string, string> = {
  'Activity': 'Activity',
  'Your orders': 'আপনার order',
  'tracked live': 'live tracking',
  'Pending': 'Pending',
  'Active': 'Active',
  'Completed': 'Completed',
  'Cancelled': 'Cancelled',
  'No orders yet': 'এখনও কোনো order নেই',
  'your story starts here': 'আপনার story এখান থেকে শুরু',
  'View my wishlist': 'Wishlist দেখুন',
  'Track order': 'Order track করুন',
  'Reorder': 'আবার order করুন',
  'Live status': 'Live status',
  'Placed': 'Placed',
  'Confirmed': 'Confirmed',
  'Baking': 'Baking',
  'Ready': 'Ready',
  'Out': 'Out',
  'Delivered': 'Delivered',
  'Order tracking': 'Order tracking',
  'Enter order ID, e.g. BAS123456': 'Order ID লিখুন, যেমন BAS123456',
  'Order not found': 'Order পাওয়া যায়নি',
  'Please check the order ID and try again.': 'Order ID check করে আবার try করুন।',
  'Order Placed': 'Order placed',
  'We received your order': 'আপনার order পেয়েছি',
  'Baker Assigned': 'Baker assigned',
  'A baker is on it': 'Baker কাজ শুরু করছে',
  'Baking Started': 'Baking started',
  'Your cake is in the oven': 'আপনার cake oven-এ',
  'Quality Check': 'Quality check',
  'Almost ready!': 'Almost ready!',
  'Out for Delivery': 'Out for delivery',
  'On the way to you': 'আপনার কাছে যাচ্ছে',
  'Enjoy your cake!': 'Cake enjoy করুন!',
  'Delivered successfully!': 'Successfully delivered!',
  'My orders': 'My orders',
  'সাহায্য দরকার?': 'সাহায্য দরকার?',
  'Close notifications': 'Notifications close করুন',
  'Notifications': 'Notifications',
  'No notifications yet': 'এখনও notification নেই',
};

const PHASE_5_AUTH_PROFILE: Record<string, string> = {
  'Sorry, something went wrong': 'দুঃখিত, কিছু problem হয়েছে',
  'Signed in successfully!': 'Sign in successful!',
  'Check Your Email': 'Email check করুন',
  'Create Account': 'Account create করুন',
  'Sign In': 'Sign in',
  'Signing In...': 'Sign in হচ্ছে...',
  'Creating Account...': 'Account create হচ্ছে...',
  'Sign in to access your orders and settings': 'Order আর settings দেখতে sign in করুন',
  'Name': 'Name',
  'Email': 'Email',
  'Phone Number': 'Phone number',
  'Your name': 'আপনার name',
  'Change': 'Change',
  'Save': 'Save',
  'Saved': 'Saved',
  'Customer Service': 'Customer service',
  'Chat with Bake Art Style support': 'Bake Art Style support-এর সাথে chat করুন',
  'Order help and quick support': 'Order help আর quick support',
  'Website': 'Website',
  'You are already browsing the Bake Art Style website.': 'আপনি এখন Bake Art Style website-এই আছেন।',
  'FAQ — coming soon': 'FAQ — শীঘ্রই',
  'Link not available yet': 'Link এখনও available না',
  'Checkout Profile': 'Checkout profile',
  'Enter Your Location': 'আপনার location দিন',
  'Manage Address': 'Address manage করুন',
  'Add New': 'New add করুন',
  'Add address': 'Address add করুন',
  'No saved address': 'Saved address নেই',
  'Choose one saved address for this order': 'এই order-এর জন্য saved address choose করুন',
};

const PHASE_6_CHAT_ADMIN: Record<string, string> = {
  'Admin Dashboard': 'Admin dashboard',
  'Admin Panel': 'Admin panel',
  'Enter your PIN': 'PIN দিন',
  'Wrong PIN!': 'PIN ঠিক নেই!',
  'Cancel': 'Cancel',
  'Dashboard': 'Dashboard',
  'Products': 'Products',
  'Orders': 'Orders',
  'Customers': 'Customers',
  'Settings': 'Settings',
  'Banners': 'Banners',
  'Reviews': 'Reviews',
  'Gallery': 'Gallery',
  'No orders yet': 'এখনও কোনো order নেই',
  'New orders will appear here': 'New order এখানে আসবে',
  'No product sales yet': 'এখনও product sale নেই',
  'Top Products': 'Top products',
  'Recent Orders': 'Recent orders',
  'Upload Image': 'Image upload',
  'Uploading...': 'Upload হচ্ছে...',
  'Add image': 'Image add',
  'Save': 'Save',
  'Reset': 'Reset',
  'Delete': 'Delete',
  'Edit': 'Edit',
  'Search orders': 'Order search',
  'Customer reviews will appear here': 'Customer review এখানে আসবে',
  'No reviews yet': 'এখনও review নেই',
  'No gallery photos yet': 'এখনও gallery photo নেই',
  'Upload your first photo above': 'উপরে first photo upload করুন',
  'Delivery zone gating': 'Delivery zone gating',
  'তুমি কী করতে পারো?': 'তুমি কী করতে পারো?',
  'কী পারো?': 'কী পারো?',
  'কেক মেনু দেখাও': 'কেক মেনু দেখাও',
  'মেনু': 'মেনু',
  'BAS is responding': 'BAS reply দিচ্ছে',
};

export const RUNTIME_TRANSLATIONS: Record<string, string> = {
  ...PHASE_1_BROWSE,
  ...PHASE_2_PRODUCT_CART,
  ...PHASE_3_CHECKOUT,
  ...PHASE_4_ORDERS_TRACKING,
  ...PHASE_5_AUTH_PROFILE,
  ...PHASE_6_CHAT_ADMIN,
};

const originalText = new WeakMap<Text, string>();
const translatedText = new WeakMap<Text, string>();
const originalAttrs = new WeakMap<Element, Record<string, string>>();
const translatedAttrs = new WeakMap<Element, Record<string, string>>();
const TRANSLATABLE_ATTRS = ['placeholder', 'aria-label', 'title'] as const;

const preserveWhitespace = (source: string, translated: string): string => {
  const leading = source.match(/^\s*/)?.[0] ?? '';
  const trailing = source.match(/\s*$/)?.[0] ?? '';
  return `${leading}${translated}${trailing}`;
};

const shouldSkip = (node: Node): boolean => {
  const parent = node.parentElement;
  if (!parent) return true;
  const tag = parent.tagName.toLowerCase();
  return ['script', 'style', 'textarea', 'code', 'pre'].includes(tag);
};

const translateTextNode = (node: Text, language: string) => {
  if (shouldSkip(node)) return;

  const current = node.nodeValue ?? '';
  const previousOriginal = originalText.get(node);
  const previousTranslated = translatedText.get(node);

  // React may reuse a Text node for new dynamic content (counts/statuses).
  // If the current value is neither the original nor our last translation,
  // treat it as the new original instead of overwriting it with a stale cache.
  const original = !previousOriginal || (current !== previousOriginal && current !== previousTranslated)
    ? current
    : previousOriginal;
  if (original !== previousOriginal) originalText.set(node, original);

  if (language === 'en') {
    if (previousTranslated && current === previousTranslated && current !== original) {
      node.nodeValue = original;
    }
    translatedText.delete(node);
    return;
  }

  const translated = RUNTIME_TRANSLATIONS[original.trim()];
  if (!translated) {
    translatedText.delete(node);
    return;
  }

  const next = preserveWhitespace(original, translated);
  translatedText.set(node, next);
  if (current !== next) node.nodeValue = next;
};

const translateElementAttrs = (el: Element, language: string) => {
  const savedOriginals = originalAttrs.get(el) ?? {};
  const savedTranslations = translatedAttrs.get(el) ?? {};
  let originalsChanged = false;
  let translationsChanged = false;

  TRANSLATABLE_ATTRS.forEach((attr) => {
    const current = el.getAttribute(attr);
    if (current == null) return;

    const previousOriginal = savedOriginals[attr];
    const previousTranslated = savedTranslations[attr];
    const original = !previousOriginal || (current !== previousOriginal && current !== previousTranslated)
      ? current
      : previousOriginal;

    if (original !== previousOriginal) {
      savedOriginals[attr] = original;
      originalsChanged = true;
    }

    if (language === 'en') {
      if (previousTranslated && current === previousTranslated && current !== original) {
        el.setAttribute(attr, original);
      }
      if (savedTranslations[attr]) {
        delete savedTranslations[attr];
        translationsChanged = true;
      }
      return;
    }

    const translated = RUNTIME_TRANSLATIONS[original.trim()];
    if (!translated) {
      if (savedTranslations[attr]) {
        delete savedTranslations[attr];
        translationsChanged = true;
      }
      return;
    }

    savedTranslations[attr] = translated;
    translationsChanged = true;
    if (current !== translated) el.setAttribute(attr, translated);
  });

  if (originalsChanged) originalAttrs.set(el, savedOriginals);
  if (translationsChanged) translatedAttrs.set(el, savedTranslations);
};

const walk = (root: ParentNode, language: string) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text, language);
    if (node.nodeType === Node.ELEMENT_NODE) translateElementAttrs(node as Element, language);
    node = walker.nextNode();
  }
};

export default function I18nRuntimeTranslator() {
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    let raf = 0;
    const run = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => walk(document.body, language));
    };

    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRS as unknown as string[],
    });

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [language]);

  return null;
}
