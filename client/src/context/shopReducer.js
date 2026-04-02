export const ACTIONS = {
  SET_SEARCH_TERM: "SET_SEARCH_TERM",
  SET_PRODUCTS_LOADING: "SET_PRODUCTS_LOADING",
  SET_PRODUCTS: "SET_PRODUCTS",
  SET_CART_LOADING: "SET_CART_LOADING",
  SET_CART: "SET_CART",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

const EMPTY_CART = {
  items: [],
  subtotal: 0,
  total: 0,
};

export const normalizeCart = (cart) => ({
  ...EMPTY_CART,
  ...cart,
  items: Array.isArray(cart?.items) ? cart.items : [],
  subtotal: Number(cart?.subtotal ?? 0),
  total: Number(cart?.total ?? cart?.subtotal ?? 0),
});

export const initialShopState = {
  products: [],
  cart: EMPTY_CART,
  searchTerm: "",
  isLoadingProducts: false,
  isLoadingCart: false,
  error: "",
};

export const shopReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload,
      };
    case ACTIONS.SET_PRODUCTS_LOADING:
      return {
        ...state,
        isLoadingProducts: action.payload,
      };
    case ACTIONS.SET_PRODUCTS:
      return {
        ...state,
        products: Array.isArray(action.payload) ? action.payload : [],
        isLoadingProducts: false,
      };
    case ACTIONS.SET_CART_LOADING:
      return {
        ...state,
        isLoadingCart: action.payload,
      };
    case ACTIONS.SET_CART:
      return {
        ...state,
        cart: normalizeCart(action.payload),
        isLoadingCart: false,
      };
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: "",
      };
    default:
      return state;
  }
};
