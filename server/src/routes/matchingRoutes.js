import express from 'express';
import { matchCandidates } from '../controllers/matchingController.js';

const router = express.Router();

router.post('/', matchCandidates);

export default router;
