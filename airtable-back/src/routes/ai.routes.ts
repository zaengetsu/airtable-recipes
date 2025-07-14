import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AIController } from '../controllers';

const router = express.Router();

// Chat avec l'IA
router.post(
  '/chat',
  authenticate,
  AIController.chat
);

// Analyser la valeur nutritionnelle
router.post(
  '/analyze-nutrition',
  authenticate,
  AIController.analyzeNutrition
);

export default router; 