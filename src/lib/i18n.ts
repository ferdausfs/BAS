import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'bn' | 'en';

type Primitive = string | number;
type Params = Record<string, Primitive>;

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'bn',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'bakeart-language' }
  )
);

export const dictionaries = {
  bn: {
    'common.back': 'ফিরে যান',
    'common.clearAll': 'সব মুছুন',
    'common.close': 'বন্ধ',
    'common.seeAll': 'সব দেখুন',
    'common.signIn': 'লগইন',
    'common.signOut': 'সাইন আউট',
    'common.order': 'অর্ডার',
    'common.viewCake': 'কেক দেখুন',
    'common.customizeYours': 'কাস্টম করুন',

    'nav.home': 'হোম',
    'nav.categories': 'কেক',
    'nav.orders': 'অর্ডার',
    'nav.profile': 'প্রোফাইল',
    'nav.primary': 'মূল নেভিগেশন',

    'home.profile': 'প্রোফাইল',
    'home.notifications': 'নোটিফিকেশন',
    'home.deliveryLocation': 'ডেলিভারি ঠিকানা',
    'home.deliveryTo': 'ডেলিভারি',
    'home.setLocation': 'ঠিকানা দিন',
    'home.searchPlaceholder': 'কেক, ফ্লেভার বা উপলক্ষ খুঁজুন',
    'home.searchResultsLabel': 'সার্চ রেজাল্ট',
    'home.recentSearch': 'সাম্প্রতিক সার্চ',
    'home.browseOccasion': 'উপলক্ষ দিয়ে খুঁজুন',
    'home.exclusiveOffers': 'এক্সক্লুসিভ অফার',
    'home.exclusiveOffersSub': 'ছবিতে ট্যাপ করলে অফার খুলবে',
    'home.coupons': 'কুপন',
    'home.couponsSub': 'কোড ট্যাপ করলে ছাড় বসবে',
    'home.exploreCategories': 'ক্যাটাগরি ঘুরে দেখুন',
    'home.exploreCategoriesSub': 'উপলক্ষ অনুযায়ী কেক খুঁজুন',
    'home.signinHelperTitle': 'উইশলিস্ট ও অর্ডার একসাথে রাখুন',
    'home.signinHelperBody': 'একবার সাইন ইন করলে পছন্দের কেক, কুপন আর অর্ডার হিস্ট্রি এখানেই থাকবে।',
    'home.upcomingToday': '{name} আজ',
    'home.upcomingInDays': '{name} {days} দিনের মধ্যে',
    'home.upcomingBody': 'আগে থেকে প্ল্যান করলে ফ্লেভার, ফিনিশ আর ডেলিভারি স্লট ধরে রাখা যায়।',
    'home.searchPanelEyebrow': 'সার্চ রেজাল্ট',
    'home.searchPanelTitle': '“{query}” এর রেজাল্ট',
    'home.searchPanelBody': '{count}টা কেক মিলছে।',
    'home.noResultsTitle': '“{query}” এর কোনো রেজাল্ট নেই',
    'home.noResultsBody': 'আরেকটা নাম, ফ্লেভার বা উপলক্ষ দিয়ে খুঁজুন।',
    'home.clearSearch': 'সার্চ মুছুন',
    'home.browseAllCakes': 'সব কেক দেখুন',
    'home.orderAgain': 'আবার অর্ডার',
    'home.orderAgainBody': 'শেষ অর্ডার এক ট্যাপে কার্টে যোগ করুন।',
    'home.featuredProducts': 'ফিচার্ড কেক',
    'home.featuredProductsSub': 'বেস্ট সেলার ও নতুন কালেকশন',
    'home.forYou': 'আপনার জন্য',
    'home.pickedForTaste': 'আপনার পছন্দ অনুযায়ী',
    'home.forYouLastOrder': 'আপনার শেষ অর্ডার থেকে',
    'home.forYouWishlist': 'আপনার সেভ করা কালেকশন থেকে',
    'home.forYouDefault': 'এই সপ্তাহের বেস্ট সেলার',
    'home.handcrafted': '২০১৮ থেকে হাতে তৈরি',
    'home.signInToOrders': 'অর্ডার দেখতে সাইন ইন করুন',

    'product.add': 'যোগ',
    'product.added': 'হয়েছে',
    'product.addToCart': 'কার্টে যোগ',
    'product.customize': 'এই কেক কাস্টমাইজ করুন',

    'profile.title': 'প্রোফাইল',
    'profile.settings': 'সেটিংস',
    'profile.help': 'হেল্প সেন্টার',
    'profile.yourProfile': 'আপনার প্রোফাইল',
    'profile.manageAddress': 'ঠিকানা',
    'profile.paymentMethods': 'পেমেন্ট',
    'profile.myOrders': 'আমার অর্ডার',
    'profile.myCoupons': 'কুপন',
    'profile.myWallet': 'ওয়ালেট',
    'profile.wishlist': 'উইশলিস্ট',
    'profile.inviteEarn': 'ইনভাইট ও আর্ন',
    'profile.specialDates': 'বিশেষ তারিখ',
    'profile.signInTitle': 'লগইন করুন',
    'profile.signInBody': 'অর্ডার, উইশলিস্ট আর ঠিকানা রাখতে নম্বর, ইমেইল বা Google দিন।',
    'profile.language': 'ভাষা',
    'profile.languageSub': 'অ্যাপের ভাষা বদলান',
    'profile.bangla': 'বাংলা',
    'profile.english': 'English',
    'profile.currentLanguage': 'বাংলা',
    'profile.notificationSettings': 'নোটিফিকেশন · শীঘ্রই',
    'profile.passwordManager': 'পাসওয়ার্ড · সাপোর্টে যোগাযোগ করুন',
    'profile.theme': 'Theme',
    'profile.deleteAccount': 'Delete Account',
    'profile.languageChangedTitle': 'ভাষা বদলানো হয়েছে',
    'profile.languageChangedBn': 'App এখন বাংলায় দেখাচ্ছে।',
    'profile.languageChangedEn': 'App language changed to English.',
  },
  en: {
    'common.back': 'Back',
    'common.clearAll': 'Clear All',
    'common.close': 'Close',
    'common.seeAll': 'See all',
    'common.signIn': 'Sign In',
    'common.signOut': 'Sign out',
    'common.order': 'Order',
    'common.viewCake': 'View cake',
    'common.customizeYours': 'Customize yours',

    'nav.home': 'Home',
    'nav.categories': 'Cake',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'nav.primary': 'Primary navigation',

    'home.profile': 'Profile',
    'home.notifications': 'Notifications',
    'home.deliveryLocation': 'Delivery location',
    'home.deliveryTo': 'Delivery to',
    'home.setLocation': 'Set your location',
    'home.searchPlaceholder': 'Search cakes, flavors, occasions',
    'home.searchResultsLabel': 'Search Results',
    'home.recentSearch': 'Recent Search',
    'home.browseOccasion': 'Browse by occasion',
    'home.exclusiveOffers': 'Exclusive Offers',
    'home.exclusiveOffersSub': 'Tap any offer image to open it',
    'home.coupons': 'Coupons',
    'home.couponsSub': 'Tap a code to apply the discount',
    'home.exploreCategories': 'Explore Categories',
    'home.exploreCategoriesSub': 'Browse by occasion with soft pastel cues and quick jumps',
    'home.signinHelperTitle': 'Save wishlist & track orders',
    'home.signinHelperBody': 'Sign in once and keep every favourite cake, coupon, and past order in one place.',
    'home.upcomingToday': '{name} is today',
    'home.upcomingInDays': '{name} is in {days} day{plural}',
    'home.upcomingBody': 'Plan a cake early to lock your preferred flavour, finish, and delivery slot.',
    'home.searchPanelEyebrow': 'Search results',
    'home.searchPanelTitle': 'Results for “{query}”',
    'home.searchPanelBody': '{count} cakes match your taste right now.',
    'home.noResultsTitle': 'No results for “{query}”',
    'home.noResultsBody': 'Try a simpler cake name, another flavour, or browse by occasion instead.',
    'home.clearSearch': 'Clear search',
    'home.browseAllCakes': 'Browse all cakes',
    'home.orderAgain': 'Order again',
    'home.orderAgainBody': 'Re-add everything from your most recent order in one tap.',
    'home.featuredProducts': 'Featured Products',
    'home.featuredProductsSub': 'Best sellers and fresh arrivals in the BAS collection',
    'home.forYou': 'For you',
    'home.pickedForTaste': 'Picked for your taste',
    'home.forYouLastOrder': 'Inspired by your last order',
    'home.forYouWishlist': 'Pulled from your saved collection',
    'home.forYouDefault': 'A calm edit of best sellers this week',
    'home.handcrafted': 'Handcrafted since 2018',
    'home.signInToOrders': 'Sign in to view orders',

    'product.add': 'Add',
    'product.added': 'Added',
    'product.addToCart': 'Add to Cart',
    'product.customize': 'Fully customize this cake',

    'profile.title': 'Profile',
    'profile.settings': 'Settings',
    'profile.help': 'Help Center',
    'profile.yourProfile': 'Your Profile',
    'profile.manageAddress': 'Manage Address',
    'profile.paymentMethods': 'Payment Methods',
    'profile.myOrders': 'My Orders',
    'profile.myCoupons': 'My Coupons',
    'profile.myWallet': 'My Wallet',
    'profile.wishlist': 'Wishlist',
    'profile.inviteEarn': 'Invite & Earn',
    'profile.specialDates': 'Special Dates',
    'profile.signInTitle': 'Sign In',
    'profile.signInBody': 'Sign in to save your delivery info, orders, wishlist, and profile.',
    'profile.language': 'Language',
    'profile.languageSub': 'Change app language',
    'profile.bangla': 'বাংলা',
    'profile.english': 'English',
    'profile.currentLanguage': 'English',
    'profile.notificationSettings': 'Notification Settings · Coming soon',
    'profile.passwordManager': 'Password Manager · Contact support',
    'profile.theme': 'Theme',
    'profile.deleteAccount': 'Delete Account',
    'profile.languageChangedTitle': 'Language changed',
    'profile.languageChangedBn': 'App is now showing Bangla.',
    'profile.languageChangedEn': 'App language changed to English.',
  },
} as const;

export type TranslationKey = keyof typeof dictionaries.bn;

const interpolate = (value: string, params?: Params): string => {
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
};

export const translate = (language: Language, key: TranslationKey, params?: Params): string => {
  const value = dictionaries[language][key] ?? dictionaries.bn[key] ?? key;
  return interpolate(value, params);
};

export function useT() {
  const language = useLanguageStore((state) => state.language);
  return (key: TranslationKey, params?: Params) => translate(language, key, params);
}
