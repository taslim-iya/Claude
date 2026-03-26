import type { Client, Itinerary, Template, Experience, SupportTicket, SavedContent, Phrase } from '../lib/types';

export const seedClients: Client[] = [
  { id: "c1", name: "James Wilson", email: "james.wilson@email.com", phone: "+44 7700 900123", tripDates: "2026-04-15 to 2026-04-25", destinations: ["Beijing", "Shanghai"], budget: "\u00a34,500", status: "booked", notes: "Vegetarian, interested in history", createdAt: "2026-02-10T10:00:00Z" },
  { id: "c2", name: "Sarah Chen", email: "sarah.chen@email.com", phone: "+44 7700 900456", tripDates: "2026-05-01 to 2026-05-08", destinations: ["Guangzhou", "Shenzhen"], budget: "\u00a33,200", status: "planning", notes: "Business trip with leisure days", createdAt: "2026-02-15T14:30:00Z" },
  { id: "c3", name: "Mohammed Al-Rashid", email: "m.alrashid@email.com", phone: "+44 7700 900789", tripDates: "2026-06-10 to 2026-06-16", destinations: ["Chengdu", "Xi'an"], budget: "\u00a35,000", status: "inquiry", notes: "Halal food requirements, family of 4", createdAt: "2026-03-01T09:00:00Z" },
  { id: "c4", name: "Emily Thompson", email: "emily.t@email.com", phone: "+44 7700 900321", tripDates: "2026-04-20 to 2026-04-30", destinations: ["Beijing", "Xi'an", "Shanghai"], budget: "\u00a36,000", status: "on-trip", notes: "Photography enthusiast, wants off-the-beaten-path experiences", createdAt: "2026-01-20T16:00:00Z" },
  { id: "c5", name: "David Park", email: "d.park@email.com", phone: "+44 7700 900654", tripDates: "2026-03-01 to 2026-03-10", destinations: ["Shanghai", "Hangzhou"], budget: "\u00a33,800", status: "completed", notes: "Loved the trip, wants to rebook for autumn", createdAt: "2026-01-05T11:00:00Z" },
];

export const seedItineraries: Itinerary[] = [
  {
    id: "it1", title: "Beijing & Shanghai Cultural Explorer", clientId: "c1", cities: ["Beijing", "Shanghai"],
    startDate: "2026-04-15", endDate: "2026-04-25", status: "confirmed",
    days: [
      { day: 1, date: "2026-04-15", city: "Beijing", activities: ["Arrive at Beijing Capital Airport", "Transfer to hotel", "Evening walk at Wangfujing Street"], transport: "Airport shuttle", accommodation: "The Peninsula Beijing", meals: ["Welcome dinner at Da Dong Roast Duck"], notes: "Jet lag day - keep it light" },
      { day: 2, date: "2026-04-16", city: "Beijing", activities: ["Tiananmen Square", "Forbidden City full tour", "Jingshan Park sunset"], transport: "Private driver", accommodation: "The Peninsula Beijing", meals: ["Hotel breakfast", "Lunch at local hutong restaurant", "Dinner at Lost Heaven"], notes: "Wear comfortable shoes, full day of walking" },
      { day: 3, date: "2026-04-17", city: "Beijing", activities: ["Great Wall at Mutianyu section", "Ming Tombs"], transport: "Private driver", accommodation: "The Peninsula Beijing", meals: ["Hotel breakfast", "Packed lunch", "Dinner at TRB Hutong"], notes: "Leave early at 7am to avoid crowds" },
    ],
    createdAt: "2026-02-12T10:00:00Z",
  },
  {
    id: "it2", title: "Guangzhou & Shenzhen Business Plus", clientId: "c2", cities: ["Guangzhou", "Shenzhen"],
    startDate: "2026-05-01", endDate: "2026-05-08", status: "draft",
    days: [
      { day: 1, date: "2026-05-01", city: "Guangzhou", activities: ["Arrive at Guangzhou Baiyun Airport", "Check into hotel", "Canton Tower evening visit"], transport: "Airport transfer", accommodation: "Four Seasons Guangzhou", meals: ["Dim sum dinner at Guangzhou Restaurant"], notes: "Welcome pack ready at hotel" },
    ],
    createdAt: "2026-02-20T14:00:00Z",
  },
];

