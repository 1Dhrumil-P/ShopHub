import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleUpdate, setRoleUpdate] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/orders/stats'),
      api.get('/orders/all'),
      api.get('/users'),
    ])
      .then(([statsRes, ordersRes, usersRes]) => {
        setStats(statsRes.data);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId) => {
    const role = roleUpdate[userId];
    if (!role) return;
    try {
      await api.put(`/users/${userId}/role`, { role });
      const { data } = await api.get('/users');
      setUsers(data);
      alert('Role updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) return <div className="loading container">Loading...</div>;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p>₹{(stats?.totalSales || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats?.totalOrders || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{stats?.totalProducts || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats?.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Order Value</h3>
          <p>₹{Math.round(stats?.averageOrderValue || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Manage Users</h2>
      <div className="card table-wrap" style={{ marginBottom: '2rem' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      className="form-control"
                      style={{ width: 'auto' }}
                      value={roleUpdate[u._id] || u.role}
                      onChange={(e) => setRoleUpdate({ ...roleUpdate, [u._id]: e.target.value })}
                    >
                      <option value="user">user</option>
                      <option value="sales">sales</option>
                      <option value="admin">admin</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => handleRoleChange(u._id)}>
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>All Orders</h2>
      {orders.length === 0 ? (
        <div className="empty-state card">No orders yet.</div>
      ) : (
        orders.slice(0, 10).map((order) => (
          <div key={order._id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>#{order._id.slice(-8).toUpperCase()} — {order.user?.name}</span>
              <span className={`badge badge-${order.status}`}>{order.status}</span>
              <span style={{ fontWeight: 700 }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
