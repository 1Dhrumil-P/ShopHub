import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';

dotenv.config();

const seedUsers = [
  { name: 'Admin User', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
  { name: 'Sales Person', email: 'sales@demo.com', password: 'sales123', role: 'sales' },
  { name: 'Regular User', email: 'user@demo.com', password: 'user123', role: 'user' },
];

const seedProducts = [
  {
    name: 'laptop',
    description: 'High-performance laptop for gaming and productivity.',
    price: 2999,
    category: 'Electronics',
    stock: 50,
    imageUrl: 'https://res.cloudinary.com/rb5hvzhg/image/upload/v1784985491/ecommerce/products/tawu24gtco1qeqzl7jxi.png',
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with breathable mesh upper.',
    price: 3499,
    category: 'Fashion',
    stock: 30,
    imageUrl: 'https://res.cloudinary.com/rb5hvzhg/image/upload/v1784894728/samples/shoe.jpg',
  },
  {
    name: 'Chair',
    description: 'Comfortable and stylish chair for your living room.',
    price: 4999,
    category: 'Home',
    stock: 20,
    imageUrl: 'https://res.cloudinary.com/rb5hvzhg/image/upload/v1784894731/samples/chair.png',
  },
  {
    name: 'Office bag',
    description: 'Spacious and durable office bag for carrying laptops and documents.',
    price: 1299,
    category: 'Accessories',
    stock: 100,
    imageUrl: 'https://res.cloudinary.com/rb5hvzhg/image/upload/v1784894725/samples/ecommerce/leather-bag-gray.jpg',
  },
  {
    name: 'Analog Watch',
    description: 'Classic analog watch with a leather strap and water resistance.',
    price: 7999,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://res.cloudinary.com/rb5hvzhg/image/upload/v1784894721/samples/ecommerce/analog-classic.jpg',
  },
  {
    name: 'Shoes',
    description: 'Comfortable and stylish shoes for everyday wear.',
    price: 1999,
    category: 'Fashion',
    stock: 40,
    imageUrl: 'https://res.cloudinary.com/rb5hvzhg/image/upload/v1784894734/cld-sample-5.jpg',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
    ]);

    const createdUsers = {};
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({ ...userData, password: hashedPassword });
      createdUsers[userData.role] = user;
      await Cart.create({ user: user._id, items: [] });
      await Wishlist.create({ user: user._id, products: [] });
      console.log(`Created ${userData.role}: ${userData.email}`);
    }

    for (let i = 0; i < seedProducts.length; i++) {
      const owner = i % 2 === 0 ? createdUsers.sales._id : createdUsers.admin._id;
      await Product.create({ ...seedProducts[i], owner });
    }
    console.log(`Created ${seedProducts.length} sample products`);

    console.log('\n--- Test Credentials ---');
    seedUsers.forEach((u) => console.log(`${u.role}: ${u.email} / ${u.password}`));

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
