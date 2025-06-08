export interface Tag {
  id: string;
  name: string;
  description: string;
}

export interface ResourceTagsProps {
  tags: Array<{
    id: string;
  }>;
  selectedTags: string[];
  onSelectTag: (tagId: string) => void;
  isPageSelectorOpen?: boolean;
}