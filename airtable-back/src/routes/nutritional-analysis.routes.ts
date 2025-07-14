import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateNutritionalAnalysis } from '../middleware/validation.middleware';
import { NutritionalAnalysisController } from '../controllers';

const router = express.Router();

// Obtenir l'analyse nutritionnelle d'une recette
router.get(
  '/:recipeId',
  NutritionalAnalysisController.getNutritionalAnalysis
);

// Créer une analyse nutritionnelle
router.post(
  '/',
  authenticate,
  authorize(['admin', 'nutritionist']),
  validateNutritionalAnalysis,
  NutritionalAnalysisController.createNutritionalAnalysis
);

// Mettre à jour une analyse nutritionnelle
router.put(
  '/:analysisId',
  authenticate,
  authorize(['admin', 'nutritionist']),
  validateNutritionalAnalysis,
  NutritionalAnalysisController.updateNutritionalAnalysis
);

// Supprimer une analyse nutritionnelle
router.delete(
  '/:analysisId',
  authenticate,
  authorize(['admin']),
  NutritionalAnalysisController.deleteNutritionalAnalysis
);

export default router; 