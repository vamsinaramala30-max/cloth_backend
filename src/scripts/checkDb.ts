import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import connectDatabase from '../database/connect';
import Product from '../models/product';
import Collection from '../models/collection';

async function check() {
  try {
    console.log('Connecting to database...');
    // Temporarily force SKIP_DB to false to test real connection
    process.env.SKIP_DB = 'false';
    await connectDatabase();
    
    const productCount = await Product.countDocuments({});
    const collectionCount = await Collection.countDocuments({});
    
    console.log(`Product count: ${productCount}`);
    console.log(`Collection count: ${collectionCount}`);
    
    if (productCount > 0) {
      const sampleProducts = await Product.find({}).limit(5);
      console.log('Sample Products:', sampleProducts.map(p => ({ name: p.name, collections: p.collections })));
    }
    
    if (collectionCount > 0) {
      const sampleCollections = await Collection.find({});
      console.log('Sample Collections:', sampleCollections.map(c => ({ name: c.name, slug: c.slug, products: c.featuredProducts })));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

check();
