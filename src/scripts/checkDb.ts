import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { supabase } from '../database/connect';

async function check() {
  try {
    console.log('Connecting to database via Supabase client...');
    
    const { count: productCount, error: pError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (pError) throw pError;

    const { count: collectionCount, error: cError } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true });

    if (cError) throw cError;

    console.log(`Product count: ${productCount}`);
    console.log(`Collection count: ${collectionCount}`);

    if (productCount && productCount > 0) {
      const { data: sampleProducts } = await supabase
        .from('products')
        .select('name, collections')
        .limit(5);
      console.log('Sample Products:', sampleProducts);
    }

    if (collectionCount && collectionCount > 0) {
      const { data: sampleCollections } = await supabase
        .from('collections')
        .select('name, slug, featured_products')
        .limit(5);
      console.log('Sample Collections:', sampleCollections);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

check();
