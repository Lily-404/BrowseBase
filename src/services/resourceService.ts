import { supabase } from '../lib/supabase';
import { Resource, ResourceFilters } from '../types/resource';

export const resourceService = {
  async fetchResources(page: number, itemsPerPage: number, filters?: ResourceFilters) {
    try {
      // 构建基础查询
      let query = supabase
        .from('resources')
        .select('*', { count: 'exact' });

      // 应用过滤条件
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.tag) {
        query = query.contains('tags', [filters.tag]);
      }

      // 计算分页偏移量
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // 执行分页查询，使用 updated_at 替代 created_at
      const { data, error, count } = await query
        .range(from, to)
        .order('updated_at', { ascending: false });  // 修改这里，使用 updated_at
      
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / itemsPerPage)
      };
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  async createResource(resource: Omit<Resource, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([resource]);

      if (error) throw error;
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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating resource:', error);
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
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }
};