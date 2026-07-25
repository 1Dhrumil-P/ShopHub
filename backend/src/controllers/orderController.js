import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { getRazorpayInstance, verifyPaymentSignature } from '../utils/razorpay.js';
import { clearCart } from './cartController.js';

export const createRazorpayOrder = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Admins cannot create orders' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        message: 'Razorpay is not configured on the server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ message: 'Invalid product in cart' });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
      totalAmount += item.product.price * item.quantity;
    }

    const amountInPaise = Math.round(totalAmount * 100);
    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      seller: item.product.owner,
    }));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
    });

    res.json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Admins cannot verify payments' });
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'Missing payment verification data' });
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.json({ message: 'Payment already verified', order });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Order ID mismatch' });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    order.status = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    await clearCart(req.user._id);

    const populated = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl');

    res.json({ message: 'Payment verified successfully', order: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Admins cannot access My Orders' });
    }
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name imageUrl category')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalesOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl category')
      .sort({ createdAt: -1 });

    const filteredOrders = orders.map((order) => {
      const myItems = order.items.filter(
        (item) => item.seller.toString() === req.user._id.toString()
      );
      const myTotal = myItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return {
        _id: order._id,
        user: order.user,
        items: myItems,
        myTotal,
        status: order.status,
        createdAt: order.createdAt,
      };
    });

    res.json(filteredOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl')
      .populate('items.seller', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderStats = async (_req, res) => {
  try {
    const paidOrders = await Order.find({ status: 'paid' });

    const totalOrders = paidOrders.length;
    const totalSales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProducts = await Product.countDocuments();
    const totalUsers = await (await import('../models/User.js')).default.countDocuments();

    res.json({
      totalOrders,
      totalSales,
      totalProducts,
      totalUsers,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl category')
      .populate('items.seller', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'user' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    if (req.user.role === 'sales') {
      const hasMyProduct = order.items.some(
        (item) => item.seller._id.toString() === req.user._id.toString()
      );
      if (!hasMyProduct) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
