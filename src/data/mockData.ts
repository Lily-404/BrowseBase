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
  { id: 'trending', name: '热门', description: '当前最受欢迎的资源' },
  { id: 'newAdded', name: '最新', description: '最近添加的资源' },
  { id: 'youtuber', name: '油管博主', description: '来自 YouTube 创作者的资源' },
  { id: 'mac', name: 'Mac软件', description: 'Mac 平台相关软件' },
  { id: 'communityChoice', name: '社区', description: '社区精选资源' },
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

