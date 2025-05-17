export interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  updatedAt: string;
}

export interface ResourceFilters {
  search?: string;
  category?: string;
  tag?: string;
}