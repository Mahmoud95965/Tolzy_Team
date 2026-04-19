export interface HeroSlide {
    id: string;
    type: 'tool' | 'news' | 'external';
    itemId?: string; // ID of the tool or news
    customTitle?: string;
    titlePrefix?: string; // Text before the highlighted title
    customBadge?: string; // Small pill text
    features?: string[]; // List of feature tags
    customDescription?: string;
    customImageUrl?: string;
    customVideoUrl?: string; // Video URL (YouTube, Vimeo, or direct link)
    mediaType?: 'image' | 'video'; // Type of media to display
    customLink?: string; // For external type
    order: number;
    isActive: boolean;
    createdAt?: string;
}
