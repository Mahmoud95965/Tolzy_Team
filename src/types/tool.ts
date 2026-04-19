export type ToolCategory = '3D' | 'Automation' | 'Business' | 'Collaboration' | 'Communication' | 'Creativity' | 'Data Science' | 'Design' | 'Education' | 'Electronics' | 'Freelancing' | 'Gamification' | 'Games' | 'Language Learning' | 'Library' | 'Lifestyle' | 'Math' | 'Memory' | 'Online Learning' | 'Other' | 'Productivity' | 'Programming' | 'Project Management' | 'Reading' | 'Research' | 'Science' | 'Studying' | 'Teaching' | 'Technology' | 'Test Prep' | 'Video' | 'Writing';

// الفئات الفرعية لكل فئة رئيسية
export type VideoSubcategory = 'Video Editing' | 'Video Generation' | 'Video Enhancement' | 'Text to Video' | 'Video Analytics';
export type WritingSubcategory = 'Content Writing' | 'Copywriting' | 'Paraphrasing' | 'Grammar Check' | 'Translation';
export type DesignSubcategory = 'Image Generation' | 'Image Editing' | 'Logo Design' | 'UI/UX Design' | 'Graphic Design';
export type ProductivitySubcategory = 'Task Management' | 'Note Taking' | 'Calendar' | 'Email' | 'Automation';
export type ProgrammingSubcategory = 'Code Generation' | 'Code Review' | 'Debugging' | 'Documentation' | 'Testing';
export type BusinessSubcategory = 'Marketing' | 'Sales' | 'Customer Service' | 'Analytics' | 'Project Management';
export type EducationSubcategory = 'Learning' | 'Teaching' | 'Assessment' | 'Course Creation' | 'Study Tools';
export type ResearchSubcategory = 'Literature Review' | 'Data Analysis' | 'Citation Management' | 'Academic Writing';

export type ToolSubcategory =
  | VideoSubcategory
  | WritingSubcategory
  | DesignSubcategory
  | ProductivitySubcategory
  | ProgrammingSubcategory
  | BusinessSubcategory
  | EducationSubcategory
  | ResearchSubcategory
  | string; // للسماح بفئات فرعية مخصصة

export type ToolPricing = 'Free' | 'Freemium' | 'Paid' | 'Subscription';
export type ToolStatus = 'pending' | 'approved' | 'rejected' | 'approved_pending';

export interface Tool {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: ToolCategory | ToolCategory[]; // يدعم فئة واحدة أو عدة فئات
  subcategory?: ToolSubcategory | ToolSubcategory[]; // الفئة الفرعية (اختياري)
  tags: string[];
  url: string;
  imageUrl: string;
  pricing: ToolPricing;
  features: string[]; // المميزات
  pros?: string[]; // المميزات الإضافية
  cons?: string[]; // العيوب
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  status?: ToolStatus;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  votes: {
    helpful: string[]; // Array of user IDs
    notHelpful: string[]; // Array of user IDs
  };
  votingStats: {
    helpfulCount: number;
    notHelpfulCount: number;
    totalVotes: number;
  };
  savedBy: string[]; // Array of user IDs who saved this tool
}