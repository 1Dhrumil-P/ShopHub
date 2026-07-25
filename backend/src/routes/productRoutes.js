import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getMyProducts,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/my', protect, authorize('admin', 'sales'), getMyProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('admin', 'sales'), upload.single('image'), createProduct);
router.put('/:id', protect, authorize('admin', 'sales'), upload.single('image'), updateProduct);
router.delete('/:id', protect, authorize('admin', 'sales'), deleteProduct);

export default router;
