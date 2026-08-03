import apiClient from "./apiClient";

export async function apiListCategories(type) {
  const { data } = await apiClient.get("/categories", { params: { type } });
  return data.data.categories;
}

export async function apiCreateCategory({ name, type, icon }) {
  const { data } = await apiClient.post("/categories", { name, type, icon });
  return data.data.category;
}

export async function apiUpdateCategory(id, updates) {
  const { data } = await apiClient.patch(`/categories/${id}`, updates);
  return data.data.category;
}

export async function apiDeleteCategory(id) {
  await apiClient.delete(`/categories/${id}`);
}
