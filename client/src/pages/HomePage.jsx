import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";
import { getProductColor, getProductVisualLabel } from "../utils/productVisuals.js";

const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;
const ALL_CATEGORIES_KEY = "__all__";

const normalizeCategory = (categoryValue) => {
  const categoryLabel = String(categoryValue || "").trim();
  return categoryLabel || "Uncategorized";
};

function HomePage() {
  const navigate = useNavigate();
  const { products, isLoadingProducts, error, clearError, addItemToCart } = useShop();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_KEY);

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const categoryLabel = normalizeCategory(product.category);
      const categoryKey = categoryLabel.toLowerCase();

      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, categoryLabel);
      }
    });

    return [...categoryMap.values()].sort((left, right) => left.localeCompare(right));
  }, [products]);

  useEffect(() => {
    if (selectedCategory === ALL_CATEGORIES_KEY) {
      return;
    }

    if (!categoryOptions.includes(selectedCategory)) {
      setSelectedCategory(ALL_CATEGORIES_KEY);
    }
  }, [categoryOptions, selectedCategory]);

  const visibleProducts = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES_KEY) {
      return products;
    }

    return products.filter(
      (product) => normalizeCategory(product.category) === selectedCategory,
    );
  }, [products, selectedCategory]);

  const handleAddToCart = async (productId) => {
    const result = await addItemToCart(productId);
    if (result.ok) {
      clearError();
      navigate("/cart");
    }
  };

  return (
    <section>
      <h1 className="page-title">Product Catalog</h1>
      <p className="section-subtitle">
        Router and shared state are set up. Product cards will become dynamic when
        API endpoints are completed.
      </p>

      {error ? (
        <div className="alert alert-warning mt-3 mb-0" role="alert">
          {error}
        </div>
      ) : null}

      {!isLoadingProducts && categoryOptions.length > 0 ? (
        <div className="category-filter-row mt-4">
          <span className="category-filter-label">Filter by category:</span>
          <div className="category-filter-buttons">
            <button
              type="button"
              className={`btn btn-sm ${
                selectedCategory === ALL_CATEGORIES_KEY
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setSelectedCategory(ALL_CATEGORIES_KEY)}
            >
              All
            </button>
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                className={`btn btn-sm ${
                  selectedCategory === category ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isLoadingProducts ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="row g-4 product-grid">
          {visibleProducts.map((product) => (
            <div className="col-12 col-md-6 col-lg-4" key={product.id}>
              <article className="card product-card">
                <Link className="product-image-wrap" to={`/products/${product.id}`}>
                  <div
                    className="product-color-block"
                    style={{ "--product-color": getProductColor(product) }}
                    aria-label={product.title || "Product"}
                  >
                    <span className="product-color-label">
                      {getProductVisualLabel(product)}
                    </span>
                  </div>
                </Link>
                <div className="card-body">
                  <Link className="product-title-link" to={`/products/${product.id}`}>
                    {product.title || "Untitled product"}
                  </Link>
                  <p className="text-muted small mb-0">
                    {product.description || "No description available."}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="price-text">{formatPrice(product.price)}</span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {!isLoadingProducts && visibleProducts.length === 0 ? (
        <div className="empty-state mt-4">
          {products.length === 0 ? (
            <>
              <h2 className="h4">No products loaded yet</h2>
              <p className="text-muted mb-0">
                Seed products and implement product API routes to populate this page.
              </p>
            </>
          ) : (
            <>
              <h2 className="h4">No products in this category</h2>
              <p className="text-muted mb-0">
                Try a different category, or switch back to <strong>All</strong>.
              </p>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default HomePage;
