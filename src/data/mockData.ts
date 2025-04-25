import { Category, Tag } from '../types';

export const categories: Category[] = [
  { id: 'ai', name: 'AI' },
  { id: 'docs', name: 'doc' },
  { id: 'tutorials', name: 'Tutorials' },
  { id: 'tools', name: 'Tools' },
  { id: 'dev', name: 'dev' },
  { id: 'design', name: 'Design' },
  { id: 'blog', name: 'Blog' },
];

export const tags: Tag[] = [
  { id: 'trending', },
  { id: 'newAdded', },
  { id: 'beginnerFriendly', },
  { id: 'enterprise', },
  { id: 'communityChoice', },
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

export const resources: Resource[] = [
  {
    id: '1',
    title: 'React 官方文档',
    url: 'https://react.dev',
    description: `React官方文档是学习React的最佳起点。`,
    updatedAt: '2天前更新',
    rating: 4.9,
    reviews: 2100,
    tags: ['trending'],  // 修改为数组格式
    category: 'docs'
  },
  {
    id: '2',
    title: 'React Router 教程',
    url: 'https://reactrouter.com',
    description: `深入学习React Router的完整指南。`,
    updatedAt: '1周前更新',
    rating: 4.7,
    reviews: 1500,
    tags: ['tutorials', 'trending', 'newAdded'],
    category: 'tutorials'
  },
  {
    id: '3',
    title: 'React DevTools',
    url: 'https://chrome.google.com/webstore/detail/react-developer-tools',
    description: `React开发者必备的浏览器调试工具。`,
    updatedAt: '3天前更新',
    rating: 4.8,
    reviews: 1800,
    tags: ['enterprise', 'tools'],
    category: 'tools'
  },
  {
    id: '4',
    title: 'React 性能优化指南',
    url: 'https://react-performance.guide',
    description: '全面的React应用性能优化指南，包含实际案例和最佳实践。',
    updatedAt: '1周前更新',
    rating: 4.6,
    reviews: 980,
    tags: ['tutorials', 'beginnerFriendly'],
    category: 'tutorials'
  },
  {
    id: '5',
    title: 'React 组件库 Storybook',
    url: 'https://storybook.js.org',
    description: '强大的UI组件开发和文档工具，支持React组件的独立开发和测试。',
    updatedAt: '5天前更新',
    rating: 4.8,
    reviews: 2500,
    tags: ['tools', 'enterprise'],
    category: 'tools'
  },
  {
    id: '6',
    title: 'React 项目模板',
    url: 'https://create-react-template.dev',
    description: '精选的React项目启动模板，包含最佳实践和常用配置。',
    updatedAt: '3天前更新',
    rating: 4.5,
    reviews: 750,
    tags: ['trending', 'beginnerFriendly'],
    category: 'templates'
  },
  {
    id: '7',
    title: 'React 动画库',
    url: 'https://react-motion.dev',
    description: '专业的React动画解决方案，让你的应用拥有流畅的动画效果。',
    updatedAt: '4天前更新',
    rating: 4.7,
    reviews: 1200,
    tags: ['tools', 'communityChoice'],
    category: 'code'
  },
  {
    id: '8',
    title: 'React UI 设计系统',
    url: 'https://react-design-system.com',
    description: '完整的React UI设计系统，包含组件库和设计规范。',
    updatedAt: '2天前更新',
    rating: 4.9,
    reviews: 1800,
    tags: ['design', 'enterprise', 'communityChoice'],
    category: 'design'
  },
];