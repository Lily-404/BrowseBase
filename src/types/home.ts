import { Resource } from './resource';
import { Tag } from './resourceTags';

export interface FilterState {
  type: 'category' | 'tag';
  id: string;
}

export interface CachedData {
  data: Resource[];
  count: number;
}

export interface ResourceResponse {
  data: Resource[];
  count: number;
  currentPage: number;
  totalPages: number;
} 