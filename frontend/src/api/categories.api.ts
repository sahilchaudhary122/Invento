/**
 * Category API Client
 * Maps to backend /api/v1/categories endpoints.
 * Automatically receives Bearer token for mutating calls via client.ts.
 */

import { api } from './client';
import type { Category, CategoryCreate, CategoryUpdate } from '../types/product';

/**
 * Fetch all categories
 */
export const getCategories = async (): Promise<Category[]> => {
  return api.get<Category[]>('/categories/');
};

/**
 * Fetch a single category by UUID
 */
export const getCategory = async (id: string): Promise<Category> => {
  return api.get<Category>(`/categories/${id}`);
};

/**
 * Create a new category (requires authentication)
 */
export const createCategory = async (payload: CategoryCreate): Promise<Category> => {
  return api.post<Category>('/categories/', payload);
};

/**
 * Update an existing category (requires authentication)
 */
export const updateCategory = async (id: string, payload: CategoryUpdate): Promise<Category> => {
  return api.put<Category>(`/categories/${id}`, payload);
};

/**
 * Delete a category by UUID (requires authentication)
 */
export const deleteCategory = async (id: string): Promise<void> => {
  return api.delete<void>(`/categories/${id}`);
};

export const categoriesApi = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
