export type Post = {
  id: string;
  created_at: string;
  author: string;
  title: string;
  description: string;
  image_url: string | null;
  location: string;
  longitude: number | null;
  latitude: number | null;
  upvotes: number;
  downvotes: number;
  status: boolean;
  resolved: number;
  category: string[];
  tags: string[];
  severity: 'high' | 'medium' | 'low';
}; 