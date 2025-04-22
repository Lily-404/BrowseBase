import { Category, Tag } from '../types';

export const categories: Category[] = [
  { id: 'webs', name: 'web' },
  { id: 'tutorials', name: 'Tutorials' },
  { id: 'tools', name: 'Tools' },
  { id: 'templates', name: 'Templates' },
  { id: 'code', name: 'Code' },
  { id: 'design', name: 'Design' },
  { id: 'ai', name: 'AI' },

];

export const tags: Tag[] = [
  { 
    id: 'trending', 
    name: 'Trending', 
    description: 'Currently most popular and widely used development resources.'
  },
  { 
    id: 'new', 
    name: 'New Added', 
    description: 'High-quality development resources added in the last week.'
  },
  { 
    id: 'beginner', 
    name: 'Beginner Friendly', 
    description: 'Basic tutorials and tool recommendations suitable for beginners.'
  },
  { 
    id: 'enterprise', 
    name: 'Enterprise', 
    description: 'Professional resources for large projects and enterprise applications.'
  },
  { 
    id: 'community', 
    name: 'Community Choice', 
    description: 'High-quality resources recommended by the developer community.'
  },
  {
    id: 'opensource',
    name: 'Open Source',
    description: 'Excellent open source projects and tool libraries.'
  }
];

export const previewContent = `
React is a JavaScript library for building user interfaces.

Key concepts:
• Component-Based: Build encapsulated components that manage their own state, then compose them to make complex UIs.
• Declarative: Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.
• Learn Once, Write Anywhere: You can develop new features in React without rewriting existing code.

Get started by exploring the documentation, tutorials, and tools available in our curated resource collection.
`;

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
    description: `React官方文档是学习React的最佳起点。

主要特点：
• 完整的API参考和最佳实践指南
• 互动式代码示例和教程
• 性能优化和调试技巧
• 服务端渲染和并发模式详解`,
    updatedAt: '2天前更新',
    rating: 4.9,
    reviews: 2100,
    tags: ['Official', 'Documentation', 'Free'],
    category: 'docs'
  },
  {
    id: '2',
    title: 'React Router 教程',
    url: 'https://reactrouter.com',
    description: `深入学习React Router的完整指南。

核心内容：
• 路由配置和动态路由
• 嵌套路由和路由保护
• 路由钩子和中间件
• 代码分割和懒加载策略`,
    updatedAt: '1周前更新',
    rating: 4.7,
    reviews: 1500,
    tags: ['Tutorial', 'Popular', 'Free'],
    category: 'tutorials'
  },
  {
    id: '3',
    title: 'React DevTools',
    url: 'https://chrome.google.com/webstore/detail/react-developer-tools',
    description: `React开发者必备的浏览器调试工具。

工具功能：
• 组件树检查和编辑
• Props和State实时监控
• 性能分析和优化建议
• Hook依赖追踪`,
    updatedAt: '3天前更新',
    rating: 4.8,
    reviews: 1800,
    tags: ['Tool', 'Development', 'Free'],
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
    tags: ['Tutorial', 'Performance', 'Free'],
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
    tags: ['Tool', 'UI', 'Development'],
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
    tags: ['Template', 'Starter', 'Free'],
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
    tags: ['Library', 'Animation', 'UI'],
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
    tags: ['Design', 'UI', 'System'],
    category: 'design'
  }
];