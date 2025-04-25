import { useState, useEffect } from 'react';
import { resourceService, Resource } from '../services/resourceService';
import { categories } from '../data/mockData';

// 定义标签数据
const tags = [
  { id: 'trending', name: '热门' },
  { id: 'newAdded', name: '最新' },
  { id: 'beginnerFriendly', name: '油管博主' },
  { id: 'enterprise', name: 'Mac软件' },
  { id: 'communityChoice', name: '社区' },
];

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
}

const Admin = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 15;
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    title: '',
    url: '',
    description: '',
    category: '',
    tags: [],
    rating: 0,
    reviews: 0
  });
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tag: ''
  });
  
  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      const { data, count } = await resourceService.fetchResources(currentPage, itemsPerPage, filters);
      setResources(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }

  // 添加过滤器变化监听
  useEffect(() => {
    setCurrentPage(1); // 重置页码
    fetchResources();
  }, [filters]); // 当过滤条件改变时重新获取数据

  useEffect(() => {
    fetchResources();
  }, [currentPage]); // 当页码改变时重新获取数据

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingResource) {
        await resourceService.updateResource(editingResource.id, newResource);
        setMessage({ type: 'success', text: '资源更新成功！' });
        setEditingResource(null);
      } else {
        await resourceService.createResource(newResource as Omit<Resource, 'id'>);
        setMessage({ type: 'success', text: '资源添加成功！' });
      }
      
      setNewResource({
        title: '',
        url: '',
        description: '',
        category: '',
        tags: [],
        rating: 0,
        reviews: 0
      });
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      setMessage({ type: 'error', text: '操作失败，请重试' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleDelete(id: string) {
    try {
      setIsLoading(true);
      await resourceService.deleteResource(id);
      setMessage({ type: 'success', text: '资源删除成功！' });
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      setMessage({ type: 'error', text: '删除失败，请重试' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  function handleEdit(resource: Resource) {
    setEditingResource(resource);
    setNewResource({
      title: resource.title,
      url: resource.url,
      description: resource.description,
      category: resource.category,
      tags: resource.tags,
      rating: resource.rating,
      reviews: resource.reviews
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            BrowseBase 资源管理
          </h1>
        </div>
        
        {/* 优化消息提示 */}
        {message && (
          <div className={`fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <span>{message.text}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧资源列表 */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col space-y-4 mb-6">
                  <h2 className="text-xl font-semibold flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>资源列表</span>
                  </h2>
                  
                  {/* 过滤器 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="搜索标题或描述..."
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value})}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <select
                        value={filters.category}
                        onChange={e => setFilters({...filters, category: e.target.value})}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">所有分类</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={filters.tag}
                        onChange={e => setFilters({...filters, tag: e.target.value})}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">所有标签</option>
                        {tags.map(tag => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-600 rounded-l-lg">标题</th>
                        <th className="text-left p-4 font-medium text-gray-600">分类</th>
                        <th className="text-left p-4 font-medium text-gray-600">标签</th>
                        <th className="text-left p-4 font-medium text-gray-600 rounded-r-lg">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {resources.map(resource => (
                        <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{resource.title}</div>
                            <div className="text-sm text-gray-500 truncate hover:text-blue-500">
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                {resource.url}
                              </a>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              {getCategoryName(resource.category)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {resource.tags.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return (
                                  <span
                                    key={tagId}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                  >
                                    {tag ? tag.name : tagId}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleEdit(resource)}
                                className="text-blue-500 hover:text-blue-700 transition-colors flex items-center space-x-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>编辑</span>
                              </button>
                              <button
                                onClick={() => handleDelete(resource.id)}
                                className="text-red-500 hover:text-red-700 transition-colors flex items-center space-x-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>删除</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* 分页控制 */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示 {resources.length} 条，共 {totalCount} 条
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>上一页</span>
                    </button>
                    <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                      第 {currentPage} 页
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={resources.length < itemsPerPage}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors ${
                        resources.length < itemsPerPage
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span>下一页</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧添加资源表单 */}
          <div className="lg:col-span-4">
            <div className="fixed top-23 right-6 w-[calc(33.333%-2rem)] max-w-md">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{editingResource ? '编辑资源' : '添加新资源'}</span>
                  </h2>
                  {editingResource && (
                    <button
                      onClick={() => {
                        setEditingResource(null);
                        setNewResource({
                          title: '',
                          url: '',
                          description: '',
                          category: '',
                          tags: [],
                          rating: 0,
                          reviews: 0
                        });
                      }}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      取消编辑
                    </button>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 标题和URL放在一行 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                      <input
                        type="text"
                        value={newResource.title}
                        onChange={e => setNewResource({...newResource, title: e.target.value})}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                      <input
                        type="url"
                        value={newResource.url}
                        onChange={e => setNewResource({...newResource, url: e.target.value})}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea
                      value={newResource.description}
                      onChange={e => setNewResource({...newResource, description: e.target.value})}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-lg min-h-[40px] bg-gray-50">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setNewResource({...newResource, category: category.id})}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            newResource.category === category.id
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-lg min-h-[40px] bg-gray-50">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            const isSelected = newResource.tags?.includes(tag.id);
                            const updatedTags = isSelected
                              ? (newResource.tags || []).filter(t => t !== tag.id)
                              : [...(newResource.tags || []), tag.id];
                            setNewResource({...newResource, tags: updatedTags});
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            newResource.tags?.includes(tag.id)
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm
                      hover:bg-blue-600 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} 
                      flex items-center justify-center space-x-2`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>处理中...</span>
                      </>
                    ) : (
                      <>
                        <span>{editingResource ? '更新资源' : '添加资源'}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;


// 辅助函数：根据ID获取分类名称
const getCategoryName = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : categoryId;
};