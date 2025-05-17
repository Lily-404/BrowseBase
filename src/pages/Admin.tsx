import { useState, useEffect } from 'react';
import React from 'react';
import { resourceService } from '../services/resourceService';
import { categories, tags } from '../data/mockData';
import { Resource } from '../types/resource';
// 给定分类ID获取分类名称

const Admin = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 添加初始加载状态
  const itemsPerPage = 13;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchResources() {
    try {
      setIsLoading(true);
      const { data, count } = await resourceService.fetchResources(currentPage, itemsPerPage, filters);
      setResources(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false); // 初始加载完成
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
        {/* 优化后的初始加载状态 */}
        {isInitialLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/90 p-8 rounded-2xl shadow-xl flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-medium text-gray-700">资源加载中</span>
                <span className="text-sm text-gray-500">请稍候...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* 优化后的操作加载状态 */}
        {!isInitialLoading && isLoading && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg flex items-center space-x-3 z-50 border border-gray-100">
            <div className="relative">
              <div className="w-5 h-5 border-2 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 w-5 h-5 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <span className="text-gray-700 text-sm font-medium">处理中...</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-light tracking-wide text-gray-800">
            BrowseBase
            <span className="text-gray-400 ml-2 text-sm font-normal">资源管理</span>
          </h1>
        </div>
        
        {/* 优化消息提示 */}
        {message && (
          <div className={`fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-sm transform transition-all duration-300 flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-gray-50 text-gray-700 border border-gray-200' 
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}>
            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              message.type === 'success' ? 'bg-gray-100' : 'bg-gray-100'
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
            <span className="text-sm">{message.text}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 资源列表 - 在移动端后显示，PC端在左侧 */}
          <div className="lg:col-span-8 order-last lg:order-first">
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <h2 className="text-lg font-light text-gray-800">资源列表</h2>
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                  <input
                    type="text"
                    placeholder="搜索资源..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full lg:w-64 px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50 text-gray-800"
                  />
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full lg:w-48 px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50 text-gray-800"
                  >
                    <option value="">所有分类</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-normal text-gray-600 text-sm rounded-l-lg">标题</th>
                      <th className="text-left p-4 font-normal text-gray-600 text-sm">分类</th>
                      <th className="text-left p-4 font-normal text-gray-600 text-sm">标签</th>
                      <th className="text-left p-4 font-normal text-gray-600 text-sm rounded-r-lg">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resources.map(resource => (
                      <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-normal text-gray-900">{resource.title}</div>
                          <div className="text-sm text-gray-500 truncate hover:text-gray-700 max-w-[250px]">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              {resource.url}
                            </a>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
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
                              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="text-sm">编辑</span>
                            </button>
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="text-sm">删除</span>
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
                <div className="text-sm text-gray-500">
                  显示 {resources.length} 条，共 {totalCount} 条
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors text-sm ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>上一页</span>
                  </button>
                  <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                    第 {currentPage} 页
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={resources.length < itemsPerPage}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors text-sm ${
                      resources.length < itemsPerPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span>下一页</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 添加新资源 - 在移动端优先显示，PC端在右侧 */}
          <div className="lg:col-span-4 order-first lg:order-last">
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-light text-gray-800">{editingResource ? '编辑资源' : '添加新资源'}</h2>
                 {editingResource && (
                   <button
                     type="button"
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
                     className="text-gray-600 hover:text-gray-800 text-sm font-normal"
                   >
                     取消编辑
                   </button>
                 )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-normal text-gray-700 mb-1">
                    资源名称
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="url" className="block text-sm font-normal text-gray-700 mb-1">
                    资源链接
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-normal text-gray-700 mb-1">
                    资源描述
                  </label>
                  <textarea
                    id="description"
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50 text-gray-800"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-normal text-gray-700 mb-1">
                    分类
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-lg min-h-[40px] bg-gray-50">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setNewResource({...newResource, category: category.id})}
                        className={`px-2.5 py-1 rounded-full text-xs font-normal transition-all ${
                          newResource.category === category.id
                            ? 'bg-gray-800 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1">
                    标签
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-1.5 border border-gray-200 rounded-lg min-h-[40px] bg-gray-50">
                    {tags.map((tag) => {
                      const isSelected = newResource.tags?.includes(tag.id) || false;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            const currentTags = newResource.tags || [];
                            const newTags = isSelected
                              ? currentTags.filter((id) => id !== tag.id)
                              : [...currentTags, tag.id];
                            setNewResource({ ...newResource, tags: newTags });
                          }}
                          className={`px-2 py-0.5 rounded-full text-xs font-normal transition-all ${
                            isSelected
                              ? 'bg-gray-800 text-white shadow-sm' // Selected style
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200' // Default style
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {editingResource ? '更新资源' : '添加资源'}
                </button>
              </form>
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