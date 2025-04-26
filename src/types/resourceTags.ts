export interface Tag {
  id: string;
  name: string;
  description: string;
}

export interface ResourceTagsProps {
  tags: Tag[];
  selectedTags: string[];
  onSelectTag: (tagId: string) => void;
  disabled?: boolean; 
}