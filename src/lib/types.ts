export interface ServiceVariant {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  category: string;
  image: string;
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
