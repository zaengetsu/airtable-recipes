import express from 'express';
import { airtableService } from '../lib/airtable.service';

const router = express.Router();

// Récupérer tous les ingrédients
router.get('/', async (req, res) => {
  try {
    const ingredients = await airtableService.getAllIngredients();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des ingrédients' });
  }
});

export default router; 