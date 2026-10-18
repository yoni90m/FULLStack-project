import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Oromiffa', nativeName: 'Afaan Oromoo', flag: '🌳' },
  { code: 'ti', label: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇹' },
];

export const TRANSLATIONS = {
  en: {
    // Navigation
    mainMenu: 'Main Menu',
    dashboard: 'Dashboard',
    liveGpsMap: 'Live GPS Map',
    busFleet: 'Bus Fleet',
    routes: 'Routes',
    schedules: 'Schedules',
    bookings: 'Bookings & Seats',
    drivers: 'Drivers',
    passengers: 'Passengers',
    payments: 'Payments',
    reports: 'Analytics & Reports',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    rewards: 'Rewards',
    
    // Landing Page
    heroTitlePart1: 'Go Smart |',
    heroTitlePart2: 'Spend Less',
    heroSubtitle: 'Book buses, explore interactive live routes & track coaches in real-time across Ethiopia.',
    searchPlaceholder: 'Where do you want to go? (e.g. Bahir Dar, Hawassa, Mekelle)',
    findTrips: 'FIND TRIPS',
    bestFares: 'Best Fares',
    flexibleDates: 'Flexible Dates',
    secureBooking: 'Secure Booking',
    liveGpsTracking: 'Live GPS Tracking',
    activeTransitCorridors: 'Explore Active Transit Corridors',
    activeTransitSubtitle: 'Track coaches live with real-time GPS coordinates, current speed, and upcoming terminal stops.',
    launchFullTracker: '🚀 Launch Full GPS Tracker →',
    activeIntercityBuses: 'Active Intercity Buses',
    bookTrip: '🎫 Book Trip',
    fullView: 'Full View',
    nextStop: 'Next',
    eta: 'ETA',
    speed: 'Speed',
    driver: 'Driver',
    busesCount: 'Buses',
    activeRoutesCount: 'Active Routes',
    happyPassengersCount: 'Happy Passengers',
    onTimeRateCount: 'On-Time Rate',
    
    // Dashboard & Common
    welcomeBack: 'Welcome back',
    dashboardSubtitle: "Here is what's happening with your transit operations today.",
    totalBuses: 'Total Buses',
    activeBookings: 'Active Bookings',
    activeRoutes: 'Active Routes',
    todayRevenue: "Today's Revenue",
    totalRevenue: 'Total Revenue',
    liveFleetTracker: 'Live Vehicle Fleet GPS Tracker',
    fitFleet: 'Fit Fleet',
    myLocation: 'My Location',
    
    // Actions & Status
    status: 'Status',
    inTransit: 'In Transit',
    scheduled: 'Scheduled',
    completed: 'Completed',
    available: 'Available',
    actions: 'Actions',
    search: 'Search...',
    origin: 'Origin',
    destination: 'Destination',
    distance: 'Distance',
    duration: 'Duration',
    fare: 'Fare',
    passenger: 'Passenger',
    bookingRef: 'Booking Ref',
    amount: 'Amount',
    method: 'Method',
    transactionId: 'Transaction ID',
    date: 'Date',
    language: 'Language',
    telebirr: 'Telebirr',
    mobileBanking: 'Mobile Banking',
    cash: 'Cash',
  },

  am: {
    // Navigation
    mainMenu: 'ዋና ምናሌ',
    dashboard: 'ዳሽቦርድ',
    liveGpsMap: 'የቀጥታ ጂፒኤስ ካርታ',
    busFleet: 'አውቶቡሶች',
    routes: 'መስመሮች',
    schedules: 'የጊዜ ሰሌዳዎች',
    bookings: 'ቦታ ማስያዝ እና መቀመጫ',
    drivers: 'ሹፌሮች',
    passengers: 'ተሳፋሪዎች',
    payments: 'ክፍያዎች',
    reports: 'ትንታኔ እና ሪፖርቶች',
    signIn: 'ግባ',
    signOut: 'ውጣ',
    rewards: 'ሽልማቶች',
    
    // Landing Page
    heroTitlePart1: 'ብልህ ይጓዙ |',
    heroTitlePart2: 'ያነሰ ያውጡ',
    heroSubtitle: 'አውቶቡሶችን በቀላሉ ይያዙ፣ የቀጥታ መስመሮችን ይመልከቱ እና ጉዞዎችን በቅጽበት ይከታተሉ።',
    searchPlaceholder: 'የት መሄድ ይፈልጋሉ? (ለምሳሌ ባሕር ዳር፣ ሀዋሳ፣ መቐለ)',
    findTrips: '🔍 ጉዞዎችን ፈልግ',
    bestFares: 'ተመጣጣኝ ዋጋ',
    flexibleDates: 'ምቹ ቀኖች',
    secureBooking: 'አስተማማኝ ቦታ ማስያዝ',
    liveGpsTracking: 'የቀጥታ ጂፒኤስ ክትትል',
    activeTransitCorridors: 'ንቁ የመጓጓዣ መስመሮችን ያስሱ',
    activeTransitSubtitle: 'አውቶቡሶችን በቀጥታ የጂፒኤስ መጋጠሚያዎች፣ ፍጥነት እና የሚደርሱበትን ሰዓት ይከታተሉ።',
    launchFullTracker: '🚀 ሙሉ የጂፒኤስ መከታተያ ክፈት →',
    activeIntercityBuses: 'በጉዞ ላይ ያሉ አውቶቡሶች',
    bookTrip: '🎫 ትኬት ይቁረጡ',
    fullView: 'ሙሉ እይታ',
    nextStop: 'ቀጣይ ማቆሚያ',
    eta: 'የሚደርስበት ሰዓት',
    speed: 'ፍጥነት',
    driver: 'ሹፌር',
    busesCount: 'አውቶቡሶች',
    activeRoutesCount: 'ንቁ መስመሮች',
    happyPassengersCount: 'ደስተኛ ተሳፋሪዎች',
    onTimeRateCount: 'በሰዓቱ የመድረስ ምጣኔ',
    
    // Dashboard & Common
    welcomeBack: 'እንኳን ደህና መጡ',
    dashboardSubtitle: 'የዛሬው የትራንስፖርት እንቅስቃሴ እና ስታቲስቲክስ የሚከተለው ነው።',
    totalBuses: 'ጠቅላላ አውቶቡሶች',
    activeBookings: 'ንቁ የተያዙ ቦታዎች',
    activeRoutes: 'ንቁ መስመሮች',
    todayRevenue: 'የዛሬው ገቢ',
    totalRevenue: 'ጠቅላላ ገቢ',
    liveFleetTracker: 'የአውቶቡሶች የቀጥታ ጂፒኤስ መከታተያ',
    fitFleet: 'ሁሉንም አሳይ',
    myLocation: 'የእኔ ቦታ',
    
    // Actions & Status
    status: 'ሁኔታ',
    inTransit: 'በመንገድ ላይ',
    scheduled: 'የታቀደ',
    completed: 'የተጠናቀቀ',
    available: 'ዝግጁ',
    actions: 'ተግባራት',
    search: 'ፈልግ...',
    origin: 'መነሻ',
    destination: 'መድረሻ',
    distance: 'ርቀት',
    duration: 'የሚወስደው ጊዜ',
    fare: 'የጉዞ ዋጋ',
    passenger: 'ተሳፋሪ',
    bookingRef: 'የቦታ መለያ',
    amount: 'መጠን',
    method: 'ዘዴ',
    transactionId: 'የግብይት ቁጥር',
    date: 'ቀን',
    language: 'ቋንቋ',
    telebirr: 'ቴሌብር',
    mobileBanking: 'ሞባይል ባንኪንግ',
    cash: 'ጥሬ ገንዘብ',
  },

  om: {
    // Navigation
    mainMenu: 'Baafata Guddaa',
    dashboard: 'Gabatee Odeeffannoo',
    liveGpsMap: 'Kaartaa GPS Kallattii',
    busFleet: 'Konkolaattota Baasii',
    routes: 'Daandiiwwan Imalaa',
    schedules: 'Sagantaawwan Imalaa',
    bookings: 'Qabannaa Teessoo',
    drivers: 'Ooftota',
    passengers: 'Imaltoota',
    payments: 'Kaffaltiiwwan',
    reports: 'Xiinxalaa fi Gabaasa',
    signIn: 'Seeni',
    signOut: 'Ba\'i',
    rewards: 'Badhaasa',
    
    // Landing Page
    heroTitlePart1: 'Ogeessummaan Imalaa |',
    heroTitlePart2: 'Qusadhaa',
    heroSubtitle: 'Baasii qabadhaa, daandiiwwan haaraa ilaalaa fi imala keessan yeroo qabatamaatti hordofaa.',
    searchPlaceholder: 'Eessa deemuu barbaaddu? (fk. Baahir Daar, Hawaasaa, Maqalee)',
    findTrips: '🔍 IMALA BARBAADAA',
    bestFares: 'Gatii Gaarii',
    flexibleDates: 'Guyyoota Mijaawaa',
    secureBooking: 'Qabannaa Amansiisaa',
    liveGpsTracking: 'Hordoffii GPS Kallattii',
    activeTransitCorridors: 'Daandiiwwan Hojjechaa Jiran Ilaalaa',
    activeTransitSubtitle: 'Baasiiwwan fageenya, saffisaa fi yeroo ga\'an kallattiin hordofaa.',
    launchFullTracker: '🚀 Hordoffii GPS Guutuu Bani →',
    activeIntercityBuses: 'Baasiiwwan Imalaa Keessa Jiran',
    bookTrip: '🎫 Tikkeettii Qabadhaa',
    fullView: 'Guutummaatti Ilaali',
    nextStop: 'Dhaabbata Itti Aanu',
    eta: 'Yeroo Ga\'u',
    speed: 'Saffisa',
    driver: 'Oofaa',
    busesCount: 'Baasiiwwan',
    activeRoutesCount: 'Daandiiwwan Hojjatan',
    happyPassengersCount: 'Imaltoota Gammadoo',
    onTimeRateCount: 'Yeroon Ga\'uu',
    
    // Dashboard & Common
    welcomeBack: 'Baga nagaan deebitan',
    dashboardSubtitle: 'Haalli soochii geejjibaa fi odeeffannoo har\'aa kan armaan gadiiti.',
    totalBuses: 'Baasiiwwan Waliigalaa',
    activeBookings: 'Qabannaa Yeroo Ammaa',
    activeRoutes: 'Daandiiwwan Hojjatan',
    todayRevenue: 'Galii Har\'aa',
    totalRevenue: 'Galii Waliigalaa',
    liveFleetTracker: 'Hordoffii GPS Baasiiwwanii',
    fitFleet: 'Hundumaa Argisiisi',
    myLocation: 'Bakka Koo',
    
    // Actions & Status
    status: 'Haala',
    inTransit: 'Karaa Irra Jira',
    scheduled: 'Qophaa\'eera',
    completed: 'Xumurameera',
    available: 'Qophii Dha',
    actions: 'Tarkaanfiiwwan',
    search: 'Barbaadi...',
    origin: 'Bakka Ka\'umsaa',
    destination: 'Bakka Geessaa',
    distance: 'Fageenya',
    duration: 'Yeroo Fudhatu',
    fare: 'Gatii Imalaa',
    passenger: 'Imalaa',
    bookingRef: 'Lakk. Qabannaa',
    amount: 'Gatii',
    method: 'Mala Kaffaltii',
    transactionId: 'Lakk. Dabarsaa',
    date: 'Guyyaa',
    language: 'Afaan',
    telebirr: 'Telebirr',
    mobileBanking: 'Baankii Moobaayilaa',
    cash: 'Qarshii Callaa',
  },

  ti: {
    // Navigation
    mainMenu: 'ቀንዲ ዝርዝር',
    dashboard: 'ዳሽቦርድ',
    liveGpsMap: 'ቀጥታዊ ጂፒኤስ ካርታ',
    busFleet: 'ኣውቶቡሳት',
    routes: 'መስመራት',
    schedules: 'መደባት ግዜ',
    bookings: 'ምዝገባን ኮረምትን',
    drivers: 'መዘወርቲ',
    passengers: 'ተሳፈርቲ',
    payments: 'ክፍሊታት',
    reports: 'ትንተናን ጸብጻባትን',
    signIn: 'እቶ',
    signOut: 'ውጻእ',
    rewards: 'ሽልማታት',
    
    // Landing Page
    heroTitlePart1: 'ብብልሒ ተጓዓዙ |',
    heroTitlePart2: 'ውሑድ ኣውጽኡ',
    heroSubtitle: 'ኣውቶቡሳት መዝግቡ፣ ቀጥታዊ መስመራት ርኣዩ፣ ኣብ ናይ ሓቂ ግዜ ድማ ተኸታተሉ።',
    searchPlaceholder: 'ናበይ ክትከዱ ትደልዩ? (ንኣብነት ባሕሪ ዳር፣ ሃዋሳ፣ መቐለ)',
    findTrips: '🔍 መገሻታት ድለዩ',
    bestFares: 'ዝበለጸ ዋጋ',
    flexibleDates: 'ምቹእ መዓልታት',
    secureBooking: 'ውሑስ ምዝገባ',
    liveGpsTracking: 'ቀጥታዊ ናይ ጂፒኤስ ምክትታል',
    activeTransitCorridors: 'ንጡፋት ናይ መጓዓዝያ መስመራት ዳህስሱ',
    activeTransitSubtitle: 'ኣውቶቡሳት ብቀጥታ ናይ ጂፒኤስ መተሓላለፊታት፣ ፍጥነትን ዝበጽሓሉ ግዜን ተኸታተሉ።',
    launchFullTracker: '🚀 ምሉእ ናይ ጂፒኤስ መከታተሊ ክፈት →',
    activeIntercityBuses: 'ኣብ ጉዕዞ ዘለዉ ኣውቶቡሳት',
    bookTrip: '🎫 ቲኬት ሓዙ',
    fullView: 'ምሉእ ርእይቶ',
    nextStop: 'ዝቕጽል መዕረፊ',
    eta: 'ዝበጽሓሉ ግዜ',
    speed: 'ፍጥነት',
    driver: 'ዘዋሪ',
    busesCount: 'ኣውቶቡሳት',
    activeRoutesCount: 'ንጡፋት መስመራት',
    happyPassengersCount: 'ሕጉሳት ተሳፈርቲ',
    onTimeRateCount: 'ብግዜኡ ምብጻሕ',
    
    // Dashboard & Common
    welcomeBack: 'እንቋዕ ብደሓን መጻእኩም',
    dashboardSubtitle: 'ናይ ሎሚ ናይ መጓዓዝያ ንጥፈታትን ጸብጻብን እዚ ዝስዕብ እዩ።',
    totalBuses: 'ሓፈሻዊ ኣውቶቡሳት',
    activeBookings: 'ንጡፍ ምዝገባታት',
    activeRoutes: 'ንጡፋት መስመራት',
    todayRevenue: 'ናይ ሎሚ ኣታዊ',
    totalRevenue: 'ሓፈሻዊ ኣታዊ',
    liveFleetTracker: 'ቀጥታዊ ናይ ኣውቶቡሳት ጂፒኤስ መከታተሊ',
    fitFleet: 'ኩሉ ኣርእይ',
    myLocation: 'ቦታይ',
    
    // Actions & Status
    status: 'ኩነታት',
    inTransit: 'ኣብ መንገዲ',
    scheduled: 'እተመደበ',
    completed: 'እተዛዘመ',
    available: 'ድሉው',
    actions: 'ተግባራት',
    search: 'ድለዩ...',
    origin: 'መበገሲ',
    destination: 'መዕረፊ',
    distance: 'ርሕቐት',
    duration: 'ዝወስዶ ግዜ',
    fare: 'ዋጋ ጉዕዞ',
    passenger: 'ተሳፋሪ',
    bookingRef: 'መለለዪ ምዝገባ',
    amount: 'መጠን',
    method: 'ኣገባብ',
    transactionId: 'ቁጽሪ ዝውውር',
    date: 'ዕለት',
    language: 'ቋንቋ',
    telebirr: 'ቴሌብር',
    mobileBanking: 'ሞባይል ባንኪንግ',
    cash: 'ጥረ ገንዘብ',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('translink_lang') || 'en';
  });

  const setLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      localStorage.setItem('translink_lang', langCode);
    }
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES, currentLangMeta }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
