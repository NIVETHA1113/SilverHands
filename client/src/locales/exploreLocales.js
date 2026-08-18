/**
 * exploreLocales.js
 * Lightweight English / Tamil translation strings for the /explore page.
 * Usage: import { useExploreLocale } from '../locales/exploreLocales';
 *        const { t, lang, setLang } = useExploreLocale();
 *        then use t('key') throughout the component.
 */

import { useLanguage } from '../contexts/LanguageContext';

// ─── Translation map ──────────────────────────────────────────────────────────
export const LOCALES = {
  en: {
    // Opportunities page — English
    oppBadge:            'Open Opportunities',
    oppTitleNear:        (city) => `Opportunities near ${city}`,
    oppTitleBrowse:      'Browse Opportunities',
    oppSubtitle:         'Customers post tasks they need help with. Apply as a provider to offer your skills.',
    oppFilteredBy:       (city) => `Filtered by: ${city}`,
    oppPostBtn:          'Post Opportunity',
    oppSearchPh:         'Search by title, skill, or city...',
    oppFiltersBtn:       'Filters',
    oppCatLabel:         'Category',
    oppCityLabel:        'City',
    oppCityPh:           'e.g. Chennai',
    oppSortLabel:        'Sort By',
    oppSortNewest:       'Newest First',
    oppSortOldest:       'Oldest First',
    oppSortBudgetAsc:    'Budget: Low to High',
    oppSortBudgetDesc:   'Budget: High to Low',
    oppNoTitle:          (city) => city ? `No opportunities found in ${city}` : 'No open opportunities',
    oppNoSubCity:        (city) => `There are no open opportunities in ${city} right now.`,
    oppNoSubCustomer:    'Be the first to post an opportunity for local providers to apply.',
    oppNoSubProvider:    'No open opportunities match your search. Try adjusting filters.',
    oppShowAllCities:    'Show all cities',
    oppPageOf:           (cur, total) => `Page ${cur} of ${total}`,
    oppApplication:      'Application',
    oppApplications:     'Applications',
    oppMore:             (n) => `+${n} more`,
    oppApplyBtn:         'Apply',
    oppBudgetFixed:      'Fixed',
    oppBudgetPerHour:    '/hr',
    oppBudgetPerDay:     '/day',

    // Navbar links — English
    navExplore:          'Explore',
    navOpportunities:    'Opportunities',
    navDashboard:        'Dashboard',
    navMyServices:       'My Services',
    navMyProducts:       'My Products',
    navMyApplications:   'My Applications',
    navPostOpportunity:  'Post Opportunity',
    navMyOpportunities:  'My Opportunities',
    navLogOut:           'Log Out',
    navLogIn:            'Log In',
    navJoin:             'Join SilverHands',
    navExploreMarketplace: '🔍 Explore Marketplace',
    navBrowseOpportunities: 'Browse Opportunities',
    navRoleProvider:     'Skill Provider',
    navRoleCustomer:     'Customer',

    // Language meta
    langCode:   'en-IN',
    langLabel:  'English',
    altLabel:   'தமிழ்',

    // Hero
    badgeMarketplace:  'Public Marketplace',
    heroTitle:         'Discover skills, services & products',
    heroSubtitle:      'Find trusted local senior citizens and homemakers offering traditional skills, home tutoring, tailoring, and handmade crafts.',

    // Search bar
    searchPlaceholder: 'e.g. Tailoring, Cooking, Mango Pickle, Math Tutor...',
    searchAriaLabel:   'Search services, products and providers',
    searchBtn:         'Search',
    voiceClickLabel:   'Click here for voice search',
    voiceListening:    'Listening...',
    voiceStopTitle:    'Listening… click to stop',
    voiceStartTitle:   'Click here for voice search',
    voiceAriaStop:     'Stop voice search',
    voiceAriaStart:    'Search by voice',
    voiceErrorDismiss: 'Dismiss',

    // Category chips
    categories: {
      All:              'All',
      Cooking:          'Cooking',
      Tailoring:        'Tailoring',
      Teaching:         'Teaching',
      Tutoring:         'Tutoring',
      Gardening:        'Gardening',
      Handicrafts:      'Handicrafts',
      Music:            'Music',
      Dance:            'Dance',
      'Traditional Arts': 'Traditional Arts',
      Beauty:           'Beauty',
      'Language Training': 'Language Training',
      Consulting:       'Consulting',
      Other:            'Other',
    },

    // Tabs
    tabServices:   'Services',
    tabProducts:   'Products',
    tabProviders:  'Providers',
    showFilters:   'Show Filters',
    hideFilters:   'Hide Filters',

    // Filter sidebar
    filterHeading:       'Filters & Sort',
    filterCity:          'City',
    filterSortBy:        'Sort By',
    filterPriceRange:    'Price Range (₹)',
    filterAvailDays:     'Available Days',
    filterDeliveryMode:  'Delivery Mode',
    filterDeliveryOpts:  'Delivery Options',
    filterSkill:         'Skill',
    filterSkillPh:       'e.g. Tailoring, Cooking…',
    filterExperience:    'Experience',
    filterLanguages:     'Languages',
    filterClearAll:      'Clear All Filters',

    // Sort options
    sortRelevance:   'Relevance',
    sortNewest:      'Newest',
    sortPriceAsc:    'Price: Low → High',
    sortPriceDesc:   'Price: High → Low',
    sortExperience:  'Experience',

    // Experience levels
    expAll:    'All Experience',
    exp0to5:   '0 – 5 years',
    exp5to10:  '5 – 10 years',
    exp10to20: '10 – 20 years',
    exp20plus: '20 + years',

    // Days
    days: {
      Monday:    'Monday',
      Tuesday:   'Tuesday',
      Wednesday: 'Wednesday',
      Thursday:  'Thursday',
      Friday:    'Friday',
      Saturday:  'Saturday',
      Sunday:    'Sunday',
    },

    // Delivery modes
    deliveryModes: {
      Online:            'Online',
      'In Person':       'In Person',
      'Home Based':      'Home Based',
      'Customer Location': 'Customer Location',
    },

    // Delivery options
    deliveryOptions: {
      Pickup:         'Pickup',
      'Local Delivery': 'Local Delivery',
      Shipping:       'Shipping',
    },

    // Languages (spoken)
    spokenLanguages: {
      Tamil:     'Tamil',
      English:   'English',
      Kannada:   'Kannada',
      Telugu:    'Telugu',
      Hindi:     'Hindi',
      Malayalam: 'Malayalam',
    },

    // Price types (from DB: 'hour', 'session', 'item', 'day', 'month', 'piece')
    priceTypes: {
      hour:    'per hour',
      session: 'per session',
      item:    'per item',
      day:     'per day',
      month:   'per month',
      piece:   'per piece',
      visit:   'per visit',
    },

    // Distance label
    kmAway: (km) => `${km} km away`,

    // Cities list label
    allCities: 'All Cities',
    anyCity:   'Any city',

    // Results count
    resultsFound:   (n) => `${n} result${n !== 1 ? 's' : ''} found`,
    resultsFor:     (q) => `for "${q}"`,
    resultsIn:      (cat) => `in ${cat}`,
    noResults:      'No results found',
    loading:        'Loading…',
    loadingListings:'Loading listings…',

    // Error state
    errorTitle:   'Error loading results',
    errorDismiss: 'Dismiss',

    // Services grid
    viewService:      'View Service',
    noServicesFound:  'No services found',
    noServicesHint:   'Try a different keyword or clear the filters.',
    clearFilters:     'Clear filters',
    skillProvider:    'Skill Provider',

    // Products grid
    outOfStock:     'Out of Stock',
    unitsLeft:      (qty, unit) => `${qty} ${unit}s left`,
    perUnit:        (unit) => `per ${unit}`,
    viewProduct:    'View Product',
    noProductsFound:'No products found',
    noProductsHint: 'Try a different keyword or clear the filters.',

    // Providers grid
    trusted:         'Trusted',
    skillsLabel:     'Skills',
    speaksLabel:     (langs) => `Speaks: ${langs}`,
    viewProfile:     'View Profile',
    noProvidersFound:'No providers found',
    noProvidersHint: 'Try a different skill or city.',
    locationUnavail: 'Location unavailable',
    providerFallback:'Provider',

    // Match panel
    matchPanelTitle:    'Find Best Match',
    matchPanelSubtitle: '— score & rank providers against your requirements',
    matchRankedBadge:   (n) => `${n} ranked`,
    matchReqSkills:     'Required Skills',
    matchSkillPh:       'e.g. Tailoring, Cooking…',
    matchAddSkill:      'Add',
    matchCity:          'City',
    matchAvailability:  'Availability',
    matchBtnLoading:    'Matching…',
    matchBtnFind:       'Find Matches',
    matchClearResults:  'Clear results',
    matchRankedHeading: (n) => `${n} providers ranked by match score`,
    matchWhyThis:       'Why this match?',
    matchHideDetails:   'Hide details',
    matchViewProfile:   'View Full Profile',
    matchNoResults:     'No providers matched your requirements. Try broadening your criteria.',

    // Pagination
    pagePrev:  'Previous',
    pageNext:  'Next',
    pageOf:    (cur, total) => `Page ${cur} of ${total}`,
  },

  // ─── Tamil ─────────────────────────────────────────────────────────────────
  ta: {
    // Opportunities page — Tamil
    oppBadge:            'திறந்த வாய்ப்புகள்',
    oppTitleNear:        (city) => `${city} அருகே வாய்ப்புகள்`,
    oppTitleBrowse:      'வாய்ப்புகளை உலாவுக',
    oppSubtitle:         'வாடிக்கையாளர்கள் தங்களுக்கு உதவி தேவைப்படும் பணிகளை பதிவிடுகின்றனர். வழங்குநராக விண்ணப்பிக்கவும்.',
    oppFilteredBy:       (city) => `வடிகட்டல்: ${city}`,
    oppPostBtn:          'வாய்ப்பு பதிவிடு',
    oppSearchPh:         'தலைப்பு, திறன் அல்லது நகரம் தேடுக...',
    oppFiltersBtn:       'வடிகட்டிகள்',
    oppCatLabel:         'வகை',
    oppCityLabel:        'நகரம்',
    oppCityPh:           'எ.கா. சென்னை',
    oppSortLabel:        'வரிசையாக்கு',
    oppSortNewest:       'புதியது முதல்',
    oppSortOldest:       'பழையது முதல்',
    oppSortBudgetAsc:    'பட்ஜெட்: குறைவு → அதிகம்',
    oppSortBudgetDesc:   'பட்ஜெட்: அதிகம் → குறைவு',
    oppNoTitle:          (city) => city ? `${city} இல் வாய்ப்புகள் இல்லை` : 'திறந்த வாய்ப்புகள் இல்லை',
    oppNoSubCity:        (city) => `${city} இல் தற்போது திறந்த வாய்ப்புகள் இல்லை.`,
    oppNoSubCustomer:    'உள்ளூர் வழங்குநர்களுக்கு முதல் வாய்ப்பை பதிவிடுங்கள்.',
    oppNoSubProvider:    'உங்கள் தேடலுக்கு பொருந்தும் வாய்ப்புகள் இல்லை. வடிகட்டிகளை சரிசெய்யவும்.',
    oppShowAllCities:    'அனைத்து நகரங்களையும் காட்டு',
    oppPageOf:           (cur, total) => `பக்கம் ${cur} / ${total}`,
    oppApplication:      'விண்ணப்பம்',
    oppApplications:     'விண்ணப்பங்கள்',
    oppMore:             (n) => `+${n} மேலும்`,
    oppApplyBtn:         'விண்ணப்பிக்கவும்',
    oppBudgetFixed:      'நிலையான',
    oppBudgetPerHour:    '/மணி',
    oppBudgetPerDay:     '/நாள்',

    // Navbar links
    navExplore:          'ஆராய்க',
    navOpportunities:    'வாய்ப்புகள்',
    navDashboard:        'டாஷ்போர்டு',
    navMyServices:       'என் சேவைகள்',
    navMyProducts:       'என் பொருட்கள்',
    navMyApplications:   'என் விண்ணப்பங்கள்',
    navPostOpportunity:  'வாய்ப்பு பதிவிடு',
    navMyOpportunities:  'என் வாய்ப்புகள்',
    navLogOut:           'வெளியேறு',
    navLogIn:            'உள்நுழை',
    navJoin:             'SilverHands இல் சேர்',
    navExploreMarketplace: '🔍 சந்தையை ஆராய்க',
    navBrowseOpportunities: 'வாய்ப்புகளை பார்க்க',
    navRoleProvider:     'திறன் வழங்குநர்',
    navRoleCustomer:     'வாடிக்கையாளர்',

    langCode:  'ta-IN',
    langLabel: 'தமிழ்',
    altLabel:  'English',

    badgeMarketplace:  'பொது சந்தை',
    heroTitle:         'திறன்கள், சேவைகள் & பொருட்களை கண்டறியுங்கள்',
    heroSubtitle:      'பாரம்பரிய திறன்கள், வீட்டு பயிற்சி, தையல் மற்றும் கைவினை பொருட்கள் வழங்கும் நம்பகமான உள்ளூர் மூத்த குடிமக்கள் மற்றும் இல்லத்தரசிகளை கண்டறியுங்கள்.',

    searchPlaceholder: 'எ.கா. தையல், சமையல், மாம்பழ ஊறுகாய், கணித ஆசிரியர்...',
    searchAriaLabel:   'சேவைகள், பொருட்கள் மற்றும் வழங்குநர்களை தேடுங்கள்',
    searchBtn:         'தேடு',
    voiceClickLabel:   'குரல் தேடலுக்கு இங்கே கிளிக் செய்யுங்கள்',
    voiceListening:    'கேட்கிறோம்...',
    voiceStopTitle:    'கேட்கிறோம்… நிறுத்த கிளிக் செய்யுங்கள்',
    voiceStartTitle:   'குரல் தேடலுக்கு இங்கே கிளிக் செய்யுங்கள்',
    voiceAriaStop:     'குரல் தேடலை நிறுத்து',
    voiceAriaStart:    'குரலால் தேடு',
    voiceErrorDismiss: 'மூடு',

    categories: {
      All:              'அனைத்தும்',
      Cooking:          'சமையல்',
      Tailoring:        'தையல்',
      Teaching:         'கற்பித்தல்',
      Tutoring:         'பயிற்சி',
      Gardening:        'தோட்டக்கலை',
      Handicrafts:      'கைவினை',
      Music:            'இசை',
      Dance:            'நடனம்',
      'Traditional Arts': 'பாரம்பரிய கலைகள்',
      Beauty:           'அழகு',
      'Language Training': 'மொழி பயிற்சி',
      Consulting:       'ஆலோசனை',
      Other:            'மற்றவை',
    },

    tabServices:   'சேவைகள்',
    tabProducts:   'பொருட்கள்',
    tabProviders:  'வழங்குநர்கள்',
    showFilters:   'வடிகட்டிகளை காட்டு',
    hideFilters:   'வடிகட்டிகளை மறை',

    filterHeading:       'வடிகட்டிகள் & வரிசை',
    filterCity:          'நகரம்',
    filterSortBy:        'வரிசையாக்கு',
    filterPriceRange:    'விலை வரம்பு (₹)',
    filterAvailDays:     'கிடைக்கும் நாட்கள்',
    filterDeliveryMode:  'வழங்கல் முறை',
    filterDeliveryOpts:  'வழங்கல் விருப்பங்கள்',
    filterSkill:         'திறன்',
    filterSkillPh:       'எ.கா. தையல், சமையல்…',
    filterExperience:    'அனுபவம்',
    filterLanguages:     'மொழிகள்',
    filterClearAll:      'அனைத்து வடிகட்டிகளையும் அழி',

    sortRelevance:   'தொடர்பு',
    sortNewest:      'புதியது முதல்',
    sortPriceAsc:    'விலை: குறைவு → அதிகம்',
    sortPriceDesc:   'விலை: அதிகம் → குறைவு',
    sortExperience:  'அனுபவம்',

    expAll:    'அனைத்து அனுபவமும்',
    exp0to5:   '0 – 5 ஆண்டுகள்',
    exp5to10:  '5 – 10 ஆண்டுகள்',
    exp10to20: '10 – 20 ஆண்டுகள்',
    exp20plus: '20+ ஆண்டுகள்',

    days: {
      Monday:    'திங்கள்',
      Tuesday:   'செவ்வாய்',
      Wednesday: 'புதன்',
      Thursday:  'வியாழன்',
      Friday:    'வெள்ளி',
      Saturday:  'சனி',
      Sunday:    'ஞாயிறு',
    },

    deliveryModes: {
      Online:              'ஆன்லைன்',
      'In Person':         'நேரில்',
      'Home Based':        'வீட்டிலிருந்து',
      'Customer Location': 'வாடிக்கையாளர் இடத்தில்',
    },

    deliveryOptions: {
      Pickup:           'எடுக்கவரவும்',
      'Local Delivery': 'உள்ளூர் டெலிவரி',
      Shipping:         'அனுப்புதல்',
    },

    spokenLanguages: {
      Tamil:     'தமிழ்',
      English:   'ஆங்கிலம்',
      Kannada:   'கன்னடம்',
      Telugu:    'தெலுங்கு',
      Hindi:     'இந்தி',
      Malayalam: 'மலையாளம்',
    },

    // Price types
    priceTypes: {
      hour:    'ஒரு மணி நேரத்திற்கு',
      session: 'ஒரு அமர்வுக்கு',
      item:    'ஒரு பொருளுக்கு',
      day:     'ஒரு நாளுக்கு',
      month:   'ஒரு மாதத்திற்கு',
      piece:   'ஒரு துண்டுக்கு',
      visit:   'ஒரு வருகைக்கு',
    },

    // Distance label
    kmAway: (km) => `${km} கி.மீ தூரத்தில்`,

    allCities: 'அனைத்து நகரங்கள்',
    anyCity:   'எந்த நகரமும்',

    resultsFound:    (n) => `${n} முடிவு${n !== 1 ? 'கள்' : ''} கிடைத்தது`,
    resultsFor:      (q) => `"${q}" க்காக`,
    resultsIn:       (cat) => `${cat} இல்`,
    noResults:       'முடிவுகள் எதுவும் இல்லை',
    loading:         'ஏற்றுகிறோம்…',
    loadingListings: 'பட்டியல்களை ஏற்றுகிறோம்…',

    errorTitle:   'முடிவுகளை ஏற்றுவதில் பிழை',
    errorDismiss: 'மூடு',

    viewService:      'சேவையை காண்க',
    noServicesFound:  'சேவைகள் எதுவும் இல்லை',
    noServicesHint:   'வேறு வார்த்தை முயற்சிக்கவும் அல்லது வடிகட்டிகளை அழிக்கவும்.',
    clearFilters:     'வடிகட்டிகளை அழி',
    skillProvider:    'திறன் வழங்குநர்',

    outOfStock:      'இல்லை',
    unitsLeft:       (qty, unit) => `${qty} ${unit} மட்டுமே உள்ளது`,
    perUnit:         (unit) => `ஒரு ${unit} க்கு`,
    viewProduct:     'பொருளை காண்க',
    noProductsFound: 'பொருட்கள் எதுவும் இல்லை',
    noProductsHint:  'வேறு வார்த்தை முயற்சிக்கவும் அல்லது வடிகட்டிகளை அழிக்கவும்.',

    trusted:         'நம்பகமான',
    skillsLabel:     'திறன்கள்',
    speaksLabel:     (langs) => `பேசும் மொழிகள்: ${langs}`,
    viewProfile:     'சுயவிவரம் காண்க',
    noProvidersFound:'வழங்குநர்கள் எதுவும் இல்லை',
    noProvidersHint: 'வேறு திறன் அல்லது நகரம் முயற்சிக்கவும்.',
    locationUnavail: 'இடம் தெரியவில்லை',
    providerFallback:'வழங்குநர்',

    matchPanelTitle:    'சிறந்த பொருத்தம் கண்டறி',
    matchPanelSubtitle: '— உங்கள் தேவைகளுக்கு வழங்குநர்களை தரவரிசைப்படுத்துங்கள்',
    matchRankedBadge:   (n) => `${n} தரவரிசை`,
    matchReqSkills:     'தேவையான திறன்கள்',
    matchSkillPh:       'எ.கா. தையல், சமையல்…',
    matchAddSkill:      'சேர்',
    matchCity:          'நகரம்',
    matchAvailability:  'கிடைக்கும் நேரம்',
    matchBtnLoading:    'பொருத்துகிறோம்…',
    matchBtnFind:       'பொருத்தம் கண்டறி',
    matchClearResults:  'முடிவுகளை அழி',
    matchRankedHeading: (n) => `${n} வழங்குநர்கள் பொருத்த மதிப்பெண் அடிப்படையில்`,
    matchWhyThis:       'ஏன் இந்த பொருத்தம்?',
    matchHideDetails:   'விவரங்களை மறை',
    matchViewProfile:   'முழு சுயவிவரம் காண்க',
    matchNoResults:     'உங்கள் தேவைகளுக்கு பொருந்தும் வழங்குநர்கள் இல்லை. வரம்புகளை விரிவாக்கவும்.',

    pagePrev: 'முந்தைய',
    pageNext: 'அடுத்த',
    pageOf:   (cur, total) => `பக்கம் ${cur} / ${total}`,
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * useExploreLocale()
 * Reads lang from LanguageContext (global) and returns the matching locale object.
 * Returns { t, lang, setLang }
 */

export function useExploreLocale() {
  const { lang, setLang } = useLanguage();
  const t = LOCALES[lang] ?? LOCALES.en;
  return { t, lang, setLang };
}
