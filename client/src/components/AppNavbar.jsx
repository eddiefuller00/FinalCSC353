import { Link, NavLink, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext.jsx";

const navLinkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

function AppNavbar() {
  const navigate = useNavigate();
  const {
    cart,
    isLoadingProducts,
    searchTerm,
    setSearchTerm,
    searchProducts,
  } = useShop();

  const cartCount = cart.items.reduce(
    (runningTotal, item) => runningTotal + Number(item.quantity || 0),
    0,
  );

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await searchProducts(searchTerm);
    navigate("/");
  };

  return (
    <nav className="navbar app-navbar py-3">
      <div className="container">
        <Link className="navbar-brand fw-semibold me-4" to="/">
          CSC353 Store
        </Link>
        <div className="d-flex flex-wrap align-items-center gap-3 w-100">
          <ul className="navbar-nav flex-row gap-2 me-auto">
            <li className="nav-item">
              <NavLink className={navLinkClass} to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navLinkClass} to="/cart">
                Cart ({cartCount})
              </NavLink>
            </li>
          </ul>
          <form className="d-flex gap-2 flex-grow-1 justify-content-end" onSubmit={handleSearchSubmit}>
            <input
              className="form-control"
              type="search"
              placeholder="Search products"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search products"
            />
            <button
              className="btn btn-outline-light"
              type="submit"
              disabled={isLoadingProducts}
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;
