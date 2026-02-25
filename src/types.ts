export enum TabType {
  PRODUCTS = 'PRODUCTS',
  TEXT = 'TEXT',
  GRAPHICS = 'GRAPHICS',
  UPLOADS = 'UPLOADS',
  AI_STUDIO = 'AI_STUDIO',
  LAYERS = 'LAYERS',
  SETTINGS = 'SETTINGS'
}

export interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  colors: ProductColor[];
  sizes: string[];
  views: ProductView[];
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface ProductView {
  id: string;
  name: string;
  imageUrl?: string; // Optional fallback
  path?: string; // Main SVG path d-attribute
  detailPaths?: string[]; // Decorative paths (collars, pockets, etc.)
  viewBox?: string; // SVG viewBox
  printArea: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface DesignLayer {
  id: string;
  type: 'text' | 'image' | 'path' | 'group';
  name: string;
  visible: boolean;
  locked: boolean;
  fabricObject?: any;
}

export interface DesignElement {
  type: 'text' | 'image';
  yOffset: number; // Offset from vertical center
  
  // Text specific
  content?: string;
  fontFamily?: string;
  fill?: string;
  fontSize?: number;
  fontWeight?: string;

  // Image specific
  query?: string; // Search term for Pixabay
}

export interface DesignConcept {
  title: string;
  description: string;
  elements: DesignElement[];
}

declare global {
  interface Window {
    fabric: any;
  }
}