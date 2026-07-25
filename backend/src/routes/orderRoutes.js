import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getSalesOrders,
  getAllOrders,
  getOrderStats,
  getOrderById,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/create-order', protect, authorize('user'), createRazorpayOrder);
router.post('/verify', protect, authorize('user'), verifyPayment);

router.get('/my', protect, authorize('user'), getMyOrders);
router.get('/sales', protect, authorize('sales'), getSalesOrders);
router.get('/stats', protect, authorize('admin'), getOrderStats);
router.get('/all', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrderById);

export default router;
