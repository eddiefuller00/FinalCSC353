import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppNavbar from "./components/AppNavbar.jsx";
import { ShopProvider } from "./context/ShopContext.jsx";
import CartPage from "./pages/CartPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import "./App.css";

function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <div className="app-shell">
          <AppNavbar />
          <main className="container main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ShopProvider>
  );
}

export default App;
