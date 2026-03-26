import { seedClients, seedItineraries, seedTemplates, seedExperiences, seedSupport, seedContent, seedPhrases } from '../data/seed';

function getOrInit<T>(key: string, seed: T): T {
  const stored = localStorage.getItem(key);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const store = {
  clients: {
    getAll: () => getOrInit('ctb_clients', seedClients),
    save: (data: typeof seedClients) => save('ctb_clients', data),
  },
  itineraries: {
    getAll: () => getOrInit('ctb_itineraries', seedItineraries),
    save: (data: typeof seedItineraries) => save('ctb_itineraries', data),
  },
  templates: {
    getAll: () => getOrInit('ctb_templates', seedTemplates),
    save: (data: typeof seedTemplates) => save('ctb_templates', data),
  },
  experiences: {
    getAll: () => getOrInit('ctb_experiences', seedExperiences),
    save: (data: typeof seedExperiences) => save('ctb_experiences', data),
  },
  support: {
    getAll: () => getOrInit('ctb_support', seedSupport),
    save: (data: typeof seedSupport) => save('ctb_support', data),
  },
  content: {
    getAll: () => getOrInit('ctb_content', seedContent),
    save: (data: typeof seedContent) => save('ctb_content', data),
  },
  phrases: {
    getAll: () => getOrInit('ctb_phrases', seedPhrases),
  },
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
