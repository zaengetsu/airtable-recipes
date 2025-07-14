import express from 'express';
import { ingredientService } from '../services';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let ingredients;
    if (search && typeof search === 'string') {
      ingredients = await ingredientService.searchIngredients(search);
    } else {
      ingredients = await ingredientService.getAllIngredients();
    }
    res.json(ingredients);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ error: 'Erreur lors de la récupération des ingrédients', details: errorMessage });
  }
});

export default router; 