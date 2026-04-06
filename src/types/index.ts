export type EnrichmentStatus = 'not_enriched' | 'pending' | 'enriched' | 'partial' | 'failed';
export type LeadScoreLabel = 'hot' | 'qualified' | 'nurture' | 'review' | 'low_priority' | 'do_not_contact';
export type OutreachStatus = 'not_contacted' | 'in_sequence' | 'replied' | 'interested' | 'not_interested' | 'unsubscribed' | 'bounced';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export type PipelineStage = 'new' | 'contacted' | 'replied' | 'interested' | 'meeting_booked' | 'proposal_sent' | 'opportunity' | 'won' | 'lost';
export type TaskType = 'follow_up' | 'call' | 'email_review' | 'research' | 'meeting_prep';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Account {
  id: string;
  name: string;
  website: string;
  domain: string;
  linkedin: string;
  industry: string;
  employeeCount: number;
  revenueBand: string;
  headquarters: string;
  country: string;
  description: string;
  technologies: string[];
  enrichmentStatus: EnrichmentStatus;
  leadScore: number;
  scoreLabel: LeadScoreLabel;
  owner: string;
  source: string;
  tags: string[];
  lastUpdated: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  seniority: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  linkedin: string;
  accountId: string;
  accountName: string;
  leadScore: number;
  scoreLabel: LeadScoreLabel;
  personaType: string;
  outreachStatus: OutreachStatus;
  pipelineStage: PipelineStage;
  owner: string;
  source: string;
  notes: string;
  lastActivity: string;
  enrichmentStatus: EnrichmentStatus;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  targetList: string;
  owner: string;
  channel: string;
  status: CampaignStatus;
  goal: string;
  contactCount: number;
  emailsSent: number;
  openRate: number;
  replyRate: number;
  meetingsBooked: number;
  createdAt: string;
  startedAt?: string;
}

export interface SequenceStep {
  id: string;
  stepNumber: number;
  type: 'email' | 'wait' | 'task';
  delayDays: number;
  subject?: string;
  body?: string;
  taskDescription?: string;
}

export interface ProspectList {
  id: string;
  name: string;
  type: 'static' | 'dynamic';
  contactCount: number;
  owner: string;
  tags: string[];
  createdAt: string;
  lastUpdated: string;
  description: string;
}

export interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  contactId: string;
  contactName: string;
  stage: PipelineStage;
  value: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
  closeDate: string;
  probability: number;
  notes: string;
  source: string;
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  dueDate: string;
  owner: string;
  priority: TaskPriority;
  accountId?: string;
  accountName?: string;
  contactId?: string;
  contactName?: string;
  completed: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  contactName?: string;
  accountName?: string;
  timestamp: string;
  owner: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  lastActive: string;
  emailsSent: number;
  meetingsBooked: number;
}
