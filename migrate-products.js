// cloth_backend/migrate-products.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/product');

dotenv.config({ path: '.env.local' });

// Load environment variables (assuming you have a .env file with your MongoDB URI)
//dotenv.config({ path: './config/config.env' }); // Adjust path to your config.env or .env file

const DB_URI = process.env.MONGO_URI; // Make sure this environment variable is set

if (!DB_URI) {
  console.error('MONGO_URI not found in environment variables. Please set it.');
  process.exit(1);
}

async function connectAndLog() {
  try {
    console.log(`Attempting to connect to MongoDB with URI: ${DB_URI.replace(/:[^@]+@/, ':********@')}`);

    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected for migration...');
    console.log(`Connected to database: ${mongoose.connection.name}`);
    console.log(`Connected to host: ${mongoose.connection.host}`);

    // Verify Product Model and Collection
    console.log(`Product Model collection name: ${Product.collection.name}`);

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in the connected database:');
    collections.forEach(col => console.log(`- ${col.name}`));

    // Get document count for the Product collection
    const productCount = await Product.countDocuments();
    console.log(`Total documents in Product collection (${Product.collection.name}): ${productCount}`);

  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

async function addPriceFieldsToExistingProducts() {
  try {
    console.log('Starting migration to add basePrice and salePrice...');

    // Find all products that do NOT have basePrice or salePrice defined
    // and update them to include these fields with a default value.
    const result = await Product.updateMany(
      {
        $or: [
          { basePrice: { $exists: false } },
          { salePrice: { $exists: false } }
        ]
      },
      {
        $set: {
          basePrice: 0, // Set a default base price
          salePrice: 0  // Set a default sale price
        }
      }
    );

    console.log(`Migration complete. Matched ${result.matchedCount} products, modified ${result.modifiedCount} products.`);

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
}

(async () => {
  await connectAndLog();
  await addPriceFieldsToExistingProducts();
})();