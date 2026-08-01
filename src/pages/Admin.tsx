import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { resourceService } from '../services/resourceService';
import { categories, tags } from '../data/mockData';
import { Resource } from '../types/resource';
import { debounce } from 'lodash';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/nothing-admin.css';

const getCategoryName = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : categoryId;
};

type ThemeMode = 'dark' | 'light';

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(opt => opt.id === value)?.name || placeholder;

  return (
    <div className="relative w-full lg:w-52">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="nd-select-trigger"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selected}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div className="nd-dropdown absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={value === '' ? 'nd-selected' : ''}
          >
            {placeholder}
          </button>
          {options.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={value === option.id ? 'nd-selected' : ''}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const itemsPerPage = 13;
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    title: '',
    url: '',
    description: '',
    category: '',
    tags: [],
    rating: 0,
    reviews: 0,
  });
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tag: '',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const v = localStorage.getItem('adminNothingTheme');
      if (v === 'light' || v === 'dark') return v;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('adminNothingTheme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

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

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters(prev => ({ ...prev, search: value }));
      setCurrentPage(1);
    }, 300),
    []
  );

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

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingResource) {
        await resourceService.updateResource(editingResource.id, newResource);
        setMessage({ type: 'success', text: '更新成功' });
        setEditingResource(null);
      } else {
        await resourceService.createResource(newResource as Omit<Resource, 'id'>);
        setMessage({ type: 'success', text: '添加成功' });
      }

      setNewResource({
        title: '',
        url: '',
        description: '',
        category: '',
        tags: [],
        rating: 0,
        reviews: 0,
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
      setMessage({ type: 'success', text: '删除成功' });
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
      reviews: resource.reviews,
    });
  }

  function clearEdit() {
    setEditingResource(null);
    setNewResource({
      title: '',
      url: '',
      description: '',
      category: '',
      tags: [],
      rating: 0,
      reviews: 0,
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

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <div className={`nd-admin ${theme === 'light' ? 'nd-light' : ''} nd-dot-grid`}>
      <div className="max-w-7xl mx-auto px-6 py-6 md:py-8">
        {/* Header + metric — compact top bar */}
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="min-w-0">
            <p className="nd-label mb-0.5">BrowseBase</p>
            <h1 className="nd-heading">资源管理</h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {(isLoading || message) && (
              <p
                className={`nd-status ${
                  message?.type === 'error'
                    ? 'nd-status-err'
                    : message?.type === 'success'
                      ? 'nd-status-ok'
                      : 'text-[var(--nd-text-secondary)]'
                }`}
              >
                {isLoading && !message
                  ? '[加载中...]'
                  : message
                    ? `[${message.text}]`
                    : null}
              </p>
            )}
            <div className="nd-mode-toggle" role="group" aria-label="主题">
              <button
                type="button"
                className={theme === 'dark' ? 'nd-active' : ''}
                onClick={() => setTheme('dark')}
              >
                深色
              </button>
              <button
                type="button"
                className={theme === 'light' ? 'nd-active' : ''}
                onClick={() => setTheme('light')}
              >
                浅色
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Resource list */}
          <div className="lg:col-span-8 order-last lg:order-first">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div className="flex items-baseline gap-2">
                <span className="nd-display" aria-label="资源总数">
                  {isInitialLoading ? '—' : String(totalCount).padStart(2, '0')}
                </span>
                <span className="nd-label">条</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    placeholder="搜索资源..."
                    defaultValue={filters.search}
                    onChange={handleSearchChange}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="nd-input"
                  />
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="nd-dropdown absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <CustomSelect
                  value={filters.category}
                  onChange={value => {
                    setFilters({ ...filters, category: value });
                    setCurrentPage(1);
                  }}
                  options={categories}
                  placeholder="所有分类"
                />
              </div>
            </div>

            <div className="overflow-x-auto min-h-[280px]">
              <table className="nd-table">
                <thead>
                  <tr>
                    <th>标题</th>
                    <th>分类</th>
                    <th>标签</th>
                    <th className="w-[1%] whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {isInitialLoading ? (
                    <tr>
                      <td colSpan={4} className="!py-20 text-center">
                        <span className="nd-status text-[var(--nd-text-disabled)]">
                          [加载中...]
                        </span>
                      </td>
                    </tr>
                  ) : resources.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="!py-20 text-center">
                        <p className="text-[var(--nd-text-secondary)] text-sm mb-1">暂无资源</p>
                        <p className="nd-caption text-[var(--nd-text-disabled)]">
                          添加一条资源开始管理
                        </p>
                      </td>
                    </tr>
                  ) : (
                    resources.map(resource => (
                      <tr
                        key={resource.id}
                        className={editingResource?.id === resource.id ? 'nd-editing' : ''}
                      >
                        <td>
                          <div className="font-light text-[var(--nd-text-display)] text-[15px]">
                            {resource.title}
                          </div>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nd-caption truncate block max-w-[240px] mt-1 hover:text-[var(--nd-interactive)] transition-colors"
                            style={{ color: 'var(--nd-text-disabled)' }}
                          >
                            {resource.url}
                          </a>
                        </td>
                        <td>
                          {resource.category ? (
                            <span className="nd-chip pointer-events-none">
                              {getCategoryName(resource.category)}
                            </span>
                          ) : (
                            <span className="nd-caption text-[var(--nd-text-disabled)]">—</span>
                          )}
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1.5">
                            {resource.tags.length === 0 ? (
                              <span className="nd-caption text-[var(--nd-text-disabled)]">—</span>
                            ) : (
                              resource.tags.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return (
                                  <span key={tagId} className="nd-chip pointer-events-none">
                                    {tag ? tag.name : tagId}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(resource)}
                              className="nd-btn nd-btn-ghost"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(resource.id)}
                              className="nd-btn nd-btn-ghost !text-[var(--nd-accent)] hover:!opacity-80"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <p className="nd-caption">
                显示 {resources.length} 条，共 {totalCount} 条 · 第 {currentPage} / {totalPages} 页
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="nd-btn nd-btn-secondary !min-h-10 !px-4 !py-2 inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  上一页
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={resources.length < itemsPerPage}
                  className="nd-btn nd-btn-secondary !min-h-10 !px-4 !py-2 inline-flex items-center gap-1"
                >
                  下一页
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="lg:col-span-4 order-first lg:order-last">
            <div className="nd-surface p-6 sticky top-6">
              <div className="flex items-start justify-between gap-3 mb-8">
                <div>
                  <p className="nd-label mb-1">
                    {editingResource ? '修改' : '新建'}
                  </p>
                  <h2 className="text-[18px] font-light tracking-tight text-[var(--nd-text-display)]">
                    {editingResource ? '编辑资源' : '添加新资源'}
                  </h2>
                </div>
                {editingResource && (
                  <button type="button" onClick={clearEdit} className="nd-btn nd-btn-ghost !px-0">
                    [ 取消 ]
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="nd-label block mb-2">
                    资源名称
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newResource.title}
                    onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                    className="nd-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="url" className="nd-label block mb-2">
                    资源链接
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={newResource.url}
                    onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                    className="nd-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="nd-label block mb-2">
                    资源描述
                  </label>
                  <textarea
                    id="description"
                    value={newResource.description}
                    onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                    className="nd-textarea"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="nd-label block mb-3">分类</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setNewResource({ ...newResource, category: category.id })}
                        className={`nd-chip ${
                          newResource.category === category.id ? 'nd-chip-filled' : ''
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="nd-label block mb-3">标签</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => {
                      const isSelected = newResource.tags?.includes(tag.id) || false;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            const currentTags = newResource.tags || [];
                            const newTags = isSelected
                              ? currentTags.filter(id => id !== tag.id)
                              : [...currentTags, tag.id];
                            setNewResource({ ...newResource, tags: newTags });
                          }}
                          className={`nd-chip ${isSelected ? 'nd-chip-active' : ''}`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button type="submit" className="nd-btn nd-btn-primary w-full" disabled={isLoading}>
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
