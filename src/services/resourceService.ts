import { supabase } from '../lib/supabase';
import { Resource, ResourceFilters } from '../types/resource';

// 缓存搜索结果
const searchCache = new Map<string, {
  data: Resource[];
  count: number;
  timestamp: number;
}>();

// 缓存过期时间（5分钟）
const CACHE_EXPIRY = 5 * 60 * 1000;

export const resourceService = {
  async fetchResources(page: number, itemsPerPage: number, filters?: ResourceFilters) {
    try {
      // 生成缓存键
      const cacheKey = JSON.stringify({ page, itemsPerPage, filters });
      const cachedResult = searchCache.get(cacheKey);
      
      // 检查缓存是否有效
      if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_EXPIRY) {
        return {
          data: cachedResult.data,
          count: cachedResult.count,
          currentPage: page,
          totalPages: Math.ceil(cachedResult.count / itemsPerPage)
        };
      }

      // 构建基础查询
      let query = supabase
        .from('resources')
        .select('*', { count: 'exact' });

      // 应用过滤条件
      if (filters?.search) {
        // 使用更高效的搜索方式
        const searchTerm = filters.search.toLowerCase().trim();
        if (searchTerm.length > 0) {
          // 使用全文搜索优化
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .order('updated_at', { ascending: false })
            .limit(itemsPerPage);
        }
      } else {
        // 如果没有搜索词，使用分页
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query
          .range(from, to)
          .order('updated_at', { ascending: false });
      }

      // 应用其他过滤条件
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.tag) {
        query = query.contains('tags', [filters.tag]);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        // 如果是范围不满足的错误，返回空数组
        if (error.code === 'PGRST103') {
          console.log('No more resources available');
          return {
            data: [],
            count: 0,
            currentPage: page,
            totalPages: 0
          };
        }
        throw error;
      }

      // 缓存结果
      const result = {
        data: data || [],
        count: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / itemsPerPage)
      };

      searchCache.set(cacheKey, {
        data: result.data,
        count: result.count,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error fetching resources:', error);
      return {
        data: [],
        count: 0,
        currentPage: page,
        totalPages: 0
      };
    }
  },

  // 获取搜索建议
  async getSearchSuggestions(searchTerm: string, limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('title')
        .or(`title.ilike.%${searchTerm}%`)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.map(item => item.title) || [];
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  },

  // 新增：获取所有资源（不分页）
  async fetchAllResources(filters?: ResourceFilters) {
    try {
      let query = supabase
        .from('resources')
        .select('*');

      // 应用过滤条件
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        if (searchTerm.length > 0) {
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .order('updated_at', { ascending: false });
        }
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.tag) {
        query = query.contains('tags', [filters.tag]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all resources:', error);
      return [];
    }
  },

  // 清除所有缓存
  clearCache() {
    searchCache.clear();
  },

  async createResource(resource: Omit<Resource, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([resource]);

      if (error) throw error;
      // 清除缓存
      this.clearCache();
      return data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  async updateResource(id: string, resource: Partial<Resource>) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update(resource)
        .eq('id', id);
      
      if (error) {
        console.error('更新资源失败:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      // 清除缓存
      this.clearCache();
      return data;
    } catch (error) {
      console.error('更新资源时发生错误:', error);
      throw error;
    }
  },

  async deleteResource(id: string) {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      // 清除缓存
      this.clearCache();
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }
};