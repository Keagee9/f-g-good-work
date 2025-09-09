export interface ServiceVariant {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  image: string;
  variants: ServiceVariant[];
}
