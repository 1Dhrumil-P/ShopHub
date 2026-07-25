import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading container">Loading...</div>;

  if (orders.length === 0) {
    return (
      <div className="container empty-state" style={{ padding: '3rem 0' }}>
        <h2>No orders yet</h2>
        <p>Your order history will appear here after purchase.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <h1 className="page-title">My Orders</h1>
      {orders.map((order) => (
        <div key={order._id} className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontWeight: 600 }}>Order #{order._id.slice(-8).toUpperCase()}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge badge-${order.status}`}>{order.status}</span>
              <p style={{ fontWeight: 700, marginTop: '0.5rem' }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
