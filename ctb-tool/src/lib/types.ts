export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  tripDates: string;
  destinations: string[];
  budget: string;
  status: string;
  notes: string;
  createdAt: string;
}

export interface DayPlan {
  day: number;
  date: string;
  city: string;
  activities: string[];
  transport: string;
  accommodation: string;
  meals: string[];
  notes: string;
}

export interface Itinerary {
  id: string;
  title: string;
  clientId: string;
  cities: string[];
  startDate: string;
  endDate: string;
  status: string;
  days: DayPlan[];
  createdAt: string;
}

export interface Template {
  id: string;
  title: string;
  cities: string[];
  duration: number;
  description: string;
  days: DayPlan[];
  createdAt: string;
}

export interface Experience {
  id: string;
  name: string;
  city: string;
  category: string;
  description: string;
  priceRange: string;
  tips: string;
  rating: number;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  clientName: string;
  timestamp: string;
  issueType: string;
  description: string;
  resolution: string;
  status: string;
}

export interface SavedContent {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  views: string;
  status: string;
  captions: Record<string, string>;
  addedAt: string;
}

export interface Phrase {
  category: string;
  english: string;
  pinyin: string;
  chinese: string;
}
