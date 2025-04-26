export interface Category {
  id: string;
  name: string;
  disabled?: boolean;
  icon?: string;
}

export interface ResourceCategoriesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}