import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <div className="alert alert-error">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return children;
}
