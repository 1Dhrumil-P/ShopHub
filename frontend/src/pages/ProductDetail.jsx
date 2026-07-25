import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { user, isUser } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isUser) {
      setInWishlist(false);
      return;
    }
    api.get('/wishlist').then((res) => {
      const ids = res.data.products.map((p) => p._id);
      setInWishlist(ids.includes(id));
    }).catch(() => {});
  }, [isUser, id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) return <div className="loading container">Loading...</div>;
  if (!product) return <div className="container empty-state">Product not found</div>;

  const canShop = user && user.role === 'user';

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <Link to="/" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Products
      </Link>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: '100%', borderRadius: 'var(--radius)', objectFit: 'cover' }}
        />
        <div>
          <span className="badge badge-user">{product.category}</span>
          <h1 className="page-title" style={{ marginTop: '0.5rem' }}>{product.name}</h1>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>
            Sold by: {product.owner?.name || 'Unknown'}
          </p>
          <p style={{ marginBottom: '1.5rem', lineHeight: 1.7 }}>{product.description}</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {canShop && product.stock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="number"
                className="form-control"
                style={{ width: '80px' }}
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button className="btn btn-primary" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button
                  className={`btn btn-secondary ${inWishlist ? 'wish-filled' : ''}`}
                  onClick={async () => {
                    if (!user) return window.location.assign('/login');
                    try {
                      if (inWishlist) {
                        await api.delete(`/wishlist/${product._id}`);
                        setInWishlist(false);
                      } else {
                        await api.post(`/wishlist/${product._id}`);
                        setInWishlist(true);
                      }
                    } catch (err) {
                      alert(err.response?.data?.message || 'Wishlist action failed');
                    }
                  }}
                >{inWishlist ? '♥' : '♡'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
