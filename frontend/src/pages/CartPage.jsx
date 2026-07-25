import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, fetchCart } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const total = cart.items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const { data } = await api.post('/orders/create-order');
      const razorpayKey = data.key || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey || razorpayKey === 'undefined') {
        throw new Error('Razorpay Key ID is not configured properly. Check backend or frontend .env.');
      }

      if (!data.razorpayOrderId || data.razorpayOrderId === 'undefined') {
        throw new Error('Invalid Razorpay Order ID received from server.');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout SDK failed to load. Refresh the page and try again.');
      }

      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'ShopHub',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.orderId,
            });
            await fetchCart();
            alert('Payment successful! Your order has been placed.');
            window.location.href = '/orders';
          } catch (err) {
            alert(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setIsCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsCheckingOut(false);
          },
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        alert('Payment failed. Please try again.');
        setIsCheckingOut(false);
      });
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Checkout failed');
      setIsCheckingOut(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container empty-state" style={{ padding: '3rem 0' }}>
        <h2>Your cart is empty</h2>
        <p style={{ margin: '1rem 0' }}>Browse products and add items to your cart.</p>
        <Link to="/" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <h1 className="page-title">Shopping Cart</h1>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((item) => (
              <tr key={item.product._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} />
                    <span>{item.product.name}</span>
                  </div>
                </td>
                <td>₹{item.product.price.toLocaleString('en-IN')}</td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: '70px' }}
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product._id, Number(e.target.value))}
                  />
                </td>
                <td>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
                <td>
                  <button className="btn btn-delete btn-sm" onClick={() => removeFromCart(item.product._id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Total Amount</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>₹{total.toLocaleString('en-IN')}</p>
        </div>
        <button className="btn btn-primary" onClick={handleCheckout} disabled={isCheckingOut}>
          {isCheckingOut ? 'Processing...' : 'Proceed to Pay with Razorpay'}
        </button>
      </div>
    </div>
  );
}
