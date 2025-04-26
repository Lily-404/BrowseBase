import { Category, Tag } from '../types';

export const categories: Category[] = [
  { id: 'ai', name: 'AI' },
  { id: 'docs', name: 'doc' },
  { id: 'tutorials', name: 'Tutorials' },
  { id: 'tools', name: 'Tools' },
  { id: 'dev', name: 'dev' },
  { id: 'design', name: 'Design' },
  { id: 'blog', name: 'Blog' },
  { id: 'resources', name: 'Resources'},
];

export const tags: Tag[] = [
  { id: 'trending', },
  { id: 'newAdded', },
  { id: 'youtuber', },
  { id: 'mac', },
  { id: 'communityChoice', },
  { id: 'openSource', },
];

export interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  updatedAt: string;
  rating: number;
  reviews: number;
  tags: string[];
  category: string;
}

