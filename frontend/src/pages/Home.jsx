import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      params.page = filters.page;

      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setPagination({ pages: data.pages, total: data.total });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/products/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && user.role === 'user') {
      api.get('/wishlist').then((res) => {
        setWishlistIds(res.data.products.map((p) => p._id));
      }).catch(() => {});
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
    fetchProducts();
  };

  const handleWishlistToggle = async (productId) => {
    if (!user) return;
    try {
      if (wishlistIds.includes(productId)) {
        await api.delete(`/wishlist/${productId}`);
        setWishlistIds((ids) => ids.filter((id) => id !== productId));
      } else {
        await api.post(`/wishlist/${productId}`);
        setWishlistIds((ids) => [...ids, productId]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Wishlist action failed');
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Discover Amazing Products</h1>
          <p>Browse, search, and shop from our curated collection</p>
        </div>
      </section>

      <div className="container home-content">
        <aside className="filters-panel card">
          <h2>Filters</h2>
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label>Search</label>
              <input
                className="form-control"
                placeholder="Search products..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-control"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Min Price (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Max Price (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="10000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Apply Filters
            </button>
          </form>
        </aside>

        <main className="products-section">
          <div className="products-header">
            <h2>{pagination.total} Products Found</h2>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty-state card">No products found. Try adjusting your filters.</div>
          ) : (
            <>
              <div className="grid grid-2">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    inWishlist={wishlistIds.includes(product._id)}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  >
                    Previous
                  </button>
                  <span>Page {filters.page} of {pagination.pages}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={filters.page >= pagination.pages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
