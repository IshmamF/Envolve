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

export interface HardCodedPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  tags: Tag[];
  votes: number;
  status: string;
  severity: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Tag {
  id: string;
  label: string;
}