export const seedTemplates: Template[] = [
  {
    id: "t1", title: "Beijing-Shanghai 7-Day Classic", cities: ["Beijing", "Shanghai"], duration: 7,
    description: "The quintessential China experience covering the Great Wall, Forbidden City, The Bund, and more.",
    days: [
      { day: 1, date: "", city: "Beijing", activities: ["Arrival & settle in", "Wangfujing Night Market"], transport: "Airport transfer", accommodation: "4-star hotel", meals: ["Welcome dinner - Peking Duck"], notes: "Rest day" },
      { day: 2, date: "", city: "Beijing", activities: ["Tiananmen Square", "Forbidden City", "Jingshan Park"], transport: "Private driver", accommodation: "4-star hotel", meals: ["Hotel breakfast", "Hutong lunch", "Local dinner"], notes: "Full day walking" },
      { day: 3, date: "", city: "Beijing", activities: ["Great Wall (Mutianyu)", "Summer Palace"], transport: "Private driver", accommodation: "4-star hotel", meals: ["Hotel breakfast", "Packed lunch", "Imperial cuisine dinner"], notes: "Early start 6:30am" },
      { day: 4, date: "", city: "Beijing", activities: ["Temple of Heaven", "798 Art District", "Hutong rickshaw tour"], transport: "Mix of taxi/walking", accommodation: "4-star hotel", meals: ["Hotel breakfast", "Art district cafe", "Hot pot dinner"], notes: "Cultural immersion day" },
      { day: 5, date: "", city: "Shanghai", activities: ["Bullet train to Shanghai", "The Bund evening walk", "Pudong skyline"], transport: "G-train Beijing-Shanghai (4.5hrs)", accommodation: "4-star hotel", meals: ["Train snacks", "Shanghai xiaolongbao dinner"], notes: "Train departs ~10am" },
      { day: 6, date: "", city: "Shanghai", activities: ["Yu Garden", "Old City", "Nanjing Road", "French Concession walk"], transport: "Metro + walking", accommodation: "4-star hotel", meals: ["Hotel breakfast", "Street food lunch", "French Concession dinner"], notes: "Shopping opportunities" },
      { day: 7, date: "", city: "Shanghai", activities: ["Zhujiajiao Water Town day trip", "Departure prep"], transport: "Private driver", accommodation: "N/A", meals: ["Hotel breakfast", "Water town lunch"], notes: "Departure day" },
    ],
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "t2", title: "Guangzhou-Shenzhen 5-Day Discovery", cities: ["Guangzhou", "Shenzhen"], duration: 5,
    description: "Explore the Pearl River Delta: dim sum culture, tech innovation, and Cantonese cuisine.",
    days: [
      { day: 1, date: "", city: "Guangzhou", activities: ["Arrival", "Canton Tower", "Pearl River night cruise"], transport: "Airport transfer", accommodation: "4-star hotel", meals: ["Dim sum welcome dinner"], notes: "Evening activities" },
      { day: 2, date: "", city: "Guangzhou", activities: ["Chen Clan Academy", "Shamian Island", "Qingping Market"], transport: "Metro + walking", accommodation: "4-star hotel", meals: ["Morning tea", "Local Cantonese lunch", "Dinner at Panxi Restaurant"], notes: "Cultural day" },
      { day: 3, date: "", city: "Guangzhou", activities: ["Baiyun Mountain hike", "Guangzhou Museum", "Beijing Road shopping"], transport: "Taxi + walking", accommodation: "4-star hotel", meals: ["Hotel breakfast", "Street food lunch", "BBQ dinner"], notes: "Active morning" },
      { day: 4, date: "", city: "Shenzhen", activities: ["High-speed train to Shenzhen", "OCT Loft Creative Park", "Coastal walk"], transport: "CRH train (30min)", accommodation: "4-star hotel", meals: ["Hotel breakfast", "Creative park cafe", "Seafood dinner"], notes: "Tech city vibes" },
      { day: 5, date: "", city: "Shenzhen", activities: ["Dafen Oil Painting Village", "Shopping at Luohu", "Departure"], transport: "Metro + taxi", accommodation: "N/A", meals: ["Hotel breakfast", "Farewell lunch"], notes: "Departure day" },
    ],
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "t3", title: "Chengdu-Xi'an 6-Day Adventure", cities: ["Chengdu", "Xi'an"], duration: 6,
    description: "Pandas, spicy food, terracotta warriors, and ancient history in western China.",
    days: [
      { day: 1, date: "", city: "Chengdu", activities: ["Arrival", "Jinli Ancient Street", "Sichuan opera face-changing show"], transport: "Airport transfer", accommodation: "4-star hotel", meals: ["Welcome hot pot dinner"], notes: "Spice introduction" },
      { day: 2, date: "", city: "Chengdu", activities: ["Giant Panda Research Base", "Wuhou Shrine", "Wide & Narrow Alleys"], transport: "Private driver", accommodation: "4-star hotel", meals: ["Hotel breakfast", "Mapo tofu lunch", "Street food dinner"], notes: "Early start for pandas 7am" },
      { day: 3, date: "", city: "Chengdu", activities: ["Leshan Giant Buddha day trip", "Tea house experience"], transport: "Private driver (2hrs each way)", accommodation: "4-star hotel", meals: ["Hotel breakfast", "Local lunch", "Kung Pao chicken dinner"], notes: "Long day trip" },
      { day: 4, date: "", city: "Xi'an", activities: ["Flight to Xi'an", "City Wall bike ride", "Muslim Quarter evening"], transport: "Flight (1.5hrs)", accommodation: "4-star hotel", meals: ["Airport meal", "Muslim Quarter street food"], notes: "Short flight day" },
      { day: 5, date: "", city: "Xi'an", activities: ["Terracotta Warriors", "Huaqing Hot Springs", "Tang Dynasty dinner show"], transport: "Private driver", accommodation: "4-star hotel", meals: ["Hotel breakfast", "Local lunch", "Tang Dynasty banquet"], notes: "Highlight day" },
      { day: 6, date: "", city: "Xi'an", activities: ["Big Wild Goose Pagoda", "Shaanxi History Museum", "Departure"], transport: "Taxi", accommodation: "N/A", meals: ["Hotel breakfast", "Biang biang noodle lunch"], notes: "Departure day" },
    ],
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export const seedExperiences: Experience[] = [
  { id: "e1", name: "Peking Duck at Da Dong", city: "Beijing", category: "food", description: "World-famous Peking duck with crispy skin carved tableside. Modern upscale setting.", priceRange: "\u00a5300-500pp", tips: "Book 2 days ahead. Ask for the crispy skin served with sugar.", rating: 5 },
  { id: "e2", name: "Great Wall Sunset at Jinshanling", city: "Beijing", category: "activity", description: "Less crowded section of the Great Wall, perfect for photography during golden hour.", priceRange: "\u00a565 entry", tips: "Hire a local guide. Bring headlamp if staying for sunset. 2.5hr drive from city.", rating: 5 },
  { id: "e3", name: "Hutong Rickshaw Tour", city: "Beijing", category: "culture", description: "Traditional rickshaw ride through ancient hutong alleyways with local family visit.", priceRange: "\u00a5200-300pp", tips: "Morning tours are best. Tip the driver. Ask to visit a courtyard home.", rating: 4 },
  { id: "e4", name: "Dim Sum at Guangzhou Restaurant", city: "Guangzhou", category: "food", description: "Iconic dim sum since 1935. Try the shrimp dumplings, char siu bao, and egg tarts.", priceRange: "\u00a5100-200pp", tips: "Go before 10am to avoid queues. Point and order from the carts.", rating: 5 },
  { id: "e5", name: "Pearl River Night Cruise", city: "Guangzhou", category: "activity", description: "Evening boat cruise with stunning views of Canton Tower and illuminated skyline.", priceRange: "\u00a580-150pp", tips: "Upper deck for best views. Book the 8pm sailing.", rating: 4 },
  { id: "e6", name: "Giant Panda Base Morning Visit", city: "Chengdu", category: "activity", description: "See giant pandas feeding and playing. Morning is when they're most active.", priceRange: "\u00a555 entry", tips: "Arrive at 7:30am opening. Pandas sleep after 10am. Take the shuttle bus inside.", rating: 5 },
  { id: "e7", name: "Sichuan Hot Pot at Haidilao", city: "Chengdu", category: "food", description: "Interactive hot pot experience with famous service. Half-spicy, half-mild broth.", priceRange: "\u00a5150-250pp", tips: "Try the hand-pulled noodle show. Free snacks and nail painting while you wait.", rating: 4 },
  { id: "e8", name: "Terracotta Warriors Private Guide", city: "Xi'an", category: "culture", description: "Guided tour of the 8,000 terracotta soldiers. Pit 1 is the main highlight.", priceRange: "\u00a5150 entry + \u00a5500 guide", tips: "Book English-speaking guide in advance. 1.5hr drive from city. Go early.", rating: 5 },
  { id: "e9", name: "Muslim Quarter Street Food Walk", city: "Xi'an", category: "food", description: "Vibrant night market with lamb skewers, roujiamo (Chinese burger), and pomegranate juice.", priceRange: "\u00a550-100pp", tips: "Best after 6pm. Try the Biang Biang noodles and persimmon cakes.", rating: 5 },
  { id: "e10", name: "The Bund Night Walk", city: "Shanghai", category: "activity", description: "Iconic waterfront promenade with views of Pudong's futuristic skyline across the river.", priceRange: "Free", tips: "Best around 7-8pm when lights come on. Walk from south to north.", rating: 5 },
  { id: "e11", name: "Yu Garden Morning Tea", city: "Shanghai", category: "culture", description: "Traditional Chinese garden from 1559 with pavilions, ponds, and rockeries.", priceRange: "\u00a540 entry", tips: "Go before 9am to avoid tour groups. The nearby Nanxiang steamed buns are a must.", rating: 4 },
  { id: "e12", name: "French Concession Cocktails", city: "Shanghai", category: "nightlife", description: "Tree-lined streets with speakeasy bars. Try Speak Low and Bar Rouge.", priceRange: "\u00a580-150 per drink", tips: "Speak Low entrance is behind a bookshelf. Dress smart casual.", rating: 4 },
  { id: "e13", name: "Dafen Oil Painting Village", city: "Shenzhen", category: "culture", description: "Fascinating village where artists create both reproductions and original works.", priceRange: "Free entry, paintings from \u00a5100", tips: "Commission a custom painting and have it shipped home. Amazing value.", rating: 4 },
  { id: "e14", name: "Chengdu Tea House Experience", city: "Chengdu", category: "culture", description: "Relax in a traditional tea house in People's Park. Watch mahjong and ear cleaning.", priceRange: "\u00a520-50", tips: "Try the covered-bowl jasmine tea. People's Park on weekday afternoons is magical.", rating: 4 },
  { id: "e15", name: "Xi'an City Wall Bike Ride", city: "Xi'an", category: "activity", description: "Cycle the complete 14km loop atop the ancient Ming Dynasty city walls.", priceRange: "\u00a554 wall entry + \u00a545 bike rental", tips: "Go at sunset for golden light. Takes about 1.5 hours to cycle the full loop.", rating: 5 },
];

export const seedSupport: SupportTicket[] = [
  { id: "s1", clientId: "c4", clientName: "Emily Thompson", timestamp: "2026-03-22T14:30:00Z", issueType: "transport", description: "Train from Xi'an to Shanghai was delayed by 2 hours. Client needs rebooking assistance.", resolution: "Rebooked on next available G-train, provided lounge access voucher", status: "resolved" },
  { id: "s2", clientId: "c4", clientName: "Emily Thompson", timestamp: "2026-03-23T09:00:00Z", issueType: "language", description: "Having difficulty communicating at local restaurant, needs translation support.", resolution: "", status: "open" },
  { id: "s3", clientId: "c1", clientName: "James Wilson", timestamp: "2026-03-15T11:00:00Z", issueType: "accommodation", description: "Requesting room upgrade at Peninsula Beijing - original room facing construction.", resolution: "Hotel agreed to complimentary upgrade to Deluxe Suite", status: "resolved" },
];

export const seedContent: SavedContent[] = [
  { id: "v1", title: "Top 10 Street Foods in Beijing You MUST Try", url: "https://youtube.com/watch?v=example1", thumbnail: "", channel: "Travel Food Channel", views: "2.3M", status: "saved", captions: {}, addedAt: "2026-03-10T10:00:00Z" },
  { id: "v2", title: "Great Wall of China - Complete Guide 2026", url: "https://youtube.com/watch?v=example2", thumbnail: "", channel: "Wanderlust Adventures", views: "1.1M", status: "scheduled", captions: { instagram: "\ud83c\udde8\ud83c\uddf3 The Great Wall isn't just a wall\u2014it's a journey through 2,000+ years of history. Which section should YOU visit? #GreatWall #ChinaTravel #CTB" }, addedAt: "2026-03-12T14:00:00Z" },
];

export const seedPhrases: Phrase[] = [
  { category: "Greetings", english: "Hello", pinyin: "N\u01d0 h\u01ceo", chinese: "\u4f60\u597d" },
  { category: "Greetings", english: "Thank you", pinyin: "Xi\u00e8 xi\u00e8", chinese: "\u8c22\u8c22" },
  { category: "Greetings", english: "You're welcome", pinyin: "B\u00fa k\u00e8 q\u00ec", chinese: "\u4e0d\u5ba2\u6c14" },
  { category: "Greetings", english: "Goodbye", pinyin: "Z\u00e0i ji\u00e0n", chinese: "\u518d\u89c1" },
  { category: "Greetings", english: "Good morning", pinyin: "Z\u01ceo shang h\u01ceo", chinese: "\u65e9\u4e0a\u597d" },
  { category: "Greetings", english: "How are you?", pinyin: "N\u01d0 h\u01ceo ma?", chinese: "\u4f60\u597d\u5417\uff1f" },
  { category: "Essentials", english: "Yes", pinyin: "Sh\u00ec", chinese: "\u662f" },
  { category: "Essentials", english: "No", pinyin: "B\u00fa sh\u00ec", chinese: "\u4e0d\u662f" },
  { category: "Essentials", english: "Please", pinyin: "Q\u01d0ng", chinese: "\u8bf7" },
  { category: "Essentials", english: "Sorry / Excuse me", pinyin: "Du\u00ec b\u00f9 q\u01d0", chinese: "\u5bf9\u4e0d\u8d77" },
  { category: "Essentials", english: "I don't understand", pinyin: "W\u01d2 t\u012bng b\u00f9 d\u01d2ng", chinese: "\u6211\u542c\u4e0d\u61c2" },
  { category: "Essentials", english: "Do you speak English?", pinyin: "N\u01d0 hu\u00ec shu\u014d y\u012bng y\u01d4 ma?", chinese: "\u4f60\u4f1a\u8bf4\u82f1\u8bed\u5417\uff1f" },
  { category: "Essentials", english: "How much?", pinyin: "Du\u014d sh\u01ceo qi\u00e1n?", chinese: "\u591a\u5c11\u94b1\uff1f" },
  { category: "Essentials", english: "Too expensive", pinyin: "T\u00e0i gu\u00ec le", chinese: "\u592a\u8d35\u4e86" },
  { category: "Food", english: "I'm vegetarian", pinyin: "W\u01d2 ch\u012b s\u00f9", chinese: "\u6211\u5403\u7d20" },
  { category: "Food", english: "No spicy please", pinyin: "B\u00fa y\u00e0o l\u00e0", chinese: "\u4e0d\u8981\u8fa3" },
  { category: "Food", english: "The bill please", pinyin: "M\u01cei d\u0101n", chinese: "\u4e70\u5355" },
  { category: "Food", english: "Delicious!", pinyin: "H\u01ceo ch\u012b!", chinese: "\u597d\u5403\uff01" },
  { category: "Food", english: "Water", pinyin: "Shu\u01d0", chinese: "\u6c34" },
  { category: "Food", english: "Beer", pinyin: "P\u00ed ji\u01d4", chinese: "\u5564\u9152" },
  { category: "Food", english: "Tea", pinyin: "Ch\u00e1", chinese: "\u8336" },
  { category: "Food", english: "Menu please", pinyin: "Q\u01d0ng g\u011bi w\u01d2 c\u00e0i d\u0101n", chinese: "\u8bf7\u7ed9\u6211\u83dc\u5355" },
  { category: "Transport", english: "Where is...?", pinyin: "...z\u00e0i n\u01ce l\u01d0?", chinese: "...\u5728\u54ea\u91cc\uff1f" },
  { category: "Transport", english: "Train station", pinyin: "Hu\u01d2 ch\u0113 zh\u00e0n", chinese: "\u706b\u8f66\u7ad9" },
  { category: "Transport", english: "Airport", pinyin: "J\u012b ch\u01ceng", chinese: "\u673a\u573a" },
  { category: "Transport", english: "Taxi", pinyin: "Ch\u016b z\u016b ch\u0113", chinese: "\u51fa\u79df\u8f66" },
  { category: "Transport", english: "I want to go to...", pinyin: "W\u01d2 y\u00e0o q\u00f9...", chinese: "\u6211\u8981\u53bb..." },
  { category: "Transport", english: "Stop here", pinyin: "Z\u00e0i zh\u00e8 l\u01d0 t\u00edng", chinese: "\u5728\u8fd9\u91cc\u505c" },
  { category: "Emergency", english: "Help!", pinyin: "Ji\u00f9 m\u00ecng!", chinese: "\u6551\u547d\uff01" },
  { category: "Emergency", english: "Hospital", pinyin: "Y\u012b yu\u00e0n", chinese: "\u533b\u9662" },
  { category: "Emergency", english: "I feel sick", pinyin: "W\u01d2 b\u00f9 sh\u016b f\u00fa", chinese: "\u6211\u4e0d\u8212\u670d" },
  { category: "Emergency", english: "Pharmacy", pinyin: "Y\u00e0o di\u00e0n", chinese: "\u836f\u5e97" },
  { category: "Shopping", english: "Can I try this on?", pinyin: "W\u01d2 k\u011b y\u01d0 sh\u00ec sh\u00ec ma?", chinese: "\u6211\u53ef\u4ee5\u8bd5\u8bd5\u5417\uff1f" },
  { category: "Shopping", english: "I'll take it", pinyin: "W\u01d2 y\u00e0o zh\u00e8 ge", chinese: "\u6211\u8981\u8fd9\u4e2a" },
  { category: "Shopping", english: "Can you give a discount?", pinyin: "K\u011b y\u01d0 pi\u00e0n y\u00ed di\u01cen ma?", chinese: "\u53ef\u4ee5\u4fbf\u5b9c\u70b9\u5417\uff1f" },
  { category: "Hotel", english: "I have a reservation", pinyin: "W\u01d2 y\u01d2u y\u00f9 d\u00ecng", chinese: "\u6211\u6709\u9884\u5b9a" },
  { category: "Hotel", english: "Wi-Fi password", pinyin: "Wi-Fi m\u00ec m\u01ce", chinese: "Wi-Fi\u5bc6\u7801" },
  { category: "Hotel", english: "Check out", pinyin: "Tu\u00ec f\u00e1ng", chinese: "\u9000\u623f" },
];
