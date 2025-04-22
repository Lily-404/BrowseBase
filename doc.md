# 资源网站开发文档

## 项目概述

一个基于React + TypeScript + Vite的资源网站项目，采用了现代化的UI设计和交互体验。项目使用Tailwind CSS进行样式管理，具有响应式布局和优雅的动画效果。

## 技术栈

- React 18.3.1
- TypeScript
- Vite 5.4.2
- Tailwind CSS 3.4.1
- ESLint
- PostCSS

## 项目结构

```
src/
  ├── components/          # 组件目录
  │   ├── DescriptionBox.tsx
  │   ├── Footer.tsx
  │   ├── Header.tsx
  │   ├── ResourceCategories.tsx
  │   ├── ResourcePreview.tsx
  │   └── ResourceTags.tsx
  ├── data/               # 数据目录
  │   └── mockData.ts
  ├── types/              # 类型定义
  │   └── index.ts
  ├── App.tsx            # 主应用组件
  ├── index.css          # 全局样式
  └── main.tsx           # 入口文件
```

## 核心功能

1. 资源分类展示

   - 支持多种资源类型（文档、教程、工具等）
   - 分类状态管理
   - 禁用状态支持
2. 标签系统

   - 多选标签
   - 标签描述展示
   - 动态状态切换
3. 资源预览

   - 响应式布局
   - 内容预览展示

## 数据结构设计

### 当前数据模型

```typescript
// 分类
interface Category {
  id: string;
  name: string;
  disabled?: boolean;
  icon?: string;
}

// 标签
interface Tag {
  id: string;
  name: string;
  description: string;
}
```


```typescript
// 分页参数
interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```



### 待实现的数据库设计

```sql
-- 资源表
CREATE TABLE resources (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(512),
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    disabled BOOLEAN DEFAULT FALSE
);

-- 标签表
CREATE TABLE tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 资源-标签关联表
CREATE TABLE resource_tags (
    resource_id VARCHAR(36),
    tag_id VARCHAR(36),
    PRIMARY KEY (resource_id, tag_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 资源-分类关联表
CREATE TABLE resource_categories (
    resource_id VARCHAR(36),
    category_id VARCHAR(36),
    PRIMARY KEY (resource_id, category_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## 待实现功能

### 后端API设计

1. 资源管理API

```typescript
interface ResourceAPI {
  getResources(): Promise<Resource[]>;
  getResourceById(id: string): Promise<Resource>;
  createResource(resource: ResourceInput): Promise<Resource>;
  updateResource(id: string, resource: ResourceInput): Promise<Resource>;
  deleteResource(id: string): Promise<void>;
}
```

2. 分类管理API

```typescript
interface CategoryAPI {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category>;
  createCategory(category: CategoryInput): Promise<Category>;
  updateCategory(id: string, category: CategoryInput): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}
```

3. 标签管理API

```typescript
interface TagAPI {
  getTags(): Promise<Tag[]>;
  getTagById(id: string): Promise<Tag>;
  createTag(tag: TagInput): Promise<Tag>;
  updateTag(id: string, tag: TagInput): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
}
```

```typescript
// 分页Hook
interface UsePagination {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const usePagination = (
  initialPage = 1,
  initialPageSize = 12
): UsePagination => {
  // 实现分页逻辑
};

// 资源列表组件中使用
const ResourceList: React.FC = () => {
  const pagination = usePagination();
  const [resources, setResources] = useState<Resource[]>([]);
  
  useEffect(() => {
    // 获取分页数据
    const fetchResources = async () => {
      const response = await api.getResources({
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      });
      setResources(response.data);
    };
  
    fetchResources();
  }, [pagination.currentPage, pagination.pageSize]);
  
  return (
    <>
      <ResourceGrid resources={resources} />
      <Footer 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onNextPage={pagination.onNextPage}
        onPrevPage={pagination.onPrevPage}
      />
    </>
  );
};
```

## 开发进度

### 已完成功能

- [X]  项目基础架构搭建
- [X]  UI组件开发
- [X]  前端路由配置
- [X]  模拟数据集成
- [X]  响应式布局适配
- [X]  交互动画效果

### 进行中功能

- [ ]  后端API开发 (0%)
- [ ]  数据库设计与实现 (30%)
- [ ]  用户认证系统 (0%)
- [ ]  资源管理后台 (0%)
- [ ]  搜索功能 (0%)
- [ ]  资源评分系统 (0%)

### 计划功能

1. 用户系统

   - 用户注册/登录
   - 权限管理
   - 个人收藏
2. 资源管理

   - 资源上传
   - 资源审核
   - 资源评分
3. 高级功能

   - 全文搜索
   - 资源推荐
   - 数据统计

## 开发指南

### 环境配置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 代码规范

- 使用ESLint进行代码检查
- 遵循TypeScript严格模式
- 组件采用函数式编程
- 使用Tailwind CSS进行样式管理

## 注意事项

1. 开发新功能时需要在types目录下添加相应的类型定义
2. 所有API调用都需要做好错误处理
3. 组件状态管理遵循React最佳实践
4. 注意保持代码的可维护性和可扩展性
