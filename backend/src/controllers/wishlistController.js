import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
    wishlist = await wishlist.populate('products');
  }
  return wishlist;
};

export const getWishlist = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Admins cannot access wishlist' });
    }
    const wishlist = await getOrCreateWishlist(req.user._id);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Admins cannot modify wishlist' });
    }
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const wishlist = await getOrCreateWishlist(req.user._id);
    const exists = wishlist.products.some(
      (p) => p._id.toString() === productId
    );

    if (!exists) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const updated = await Wishlist.findById(wishlist._id).populate('products');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Admins cannot modify wishlist' });
    }
    const { productId } = req.params;
    const wishlist = await getOrCreateWishlist(req.user._id);

    wishlist.products = wishlist.products.filter(
      (p) => p._id.toString() !== productId
    );

    await wishlist.save();
    const updated = await Wishlist.findById(wishlist._id).populate('products');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
