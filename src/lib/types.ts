export interface ServiceVariant {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  // These are optional because they are inherited from the category
  category?: string;
  image?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  image: string;
  variants: ServiceVariant[];
}

export interface Addon {
  id: string;
  name: string;
  duration: string;
  price: number;
}
