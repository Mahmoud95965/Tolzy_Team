export interface SubtitleWord {
  id: string;
  text: string;
  start: number; // in seconds
  end: number;   // in seconds
  highlightColor?: string;
}

export interface SubtitlePhrase {
  id: string;
  phrase: string;
  start: number;
  end: number;
  words: SubtitleWord[];
}

export interface SceneMeta {
  id: number;
  key: string;
  title: string;
  englishTitle: string;
  start: number;
  end: number;
  duration: number;
  themeColor: string;
}

export interface CompareTool {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  badge: string;
  price: string;
  arabicSupport: string;
  topFeature: string;
  pros: string[];
  cons: string[];
  rating: number;
  votes: number;
  accentColor: string;
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    badge: string;
  };
  content: string;
  timeAgo: string;
  mentionedTool: CompareTool;
  likes: number;
  replies: number;
}

export interface TechStackItem {
  id: string;
  name: string;
  author: string;
  authorAvatar: string;
  description: string;
  copiesCount: number;
  tools: {
    name: string;
    category: string;
    color: string;
    icon: string;
  }[];
}

export interface PollData {
  id: string;
  question: string;
  totalVotes: number;
  options: {
    id: string;
    text: string;
    percentage: number;
    votes: number;
    color: string;
    icon: string;
  }[];
}

export interface CreatorProfileData {
  name: string;
  handle: string;
  role: string;
  avatar: string;
  bio: string;
  stats: {
    label: string;
    value: string;
    icon: string;
  }[];
  favoriteTools: {
    name: string;
    role: string;
    color: string;
  }[];
}
