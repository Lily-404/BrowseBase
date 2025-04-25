import { resources } from '../src/data/mockData.ts';
import { supabase } from '../src/lib/supabase.ts';

async function migrateData() {
  try {
    const { error } = await supabase
      .from('resources')
      .insert(resources);
    
    if (error) throw error;
    console.log('数据迁移成功！');
  } catch (error) {
    console.error('数据迁移失败:', error);
  }
}

migrateData();