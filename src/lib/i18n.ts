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
    'common.clearAll': 'সব clear',
    'common.close': 'Close',
    'common.seeAll': 'সব দেখুন',
    'common.signIn': 'Sign in',
    'common.signOut': 'Sign out',
    'common.order': 'Order',
    'common.viewCake': 'Cake দেখুন',
    'common.customizeYours': 'Customize করুন',

    'nav.home': 'Home',
    'nav.categories': 'Cake',
    'nav.orders': 'Order',
    'nav.profile': 'Profile',
    'nav.primary': 'Primary navigation',

    'home.profile': 'Profile',
    'home.notifications': 'Notifications',
    'home.deliveryLocation': 'Delivery location',
    'home.deliveryTo': 'Delivery হবে',
    'home.setLocation': 'Location set করুন',
    'home.searchPlaceholder': 'Cake, flavor বা occasion খুঁজুন',
    'home.searchResultsLabel': 'Search results',
    'home.recentSearch': 'Recent search',
    'home.browseOccasion': 'Occasion দিয়ে browse করুন',
    'home.exclusiveOffers': 'Exclusive offer',
    'home.exclusiveOffersSub': 'Offer image tap করলে খুলবে',
    'home.exploreCategories': 'Category ঘুরে দেখুন',
    'home.exploreCategoriesSub': 'Occasion অনুযায়ী cake খুঁজুন',
    'home.signinHelperTitle': 'Wishlist save আর order track করুন',
    'home.signinHelperBody': 'একবার sign in করলে favourite cake, promo আর order history এক জায়গায় থাকবে।',
    'home.upcomingToday': '{name} আজ',
    'home.upcomingInDays': '{name} {days} দিনের মধ্যে',
    'home.upcomingBody': 'আগে থেকে cake plan করলে preferred flavour, finish আর delivery slot lock করা যাবে।',
    'home.searchPanelEyebrow': 'Search results',
    'home.searchPanelTitle': '“{query}” এর result',
    'home.searchPanelBody': '{count}টা cake এখন match করছে।',
    'home.noResultsTitle': '“{query}” এর কোনো result নেই',
    'home.noResultsBody': 'আরেকটা cake name, flavor বা occasion দিয়ে try করুন।',
    'home.clearSearch': 'Search clear করুন',
    'home.browseAllCakes': 'সব cake দেখুন',
    'home.orderAgain': 'Order again',
    'home.orderAgainBody': 'আপনার last order এক tap-এ cart-এ add করুন।',
    'home.featuredProducts': 'Featured cake',
    'home.featuredProductsSub': 'Best seller আর new arrival BAS collection থেকে',
    'home.forYou': 'For you',
    'home.pickedForTaste': 'আপনার taste অনুযায়ী',
    'home.forYouLastOrder': 'আপনার last order থেকে inspired',
    'home.forYouWishlist': 'আপনার saved collection থেকে',
    'home.forYouDefault': 'এই সপ্তাহের calm best seller edit',
    'home.handcrafted': 'Handcrafted since 2018',

    'profile.title': 'Profile',
    'profile.settings': 'Settings',
    'profile.help': 'Help Center',
    'profile.yourProfile': 'Your Profile',
    'profile.manageAddress': 'Manage Address',
    'profile.paymentMethods': 'Payment Methods',
    'profile.myOrders': 'My Orders',
    'profile.myCoupons': 'My Coupons',
    'profile.myWallet': 'My Wallet',
    'profile.signInTitle': 'Sign in',
    'profile.signInBody': 'Delivery info, order, wishlist আর profile save করতে sign in করুন।',
    'profile.language': 'ভাষা',
    'profile.languageSub': 'App language change করুন',
    'profile.bangla': 'বাংলা',
    'profile.english': 'English',
    'profile.currentLanguage': 'বাংলা primary',
    'profile.notificationSettings': 'Notification Settings · শীঘ্রই',
    'profile.passwordManager': 'Password Manager · Support-এ contact করুন',
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
    'home.exploreCategories': 'Explore Categories',
    'home.exploreCategoriesSub': 'Browse by occasion with soft pastel cues and quick jumps',
    'home.signinHelperTitle': 'Save wishlist & track orders',
    'home.signinHelperBody': 'Sign in once and keep every favourite cake, promo, and past order in one place.',
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

    'profile.title': 'Profile',
    'profile.settings': 'Settings',
    'profile.help': 'Help Center',
    'profile.yourProfile': 'Your Profile',
    'profile.manageAddress': 'Manage Address',
    'profile.paymentMethods': 'Payment Methods',
    'profile.myOrders': 'My Orders',
    'profile.myCoupons': 'My Coupons',
    'profile.myWallet': 'My Wallet',
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
