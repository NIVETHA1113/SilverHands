import express from 'express';
import { handleGlobalSearch } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', handleGlobalSearch);

export default router;
