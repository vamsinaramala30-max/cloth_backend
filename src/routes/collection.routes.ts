import { Router } from 'express';
import {
  getCollections,
  getCollectionBySlug,
  getCollectionProducts,
} from '../controllers/collection.controller';

const router = Router();

router.get('/', getCollections);
router.get('/:slug', getCollectionBySlug);
router.get('/:slug/products', getCollectionProducts);

export default router;
