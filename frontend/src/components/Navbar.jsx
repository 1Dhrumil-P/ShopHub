import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, canManageProducts, isAdmin, isSales } = useAuth();
  const { count } = useCart();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">S</span>
          ShopHub
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end>Products</NavLink>

          {user && canManageProducts && (
            <NavLink to="/products/manage">Manage Products</NavLink>
          )}

          {user && user.role === 'user' && (
            <>
              <NavLink to="/wishlist">Wishlist</NavLink>
              <NavLink to="/cart" className="cart-link">
                Cart
                {count > 0 && <span className="cart-badge">{count}</span>}
              </NavLink>
              <NavLink to="/orders">My Orders</NavLink>
            </>
          )}

          {isSales && <NavLink to="/sales/orders">Sales Orders</NavLink>}
          {isAdmin && <NavLink to="/admin">Admin Dashboard</NavLink>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <span className={`badge badge-${user.role}`}>{user.role}</span>
              <span className="user-name">{user.name}</span>
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
