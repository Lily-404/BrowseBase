export interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  updatedAt: string;
  rating: number;
  reviews: number;
  tags: string[];
  category: string;
}

export interface ResourcePreviewProps {
  resources: Resource[];
  currentPage: number;
  itemsPerPage: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageChange?: (page: number) => void;
  totalPages: number;
  totalCount: number;
  isLoading?: boolean;
}