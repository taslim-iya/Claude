import type { Account, Contact, Campaign, Opportunity, Task, Activity, TeamMember, ProspectList, SequenceStep } from '../types';

// Core data now loads at runtime from /data/accounts.json and /data/contacts.json
// These exports are kept for AppContext compatibility (campaigns, tasks, etc.)
export const accounts: Account[] = [];
export const contacts: Contact[] = [];
export const campaigns: Campaign[] = [];
export const opportunities: Opportunity[] = [];

export const tasks: Task[] = [
  { id: 'task-001', type: 'research', title: 'Review hot leads from Professional Services', description: 'Go through hot-scored professional services companies and prioritise top 20 for immediate outreach', dueDate: '2026-04-17', owner: 'Steve Pillon', priority: 'high', completed: false, createdAt: '2026-04-15' },
  { id: 'task-002', type: 'email_review', title: 'Draft intro sequence for construction firms', description: 'Create a 3-step email sequence targeting construction companies needing websites + automation', dueDate: '2026-04-18', owner: 'Steve Pillon', priority: 'high', completed: false, createdAt: '2026-04-15' },
  { id: 'task-003', type: 'research', title: 'Identify companies with weak websites', description: 'Filter the 9,000 prospects by "Poor" website quality — these are the easiest sell for web services', dueDate: '2026-04-19', owner: 'Steve Pillon', priority: 'medium', completed: false, createdAt: '2026-04-15' },
  { id: 'task-004', type: 'call', title: 'Call top 10 hot leads with phone numbers', description: 'Use the phone filter to find hot leads with numbers and make intro calls', dueDate: '2026-04-20', owner: 'Steve Pillon', priority: 'high', completed: false, createdAt: '2026-04-15' },
];

export const activities: Activity[] = [
  { id: 'act-001', type: 'import', description: 'Imported 9,000 Tier 1 ICP accounts from Companies House across 10 industries', timestamp: '2026-04-15T08:30:00Z', owner: 'Steve Pillon' },
  { id: 'act-002', type: 'enrichment', description: 'Enriched all accounts with insights, website quality scores, outreach positioning, and phone numbers', timestamp: '2026-04-15T08:30:00Z', owner: 'Steve Pillon' },
  { id: 'act-003', type: 'import', description: 'Generated 14,000+ decision-maker contacts with email, phone, and LinkedIn profiles', timestamp: '2026-04-15T08:30:00Z', owner: 'Steve Pillon' },
];

export const teamMembers: TeamMember[] = [
  { id: 'tm-001', name: 'Steve Pillon', email: 'steve@pillon.com', role: 'admin', joinedAt: '2026-04-14', lastActive: '2026-04-15', emailsSent: 0, meetingsBooked: 0 },
];

export const prospectLists: ProspectList[] = [
  { id: 'list-001', name: 'Tier 1 — Professional Services (2,500)', type: 'static', contactCount: 2500, owner: 'Steve Pillon', tags: ['tier-1', 'professional-services'], createdAt: '2026-04-15', lastUpdated: '2026-04-15', description: 'Accountants, solicitors, and professional services firms. 5-20 years old.' },
  { id: 'list-002', name: 'Tier 1 — Construction (2,000)', type: 'static', contactCount: 2000, owner: 'Steve Pillon', tags: ['tier-1', 'construction'], createdAt: '2026-04-15', lastUpdated: '2026-04-15', description: 'Construction companies needing quoting, invoicing, and project management automation.' },
  { id: 'list-003', name: 'Tier 1 — Management Consultancy (1,200)', type: 'static', contactCount: 1200, owner: 'Steve Pillon', tags: ['tier-1', 'consultancy'], createdAt: '2026-04-15', lastUpdated: '2026-04-15', description: 'Consultancy firms that need client portals, CRM, and workflow automation.' },
  { id: 'list-004', name: 'Tier 1 — IT & Software (800)', type: 'static', contactCount: 800, owner: 'Steve Pillon', tags: ['tier-1', 'it-software'], createdAt: '2026-04-15', lastUpdated: '2026-04-15', description: 'Tech firms needing marketing sites, client onboarding, and support systems.' },
  { id: 'list-005', name: 'Tier 1 — Recruitment (800)', type: 'static', contactCount: 800, owner: 'Steve Pillon', tags: ['tier-1', 'recruitment'], createdAt: '2026-04-15', lastUpdated: '2026-04-15', description: 'Recruitment agencies needing candidate portals, ATS, and automated comms.' },
  { id: 'list-006', name: 'Weak Website Opportunities', type: 'dynamic', contactCount: 0, owner: 'Steve Pillon', tags: ['weak-website', 'easy-sell'], createdAt: '2026-04-15', lastUpdated: '2026-04-15', description: 'Companies with website quality score under 50 — strongest opening for web services pitch.' },
  { id: 'list-007', name: 'Hot Leads with Phone', type: 'dynamic', contactCount: 0, owner: 'Steve Pillon', tags: ['hot', 'phone-available'], createdAt: '2026-04-15', lastUpdated: '2026-04-15', description: 'High-scoring leads that have phone numbers — call first, email second.' },
];

export const sequenceSteps: SequenceStep[] = [
  { id:'step-001', stepNumber:1, type:'email', delayDays:0, subject:'Quick question about {{company_name}}', body:'Hi {{first_name}},\n\nI came across {{company_name}} and was impressed by what you\'ve built.\n\nWe help businesses like yours modernise operations — from professional websites to automation tools that eliminate repetitive admin work. Most clients see a 40%+ reduction in manual tasks within the first month.\n\nWorth a quick 15-min call?\n\nSteve Pillon' },
  { id:'step-002', stepNumber:2, type:'wait', delayDays:3 },
  { id:'step-003', stepNumber:3, type:'email', delayDays:0, subject:'Re: Quick question', body:'Hi {{first_name}},\n\nJust bumping this up briefly. We recently helped a similar firm automate their invoicing and client onboarding — saved them roughly £2,000/month in admin costs.\n\nHappy to show you what that would look like for {{company_name}}.\n\nSteve' },
  { id:'step-004', stepNumber:4, type:'wait', delayDays:4 },
  { id:'step-005', stepNumber:5, type:'email', delayDays:0, subject:'Last one from me, {{first_name}}', body:'Hi {{first_name}},\n\nNo worries if the timing isn\'t right. I\'ll leave you with this: we\'ve helped 50+ UK businesses cut operational overhead by 30-50% with modern websites, accounting automation, and AI tools.\n\nIf things change: steve@pillon.com\n\nBest,\nSteve' },
];

export const emailPerformanceData = [
  { date:'Mon', sent:0, opened:0, replied:0 },
  { date:'Tue', sent:0, opened:0, replied:0 },
  { date:'Wed', sent:0, opened:0, replied:0 },
  { date:'Thu', sent:0, opened:0, replied:0 },
  { date:'Fri', sent:0, opened:0, replied:0 },
  { date:'Sat', sent:0, opened:0, replied:0 },
  { date:'Sun', sent:0, opened:0, replied:0 },
];

export const funnelData = [
  { stage:'Total Leads', count:9000 },
  { stage:'Enriched', count:9000 },
  { stage:'Qualified', count:6200 },
  { stage:'Contacted', count:0 },
  { stage:'Replied', count:0 },
  { stage:'Meetings', count:0 },
  { stage:'Opportunities', count:0 },
];
