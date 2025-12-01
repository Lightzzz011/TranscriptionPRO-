export interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export interface Transcript {
  id: string;
  title: string;
  videoId: string;
  date: string;
  content: string;
  wordCount: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TOOL = 'TOOL',
  PRICING = 'PRICING',
  SETTINGS = 'SETTINGS',
  LOGIN = 'LOGIN'
}

export interface PlanDetails {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  razorpayPlanId?: string;
}