import { Category, Tag } from '../types';

export const categories: Category[] = [
  { id: 'ai', name: 'AI' },
  { id: 'docs', name: 'Doc' },
  { id: 'tools', name: 'Tools' },
  { id: 'dev', name: 'Dev' },
  { id: 'design', name: 'Design' },
  { id: 'blog', name: 'Blog' },
  { id: 'resources', name: 'Resources'},
];

export const tags: Tag[] = [
  { id: 'trending', name: '热门', description: '当前最受欢迎的资源' },
  { id: 'newAdded', name: '最新', description: '最近添加的资源' },
  { id: 'socialMedia', name: '社交媒体', description: '来自各大社交平台的优质账号' },
  { id: 'mac', name: '软件', description: '平台相关软件' },
  { id: 'communityChoice', name: '社区精选', description: '社区精选资源' },
  { id: 'openSource', name: '开源', description: '开源项目资源' },
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

