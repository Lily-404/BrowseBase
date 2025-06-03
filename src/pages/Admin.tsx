import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { resourceService } from '../services/resourceService';
import { categories, tags } from '../data/mockData';
import { Resource } from '../types/resource';
import { debounce } from 'lodash';
import { ThemeToggle } from '../components/ui/ThemeToggle';
// 给定分类ID获取分类名称

// 自定义下拉选择组件
const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  isRetroTheme 
}: { 
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string; }[];
  placeholder: string;
  isRetroTheme: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full lg:w-48 px-3 py-2 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50'} text-gray-800 flex items-center justify-between`}
      >
        <span className={`${isRetroTheme ? 'font-mono' : ''}`}>
          {options.find(opt => opt.id === value)?.name || placeholder}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className={`absolute z-50 w-full mt-1 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'bg-white border border-gray-100 rounded-lg shadow-lg'}`}
        >
          <div className="max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left ${isRetroTheme ? 'font-mono hover:bg-gray-200' : 'hover:bg-gray-50'} ${value === '' ? (isRetroTheme ? 'bg-[#2c2c2c] text-white' : 'bg-gray-100') : 'text-gray-700'}`}
            >
              {placeholder}
            </button>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left ${isRetroTheme ? 'font-mono hover:bg-gray-200' : 'hover:bg-gray-50'} ${value === option.id ? (isRetroTheme ? 'bg-[#2c2c2c] text-white' : 'bg-gray-100') : 'text-gray-700'}`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isRetroTheme, setIsRetroTheme] = useState(false);
  
  // 使用 useCallback 包装 fetchResources 函数
  const fetchResources = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, count } = await resourceService.fetchResources(currentPage, itemsPerPage, filters);
      setResources(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  // 创建防抖的搜索处理函数
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters(prev => ({ ...prev, search: value }));
      setCurrentPage(1); // 重置页码
    }, 300),
    []
  );

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
    setShowSuggestions(true);
    
    if (value.trim().length > 0) {
      resourceService.getSearchSuggestions(value).then(suggestions => {
        setSearchSuggestions(suggestions);
      });
    } else {
      setSearchSuggestions([]);
    }
  };

  // 只保留一个 useEffect
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

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

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, search: suggestion }));
    setShowSuggestions(false);
  };

  const handleNextPage = () => {
    if (resources.length < itemsPerPage) return;
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage === 1) return;
    setCurrentPage(prev => prev - 1);
  };

  return (
    <div className={`min-h-screen ${isRetroTheme ? 'bg-[#f0f0f0]' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl ${isRetroTheme ? 'font-mono' : 'font-light'} tracking-wide text-gray-800`}>
            BrowseBase
            <span className="text-gray-400 ml-2 text-sm font-normal">资源管理</span>
          </h1>
          <ThemeToggle isRetroTheme={isRetroTheme} onToggle={() => setIsRetroTheme(!isRetroTheme)} />
        </div>
        
        {/* 优化后的初始加载状态 */}
        {isInitialLoading && (
          <div className={`fixed inset-0 ${isRetroTheme ? 'bg-[#f0f0f0]/80' : 'bg-white/80'} backdrop-blur-sm flex items-center justify-center z-50`}>
            <div className={`${isRetroTheme ? 'bg-[#f0f0f0]/90' : 'bg-white/90'} p-8 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'rounded-2xl shadow-xl'} flex flex-col items-center space-y-4`}>
              <div className="relative">
                <div className={`w-16 h-16 ${isRetroTheme ? 'border-2' : 'border-4'} ${isRetroTheme ? 'border-[#2c2c2c]' : 'border-blue-100'} ${isRetroTheme ? '' : 'rounded-full'}`}></div>
                <div className={`absolute inset-0 w-16 h-16 ${isRetroTheme ? 'border-2' : 'border-4'} ${isRetroTheme ? 'border-[#2c2c2c]' : 'border-blue-500'} ${isRetroTheme ? '' : 'rounded-full'} border-t-transparent animate-spin`}></div>
              </div>
              <div className="flex flex-col items-center">
                <span className={`text-lg ${isRetroTheme ? 'font-mono' : 'font-medium'} text-gray-700`}>资源加载中</span>
                <span className="text-sm text-gray-500">请稍候...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* 优化后的操作加载状态 */}
        {!isInitialLoading && isLoading && (
          <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 ${isRetroTheme ? 'bg-[#f0f0f0]/90 border-2 border-[#2c2c2c]' : 'bg-white/90 backdrop-blur border border-gray-100'} px-6 py-3 ${isRetroTheme ? '' : 'rounded-full shadow-lg'} flex items-center space-x-3 z-50`}>
            <div className="relative">
              <div className={`w-5 h-5 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'border-2 border-gray-200 rounded-full'}`}></div>
              <div className={`absolute inset-0 w-5 h-5 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'border-2 border-blue-500 rounded-full'} border-t-transparent animate-spin`}></div>
            </div>
            <span className={`text-gray-700 text-sm ${isRetroTheme ? 'font-mono' : 'font-medium'}`}>处理中...</span>
          </div>
        )}
        
        {/* 优化消息提示 */}
        {message && (
          <div className={`fixed bottom-4 right-4 z-50 max-w-sm p-4 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'rounded-lg shadow-sm'} transform transition-all duration-300 flex items-center space-x-2 ${
            message.type === 'success' 
              ? isRetroTheme ? 'bg-[#f0f0f0] text-[#2c2c2c]' : 'bg-gray-50 text-gray-700 border border-gray-200'
              : isRetroTheme ? 'bg-[#f0f0f0] text-[#2c2c2c]' : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}>
            <span className={`flex-shrink-0 w-6 h-6 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'rounded-full'} flex items-center justify-center ${
              message.type === 'success' ? isRetroTheme ? 'bg-[#f0f0f0]' : 'bg-gray-100' : isRetroTheme ? 'bg-[#f0f0f0]' : 'bg-gray-100'
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
            <span className={`text-sm ${isRetroTheme ? 'font-mono' : ''}`}>{message.text}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 资源列表 - 在移动端后显示，PC端在左侧 */}
          <div className="lg:col-span-8 order-last lg:order-first">
            <div className={`${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'bg-white rounded-lg border border-gray-100'} p-6`}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <h2 className={`text-lg ${isRetroTheme ? 'font-mono' : 'font-light'} text-gray-800`}>资源列表</h2>
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                  <div className="relative w-full lg:w-64">
                    <input
                      type="text"
                      placeholder="搜索资源..."
                      defaultValue={filters.search}
                      onChange={handleSearchChange}
                      className={`w-full px-3 py-2 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50'} text-gray-800`}
                    />
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className={`absolute z-10 w-full mt-1 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'bg-white border border-gray-100 rounded-lg shadow-lg'} max-h-60 overflow-y-auto`}>
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none ${isRetroTheme ? 'font-mono' : ''}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <CustomSelect
                    value={filters.category}
                    onChange={(value) => setFilters({...filters, category: value})}
                    options={categories}
                    placeholder="所有分类"
                    isRetroTheme={isRetroTheme}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={isRetroTheme ? 'bg-[#f0f0f0]' : 'bg-gray-50'}>
                      <th className={`text-left p-4 ${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-600 text-sm ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'rounded-l-lg'}`}>标题</th>
                      <th className={`text-left p-4 ${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-600 text-sm ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : ''}`}>分类</th>
                      <th className={`text-left p-4 ${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-600 text-sm ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : ''}`}>标签</th>
                      <th className={`text-left p-4 ${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-600 text-sm ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'rounded-r-lg'}`}>操作</th>
                    </tr>
                  </thead>
                  <tbody className={isRetroTheme ? '' : 'divide-y divide-gray-100'}>
                    {resources.map(resource => (
                      <tr key={resource.id} className={`${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className={`p-4 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : ''}`}>
                          <div className={`${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-900`}>{resource.title}</div>
                          <div className={`text-sm text-gray-500 truncate hover:text-gray-700 max-w-[250px] ${isRetroTheme ? 'font-mono' : ''}`}>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              {resource.url}
                            </a>
                          </div>
                        </td>
                        <td className={`p-4 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : ''}`}>
                          {resource.category ? (
                            <span className={`px-3 py-1 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'bg-gray-100 rounded-full'} text-gray-700 text-sm ${isRetroTheme ? 'font-mono' : ''}`}>
                              {getCategoryName(resource.category)}
                            </span>
                          ) : (
                            <span className={`text-gray-400 text-sm ${isRetroTheme ? 'font-mono' : ''}`}>未分类</span>
                          )}
                        </td>
                        <td className={`p-4 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : ''}`}>
                          <div className="flex flex-wrap gap-1">
                            {resource.tags.map(tagId => {
                              const tag = tags.find(t => t.id === tagId);
                              return (
                                <span
                                  key={tagId}
                                  className={`px-2 py-1 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'bg-gray-100 rounded-full'} text-gray-700 text-xs ${isRetroTheme ? 'font-mono' : ''}`}
                                >
                                  {tag ? tag.name : tagId}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className={`p-4 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : ''}`}>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(resource)}
                              className={`text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1 ${isRetroTheme ? 'font-mono' : ''}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="text-sm">编辑</span>
                            </button>
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className={`text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1 ${isRetroTheme ? 'font-mono' : ''}`}
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
                <div className={`text-sm text-gray-500 ${isRetroTheme ? 'font-mono' : ''}`}>
                  显示 {resources.length} 条，共 {totalCount} 条
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'rounded-lg'} flex items-center space-x-1 transition-colors text-sm ${
                      currentPage === 1
                        ? isRetroTheme ? 'bg-[#f0f0f0] text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isRetroTheme ? 'bg-[#f0f0f0] text-gray-700 hover:bg-gray-200 border-2 border-[#2c2c2c]' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    } ${isRetroTheme ? 'font-mono' : ''}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>上一页</span>
                  </button>
                  <span className={`px-4 py-2 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'bg-white border border-gray-200 rounded-lg'} text-sm text-gray-700 ${isRetroTheme ? 'font-mono' : ''}`}>
                    第 {currentPage} 页
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={resources.length < itemsPerPage}
                    className={`px-4 py-2 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'rounded-lg'} flex items-center space-x-1 transition-colors text-sm ${
                      resources.length < itemsPerPage
                        ? isRetroTheme ? 'bg-[#f0f0f0] text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isRetroTheme ? 'bg-[#f0f0f0] text-gray-700 hover:bg-gray-200 border-2 border-[#2c2c2c]' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    } ${isRetroTheme ? 'font-mono' : ''}`}
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
            <div className={`${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'bg-white rounded-lg border border-gray-100'} p-6`}>
              <div className="flex justify-between items-center mb-6">
                 <h2 className={`text-lg ${isRetroTheme ? 'font-mono' : 'font-light'} text-gray-800`}>{editingResource ? '编辑资源' : '添加新资源'}</h2>
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
                     className={`text-gray-600 hover:text-gray-800 text-sm ${isRetroTheme ? 'font-mono' : 'font-normal'}`}
                   >
                     取消编辑
                   </button>
                 )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className={`block text-sm ${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-700 mb-1`}>
                    资源名称
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className={`w-full px-3 py-2 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50'} text-gray-800`}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="url" className={`block text-sm ${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-700 mb-1`}>
                    资源链接
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className={`w-full px-3 py-2 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50'} text-gray-800`}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className={`block text-sm ${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-700 mb-1`}>
                    资源描述
                  </label>
                  <textarea
                    id="description"
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    className={`w-full px-3 py-2 ${isRetroTheme ? 'border-2 border-[#2c2c2c] bg-[#f0f0f0]' : 'border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 bg-gray-50'} text-gray-800`}
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className={`block text-sm ${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-700 mb-1`}>
                    分类
                  </label>
                  <div className={`flex flex-wrap gap-1.5 p-2 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'border border-gray-200 rounded-lg'} min-h-[40px] ${isRetroTheme ? 'bg-[#f0f0f0]' : 'bg-gray-50'}`}>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setNewResource({...newResource, category: category.id})}
                        className={`px-2.5 py-1 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'rounded-full'} text-xs font-normal transition-all ${
                          newResource.category === category.id
                            ? isRetroTheme ? 'bg-[#2c2c2c] text-white' : 'bg-gray-800 text-white shadow-sm'
                            : isRetroTheme ? 'bg-[#f0f0f0] text-gray-700 hover:bg-gray-200 border-2 border-[#2c2c2c]' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        } ${isRetroTheme ? 'font-mono' : ''}`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm ${isRetroTheme ? 'font-mono' : 'font-normal'} text-gray-700 mb-1`}>
                    标签
                  </label>
                  <div className={`flex flex-wrap gap-1.5 p-1.5 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'border border-gray-200 rounded-lg'} min-h-[40px] ${isRetroTheme ? 'bg-[#f0f0f0]' : 'bg-gray-50'}`}>
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
                          className={`px-2 py-0.5 ${isRetroTheme ? 'border-2 border-[#2c2c2c]' : 'rounded-full'} text-xs font-normal transition-all ${
                            isSelected
                              ? isRetroTheme ? 'bg-[#2c2c2c] text-white' : 'bg-gray-800 text-white shadow-sm'
                              : isRetroTheme ? 'bg-[#f0f0f0] text-gray-700 hover:bg-gray-200 border-2 border-[#2c2c2c]' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          } ${isRetroTheme ? 'font-mono' : ''}`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="submit"
                  className={`w-full px-4 py-2 ${isRetroTheme ? 'bg-[#2c2c2c] border-2 border-[#2c2c2c]' : 'bg-gray-800 rounded-lg'} text-white hover:opacity-90 transition-colors ${isRetroTheme ? 'font-mono' : ''}`}
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