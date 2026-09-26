/**
 * Product API Client
 * Maps to backend /api/v1/products endpoints.
 * Automatically receives Bearer token for mutating calls via client.ts.
 */

import { api } from './client';
import type { Product, ProductCreate, ProductUpdate } from '../types/product';

/**
 * Fetch all products, with optional search term filtering across name and SKU
 */
export const getProducts = async (search?: string): Promise<Product[]> => {
  const query = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return api.get<Product[]>(`/products/${query}`);
};

/**
 * Fetch a single product by UUID
 */
export const getProduct = async (id: string): Promise<Product> => {
  return api.get<Product>(`/products/${id}`);
};

/**
 * Create a new product (requires authentication)
 */
export const createProduct = async (payload: ProductCreate): Promise<Product> => {
  return api.post<Product>('/products/', payload);
};

/**
 * Update an existing product (requires authentication)
 */
export const updateProduct = async (id: string, payload: ProductUpdate): Promise<Product> => {
  return api.put<Product>(`/products/${id}`, payload);
};

/**
 * Delete a product by UUID (requires authentication)
 */
export const deleteProduct = async (id: string): Promise<void> => {
  return api.delete<void>(`/products/${id}`);
};

export const productsApi = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
