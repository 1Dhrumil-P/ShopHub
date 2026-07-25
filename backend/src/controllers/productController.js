import Product from '../models/Product.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinary.js';

export const getProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('owner', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const uploadedImage = await uploadToCloudinary(req.file.buffer);
    const imageUrl = uploadedImage?.secure_url || uploadedImage?.url;

    if (!imageUrl) {
      return res.status(500).json({ message: 'Image upload failed. Please try again.' });
    }

    const owner = req.user.role === 'admin' && req.body.owner
      ? req.body.owner
      : req.user._id;

    let product;

    try {
      product = await Product.create({
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock) || 0,
        imageUrl,
        owner,
      });
    } catch (dbError) {
      await deleteFromCloudinary(uploadedImage.public_id).catch(() => null);
      throw dbError;
    }

    const populated = await product.populate('owner', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user.role === 'sales' && product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }

    const { name, description, price, category, stock } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      const imageUrl = uploadedImage?.secure_url || uploadedImage?.url;

      if (!imageUrl) {
        return res.status(500).json({ message: 'Image upload failed. Please try again.' });
      }

      product.imageUrl = imageUrl;

      try {
        await product.save();
      } catch (saveError) {
        await deleteFromCloudinary(uploadedImage.public_id).catch(() => null);
        throw saveError;
      }
    } else {
      await product.save();
    }
    const populated = await product.populate('owner', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user.role === 'sales' && product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (_req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
