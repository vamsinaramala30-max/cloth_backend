import mongoose from 'mongoose';

// In-memory database store grouped by model name
const dbStore: Record<string, any[]> = {
  Product: [
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e1a'),
      name: 'Quantum Silk Jacket',
      slug: 'quantum-silk-jacket',
      category: 'Jackets',
      basePrice: 850,
      salePrice: 720,
      description: 'Premium luxury jacket with quantum silk fabric.',
      isActive: true,
      variants: [{ images: ['https://images.unsplash.com/photo-1551028719-00167b16ebc5?q=80&w=1000'], sku: 'QSJ-01', color: '#fff', colorName: 'White', size: 'M', stock: 10 }],
      collections: ['new-arrivals', 'digital-couture'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e1b'),
      name: 'Neural Mesh Shirt',
      slug: 'neural-mesh-shirt',
      category: 'Shirts',
      basePrice: 450,
      isActive: true,
      variants: [{ images: ['https://images.unsplash.com/photo-1503342394128-c104cbb9810d?q=80&w=1000'], sku: 'NMS-01', color: '#000', colorName: 'Black', size: 'L', stock: 5 }],
      collections: ['new-arrivals', 'summer-edit'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  Collection: [
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e20'),
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'Curated avant-garde arrivals for the current season.',
      longDescription: 'Experience the latest iterations of modern fashion. Our new arrivals blend technological innovation with traditional couture craftsmanship.',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?q=80&w=1000',
      bannerImage: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?q=80&w=1000',
      accentColor: 'from-cyan-500/20 to-blue-600/20',
      color: 'from-cyan-500 to-blue-600',
      featuredProducts: [new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e1a'), new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e1b')],
      productCount: 2,
      displayOrder: 1,
      isActive: true,
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e21'),
      name: 'Summer Edit',
      slug: 'summer-edit',
      description: 'Futuristic resort and hot-weather wear designed for comfort.',
      longDescription: 'Keep cool with high-tech fabrics and silhouettes styled for high-temperature cyber-resorts.',
      image: 'https://images.unsplash.com/photo-1503342394128-c104cbb9810d?q=80&w=1000',
      bannerImage: 'https://images.unsplash.com/photo-1503342394128-c104cbb9810d?q=80&w=1000',
      accentColor: 'from-orange-500/20 to-yellow-600/20',
      color: 'from-orange-500 to-yellow-600',
      featuredProducts: [new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e1b')],
      productCount: 1,
      displayOrder: 2,
      isActive: true,
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e22'),
      name: 'Evening Couture',
      slug: 'evening-couture',
      description: 'High-end elegant tailoring for after-dark statement-making.',
      longDescription: 'Stunning silhouettes and hyper-premium tailoring made for night events and luxury lounges.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000',
      bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000',
      accentColor: 'from-purple-500/20 to-pink-600/20',
      color: 'from-purple-500 to-pink-600',
      featuredProducts: [],
      productCount: 0,
      displayOrder: 3,
      isActive: true,
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e23'),
      name: 'Digital Couture',
      slug: 'digital-couture',
      description: 'AI runway couture built on generative aesthetics.',
      longDescription: 'Exploring the boundary between digital fashion design and physical garment creation.',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000',
      bannerImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000',
      accentColor: 'from-blue-500/20 to-purple-600/20',
      color: 'from-blue-500 to-purple-600',
      featuredProducts: [new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e1a')],
      productCount: 1,
      displayOrder: 4,
      isActive: true,
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e24'),
      name: 'Editorial Picks',
      slug: 'editorial-picks',
      description: 'Pieces recommended by our head designers.',
      longDescription: 'Curated favorites from our creative directors, showcasing bold styling and premium craftsmanship.',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000',
      bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000',
      accentColor: 'from-amber-500/20 to-red-600/20',
      color: 'from-amber-500 to-red-600',
      featuredProducts: [],
      productCount: 0,
      displayOrder: 5,
      isActive: true,
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e25'),
      name: 'Limited Edition',
      slug: 'limited-edition',
      description: 'Highly restricted, serial-numbered releases.',
      longDescription: 'Extremely rare items crafted in single-digit production batches for the ultimate collectors.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
      bannerImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
      accentColor: 'from-rose-500/20 to-indigo-600/20',
      color: 'from-rose-500 to-indigo-600',
      featuredProducts: [],
      productCount: 0,
      displayOrder: 6,
      isActive: true,
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e26'),
      name: 'AI Collection',
      slug: 'ai-collection',
      description: 'Designs conceptualized by custom generative neural models.',
      longDescription: 'At the intersection of code and canvas, this capsule showcases designs purely generated by deep learning algorithms.',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000',
      bannerImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000',
      accentColor: 'from-emerald-500/20 to-teal-600/20',
      color: 'from-emerald-500 to-teal-600',
      featuredProducts: [],
      productCount: 0,
      displayOrder: 7,
      isActive: true,
    },
    {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f8e8e27'),
      name: 'Heritage Collection',
      slug: 'heritage-collection',
      description: 'Timeless luxury roots combined with cybernetic details.',
      longDescription: 'Honoring historical patterns and techniques, upgraded with futuristic design elements.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000',
      bannerImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000',
      accentColor: 'from-bronze-500/20 to-yellow-700/20',
      color: 'from-yellow-700 to-amber-900',
      featuredProducts: [],
      productCount: 0,
      displayOrder: 8,
      isActive: true,
    }
  ],
  User: [],
  Cart: [],
  RefreshToken: [],
  Subscriber: [],
  Order: [],
};

// Setup interception
export function setupMockMongoose(): void {
  console.log('[MockDB] Setting up in-memory Mongoose fallback...');

  // Mock connection ready state to prevent buffering
  (mongoose.connection as any).readyState = 1;

  // Mock connect
  mongoose.connect = async () => {
    console.log('[MockDB] Mock connection to database successful.');
    (mongoose.connection as any).readyState = 1;
    return mongoose;
  };

  // Intercept exec
  const originalExec = mongoose.Query.prototype.exec;
  mongoose.Query.prototype.exec = async function (this: any) {
    const modelName = this.model.modelName;
    const op = this.op;
    const filter = this.getFilter();

    console.log(`[MockDB] Intercepted query: ${modelName}.${op}`, JSON.stringify(filter));

    if (!dbStore[modelName]) {
      dbStore[modelName] = [];
    }

    const list = dbStore[modelName];

    if (op === 'deleteMany') {
      dbStore[modelName] = [];
      return { deletedCount: list.length };
    }

    if (op === 'find') {
      let results = [...list];
      if (filter._id) {
        if (filter._id.$in) {
          const ids = filter._id.$in.map((id: any) => id.toString());
          results = results.filter(item => ids.includes(item._id.toString()));
        } else {
          const filterIdStr = filter._id.toString();
          results = results.filter(item => item._id.toString() === filterIdStr);
        }
      } else if (filter.email) {
        results = results.filter(item => item.email === filter.email);
      } else if (filter.isActive !== undefined) {
        results = results.filter(item => item.isActive === filter.isActive);
      }

      // Filter by collection if present
      if (modelName === 'Product') {
        if (filter.$or) {
          const orFilter = filter.$or;
          results = results.filter(p => {
            return orFilter.some((condition: any) => {
              if (condition.collections) {
                const searchVal = condition.collections;
                const productCollections = p.collections || [];
                if (searchVal && searchVal.$in) {
                  return productCollections.some((c: string) =>
                    searchVal.$in.some((sv: string) => sv.toLowerCase() === c.toLowerCase())
                  );
                }
                return productCollections.some((c: string) => c.toLowerCase() === searchVal.toLowerCase());
              }
              if (condition._id) {
                if (condition._id.$in) {
                  const ids = condition._id.$in.map((id: any) => id.toString());
                  return ids.includes(p._id.toString());
                }
                return p._id.toString() === condition._id.toString();
              }
              return false;
            });
          });
        } else if (filter.collections && filter.collections.$in) {
          const searchColls = filter.collections.$in.map((c: string) => c.toLowerCase());
          results = results.filter(p => {
            const productCollections = p.collections || [];
            return productCollections.some((c: string) => searchColls.includes(c.toLowerCase()));
          });
        }
      }
      return results;
    }

    if (op === 'findOne') {
      if (filter._id) {
        const filterIdStr = filter._id.toString();
        return list.find(item => item._id.toString() === filterIdStr) || null;
      }
      if (filter.slug) {
        return list.find(item => item.slug === filter.slug) || null;
      }
      if (filter.email) {
        return list.find(item => item.email === filter.email) || null;
      }
      if (filter.userId) {
        const userIdStr = filter.userId.toString();
        return list.find(item => item.userId?.toString() === userIdStr) || null;
      }
      if (filter.token) {
        return list.find(item => item.token === filter.token) || null;
      }
      return list[0] || null;
    }

    if (op === 'countDocuments') {
      return list.length;
    }

    if (op === 'distinct') {
      const field = this._distinct;
      const values = list.map(item => item[field]).filter(Boolean);
      return Array.from(new Set(values));
    }

    if (op === 'deleteOne') {
      if (filter.token) {
        const idx = list.findIndex(item => item.token === filter.token);
        if (idx !== -1) list.splice(idx, 1);
      }
      return { deletedCount: 1 };
    }

    return originalExec.apply(this);
  };

  // Intercept save
  mongoose.Model.prototype.save = async function (this: any) {
    const modelName = this.constructor.modelName;
    console.log(`[MockDB] Intercepted save: ${modelName}`);

    if (!dbStore[modelName]) {
      dbStore[modelName] = [];
    }

    const list = dbStore[modelName];
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }

    const idx = list.findIndex(item => item._id.toString() === this._id.toString());
    const docData = this.toObject ? this.toObject() : this;
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...docData };
    } else {
      list.push(docData);
    }
    return this;
  };
}
