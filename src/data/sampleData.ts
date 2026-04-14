import type { Account, Contact, Campaign, Opportunity, Task, Activity, TeamMember, ProspectList, SequenceStep } from '../types';

export const accounts: Account[] = [];
export const contacts: Contact[] = [];
export const campaigns: Campaign[] = [];
export const opportunities: Opportunity[] = [];
export const tasks: Task[] = [];
export const activities: Activity[] = [];
export const teamMembers: TeamMember[] = [];
export const prospectLists: ProspectList[] = [];

export const sequenceSteps: SequenceStep[] = [
  { id:'step-001', stepNumber:1, type:'email', delayDays:0, subject:'Quick question about {{company_name}}', body:'Hi {{first_name}},\n\nI noticed {{company_name}} is scaling its sales team — congrats on the momentum.\n\nWe\'ve helped teams like yours cut prospecting time by 60% while increasing qualified pipeline by 3x.\n\nWorth a 15-min call?\n\n{{your_name}}' },
  { id:'step-002', stepNumber:2, type:'wait', delayDays:3 },
  { id:'step-003', stepNumber:3, type:'email', delayDays:0, subject:'Re: Quick question', body:'Hi {{first_name}},\n\nFollowing up briefly. We help companies automate lead sourcing, enrichment, and outreach in one platform. Most teams see first replies within 2 weeks.\n\n{{your_name}}' },
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
  { stage:'Total Leads', count:0 },
  { stage:'Enriched', count:0 },
  { stage:'Qualified', count:0 },
  { stage:'Contacted', count:0 },
  { stage:'Replied', count:0 },
  { stage:'Meetings', count:0 },
  { stage:'Opportunities', count:0 },
];
