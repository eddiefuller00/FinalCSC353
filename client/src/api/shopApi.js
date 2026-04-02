import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

export const fetchProducts = async (searchTerm = "") => {
  const params = {};
  const normalizedSearch = searchTerm.trim();

  if (normalizedSearch) {
    params.search = normalizedSearch;
  }

  const response = await apiClient.get("/products", { params });
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchProductById = async (productId) => {
  const response = await apiClient.get(`/products/${productId}`);
  return response.data;
};

export const fetchCart = async () => {
  const response = await apiClient.get("/cart");
  return response.data;
};

export const addCartItem = async (productId, quantity = 1) => {
  const response = await apiClient.post("/cart/items", {
    productId,
    quantity,
  });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await apiClient.patch(`/cart/items/${productId}`, {
    quantity,
  });
  return response.data;
};

export const removeCartItem = async (productId) => {
  const response = await apiClient.delete(`/cart/items/${productId}`);
  return response.data;
};
