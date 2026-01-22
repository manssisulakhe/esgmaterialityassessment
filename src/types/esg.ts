export type ESGCategory = 'environmental' | 'social' | 'governance';

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ESGTopic {
  id: string;
  project_id: string;
  category: ESGCategory;
  name: string;
  description: string | null;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  topic_id: string;
  project_id: string;
  stakeholder_importance: number;
  business_impact: number;
  materiality_score: number;
  created_at: string;
  updated_at: string;
}

export interface TopicWithScore extends ESGTopic {
  stakeholder_importance?: number;
  business_impact?: number;
  materiality_score?: number;
}

export const ESG_CATEGORIES: { key: ESGCategory; label: string; icon: string }[] = [
  { key: 'environmental', label: 'Environmental', icon: 'Leaf' },
  { key: 'social', label: 'Social', icon: 'Users' },
  { key: 'governance', label: 'Governance', icon: 'Building2' },
];

export const IMPORTANCE_LEVELS = [
  { value: 1, label: 'Low', description: 'Minimal relevance' },
  { value: 2, label: 'Medium', description: 'Moderate relevance' },
  { value: 3, label: 'High', description: 'Significant relevance' },
  { value: 4, label: 'Very High', description: 'Critical importance' },
];

export const IMPACT_LEVELS = [
  { value: 1, label: 'Low', description: 'Minimal relevance' },
  { value: 2, label: 'Medium', description: 'Moderate relevance' },
  { value: 3, label: 'High', description: 'Significant relevance' },
  { value: 4, label: 'Very High', description: 'Critical importance' },
];
