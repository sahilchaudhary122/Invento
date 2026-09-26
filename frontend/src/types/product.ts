/**
 * Product & Category Types
 * Mirrors backend Pydantic schemas in app/schemas/product.py and app/schemas/category.py
 */

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface CategoryCreate {
  name: string;
  description?: string | null;
}

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  unit_of_measure: string;
  reorder_threshold: number;
  is_active: boolean;
}

export interface ProductCreate {
  name: string;
  sku: string;
  category_id: string;
  unit_of_measure?: string;
  reorder_threshold?: number;
  is_active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  sku?: string;
  category_id?: string;
  unit_of_measure?: string;
  reorder_threshold?: number;
  is_active?: boolean;
}

export interface ProductSearchParams {
  search?: string;
}
