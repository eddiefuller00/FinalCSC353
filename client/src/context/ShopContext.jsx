import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  addCartItem,
  fetchCart,
  fetchProducts,
  removeCartItem,
  updateCartItem,
} from "../api/shopApi.js";
import { ACTIONS, initialShopState, normalizeCart, shopReducer } from "./shopReducer.js";

const ShopContext = createContext(null);

const parseError = (error, fallbackMessage) =>
  error?.response?.data?.error || error?.message || fallbackMessage;

export const ShopProvider = ({ children }) => {
  const [state, dispatch] = useReducer(shopReducer, initialShopState);

  const setSearchTerm = useCallback((nextSearchTerm) => {
    dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: nextSearchTerm });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  const loadProducts = useCallback(async (searchTerm = "") => {
    dispatch({ type: ACTIONS.SET_PRODUCTS_LOADING, payload: true });
    try {
      const products = await fetchProducts(searchTerm);
      dispatch({ type: ACTIONS.SET_PRODUCTS, payload: products });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_PRODUCTS, payload: [] });
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: parseError(error, "Unable to load products."),
      });
    }
  }, []);

  const loadCart = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_CART_LOADING, payload: true });
    try {
      const cart = await fetchCart();
      dispatch({ type: ACTIONS.SET_CART, payload: normalizeCart(cart) });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_CART, payload: normalizeCart() });
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: parseError(error, "Unable to load cart."),
      });
    }
  }, []);

  const searchProducts = useCallback(
    async (nextSearchTerm) => {
      dispatch({ type: ACTIONS.SET_SEARCH_TERM, payload: nextSearchTerm });
      await loadProducts(nextSearchTerm);
    },
    [loadProducts],
  );

  const addItemToCart = useCallback(async (productId, quantity = 1) => {
    dispatch({ type: ACTIONS.SET_CART_LOADING, payload: true });
    try {
      const cart = await addCartItem(productId, quantity);
      dispatch({ type: ACTIONS.SET_CART, payload: normalizeCart(cart) });
      return { ok: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_CART_LOADING, payload: false });
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: parseError(error, "Unable to add item to cart."),
      });
      return { ok: false };
    }
  }, []);

  const updateItemQuantity = useCallback(async (productId, quantity) => {
    dispatch({ type: ACTIONS.SET_CART_LOADING, payload: true });
    try {
      const cart = await updateCartItem(productId, quantity);
      dispatch({ type: ACTIONS.SET_CART, payload: normalizeCart(cart) });
      return { ok: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_CART_LOADING, payload: false });
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: parseError(error, "Unable to update cart item."),
      });
      return { ok: false };
    }
  }, []);

  const removeItemFromCart = useCallback(async (productId) => {
    dispatch({ type: ACTIONS.SET_CART_LOADING, payload: true });
    try {
      const cart = await removeCartItem(productId);
      dispatch({ type: ACTIONS.SET_CART, payload: normalizeCart(cart) });
      return { ok: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_CART_LOADING, payload: false });
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: parseError(error, "Unable to remove cart item."),
      });
      return { ok: false };
    }
  }, []);

  useEffect(() => {
    void loadProducts();
    void loadCart();
  }, [loadProducts, loadCart]);

  const value = useMemo(
    () => ({
      ...state,
      setSearchTerm,
      clearError,
      searchProducts,
      loadProducts,
      loadCart,
      addItemToCart,
      updateItemQuantity,
      removeItemFromCart,
    }),
    [
      state,
      setSearchTerm,
      clearError,
      searchProducts,
      loadProducts,
      loadCart,
      addItemToCart,
      updateItemQuantity,
      removeItemFromCart,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside ShopProvider.");
  }
  return context;
};
