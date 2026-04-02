import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

const getItemInfo = (item) => {
  const product = item.product || item;
  const quantity = Number(item.quantity || 0);
  const productId = item.productId ?? product.id;
  const title = product.title || "Untitled product";
  const unitPrice = Number(product.price || item.price || 0);
  return {
    productId,
    title,
    quantity,
    unitPrice,
    lineTotal: unitPrice * quantity,
  };
};

function CartPage() {
  const { cart, isLoadingCart, error, updateItemQuantity, removeItemFromCart } = useShop();
  const cartItems = Array.isArray(cart.items) ? cart.items : [];

  const handleIncrement = async (productId, currentQuantity) => {
    await updateItemQuantity(productId, currentQuantity + 1);
  };

  const handleDecrement = async (productId, currentQuantity) => {
    if (currentQuantity <= 1) {
      return;
    }
    await updateItemQuantity(productId, currentQuantity - 1);
  };

  const handleRemove = async (productId) => {
    await removeItemFromCart(productId);
  };

  if (isLoadingCart && cartItems.length === 0) {
    return (
      <section className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="empty-state">
        <h1 className="h3">Your cart is empty</h1>
        <p className="text-muted">Add an item from the catalog to get started.</p>
        <Link to="/" className="btn btn-primary mt-3">
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h1 className="page-title">Cart</h1>
      <p className="section-subtitle">Update quantities or remove items below.</p>

      {error ? (
        <div className="alert alert-warning mt-3 mb-0" role="alert">
          {error}
        </div>
      ) : null}

      <div className="table-responsive mt-4">
        <table className="table table-striped table-hover bg-white cart-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Unit Price</th>
              <th scope="col">Quantity</th>
              <th scope="col">Line Total</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => {
              const { productId, title, quantity, unitPrice, lineTotal } = getItemInfo(item);
              return (
                <tr key={productId}>
                  <td>{title}</td>
                  <td>{formatPrice(unitPrice)}</td>
                  <td>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleDecrement(productId, quantity)}
                        disabled={isLoadingCart || quantity <= 1}
                      >
                        -
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleIncrement(productId, quantity)}
                        disabled={isLoadingCart}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{formatPrice(lineTotal)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemove(productId)}
                      disabled={isLoadingCart}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3} className="text-end">
                Subtotal
              </th>
              <th>{formatPrice(cart.subtotal)}</th>
              <th />
            </tr>
            <tr>
              <th colSpan={3} className="text-end">
                Total
              </th>
              <th>{formatPrice(cart.total)}</th>
              <th />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default CartPage;
