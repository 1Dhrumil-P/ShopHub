import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

export default function ProductCard({ product, onWishlistToggle, inWishlist }) {
  const { user } = useAuth();
  const canShop = user && user.role === 'user';

  return (
    <div className="product-card card">
      <div className="product-image-link">
        <Link to={`/products/${product._id}`}>
          <img src={product.imageUrl} alt={product.name} className="product-image" />
        </Link>
        {canShop && (
          <button
            className={`wishlist-overlay ${inWishlist ? 'wish-filled' : 'wish-empty'}`}
            onClick={() => onWishlistToggle?.(product._id)}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {inWishlist ? '♥' : '♡'}
          </button>
        )}
      </div>

      <div className="product-body">
        <div className="product-meta">
          <div className="product-meta-left">
            <span className="product-category">{product.category}</span>
            <Link to={`/products/${product._id}`}>
              <h3 className="product-name">{product.name}</h3>
            </Link>
          </div>
          <div className="product-meta-right">
            <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
