import { Category, Tag } from '../types';

export const categories: Category[] = [
  { id: 'docs', name: 'Documentation' },
  { id: 'tutorials', name: 'Tutorials' },
  { id: 'tools', name: 'Tools' },
  { id: 'templates', name: 'Templates' },
  { id: 'code', name: 'Code' },
  { id: 'design', name: 'Design' },
  { id: 'upcoming', name: 'Coming Soon', disabled: true },
];

export const tags: Tag[] = [
  { 
    id: 'free', 
    name: 'Free', 
    description: 'Resources that are completely free to use in both personal and commercial projects.'
  },
  { 
    id: 'premium', 
    name: 'Premium', 
    description: 'High-quality resources that require a license or subscription.'
  },
  { 
    id: 'latest', 
    name: 'Latest', 
    description: 'Recently added resources featuring the newest React techniques and patterns.'
  },
  { 
    id: 'recommended', 
    name: 'Recommended', 
    description: 'Highly rated resources recommended by the React community.'
  },
];

export const previewContent = `
React is a JavaScript library for building user interfaces.

Key concepts:
• Component-Based: Build encapsulated components that manage their own state, then compose them to make complex UIs.
• Declarative: Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.
• Learn Once, Write Anywhere: You can develop new features in React without rewriting existing code.

Get started by exploring the documentation, tutorials, and tools available in our curated resource collection.
`;