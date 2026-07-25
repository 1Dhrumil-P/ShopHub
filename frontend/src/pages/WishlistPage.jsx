import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data);
    } catch {
      setWishlist({ products: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleWishlistToggle = async (productId) => {
    await api.delete(`/wishlist/${productId}`);
    fetchWishlist();
  };

  if (loading) return <div className="loading container">Loading...</div>;

  if (wishlist.products.length === 0) {
    return (
      <div className="container empty-state" style={{ padding: '3rem 0' }}>
        <h2>Your wishlist is empty</h2>
        <p style={{ margin: '1rem 0' }}>Save products you love for later.</p>
        <Link to="/" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <h1 className="page-title">My Wishlist</h1>
      <div className="grid grid-2">
        {wishlist.products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            inWishlist
            onWishlistToggle={handleWishlistToggle}
          />
        ))}
      </div>
    </div>
  );
}
