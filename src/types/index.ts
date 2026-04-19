export * from './tool';
export * from './hero';

export interface FilterOptions {
  category: import('./tool').ToolCategory | 'All';
  pricing: import('./tool').ToolPricing | 'All';
  searchQuery?: string;
}



export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  coverImageUrl?: string;
  createdAt: string;
  authorId: string;
  authorEmail?: string;
  tags?: string[];
  status: 'draft' | 'published';
  likes?: string[]; // Array of user IDs who liked
  likesCount?: number;
  shares?: number;
}