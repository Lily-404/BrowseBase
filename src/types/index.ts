export interface Category {
  id: string;
  name: string;
  disabled?: boolean;
  icon?: string;
}

export interface Tag {
  id: string;
  name: string;
  description: string;
}