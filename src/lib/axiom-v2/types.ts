export interface RetrievedTool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing?: string;
  pros?: string[];
  cons?: string[];
  use_cases?: string[];
  website_url?: string;
  link?: string;
  similarity: number;
}

export interface RetrievedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level?: string;
  price?: string;
  link?: string;
  thumbnail?: string;
  similarity: number;
}

export interface AxiomV2ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  userPlan?: string;
  userId?: string;
  enableSearch?: boolean;
  mode?: string;
  model?: string;
  voice?: string;
  isGmailConnected?: boolean;
}

export interface AxiomV2RAGResult {
  tools: RetrievedTool[];
  courses: RetrievedCourse[];
  processedQuery: string;
}
