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
  { id: 'trending', description: '当前最受欢迎的资源' },
  { id: 'newAdded', description: '最近添加的资源' },
  { id: 'socialMedia', description: '来自各大社交平台的优质账号' },
  { id: 'mac', description: 'Mac 平台相关软件' },
  { id: 'communityChoice', description: '社区精选资源' },
  { id: 'openSource', description: '开源项目资源' },
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

