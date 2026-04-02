import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";
import { getProductColor, getProductVisualLabel } from "../utils/productVisuals.js";

const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, isLoadingProducts, clearError, addItemToCart } = useShop();

  const product = useMemo(
    () => products.find((product) => String(product.id) === String(id)) || null,
    [products, id],
  );

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    const result = await addItemToCart(product.id);
    if (result.ok) {
      clearError();
      navigate("/cart");
    }
  };

  if (isLoadingProducts && !product) {
    return (
      <section className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="empty-state">
        <h1 className="h4">Product not found</h1>
        <p className="text-muted">
          The product API routes are the next backend step, so this page depends on
          loaded catalog data for now.
        </p>
        <Link className="btn btn-primary mt-3" to="/">
          Return Home
        </Link>
      </section>
    );
  }

  return (
    <section className="card product-detail-card p-4 p-lg-5">
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-6">
          <div
            className="product-detail-image product-color-block"
            style={{ "--product-color": getProductColor(product) }}
            aria-label={product.title || "Product"}
          >
            <span className="product-color-label">
              {getProductVisualLabel(product)}
            </span>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <p className="text-uppercase text-muted small mb-2">
            {product.category || "General"}
          </p>
          <h1 className="page-title fs-2">{product.title || "Untitled product"}</h1>
          <p className="text-muted mt-3">
            {product.description || "No description available."}
          </p>
          <p className="price-text fs-3 mt-4 mb-4">{formatPrice(product.price)}</p>
          <div className="d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <Link className="btn btn-outline-secondary" to="/">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailPage;
