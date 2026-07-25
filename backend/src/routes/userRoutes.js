import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  createUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
