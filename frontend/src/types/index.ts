export type ExpenseConcept = string;

export interface ExpenseConceptItem {
  key: string;
  label: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  concept?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FamilyEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  type?: string;
  location?: string;
  recurrence?: string;
  days_of_week?: string;
}

export interface Restaurant {
  id: string;
  owner_id: number;
  name: string;
  address?: string;
  phone?: string;
  cuisine_type?: string;
  notes?: string;
  rating: number;
  created_at?: string;
}
