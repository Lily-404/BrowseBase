import { supabase } from '../lib/supabase';
import { Resource, ResourceFilters } from '../types/resource';

export const resourceService = {
  async fetchResources(page: number, itemsPerPage: number, filters?: ResourceFilters) {
    try {
      let query = supabase.from('resources').select('*');

      // 应用过滤条件
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.tag) {
        query = query.contains('tags', [filters.tag]);
      }

      // 获取总数
      const { count } = await query.select('*', { count: 'exact', head: true });

      // 获取分页数据
      const { data, error } = await query
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
      
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0
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