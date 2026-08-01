import { useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react';
import { toast } from 'sonner';
import { resourceService } from '../services/resourceService';
import { categories, tags } from '../data/mockData';
import { Resource } from '../types/resource';
import { debounce } from 'lodash';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/nothing.css';
import { loadNothingFonts } from '../utils/loadNothingFonts';

const getCategoryName = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : categoryId;
};

const CATEGORY_DOT: Record<string, string> = {
  ai: '#f09a2f',
  docs: '#16a6c7',
  tools: '#25a878',
  dev: '#5b9bf6',
  design: '#e85a5a',
  blog: '#a855f7',
  resources: '#999999',
};

const TAG_COLORS: Record<string, string> = {
  trending: '#f09a2f',
  newAdded: '#92b72d',
  socialMedia: '#ee6572',
  mac: '#3f78ff',
  communityChoice: '#9a5cff',
  openSource: '#25a878',
};

const categoryPillClass = (categoryId: string) => {
  const known = ['ai', 'docs', 'tools', 'dev', 'design', 'blog', 'resources'];
  return known.includes(categoryId) ? `ft-pill-${categoryId}` : 'ft-pill-default';
};

type ThemeMode = 'dark' | 'light';

const Admin = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allCount, setAllCount] = useState(0);
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
  const [pendingDelete, setPendingDelete] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tag: '',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    loadNothingFonts();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('adminNothingTheme', theme);
    } catch {
      // ignore
    }
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    return () => {
      root.classList.remove('dark');
    };
  }, [theme]);

  const fetchResources = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, count } = await resourceService.fetchResources(currentPage, itemsPerPage, filters);
      setResources(data);
      setTotalCount(count);
      if (!filters.category && !filters.search && !filters.tag) {
        setAllCount(count);
      }
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

  const applySearchQuery = (value: string) => {
    setSearchQuery(value);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applySearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setFilters(prev => ({ ...prev, search: '' }));
    setCurrentPage(1);
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
        toast.success('已更新资源');
        setEditingResource(null);
      } else {
        await resourceService.createResource(newResource as Omit<Resource, 'id'>);
        toast.success('已添加资源');
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
      toast.error('提交失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    try {
      setIsLoading(true);
      await resourceService.deleteResource(id);
      setPendingDelete(null);
      if (editingResource?.id === id) clearEdit();
      toast.success('已删除资源');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('删除失败，请重试');
    } finally {
      setIsLoading(false);
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
    setSearchQuery(suggestion);
    setFilters(prev => ({ ...prev, search: suggestion }));
    setCurrentPage(1);
    setShowSuggestions(false);
  };

  const searchEmpty = searchQuery.length > 2 && searchSuggestions.length === 0 && showSuggestions;

  const handleNextPage = () => {
    if (resources.length < itemsPerPage) return;
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage === 1) return;
    setCurrentPage(prev => prev - 1);
  };

  const setCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const filterChips = useMemo(
    () => [
      {
        key: '',
        label: '全部',
        count: filters.category === '' ? totalCount : allCount || totalCount,
        dot: undefined as string | undefined,
      },
      ...categories.map(c => ({
        key: c.id,
        label: c.name,
        count: filters.category === c.id ? totalCount : null,
        dot: CATEGORY_DOT[c.id],
      })),
    ],
    [filters.category, totalCount, allCount]
  );

  return (
    <div className={`nd ${theme === 'light' ? 'nd-light' : ''} nd-dot-grid`}>
      {pendingDelete && (
        <div
          className="rec-overlay"
          onClick={() => !isLoading && setPendingDelete(null)}
        >
          <div
            className="rec-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="rec-card-pad">
              <span id="delete-confirm-title" className="rec-card-title">
                确认删除这条资源？
              </span>
              <p className="rec-card-body">
                将永久删除{' '}
                <code className="rec-code">{pendingDelete.title}</code>
                {pendingDelete.category ? (
                  <>
                    {' '}
                    （分类{' '}
                    <code className="rec-code">
                      {getCategoryName(pendingDelete.category)}
                    </code>
                    ）
                  </>
                ) : null}
                。此操作不可撤销。
              </p>
            </div>

            <div className="rec-card-footer">
              <span className="rec-meter-wrap">
                <span className="rec-meter" aria-hidden>
                  {[0, 1, 2].map(bar => (
                    <span
                      key={bar}
                      className="rec-meter-bar"
                      style={{
                        background: bar < 3 ? 'var(--nd-accent)' : 'var(--nd-border-visible)',
                      }}
                    />
                  ))}
                </span>
                <span className="rec-meter-label">高风险操作</span>
              </span>

              <span className="rec-actions">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setPendingDelete(null)}
                  className="rec-btn rec-btn-secondary"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={confirmDelete}
                  className="rec-btn rec-btn-danger"
                >
                  {isLoading ? '删除中…' : '确认删除'}
                </button>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 md:py-8">
        <header className="flex items-center justify-between gap-4 mb-3">
          <div className="min-w-0">
            <h1 className="nd-heading">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity duration-150"
              >
                BrowseBase
              </a>
              <span className="nd-label ml-2 align-middle !normal-case tracking-[0.04em]">
                资源管理
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {isLoading && (
              <p className="nd-status text-[var(--nd-text-secondary)]">[加载中...]</p>
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
          {/* Resource list — Filter Table */}
          <div className="lg:col-span-8 order-last lg:order-first">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="nd-display" aria-label="资源总数">
                  {isInitialLoading ? '—' : String(totalCount).padStart(2, '0')}
                </span>
                <span className="nd-label">条</span>
              </div>
              <div className="cmd-search">
                <div className="cmd-search-shell">
                  <div className="cmd-search-row">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--nd-text-disabled)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="shrink-0"
                      aria-hidden
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.3-4.3" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="搜索资源…"
                      aria-label="搜索资源"
                      className="cmd-search-input"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        aria-label="清除搜索"
                        onClick={clearSearch}
                        className="cmd-search-clear"
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          aria-hidden
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {showSuggestions && (searchEmpty || searchSuggestions.length > 0) && (
                  <div className="cmd-search-panel">
                    {searchEmpty ? (
                      <div className="cmd-search-empty">
                        <span className="cmd-search-empty-icon" aria-hidden>
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          >
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4.3-4.3" />
                          </svg>
                        </span>
                        <span className="cmd-search-empty-title">未找到结果</span>
                        <span className="cmd-search-empty-desc">调整关键词再试一次</span>
                      </div>
                    ) : (
                      <div className="cmd-search-results">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion}-${index}`}
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="cmd-search-item"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* filter chips */}
            <div
              className="-mx-1 mb-2 flex items-center gap-1 overflow-x-auto px-1 py-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {filterChips.map(f => {
                const active = filters.category === f.key;
                return (
                  <button
                    key={f.key || 'all'}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategoryFilter(f.key)}
                    className={`ft-chip ${active ? 'ft-chip-active' : ''}`}
                  >
                    {f.dot && (
                      <span className="ft-chip-dot" style={{ background: f.dot }} />
                    )}
                    {f.label}
                    {f.count !== null && (
                      <span className="ft-chip-count">{f.count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* table card */}
            <div
              aria-label="资源列表"
              className="ft-card min-h-[280px]"
              role="region"
              tabIndex={0}
            >
              <div className="min-w-[520px]">
                <div className="ft-head">
                  <span>标题</span>
                  <span className="ft-col-center">分类</span>
                  <span className="ft-col-center">标签</span>
                  <span className="ft-col-center">操作</span>
                </div>

                {isInitialLoading ? (
                  <div className="py-16 text-center">
                    <span className="nd-status text-[var(--nd-text-disabled)]">[加载中...]</span>
                  </div>
                ) : resources.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-[var(--nd-text-secondary)] text-sm mb-1">暂无资源</p>
                    <p className="nd-caption text-[var(--nd-text-disabled)]">
                      添加一条资源开始管理
                    </p>
                  </div>
                ) : (
                  resources.map(resource => (
                    <div
                      key={resource.id}
                      className={`ft-row ${
                        editingResource?.id === resource.id ? 'ft-row-editing' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-[var(--nd-text-display)]">
                          {resource.title}
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="nd-caption truncate block mt-0.5 hover:text-[var(--nd-interactive)] transition-colors"
                          style={{ color: 'var(--nd-text-disabled)' }}
                        >
                          {resource.url}
                        </a>
                      </div>
                      <div className="ft-col-center">
                        {resource.category ? (
                          <span className={`ft-pill ${categoryPillClass(resource.category)}`}>
                            {getCategoryName(resource.category)}
                          </span>
                        ) : (
                          <span className="text-[var(--nd-text-disabled)]">—</span>
                        )}
                      </div>
                      <div className="ft-col-center ft-tags min-w-0">
                        {resource.tags.length === 0 ? (
                          <span className="text-[var(--nd-text-disabled)]">—</span>
                        ) : (
                          resource.tags.slice(0, 2).map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            return (
                              <span key={tagId} className="ft-pill ft-pill-default">
                                {tag ? tag.name : tagId}
                              </span>
                            );
                          })
                        )}
                        {resource.tags.length > 2 && (
                          <span className="text-[10.5px] text-[var(--nd-text-disabled)] tabular-nums">
                            +{resource.tags.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="ft-col-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(resource)}
                          className="nd-btn nd-btn-ghost !px-2 !py-1 !min-h-0 text-[11px]"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(resource)}
                          className="nd-btn nd-btn-ghost !px-2 !py-1 !min-h-0 text-[11px] !text-[var(--nd-accent)]"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="nd-caption">
                显示 {resources.length} 条，共 {totalCount} 条 · 第 {currentPage} / {totalPages} 页
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="rec-btn rec-btn-secondary inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
                  上一页
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={resources.length < itemsPerPage}
                  className="rec-btn rec-btn-secondary inline-flex items-center gap-1"
                >
                  下一页
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>

          {/* Form panel — Records style */}
          <div className="lg:col-span-4 order-first lg:order-last">
            <div className="records-form">
              <div className="records-form-head">
                <div className="records-form-head-main">
                  <span className="records-mark" aria-hidden>
                    {(newResource.title || (editingResource ? 'E' : 'N')).slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="records-form-title">
                      {editingResource ? '编辑资源' : '添加新资源'}
                    </div>
                    <div className="records-form-sub">
                      {editingResource ? '修改现有记录' : '新建一条记录'}
                    </div>
                  </div>
                </div>
                {editingResource && (
                  <button type="button" onClick={clearEdit} className="records-form-cancel">
                    取消
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="records-form-body">
                <div className="records-field">
                  <label htmlFor="name" className="records-field-label">
                    名称
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newResource.title}
                    onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                    className="records-field-input"
                    placeholder="资源名称"
                    required
                  />
                </div>

                <div className="records-field">
                  <label htmlFor="url" className="records-field-label">
                    链接
                  </label>
                  <div className="min-w-0">
                    <input
                      type="url"
                      id="url"
                      value={newResource.url}
                      onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                      className="records-field-input"
                      placeholder="https://"
                      required
                    />
                    {newResource.url ? (
                      <a
                        href={newResource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="records-link-preview"
                      >
                        <span>{newResource.url.replace(/^https?:\/\//, '')}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M14 5h5v5M19 5l-8 8" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="records-field">
                  <label htmlFor="description" className="records-field-label">
                    描述
                  </label>
                  <textarea
                    id="description"
                    value={newResource.description}
                    onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                    className="records-field-input records-field-textarea"
                    placeholder="简短描述"
                    rows={3}
                    required
                  />
                </div>

                <div className="records-field">
                  <span className="records-field-label">分类</span>
                  <div className="records-tags">
                    {categories.map(category => {
                      const active = newResource.category === category.id;
                      const color = CATEGORY_DOT[category.id] || '#7f858d';
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setNewResource({ ...newResource, category: category.id })}
                          className={`records-tag ${active ? '' : 'records-tag-idle'}`}
                          style={{ '--tag-color': color } as React.CSSProperties}
                        >
                          <span className="records-tag-dot" style={{ background: color }} />
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="records-field">
                  <span className="records-field-label">标签</span>
                  <div className="records-tags">
                    {tags.map(tag => {
                      const isSelected = newResource.tags?.includes(tag.id) || false;
                      const color = TAG_COLORS[tag.id] || '#7f858d';
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
                          className={`records-tag ${isSelected ? '' : 'records-tag-idle'}`}
                          style={{ '--tag-color': color } as React.CSSProperties}
                        >
                          <span className="records-tag-dot" style={{ background: color }} />
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="records-form-foot">
                  <span className="records-form-meta">
                    {newResource.tags?.length || 0} 标签 · {newResource.category ? 1 : 0} 分类
                  </span>
                  <button type="submit" className="records-form-submit" disabled={isLoading}>
                    {isLoading
                      ? '处理中...'
                      : editingResource
                        ? '更新记录'
                        : '添加记录'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
