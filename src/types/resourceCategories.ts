export interface Category {
  id: string;
  name: string;
  disabled?: boolean;
  icon?: string;
}

export interface ResourceCategoriesProps {
  categories: Array<{
    id: string;
    disabled?: boolean;
  }>;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  isPageSelectorOpen?: boolean;
}