import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateNutritionalAnalysis } from '../middleware/validation.middleware';
import { airtableService } from '../lib/airtable.service';

const router = express.Router();

// Obtenir l'analyse nutritionnelle d'une recette
router.get('/:recipeId', async (req, res, next) => {
  try {
    const analysis = await airtableService.getNutritionalAnalysis(req.params.recipeId);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Créer une analyse nutritionnelle
router.post('/', authenticate, authorize(['admin', 'nutritionist']), validateNutritionalAnalysis, async (req, res, next) => {
  try {
    const analysis = await airtableService.createNutritionalAnalysis(req.body);
    res.status(201).json(analysis);
  } catch (error) {
    next(error);
  }
});

// Mettre à jour une analyse nutritionnelle
router.put('/:analysisId', authenticate, authorize(['admin', 'nutritionist']), validateNutritionalAnalysis, async (req, res, next) => {
  try {
    const analysis = await airtableService.updateNutritionalAnalysis(req.params.analysisId, req.body);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Supprimer une analyse nutritionnelle
router.delete('/:analysisId', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    await airtableService.deleteNutritionalAnalysis(req.params.analysisId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router; 